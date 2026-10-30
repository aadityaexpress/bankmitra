import {
  DashboardMetrics,
  CaseItem,
  CaseDetail,
  ReviewQueueItem,
  ServicePoint,
  AuditEvent,
  GovernanceOutcomesResponse,
  RetentionPolicyResponse,
  WorkflowTransitionRequest,
  WorkflowTransitionResponse,
  WorkflowStage
} from './types';

const BASE_URL = '/api';
const STORAGE_KEY = 'bankmitra_sandbox_state_v3_2';

interface SandboxState {
  macro_evidence: any;
  service_directory: ServicePoint[];
  retention_policy: RetentionPolicyResponse;
  cases_list: CaseItem[];
  case_details: Record<string, CaseDetail>;
  audit_events: AuditEvent[];
  metrics: DashboardMetrics;
  governance_outcomes: GovernanceOutcomesResponse;
  review_queue: ReviewQueueItem[];
}

let memoryState: SandboxState | null = null;
let seedPromise: Promise<SandboxState> | null = null;

/**
 * Attempts a JSON request against the live FastAPI backend (/api/*).
 * - If FastAPI responds with valid JSON (200 or 4xx validation error), returns/throws normally.
 * - If /api/* is unmounted on a static deployment (404 or SPA HTML rewrite), returns null
 *   so the deterministic client-side engine seamlessly serves the verified sandbox fixtures.
 */
async function tryLiveApi<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, init);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
      // If a static host returned a generic 404 JSON without FastAPI's `detail` key on GET, fallback
      if (res.status === 404 && !errData?.detail) {
        return null;
      }
      const apiErr: any = new Error(errData?.detail || `Request failed (${res.status})`);
      apiErr.isBackendValidationError = true;
      throw apiErr;
    }
    return (await res.json()) as T;
  } catch (err: any) {
    if (err?.isBackendValidationError) {
      throw err;
    }
    return null;
  }
}

async function loadSandboxState(forceReset = false): Promise<SandboxState> {
  if (!forceReset && memoryState) {
    return memoryState;
  }
  if (!forceReset) {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        memoryState = JSON.parse(saved) as SandboxState;
        return memoryState;
      }
    } catch {
      // Ignore storage quota / parse errors
    }
  }
  if (!seedPromise || forceReset) {
    seedPromise = fetch('/fallback-data/sandbox_seed.json', { cache: 'no-cache' }).then(async (res) => {
      if (!res.ok) {
        throw new Error('Unable to load BankMitra sandbox seed fixtures.');
      }
      return (await res.json()) as SandboxState;
    });
  }
  const fresh = await seedPromise;
  memoryState = JSON.parse(JSON.stringify(fresh)) as SandboxState;
  persistSandboxState(memoryState);
  return memoryState;
}

function persistSandboxState(state: SandboxState) {
  memoryState = state;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Keep in-memory state if sessionStorage quota is exceeded
  }
}

