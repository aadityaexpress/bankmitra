"""
Pydantic Schemas for BankMitra API
Ensures strict type validation, transparent rule outputs, and safe schema handling.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime

class InactivityBand(str, Enum):
    TWO_TO_THREE_YEARS = "2_TO_3_YEARS"
    THREE_TO_FIVE_YEARS = "3_TO_5_YEARS"
    FIVE_TO_TEN_YEARS = "5_TO_10_YEARS"
    OVER_TEN_YEARS = "OVER_10_YEARS"

class AccountOrigin(str, Enum):
    PMJDY_BENEFIT = "PMJDY_BENEFIT"
    SCHOLARSHIP_DBT = "SCHOLARSHIP_DBT"
    GENERAL_SAVINGS = "GENERAL_SAVINGS"
    RURAL_EMPLOYMENT_MGNREGA = "RURAL_EMPLOYMENT_MGNREGA"

class ConsentStatus(str, Enum):
    CONSENTED = "CONSENTED"
    PENDING_CONSENT = "PENDING_CONSENT"
    WITHDRAWN = "WITHDRAWN"
    DECLINED = "DECLINED"

class PreferredChannel(str, Enum):
    AUTHORISED_BC = "AUTHORISED_BC"
    BRANCH_VISIT = "BRANCH_VISIT"
    PLAIN_SMS_GUIDE = "PLAIN_SMS_GUIDE"
    NO_FURTHER_CONTACT = "NO_FURTHER_CONTACT"

class BarrierPrimary(str, Enum):
    KYC_MISMATCH = "KYC_MISMATCH"
    PHYSICAL_ACCESS = "PHYSICAL_ACCESS"
    TRUST_GRIEVANCE = "TRUST_GRIEVANCE"
    DIGITAL_FRICTION = "DIGITAL_FRICTION"
    CHANGED_UTILITY = "CHANGED_UTILITY"
    UNKNOWN_OR_CONTRADICTORY = "UNKNOWN_OR_CONTRADICTORY"

class EvidenceSource(str, Enum):
    CUSTOMER_CONFIRMED = "CUSTOMER_CONFIRMED"
    AUTHORISED_STAFF_NOTE = "AUTHORISED_STAFF_NOTE"
    SYSTEM_SIGNAL_ONLY = "SYSTEM_SIGNAL_ONLY"
    UNKNOWN = "UNKNOWN"

class ConfidenceLabel(str, Enum):
    HIGH_CONFIRMED = "HIGH_CONFIRMED"
    MEDIUM_DOCUMENTED = "MEDIUM_DOCUMENTED"
    LOW_INFERRED = "LOW_INFERRED"
    UNRESOLVED = "UNRESOLVED"

class CustomerDecision(str, Enum):
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"
    REQUESTED_NO_ACTION = "REQUESTED_NO_ACTION"
    PENDING_DECISION = "PENDING_DECISION"
    OPTED_OUT = "OPTED_OUT"

class CompletionStatus(str, Enum):
    NOT_OFFERED = "NOT_OFFERED"
    OFFERED = "OFFERED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    BLOCKED_UNVERIFIED = "BLOCKED_UNVERIFIED"
    DECLINED = "DECLINED"

class AccountStatusAfter(str, Enum):
    INOPERATIVE_UNCHANGED = "INOPERATIVE_UNCHANGED"
    ACTIVATION_REQUESTED = "ACTIVATION_REQUESTED"
    REACTIVATED_OPERATIONAL = "REACTIVATED_OPERATIONAL"
    CLOSED_BY_REQUEST = "CLOSED_BY_REQUEST"

class MeaningfulUseStatus(str, Enum):
    VERIFIED_VOLUNTARY_USE = "VERIFIED_VOLUNTARY_USE"
    SELF_REPORTED_USE = "SELF_REPORTED_USE"
    NO_FURTHER_USE_WANTED = "NO_FURTHER_USE_WANTED"
    NO_USE_DETECTED = "NO_USE_DETECTED"
    NOT_MEASURED_YET = "NOT_MEASURED_YET"

class WorkflowStage(str, Enum):
    ASSESSMENT = "ASSESSMENT"
    REFERRAL = "REFERRAL"
    ACCEPTED_INTERVENTION = "ACCEPTED_INTERVENTION"
    COMPLETED = "COMPLETED"
    VERIFIED_REACTIVATION = "VERIFIED_REACTIVATION"
    SUSTAINED_USAGE = "SUSTAINED_USAGE"
    UNRESOLVED_BARRIERS = "UNRESOLVED_BARRIERS"
    OPTED_OUT = "OPTED_OUT"

# Schema classes
class ServiceDirectoryItem(BaseModel):
    service_id: str
    institution: str
    service_type: str
    location_label: str
    authorised_status: bool = True
    verification_source: str
    last_verified_at: str
    contact_route: str
    is_synthetic: bool = True

class CaseBase(BaseModel):
    case_id: str
    customer_token: str
    region: str = "Central Zone"
    workflow_stage: WorkflowStage = WorkflowStage.ASSESSMENT
    status_source: str
    review_date: str
    inactivity_band: InactivityBand
    account_origin: AccountOrigin
    consent_status: ConsentStatus
    contact_permission: bool = True
    preferred_channel: PreferredChannel
    source_authorisation: str
    is_synthetic: bool = True

class CaseCreate(CaseBase):
    pass

class BarrierAssessmentBase(BaseModel):
    assessment_id: str
    case_id: str
    barrier_primary: BarrierPrimary
    barrier_secondary: Optional[str] = None
    evidence_source: EvidenceSource
    confidence_label: ConfidenceLabel
    customer_confirmed: bool = False
    recorded_at: str
    notes: Optional[str] = None
    is_synthetic: bool = True

class BarrierAssessmentCreate(BaseModel):
    barrier_primary: BarrierPrimary
    barrier_secondary: Optional[str] = None
    evidence_source: EvidenceSource
    customer_confirmed: bool = False
    notes: Optional[str] = None

class InterventionBase(BaseModel):
    intervention_id: str
    case_id: str
    rule_id: str
    intervention_type: str
    service_id: Optional[str] = None
    destination_verified: bool = False
    assigned_channel: str
    customer_decision: CustomerDecision = CustomerDecision.PENDING_DECISION
    completion_status: CompletionStatus = CompletionStatus.NOT_OFFERED
    offered_at: str
    completed_at: Optional[str] = None
    explanation_note: Optional[str] = None
    is_synthetic: bool = True

class InterventionOfferRequest(BaseModel):
    customer_decision: Optional[CustomerDecision] = CustomerDecision.PENDING_DECISION

class InterventionDecisionRequest(BaseModel):
    decision: CustomerDecision
    notes: Optional[str] = None

class OutcomeBase(BaseModel):
    outcome_id: str
    case_id: str
    barrier_resolved_self_reported: bool = False
    barrier_resolved_verified: bool = False
    account_status_after: AccountStatusAfter = AccountStatusAfter.INOPERATIVE_UNCHANGED
    meaningful_use_status: MeaningfulUseStatus = MeaningfulUseStatus.NOT_MEASURED_YET
    outcome_source: str = "UNVERIFIED"
    follow_up_date: Optional[str] = None
    opt_out: bool = False
    notes: Optional[str] = None
    is_synthetic: bool = True

class OutcomeUpdateRequest(BaseModel):
    barrier_resolved_self_reported: Optional[bool] = None
    barrier_resolved_verified: Optional[bool] = None
    account_status_after: Optional[AccountStatusAfter] = None
    meaningful_use_status: Optional[MeaningfulUseStatus] = None
    outcome_source: Optional[str] = None
    opt_out: Optional[bool] = None
    notes: Optional[str] = None

class AuditEventItem(BaseModel):
    event_id: str
    case_id: str
    actor_role: str
    action: str
    timestamp: str
    details: str
    purpose_code: str
    is_synthetic: bool = True

class RuleEvaluationResult(BaseModel):
    rule_id: str
    triggering_evidence: str
    reason: str
    required_verification: str
    suggested_next_step: str
    intervention_type: str
    assigned_channel: str
    service_id: Optional[str] = None
    destination_verified: bool = False
    limitations: str
    can_auto_proceed: bool

class CaseDetailResponse(BaseModel):
    case: CaseBase
    assessment: Optional[BarrierAssessmentBase] = None
    intervention: Optional[InterventionBase] = None
    outcome: Optional[OutcomeBase] = None
    service_point: Optional[ServiceDirectoryItem] = None
    rule_evaluation: Optional[RuleEvaluationResult] = None
    audit_history: List[AuditEventItem] = []
    is_synthetic_demo: bool = True

class DashboardFunnelMetrics(BaseModel):
    eligible_reviewed: int
    invited_contacted: int
    engaged: int
    barriers_assessed: int
    customer_confirmed_barriers: int
    interventions_accepted: int
    interventions_completed: int
    barriers_resolved_self_reported: int
    barriers_resolved_verified: int
    accounts_reactivated: int
    meaningful_use_verified: int
    opt_outs: int
    unknown_or_contradictory: int
    sample_size: int
    data_label: str = "Synthetic demonstration data"
    observation_window_days: int = 90

class DashboardMetricsResponse(BaseModel):
    funnel: DashboardFunnelMetrics
    barrier_breakdown: Dict[str, int]
    intervention_outcomes: Dict[str, int]
    account_status_breakdown: Dict[str, int]
    meaningful_use_breakdown: Dict[str, int]
    data_quality_warnings: List[str]
    sample_size: int
    is_synthetic_demonstration: bool = True

class ImportValidationReport(BaseModel):
    total_processed: int
    valid_imported: int
    duplicates_detected: int
    validation_errors: List[str]
    is_synthetic: bool = True

class WorkflowTransitionRequest(BaseModel):
    target_stage: WorkflowStage
    actor_role: str = "BRANCH_OFFICER"
    service_id: Optional[str] = None
    notes: Optional[str] = None
    customer_decision: Optional[CustomerDecision] = None
    barrier_resolved_verified: Optional[bool] = None
    account_status_after: Optional[AccountStatusAfter] = None
    meaningful_use_status: Optional[MeaningfulUseStatus] = None

class WorkflowTransitionResponse(BaseModel):
    case_id: str
    previous_stage: WorkflowStage
    current_stage: WorkflowStage
    actor_role: str
    action_recorded: str
    audit_event_id: str
    message: str
    is_synthetic: bool = True

class GovernanceIndicatorItem(BaseModel):
    code: str
    name: str
    formula: str
    numerator: int
    numerator_label: str
    denominator: int
    denominator_label: str
    rate_pct: float
    value_pct: Optional[float] = None
    time_window: str
    source_requirement: str
    statutory_authority: str
    evidence_tier: str = "Tier D (Simulated Operational Demonstration)"

class GovernanceOutcomesResponse(BaseModel):
    indicators: Dict[str, GovernanceIndicatorItem]
    funnel_stages: Dict[str, int]
    regional_distribution: Dict[str, Dict[str, Any]]
    sovereign_observed_baselines: Dict[str, Any]
    data_boundaries: Dict[str, Any]
    air_gap_verification: Optional[Dict[str, Any]] = None
    sample_size: int
    is_synthetic_demonstration: bool = True

class RetentionPolicyResponse(BaseModel):
    policies: List[Dict[str, Any]]
    total_audit_events: int
    oldest_event_timestamp: Optional[str]
    newest_event_timestamp: Optional[str]
    retention_status: str
    is_synthetic: bool = True
