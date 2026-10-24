export type InactivityBand = '2_TO_3_YEARS' | '3_TO_5_YEARS' | '5_TO_10_YEARS' | 'OVER_10_YEARS';
export type AccountOrigin = 'PMJDY_BENEFIT' | 'SCHOLARSHIP_DBT' | 'GENERAL_SAVINGS' | 'RURAL_EMPLOYMENT_MGNREGA';
export type ConsentStatus = 'CONSENTED' | 'PENDING_CONSENT' | 'WITHDRAWN' | 'DECLINED';
export type PreferredChannel = 'AUTHORISED_BC' | 'BRANCH_VISIT' | 'PLAIN_SMS_GUIDE' | 'NO_FURTHER_CONTACT';
export type BarrierPrimary = 'KYC_MISMATCH' | 'PHYSICAL_ACCESS' | 'TRUST_GRIEVANCE' | 'DIGITAL_FRICTION' | 'CHANGED_UTILITY' | 'UNKNOWN_OR_CONTRADICTORY';
export type EvidenceSource = 'CUSTOMER_CONFIRMED' | 'AUTHORISED_STAFF_NOTE' | 'SYSTEM_SIGNAL_ONLY' | 'UNKNOWN';
export type CustomerDecision = 'ACCEPTED' | 'DECLINED' | 'REQUESTED_NO_ACTION' | 'PENDING_DECISION' | 'OPTED_OUT';
export type CompletionStatus = 'NOT_OFFERED' | 'OFFERED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED_UNVERIFIED' | 'DECLINED';
export type AccountStatusAfter = 'INOPERATIVE_UNCHANGED' | 'ACTIVATION_REQUESTED' | 'REACTIVATED_OPERATIONAL' | 'CLOSED_BY_REQUEST';
export type MeaningfulUseStatus = 'VERIFIED_VOLUNTARY_USE' | 'SELF_REPORTED_USE' | 'NO_FURTHER_USE_WANTED' | 'NO_USE_DETECTED' | 'NOT_MEASURED_YET';

export type WorkflowStage =
  | 'ASSESSMENT'
  | 'REFERRAL'
  | 'ACCEPTED_INTERVENTION'
  | 'COMPLETED'
  | 'VERIFIED_REACTIVATION'
  | 'SUSTAINED_USAGE'
  | 'UNRESOLVED_BARRIERS'
  | 'OPTED_OUT';

export interface CaseItem {
  case_id: string;
  customer_token: string;
  status_source: string;
  review_date: string;
  inactivity_band: InactivityBand;
  account_origin: AccountOrigin;
  consent_status: ConsentStatus;
  contact_permission: boolean;
  preferred_channel: PreferredChannel;
  source_authorisation: string;
  is_synthetic: boolean;
  region?: string;
  workflow_stage?: WorkflowStage;
  barrier_primary?: BarrierPrimary;
  barrier_secondary?: string;
  evidence_source?: EvidenceSource;
  customer_confirmed?: boolean;
  rule_id?: string;
  intervention_type?: string;
  customer_decision?: CustomerDecision;
  completion_status?: CompletionStatus;
  barrier_resolved_verified?: boolean;
  account_status_after?: AccountStatusAfter;
  meaningful_use_status?: MeaningfulUseStatus;
  opt_out?: boolean;
}

export interface BarrierAssessment {
  assessment_id: string;
  case_id: string;
  barrier_primary: BarrierPrimary;
  barrier_secondary?: string;
  evidence_source: EvidenceSource;
  confidence_label: string;
  customer_confirmed: boolean;
  recorded_at: string;
  notes?: string;
}

export interface Intervention {
  intervention_id: string;
  case_id: string;
  rule_id: string;
  intervention_type: string;
  service_id?: string;
  destination_verified: boolean;
  assigned_channel: string;
  customer_decision: CustomerDecision;
  completion_status: CompletionStatus;
  offered_at: string;
  completed_at?: string;
  explanation_note?: string;
}

export interface Outcome {
  outcome_id: string;
  case_id: string;
  barrier_resolved_self_reported: boolean;
  barrier_resolved_verified: boolean;
  account_status_after: AccountStatusAfter;
  meaningful_use_status: MeaningfulUseStatus;
  outcome_source: string;
  follow_up_date?: string;
  opt_out: boolean;
  notes?: string;
}

export interface ServicePoint {
  service_id: string;
  institution: string;
  service_type: string;
  location_label: string;
  authorised_status: boolean;
  verification_source: string;
  last_verified_at: string;
  contact_route: string;
  fresh_status?: 'ACTIVE_VERIFIED' | 'STALE_OR_UNVERIFIED';
  freshness_notes?: string;
}