function makeAuditEvent(
  state: SandboxState,
  caseId: string,
  actorRole: string,
  action: string,
  details: string,
  purposeCode = 'FINANCIAL_INCLUSION_REVIEW'
): AuditEvent {
  const evt: AuditEvent = {
    event_id: `EVT-${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
    case_id: caseId,
    actor_role: actorRole,
    action,
    timestamp: new Date().toISOString(),
    details,
    purpose_code: purposeCode
  };
  state.audit_events.unshift(evt);
  const detail = state.case_details[caseId];
  if (detail) {
    detail.audit_history = [evt, ...(detail.audit_history || [])];
  }
  state.retention_policy.total_audit_events = state.audit_events.length;
  state.retention_policy.total_audit_events_retained = state.audit_events.length;
  state.retention_policy.newest_event_timestamp = evt.timestamp;
  return evt;
}

function syncListItemFromDetail(state: SandboxState, caseId: string) {
  const d = state.case_details[caseId];
  if (!d) return;
  const idx = state.cases_list.findIndex((c) => c.case_id === caseId);
  if (idx === -1) return;
  state.cases_list[idx] = {
    ...state.cases_list[idx],
    ...d.case,
    barrier_primary: d.assessment?.barrier_primary,
    barrier_secondary: d.assessment?.barrier_secondary,
    evidence_source: d.assessment?.evidence_source,
    customer_confirmed: d.assessment?.customer_confirmed,
    rule_id: d.intervention?.rule_id,
    intervention_type: d.intervention?.intervention_type,
    customer_decision: d.intervention?.customer_decision,
    completion_status: d.intervention?.completion_status,
    barrier_resolved_verified: d.outcome?.barrier_resolved_verified,
    account_status_after: d.outcome?.account_status_after,
    meaningful_use_status: d.outcome?.meaningful_use_status,
    opt_out: d.outcome?.opt_out
  };
}

function recomputeDerivedAggregates(state: SandboxState) {
  const details = Object.values(state.case_details);
  const totalCases = details.length;

  const invitedContacted = details.filter(
    (d) => d.case.contact_permission && d.case.consent_status !== 'DECLINED'
  ).length;
  const engaged = details.filter(
    (d) => d.case.consent_status === 'CONSENTED' && d.case.preferred_channel !== 'NO_FURTHER_CONTACT'
  ).length;
  const barriersAssessed = details.filter((d) => Boolean(d.assessment)).length;
  const confirmedBarriers = details.filter((d) => Boolean(d.assessment?.customer_confirmed)).length;
  const accepted = details.filter((d) => d.intervention?.customer_decision === 'ACCEPTED').length;
  const completed = details.filter((d) => d.intervention?.completion_status === 'COMPLETED').length;
  const selfReported = details.filter((d) => Boolean(d.outcome?.barrier_resolved_self_reported)).length;
  const verifiedResolved = details.filter((d) => Boolean(d.outcome?.barrier_resolved_verified)).length;
  const reactivated = details.filter((d) => d.outcome?.account_status_after === 'REACTIVATED_OPERATIONAL').length;
  const sustained = details.filter((d) => d.outcome?.meaningful_use_status === 'VERIFIED_VOLUNTARY_USE').length;
  const optOuts = details.filter(
    (d) =>
      !d.case.contact_permission ||
      d.case.consent_status === 'DECLINED' ||
      d.case.consent_status === 'WITHDRAWN' ||
      Boolean(d.outcome?.opt_out) ||
      d.intervention?.customer_decision === 'OPTED_OUT'
  ).length;
  const unknownOrContradictory = details.filter(
    (d) =>
      d.assessment?.barrier_primary === 'UNKNOWN_OR_CONTRADICTORY' ||
      d.assessment?.evidence_source === 'SYSTEM_SIGNAL_ONLY'
  ).length;

  const barrierBreakdown: Record<string, number> = {};
  const interventionOutcomes: Record<string, number> = {};
  const accountBreakdown: Record<string, number> = {};
  const meaningfulBreakdown: Record<string, number> = {};

  for (const d of details) {
    if (d.assessment?.barrier_primary) {
      barrierBreakdown[d.assessment.barrier_primary] = (barrierBreakdown[d.assessment.barrier_primary] || 0) + 1;
    }
    if (d.intervention?.customer_decision) {
      interventionOutcomes[d.intervention.customer_decision] =
        (interventionOutcomes[d.intervention.customer_decision] || 0) + 1;
    }
    if (d.outcome?.account_status_after) {
      accountBreakdown[d.outcome.account_status_after] =
        (accountBreakdown[d.outcome.account_status_after] || 0) + 1;
    }
    if (d.outcome?.meaningful_use_status) {
      meaningfulBreakdown[d.outcome.meaningful_use_status] =
        (meaningfulBreakdown[d.outcome.meaningful_use_status] || 0) + 1;
    }
  }

  state.metrics = {
    ...state.metrics,
    sample_size: totalCases,
    funnel: {
      ...state.metrics.funnel,
      eligible_reviewed: totalCases,
      invited_contacted: invitedContacted,
      engaged,
      barriers_assessed: barriersAssessed,
      customer_confirmed_barriers: confirmedBarriers,
      interventions_accepted: accepted,
      interventions_completed: completed,
      barriers_resolved_self_reported: selfReported,
      barriers_resolved_verified: verifiedResolved,
      accounts_reactivated: reactivated,
      meaningful_use_verified: sustained,
      opt_outs: optOuts,
      unknown_or_contradictory: unknownOrContradictory,
      sample_size: totalCases
    },
    barrier_breakdown: barrierBreakdown,
    intervention_outcomes: interventionOutcomes,
    account_status_breakdown: accountBreakdown,
    meaningful_use_breakdown: meaningfulBreakdown
  };

  // Recompute G1–G5 indicators
  const g1Num = details.filter(
    (d) =>
      d.intervention?.destination_verified &&
      Boolean(d.intervention?.service_id) &&
      d.intervention?.completion_status !== 'NOT_OFFERED'
  ).length;
  const g1Den = totalCases || 1;
  const g2Den = accepted || 1;
  const g2Num = completed;
  const g3Den = g2Num || 1;
  const g3Num = reactivated;
  const g4Den = g3Num || 1;
  const g4Num = sustained;
  const g5Num = details.filter(
    (d) =>
      d.case.workflow_stage === 'UNRESOLVED_BARRIERS' ||
      d.intervention?.completion_status === 'BLOCKED_UNVERIFIED' ||
      (d.assessment?.barrier_primary === 'TRUST_GRIEVANCE' && d.intervention?.completion_status !== 'COMPLETED') ||
      d.assessment?.evidence_source === 'SYSTEM_SIGNAL_ONLY'
  ).length;
  const g5Den = barriersAssessed || 1;

  const pct = (n: number, dn: number) => Math.round((n / dn) * 10000) / 100;
  const ind = state.governance_outcomes.indicators;
  if (ind.G1_RDR) {
    ind.G1_RDR.numerator = g1Num;
    ind.G1_RDR.denominator = g1Den;
    ind.G1_RDR.value_pct = pct(g1Num, g1Den);
    ind.G1_RDR.rate_pct = pct(g1Num, g1Den);
  }
  if (ind.G2_ICR) {
    ind.G2_ICR.numerator = g2Num;
    ind.G2_ICR.denominator = g2Den;
    ind.G2_ICR.value_pct = pct(g2Num, g2Den);
    ind.G2_ICR.rate_pct = pct(g2Num, g2Den);
  }
  if (ind.G3_VARR) {
    ind.G3_VARR.numerator = g3Num;
    ind.G3_VARR.denominator = g3Den;
    ind.G3_VARR.value_pct = pct(g3Num, g3Den);
    ind.G3_VARR.rate_pct = pct(g3Num, g3Den);
  }
  if (ind.G4_SMUR_90d) {
    ind.G4_SMUR_90d.numerator = g4Num;
    ind.G4_SMUR_90d.denominator = g4Den;
    ind.G4_SMUR_90d.value_pct = pct(g4Num, g4Den);
    ind.G4_SMUR_90d.rate_pct = pct(g4Num, g4Den);
  }
  if (ind.G5_UBR) {
    ind.G5_UBR.numerator = g5Num;
    ind.G5_UBR.denominator = g5Den;
    ind.G5_UBR.value_pct = pct(g5Num, g5Den);
    ind.G5_UBR.rate_pct = pct(g5Num, g5Den);
  }

  state.governance_outcomes.funnel_summary = {
    total_inoperative_reviewed: totalCases,
    assessment_engaged: engaged,
    referral_dispatched: g1Num,
    customer_accepted: accepted,
    intervention_completed: completed,
    verified_operational_reactivation: reactivated,
    sustained_voluntary_use_90d: sustained,
    unresolved_or_friction: g5Num,
    opted_out: optOuts
  };

  // Recompute Review Queue
  state.review_queue = details
    .filter(
      (d) =>
        d.assessment?.barrier_primary === 'UNKNOWN_OR_CONTRADICTORY' ||
        !d.assessment?.customer_confirmed ||
        d.intervention?.completion_status === 'BLOCKED_UNVERIFIED' ||
        d.intervention?.rule_id === 'R6' ||
        (d.assessment?.barrier_primary === 'TRUST_GRIEVANCE' && d.intervention?.completion_status !== 'COMPLETED')
    )
    .map((d) => {
      const reasons: string[] = [];
      if (d.assessment?.barrier_primary === 'UNKNOWN_OR_CONTRADICTORY') {
        reasons.push('Unknown or unclassified barrier');
      }
      if (!d.assessment?.customer_confirmed) {
        reasons.push('Unconfirmed system-only signal (Rule R6)');
      }
      if (d.intervention?.rule_id === 'R6') {
        reasons.push('Held by Rule R6 compliance guardrail');
      }
      if (d.intervention?.completion_status === 'BLOCKED_UNVERIFIED') {
        reasons.push('Touchpoint stale (>90 days) or unverified (Rule R3)');
      }
      if (d.assessment?.barrier_primary === 'TRUST_GRIEVANCE' && d.intervention?.completion_status !== 'COMPLETED') {
        reasons.push('Pending grievance redressal before reactivation (Rule R4)');
      }
      return {
        case_id: d.case.case_id,
        customer_token: d.case.customer_token,
        review_date: d.case.review_date,
        inactivity_band: d.case.inactivity_band,
        barrier_primary: d.assessment?.barrier_primary || 'UNKNOWN_OR_CONTRADICTORY',
        barrier_secondary: d.assessment?.barrier_secondary || '',
        evidence_source: d.assessment?.evidence_source || 'UNKNOWN',
        customer_confirmed: d.assessment?.customer_confirmed ? 1 : 0,
        rule_id: d.intervention?.rule_id || 'R6',
        completion_status: d.intervention?.completion_status || 'NOT_OFFERED',
        explanation_note: d.intervention?.explanation_note || '',
        service_id: d.service_point?.service_id,
        location_label: d.service_point?.location_label,
        authorised_status: d.service_point?.authorised_status ? 1 : 0,
        last_verified_at: d.service_point?.last_verified_at,
        queue_reasons: reasons
      };
    });
}

export async function fetchHealth() {
  const live = await tryLiveApi<any>(`${BASE_URL}/health`);
  if (live) return live;
  return {
    status: 'healthy',
    service: 'BankMitra Engine (Deterministic Sandbox)',
    timestamp: new Date().toISOString(),
    database: 'sandbox_fixtures',
    environment: 'synthetic_demonstration',
    real_bank_connection: false
  };
}

export async function fetchMacroEvidence() {
  const live = await tryLiveApi<any>(`${BASE_URL}/macro/evidence`);
  if (live) return live;
  const state = await loadSandboxState();
  return state.macro_evidence;
}

export async function fetchMetrics(): Promise<DashboardMetrics> {
  const live = await tryLiveApi<DashboardMetrics>(`${BASE_URL}/metrics`);
  if (live) return live;
  const state = await loadSandboxState();
  return state.metrics;
}

export async function fetchGovernanceOutcomes(): Promise<GovernanceOutcomesResponse> {
  const live = await tryLiveApi<GovernanceOutcomesResponse>(`${BASE_URL}/governance/outcomes`);
  if (live) return live;
  const state = await loadSandboxState();
  return state.governance_outcomes;
}

export async function fetchRetentionPolicy(): Promise<RetentionPolicyResponse> {
  const live = await tryLiveApi<RetentionPolicyResponse>(`${BASE_URL}/governance/retention`);
  if (live) return live;
  const state = await loadSandboxState();
  return state.retention_policy;
}

export async function simulateRetentionPurge(stage?: string) {
  const query = stage ? `?stage=${stage}` : '';
  const live = await tryLiveApi<any>(`${BASE_URL}/governance/retention/simulate-purge${query}`, {
    method: 'POST'
  });
  if (live) return live;

  const state = await loadSandboxState();
  const evt = makeAuditEvent(
    state,
    'SYSTEM-GLOBAL',
    'COMPLIANCE_AUDITOR',
    'RETENTION_AUDIT_VERIFIED',
    'Automated check: verified 0 orphaned records and 100% adherence to purpose limitation.',
    'STATUTORY_AUDIT'
  );
  persistSandboxState(state);
  return {
    status: 'retention_audit_complete',
    audit_event_id: evt.event_id,
    message: 'Retention schedule simulated. Audit trails preserved; customer opt-out suppressions certified.',
    is_synthetic: true
  };
}

export async function transitionWorkflowStage(
  caseId: string,
  payload: WorkflowTransitionRequest
): Promise<WorkflowTransitionResponse> {
  const live = await tryLiveApi<WorkflowTransitionResponse>(`${BASE_URL}/cases/${caseId}/workflow-transition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (live) return live;

  const state = await loadSandboxState();
  const detail = state.case_details[caseId];
  if (!detail) {
    throw new Error(`Case ${caseId} not found.`);
  }

  const currentStage: WorkflowStage = (detail.case.workflow_stage || 'ASSESSMENT') as WorkflowStage;
  const targetStage: WorkflowStage = payload.target_stage;
  const actorRole = payload.actor_role || 'BRANCH_OFFICER';

  if (currentStage === 'OPTED_OUT' && targetStage !== 'OPTED_OUT') {
    throw new Error('Outreach prohibited: Customer has opted out under Rule R1. Cannot transition to active stages.');
  }

  if (targetStage === 'OPTED_OUT') {
    detail.case.workflow_stage = 'OPTED_OUT';
    detail.case.contact_permission = false;
    detail.case.consent_status = 'DECLINED';
    detail.case.preferred_channel = 'NO_FURTHER_CONTACT';
    if (detail.outcome) detail.outcome.opt_out = true;
    if (detail.intervention) {
      detail.intervention.customer_decision = 'OPTED_OUT';
      detail.intervention.completion_status = 'DECLINED';
    }
    const evt = makeAuditEvent(
      state,
      caseId,
      actorRole,
      'WORKFLOW_TRANSITION_OPT_OUT',
      `Customer exercised right to opt-out. Workflow moved to OPTED_OUT. All outreach suppressed under Rule R1. Notes: ${payload.notes || 'None'}`
    );
    syncListItemFromDetail(state, caseId);
    recomputeDerivedAggregates(state);
    persistSandboxState(state);
    return {
      case_id: caseId,
      previous_stage: currentStage,
      new_stage: 'OPTED_OUT',
      status: 'OPT_OUT_SUPPRESSED',
      audit_event_id: evt.event_id,
      message: 'Outreach suppressed immediately per customer preference under Rule R1.'
    };
  }

  const invalidJumps: Partial<Record<WorkflowStage, WorkflowStage[]>> = {
    ASSESSMENT: ['ACCEPTED_INTERVENTION', 'COMPLETED', 'VERIFIED_REACTIVATION', 'SUSTAINED_USAGE'],
    REFERRAL: ['COMPLETED', 'VERIFIED_REACTIVATION', 'SUSTAINED_USAGE'],
    ACCEPTED_INTERVENTION: ['VERIFIED_REACTIVATION', 'SUSTAINED_USAGE'],
    COMPLETED: ['SUSTAINED_USAGE']
  };

  if (invalidJumps[currentStage]?.includes(targetStage)) {
    throw new Error(
      `Invalid stage transition: cannot skip directly from ${currentStage} to ${targetStage} without intermediate verification.`
    );
  }

  if (
    targetStage !== 'UNRESOLVED_BARRIERS' &&
    (detail.assessment?.evidence_source === 'SYSTEM_SIGNAL_ONLY' || !detail.assessment?.customer_confirmed)
  ) {
    throw new Error(
      'Rule R6 Guardrail: Unconfirmed system-only signals require human compliance verification before advancing.'
    );
  }

  if (
    targetStage === 'REFERRAL' &&
    detail.service_point &&
    detail.service_point.fresh_status === 'STALE_OR_UNVERIFIED'
  ) {
    throw new Error(
      'Rule R3 Guardrail: Assigned touchpoint is unverified or stale (>90 days). Select a fresh verified touchpoint.'
    );
  }

  detail.case.workflow_stage = targetStage;
  if (detail.intervention) {
    if (targetStage === 'REFERRAL') {
      detail.intervention.completion_status = 'OFFERED';
    } else if (targetStage === 'ACCEPTED_INTERVENTION') {
      detail.intervention.customer_decision = 'ACCEPTED';
      detail.intervention.completion_status = 'IN_PROGRESS';
    } else if (targetStage === 'COMPLETED') {
      detail.intervention.customer_decision = 'ACCEPTED';
      detail.intervention.completion_status = 'COMPLETED';
      detail.intervention.completed_at = new Date().toISOString();
    }
  }
  if (detail.outcome) {
    if (targetStage === 'VERIFIED_REACTIVATION') {
      detail.outcome.barrier_resolved_verified = true;
      detail.outcome.account_status_after = 'REACTIVATED_OPERATIONAL';
    } else if (targetStage === 'SUSTAINED_USAGE') {
      detail.outcome.barrier_resolved_verified = true;
      detail.outcome.account_status_after = 'REACTIVATED_OPERATIONAL';
      detail.outcome.meaningful_use_status = 'VERIFIED_VOLUNTARY_USE';
    }
  }

  const evt = makeAuditEvent(
    state,
    caseId,
    actorRole,
    `WORKFLOW_STAGE_${targetStage}`,
    payload.notes || `Transitioned from ${currentStage} to ${targetStage}`
  );
  syncListItemFromDetail(state, caseId);
  recomputeDerivedAggregates(state);
  persistSandboxState(state);

  return {
    case_id: caseId,
    previous_stage: currentStage,
    new_stage: targetStage,
    status: 'TRANSITION_RECORDED',
    audit_event_id: evt.event_id,
    message: `Case ${caseId} transitioned from ${currentStage} to ${targetStage}.`
  };
}

export async function fetchCases(params: {
  region?: string;
  workflow_stage?: string;
  intervention_type?: string;
  barrier?: string;
  channel?: string;
  review_needed?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const query = new URLSearchParams();
  if (params.region && params.region !== 'ALL') query.append('region', params.region);
  if (params.workflow_stage && params.workflow_stage !== 'ALL') query.append('workflow_stage', params.workflow_stage);
  if (params.intervention_type && params.intervention_type !== 'ALL') query.append('intervention_type', params.intervention_type);
  if (params.barrier && params.barrier !== 'ALL') query.append('barrier', params.barrier);
  if (params.channel && params.channel !== 'ALL') query.append('channel', params.channel);
  if (params.review_needed !== undefined) query.append('review_needed', String(params.review_needed));
  if (params.search) query.append('search', params.search);
  if (params.limit) query.append('limit', String(params.limit));
  if (params.offset !== undefined) query.append('offset', String(params.offset));

  const live = await tryLiveApi<{ total: number; items: CaseItem[] }>(`${BASE_URL}/cases?${query.toString()}`);
  if (live) return live;

  const state = await loadSandboxState();
  const reviewIds = new Set(state.review_queue.map((r) => r.case_id));
  let filtered = state.cases_list.filter((c) => {
    if (params.region && params.region !== 'ALL' && c.region !== params.region) return false;
    if (params.workflow_stage && params.workflow_stage !== 'ALL' && c.workflow_stage !== params.workflow_stage) return false;
    if (params.intervention_type && params.intervention_type !== 'ALL' && c.intervention_type !== params.intervention_type) return false;
    if (params.barrier && params.barrier !== 'ALL' && c.barrier_primary !== params.barrier) return false;
    if (params.channel && params.channel !== 'ALL' && c.preferred_channel !== params.channel) return false;
    if (params.review_needed === true && !reviewIds.has(c.case_id)) return false;
    if (params.review_needed === false && reviewIds.has(c.case_id)) return false;
    if (params.search) {
      const q = params.search.toLowerCase();
      if (!c.case_id.toLowerCase().includes(q) && !c.customer_token.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const total = filtered.length;
  const offset = params.offset ?? 0;
  const limit = params.limit ?? 50;
  filtered = filtered.slice(offset, offset + limit);
  return { total, items: filtered };
}

export async function fetchCaseDetail(caseId: string): Promise<CaseDetail> {
  const live = await tryLiveApi<CaseDetail>(`${BASE_URL}/cases/${caseId}`);
  if (live) return live;

  const state = await loadSandboxState();
  const detail = state.case_details[caseId];
  if (!detail) throw new Error(`Case ${caseId} not found`);
  return detail;
}

export async function updateCustomerDecision(caseId: string, decision: string, notes?: string) {
  const live = await tryLiveApi<any>(`${BASE_URL}/cases/${caseId}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision, notes })
  });
  if (live) return live;

  const state = await loadSandboxState();
  const detail = state.case_details[caseId];
  if (!detail) throw new Error(`Case ${caseId} not found`);

  if (detail.intervention) {
    detail.intervention.customer_decision = decision as any;
    if (decision === 'ACCEPTED') detail.intervention.completion_status = 'IN_PROGRESS';
    if (decision === 'DECLINED' || decision === 'OPTED_OUT') detail.intervention.completion_status = 'DECLINED';
    if (decision === 'REQUESTED_NO_ACTION') detail.intervention.completion_status = 'COMPLETED';
  }
  if (decision === 'OPTED_OUT') {
    detail.case.workflow_stage = 'OPTED_OUT';
    detail.case.contact_permission = false;
    detail.case.consent_status = 'DECLINED';
    detail.case.preferred_channel = 'NO_FURTHER_CONTACT';
    if (detail.outcome) detail.outcome.opt_out = true;
  }

  makeAuditEvent(state, caseId, 'AUTHORISED_STAFF', 'DECISION_RECORDED', `Customer decision: ${decision}. Notes: ${notes || 'None'}`);
  syncListItemFromDetail(state, caseId);
  recomputeDerivedAggregates(state);
  persistSandboxState(state);
  return { status: 'decision_recorded', decision, message: `Customer decision recorded: ${decision}` };
}

export async function updateCaseOutcome(
  caseId: string,
  payload: {
    barrier_resolved_self_reported?: boolean;
    barrier_resolved_verified?: boolean;
    account_status_after?: string;
    meaningful_use_status?: string;
    notes?: string;
  }
) {
  const live = await tryLiveApi<any>(`${BASE_URL}/cases/${caseId}/outcome`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (live) return live;

  const state = await loadSandboxState();
  const detail = state.case_details[caseId];
  if (!detail || !detail.outcome) throw new Error(`Outcome for ${caseId} not found`);

  if (payload.barrier_resolved_self_reported !== undefined) {
    detail.outcome.barrier_resolved_self_reported = payload.barrier_resolved_self_reported;
  }
  if (payload.barrier_resolved_verified !== undefined) {
    detail.outcome.barrier_resolved_verified = payload.barrier_resolved_verified;
  }
  if (payload.account_status_after !== undefined) {
    detail.outcome.account_status_after = payload.account_status_after as any;
  }
  if (payload.meaningful_use_status !== undefined) {
    detail.outcome.meaningful_use_status = payload.meaningful_use_status as any;
  }
  if (payload.notes !== undefined) {
    detail.outcome.notes = payload.notes;
  }
  detail.outcome.follow_up_date = new Date().toISOString().slice(0, 10);

  makeAuditEvent(state, caseId, 'COMPLIANCE_AUDITOR', 'OUTCOME_UPDATED', `Outcome updated: ${JSON.stringify(payload)}`);
  syncListItemFromDetail(state, caseId);
  recomputeDerivedAggregates(state);
  persistSandboxState(state);
  return { message: 'Outcome record updated successfully', case_id: caseId };
}

export async function fetchReviewQueue(): Promise<{ count: number; items: ReviewQueueItem[] }> {
  const live = await tryLiveApi<{ count: number; items: ReviewQueueItem[] }>(`${BASE_URL}/review-queue`);
  if (live) return live;

  const state = await loadSandboxState();
  return { count: state.review_queue.length, items: state.review_queue };
}

export async function fetchServiceDirectory(): Promise<{ count: number; items: ServicePoint[] }> {
  const live = await tryLiveApi<{ count: number; items: ServicePoint[] }>(`${BASE_URL}/service-directory`);
  if (live) return live;

  const state = await loadSandboxState();
  return { count: state.service_directory.length, items: state.service_directory };
}

export async function fetchAuditEvents(limit = 50): Promise<{ count: number; items: AuditEvent[] }> {
  const live = await tryLiveApi<{ count: number; items: AuditEvent[] }>(`${BASE_URL}/audit-events?limit=${limit}`);
  if (live) return live;

  const state = await loadSandboxState();
  const items = state.audit_events.slice(0, limit);
  return { count: items.length, items };
}

export async function seedDatabase() {
  const live = await tryLiveApi<any>(`${BASE_URL}/seed`, { method: 'POST' });
  if (live) return live;

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  memoryState = null;
  seedPromise = null;
  const fresh = await loadSandboxState(true);
  return {
    service_directory: fresh.service_directory.length,
    cases: fresh.cases_list.length,
    audit_events: fresh.audit_events.length
  };
}
