import {
  DashboardMetrics,
  CaseDetail,
  ReviewQueueItem,
  ServicePoint,
  AuditEvent,
  GovernanceOutcomesResponse,
  RetentionPolicyResponse,
  WorkflowTransitionRequest,
  WorkflowTransitionResponse
} from './types';

const BASE_URL = '/api';

export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  return res.json();
}

export async function fetchMacroEvidence() {
  const res = await fetch(`${BASE_URL}/macro/evidence`);
  if (!res.ok) throw new Error('Failed to fetch macro evidence');
  return res.json();
}

export async function fetchMetrics(): Promise<DashboardMetrics> {
  const res = await fetch(`${BASE_URL}/metrics`);
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

export async function fetchGovernanceOutcomes(): Promise<GovernanceOutcomesResponse> {
  const res = await fetch(`${BASE_URL}/governance/outcomes`);
  if (!res.ok) throw new Error('Failed to fetch governance outcomes');
  return res.json();
}

export async function fetchRetentionPolicy(): Promise<RetentionPolicyResponse> {
  const res = await fetch(`${BASE_URL}/governance/retention`);
  if (!res.ok) throw new Error('Failed to fetch retention policy');
  return res.json();
}

export async function simulateRetentionPurge(stage?: string) {
  const query = stage ? `?stage=${stage}` : '';
  const res = await fetch(`${BASE_URL}/governance/retention/simulate-purge${query}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to simulate retention purge');
  return res.json();
}

export async function transitionWorkflowStage(
  caseId: string,
  payload: WorkflowTransitionRequest
): Promise<WorkflowTransitionResponse> {
  const res = await fetch(`${BASE_URL}/cases/${caseId}/workflow-transition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to transition workflow stage' }));
    throw new Error(errorData.detail || 'Workflow transition failed');
  }
  return res.json();
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

  const res = await fetch(`${BASE_URL}/cases?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch cases');
  return res.json();
}

export async function fetchCaseDetail(caseId: string): Promise<CaseDetail> {
  const res = await fetch(`${BASE_URL}/cases/${caseId}`);
  if (!res.ok) throw new Error(`Failed to fetch case ${caseId}`);
  return res.json();
}

export async function updateCustomerDecision(caseId: string, decision: string, notes?: string) {
  const res = await fetch(`${BASE_URL}/cases/${caseId}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision, notes })
  });
  if (!res.ok) throw new Error('Failed to update decision');
  return res.json();
}

export async function updateCaseOutcome(caseId: string, payload: {
  barrier_resolved_self_reported?: boolean;
  barrier_resolved_verified?: boolean;
  account_status_after?: string;
  meaningful_use_status?: string;
  notes?: string;
}) {
  const res = await fetch(`${BASE_URL}/cases/${caseId}/outcome`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update outcome');
  return res.json();
}

export async function fetchReviewQueue(): Promise<{ count: number; items: ReviewQueueItem[] }> {
  const res = await fetch(`${BASE_URL}/review-queue`);
  if (!res.ok) throw new Error('Failed to fetch review queue');
  return res.json();
}

export async function fetchServiceDirectory(): Promise<{ count: number; items: ServicePoint[] }> {
  const res = await fetch(`${BASE_URL}/service-directory`);
  if (!res.ok) throw new Error('Failed to fetch service directory');
  return res.json();
}

export async function fetchAuditEvents(limit = 50): Promise<{ count: number; items: AuditEvent[] }> {
  const res = await fetch(`${BASE_URL}/audit-events?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch audit events');
  return res.json();
}

export async function seedDatabase() {
  const res = await fetch(`${BASE_URL}/seed`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reseed database');
  return res.json();
}