export interface AuditEvent {
  event_id: string;
  case_id: string;
  actor_role: string;
  action: string;
  timestamp: string;
  details: string;
  purpose_code: string;
}

export interface RuleEvaluationResult {
  rule_id: string;
  triggering_evidence: string;
  reason: string;
  required_verification: string;
  suggested_next_step: string;
  intervention_type: string;
  assigned_channel: string;
  service_id?: string;
  destination_verified: boolean;
  limitations: string;
  can_auto_proceed: boolean;
}

export interface CaseDetail {
  case: CaseItem;
  assessment?: BarrierAssessment;
  intervention?: Intervention;
  outcome?: Outcome;
  service_point?: ServicePoint;
  rule_evaluation?: RuleEvaluationResult;
  audit_history: AuditEvent[];
  is_synthetic_demo: boolean;
}

export interface DashboardMetrics {
  funnel: {
    eligible_reviewed: number;
    invited_contacted: number;
    engaged: number;
    barriers_assessed: number;
    customer_confirmed_barriers: number;
    interventions_accepted: number;
    interventions_completed: number;
    barriers_resolved_self_reported: number;
    barriers_resolved_verified: number;
    accounts_reactivated: number;
    meaningful_use_verified: number;
    opt_outs: number;
    unknown_or_contradictory: number;
    sample_size: number;
    data_label: string;
    observation_window_days: number;
  };
  barrier_breakdown: Record<string, number>;
  intervention_outcomes: Record<string, number>;
  account_status_breakdown: Record<string, number>;
  meaningful_use_breakdown: Record<string, number>;
  data_quality_warnings: string[];
  sample_size: number;
  is_synthetic_demonstration: boolean;
}

export interface ReviewQueueItem {
  case_id: string;
  customer_token: string;
  review_date: string;
  inactivity_band: string;
  barrier_primary: string;
  barrier_secondary: string;
  evidence_source: string;
  customer_confirmed: number;
  rule_id: string;
  completion_status: string;
  explanation_note: string;
  service_id?: string;
  location_label?: string;
  authorised_status?: number;
  last_verified_at?: string;
  queue_reasons: string[];
}

export interface GovernanceIndicatorItem {
  code: string;
  name: string;
  value_pct: number;
  rate_pct?: number;
  numerator: number;
  numerator_label: string;
  denominator: number;
  denominator_label: string;
  formula: string;
  time_window?: string;
  observation_window?: string;
  data_tier?: string;
  source_requirement: string;
  statutory_authority?: string;
  policy_significance?: string;
}

export interface GovernanceOutcomesResponse {
  indicators: Record<string, GovernanceIndicatorItem>;
  funnel_stages?: Record<string, number>;
  funnel_summary?: {
    total_inoperative_reviewed: number;
    assessment_engaged: number;
    referral_dispatched: number;
    customer_accepted: number;
    intervention_completed: number;
    verified_operational_reactivation: number;
    sustained_voluntary_use_90d: number;
    unresolved_or_friction: number;
    opted_out: number;
  };
  regional_distribution?: Record<string, any>;
  regional_breakdown?: Record<string, {
    total_cases: number;
    completed: number;
    reactivated: number;
    sustained: number;
    unresolved: number;
  }>;
  sovereign_observed_baselines?: Record<string, any>;
  data_boundaries?: Record<string, any>;
  air_gap_verification?: {
    data_tier: string;
    is_synthetic_demonstration: boolean;
    observed_statistics_separation_confirmed: boolean;
  };
  sample_size?: number;
  is_synthetic_demonstration?: boolean;
}

export interface RetentionPolicyResponse {
  policies?: Array<{
    regulation: string;
    scope: string;
    mandated_retention_period: string;
    compliance_status: string;
    details: string;
  }>;
  legal_framework?: string;
  retention_schedules?: Record<string, string>;
  pmla_audit_trail_retention_years?: number;
  dpdp_erasure_policy?: string;
  total_audit_events?: number;
  total_audit_events_retained?: number;
  oldest_event_timestamp?: string;
  newest_event_timestamp?: string;
  retention_status?: string;
  demonstration_note?: string;
  is_synthetic?: boolean;
}

export interface WorkflowTransitionRequest {
  target_stage: WorkflowStage;
  service_id?: string;
  actor_role?: string;
  notes?: string;
}

export interface WorkflowTransitionResponse {
  case_id: string;
  previous_stage: string;
  new_stage: string;
  status: string;
  audit_event_id: string;
  message: string;
}
