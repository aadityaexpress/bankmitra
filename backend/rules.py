"""
Transparent Rules Engine for BankMitra
Deterministic, explainable rule execution (R1 to R8).
Never infers customer motive from low balance or inactivity duration alone.
"""
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timezone
from backend.schemas import (
    RuleEvaluationResult,
    BarrierPrimary,
    EvidenceSource,
    ConsentStatus,
    PreferredChannel,
    CustomerDecision,
    AccountStatusAfter,
    MeaningfulUseStatus
)

def is_route_fresh_and_verified(service_dict: Optional[Dict[str, Any]]) -> Tuple[bool, str]:
    """Checks whether a service directory route is authorised and verified within 90 days."""
    if not service_dict:
        return False, "No service directory touchpoint specified."
    
    if not service_dict.get("authorised_status", False):
        return False, f"Touchpoint {service_dict.get('service_id')} is marked unverified/unauthorised."
    
    verified_str = service_dict.get("last_verified_at", "")
    try:
        verified_date = datetime.fromisoformat(verified_str.replace("Z", "+00:00")).date()
        # Assume reference date 2026-10-21
        reference_date = datetime(2026, 10, 21).date()
        days_stale = (reference_date - verified_date).days
        if days_stale > 90:
            return False, f"Directory verification is stale ({days_stale} days old > 90 days limit)."
        return True, f"Verified active touchpoint ({days_stale} days since audit)."
    except Exception:
        return False, "Could not parse verification timestamp."

def evaluate_case_rules(
    case: Dict[str, Any],
    assessment: Optional[Dict[str, Any]] = None,
    service_point: Optional[Dict[str, Any]] = None,
    outcome: Optional[Dict[str, Any]] = None
) -> RuleEvaluationResult:
    """
    Executes the deterministic decision tree for a synthetic case.
    Strictly forbids guessing customer motive from telemetry alone.
    """
    # Guardrail 1: Customer declined contact, opted out, or preference is NO_FURTHER_CONTACT (Rule R1)
    if (
        case.get("consent_status") in [ConsentStatus.DECLINED.value, ConsentStatus.WITHDRAWN.value]
        or not case.get("contact_permission", True)
        or case.get("preferred_channel") == PreferredChannel.NO_FURTHER_CONTACT.value
        or (outcome and outcome.get("opt_out", False))
    ):
        return RuleEvaluationResult(
            rule_id="R1",
            triggering_evidence="Customer consent is DECLINED/WITHDRAWN or contact_permission is FALSE.",
            reason="Customer has exercised their autonomous right to decline contact or opt out of outreach.",
            required_verification="Verify customer opt-out status in compliance registry; ensure no automated retargeting.",
            suggested_next_step="Suppress all simulated communication immediately. Log opt-out in compliance audit.",
            intervention_type="SUPPRESS_OUTREACH",
            assigned_channel="INTERNAL_REVIEW",
            service_id=None,
            destination_verified=False,
            limitations="No outreach permitted. Respecting customer choice outranks operational re-engagement metrics.",
            can_auto_proceed=True
        )

    # If no barrier assessment exists or primary barrier is unconfirmed/unknown
    if not assessment:
        return RuleEvaluationResult(
            rule_id="R6",
            triggering_evidence="Case has no recorded barrier assessment.",
            reason="Inactivity telemetry alone cannot determine root cause. Customer has not yet stated their barrier.",
            required_verification="Consented initial contact required via approved channel before prescribing any action.",
            suggested_next_step="Queue for consented, non-leading barrier inquiry or hold in review queue.",
            intervention_type="HUMAN_REVIEW_HOLD",
            assigned_channel="INTERNAL_REVIEW",
            service_id=None,
            destination_verified=False,
            limitations="Never infer reason from transaction history, zero balance, or time elapsed.",
            can_auto_proceed=False
        )

    barrier = assessment.get("barrier_primary")
    evidence_source = assessment.get("evidence_source")
    customer_confirmed = assessment.get("customer_confirmed", False)

    # Guardrail 2: System signal only without customer confirmation (Rule R6)
    if evidence_source == EvidenceSource.SYSTEM_SIGNAL_ONLY.value or not customer_confirmed:
        return RuleEvaluationResult(
            rule_id="R6",
            triggering_evidence=f"Barrier {barrier} flagged by system signal only (customer_confirmed = {customer_confirmed}).",
            reason="System heuristic or transaction pattern cannot substitute for customer's confirmed lived reality.",
            required_verification="Human review or trusted outreach required to confirm actual blocker before action.",
            suggested_next_step="Schedule neutral check-in with authorised staff to confirm customer-stated blocker.",
            intervention_type="HUMAN_REVIEW_HOLD",
            assigned_channel="INTERNAL_REVIEW",
            service_id=None,
            destination_verified=False,
            limitations="Automated cause-labeling on unconfirmed signals violates consumer protection protocols.",
            can_auto_proceed=False
        )

    # Rule R2: Customer-confirmed KYC / Customer Detail Mismatch
    if barrier == BarrierPrimary.KYC_MISMATCH.value and customer_confirmed:
        verified, verif_msg = is_route_fresh_and_verified(service_point)
        svc_id = service_point.get("service_id") if (service_point and verified) else None
        channel = "AUTHORISED_BC" if (service_point and "BC" in service_point.get("service_type", "")) else "BANK_BRANCH"
        
        return RuleEvaluationResult(
            rule_id="R2",
            triggering_evidence=f"Customer-confirmed KYC mismatch ({assessment.get('barrier_secondary', 'General KYC')}).",
            reason="Customer is blocked by documentation or demographic mismatch. RBI circulars (01 Jan 2024, 12 Jun 2025) permit KYC updation at non-home branches and through authorised BCs.",
            required_verification=f"Route verification: {verif_msg}. Must verify document checklist without collecting credentials.",
            suggested_next_step="Provide official bank KYC guidance and appointment at verified local BC or non-home branch.",
            intervention_type="OFFICIAL_KYC_PATHWAY",
            assigned_channel=channel,
            service_id=svc_id,
            destination_verified=verified,
            limitations="System does not collect or process KYC documents. Activation execution remains strictly with bank.",
            can_auto_proceed=verified
        )

    # Rule R3: Customer-confirmed Physical Access Friction
    if barrier == BarrierPrimary.PHYSICAL_ACCESS.value and customer_confirmed:
        verified, verif_msg = is_route_fresh_and_verified(service_point)
        if not verified:
            return RuleEvaluationResult(
                rule_id="R3",
                triggering_evidence="Customer-confirmed physical access barrier, but assigned service point is stale or unverified.",
                reason="Routing a customer to an unverified or defunct BC point wastes travel and damages institutional trust.",
                required_verification=f"Blocked: {verif_msg}. Requires lead-bank directory audit.",
                suggested_next_step="Hold case in review queue until a verified, active local service touchpoint is audited.",
                intervention_type="HUMAN_REVIEW_HOLD",
                assigned_channel="INTERNAL_REVIEW",
                service_id=None,
                destination_verified=False,
                limitations="Never dispatch customer to an unverified touchpoint.",
                can_auto_proceed=False
            )
        
        return RuleEvaluationResult(
            rule_id="R3",
            triggering_evidence=f"Customer-confirmed physical access barrier ({assessment.get('barrier_secondary', 'Distance/Hours')}).",
            reason=f"Customer faces distance or transit friction. Verified local service point identified: {service_point.get('location_label')}.",
            required_verification=f"Touchpoint verified: {verif_msg}.",
            suggested_next_step="Offer doorstep/local kiosk appointment with verified authorised Business Correspondent.",
            intervention_type="VERIFIED_BC_ASSIST",
            assigned_channel="AUTHORISED_BC",
            service_id=service_point.get("service_id"),
            destination_verified=True,
            limitations="Appointment subject to BC terminal uptime and liquidity availability on scheduled date.",
            can_auto_proceed=True
        )

    # Rule R4: Unresolved Service Grievance or Loss of Trust
    if barrier == BarrierPrimary.TRUST_GRIEVANCE.value and customer_confirmed:
        return RuleEvaluationResult(
            rule_id="R4",
            triggering_evidence=f"Customer reports unresolved grievance: {assessment.get('barrier_secondary', 'Service failure')}.",
            reason="Customer ceased banking due to an unresolved failure, charge dispute, or broken promise. Re-engagement without resolving the grievance is coercive.",
            required_verification="Verify historical ticket in bank internal grievance redressal system or Ombudsman logs.",
            suggested_next_step="Route directly to Bank Customer Service Committee / Internal Ombudsman; track formal acknowledgement.",
            intervention_type="GRIEVANCE_ESCALATION",
            assigned_channel="BANK_BRANCH",
            service_id=service_point.get("service_id") if service_point else None,
            destination_verified=True,
            limitations="Referral to grievance mechanism does NOT constitute resolution. Never promise refund or outcome.",
            can_auto_proceed=True
        )

    # Rule R5: Changed or Low Utility
    if barrier == BarrierPrimary.CHANGED_UTILITY.value and customer_confirmed:
        return RuleEvaluationResult(
            rule_id="R5",
            triggering_evidence=f"Customer reports account no longer needed ({assessment.get('barrier_secondary', 'Scheme concluded')}).",
            reason="Account utility has concluded (e.g., student graduated, scholarship ended). Customer has no organic transaction demand.",
            required_verification="Confirm whether any future welfare or Direct Benefit Transfer credits are anticipated.",
            suggested_next_step="Provide neutral information on zero-minimum-balance rights, structured closure option, or safe no-action.",
            intervention_type="NEUTRAL_INFO_NO_ACTION",
            assigned_channel="CUSTOMER_SELF_SERVICE",
            service_id=None,
            destination_verified=True,
            limitations="Never push artificial transactions, forced deposits, or unwanted insurance/credit cross-sells.",
            can_auto_proceed=True
        )

    # Rule R6: Unknown, Contradictory, or Sensitive Reason
    return RuleEvaluationResult(
        rule_id="R6",
        triggering_evidence=f"Barrier assessment is {barrier} with evidence {evidence_source}.",
        reason="Evidence is insufficient, ambiguous, or contradictory. Automated intervention is unsafe.",
        required_verification="Case must be reviewed by bank inclusion officer or placed on safe hold.",
        suggested_next_step="Route to human review queue; do not initiate automated outbound contact.",
        intervention_type="HUMAN_REVIEW_HOLD",
        assigned_channel="INTERNAL_REVIEW",
        service_id=None,
        destination_verified=False,
        limitations="Protect customer from unguided outreach when root friction is undetermined.",
        can_auto_proceed=False
    )

def evaluate_outcome_separation(
    barrier_resolved_self_reported: bool,
    barrier_resolved_verified: bool,
    account_status_after: str,
    customer_desires_use: bool,
    actual_voluntary_use_recorded: bool
) -> Tuple[str, str, str]:
    """
    Evaluates Rule R7 & Rule R8:
    Strictly prevents false success claims by separating:
    1. Operational account status
    2. Barrier resolution
    3. Meaningful access
    """
    # Rule R7: Referral completed but verified resolution missing
    if barrier_resolved_self_reported and not barrier_resolved_verified:
        barrier_status = "SELF_REPORTED_RESOLVED_UNVERIFIED"
    elif barrier_resolved_verified:
        barrier_status = "VERIFIED_RESOLVED"
    else:
        barrier_status = "UNRESOLVED"

    # Rule R8: Account reactivated but customer does not want ongoing use
    if account_status_after == AccountStatusAfter.REACTIVATED_OPERATIONAL.value:
        if not customer_desires_use:
            meaningful_status = MeaningfulUseStatus.NO_FURTHER_USE_WANTED.value
            explanation = "Rule R8 applied: Account was reactivated operationally, but customer explicitly stated no further use wanted. Cannot count as meaningful inclusion success."
        elif actual_voluntary_use_recorded:
            meaningful_status = MeaningfulUseStatus.VERIFIED_VOLUNTARY_USE.value
            explanation = "Customer voluntarily performed transaction within observation window."
        else:
            meaningful_status = MeaningfulUseStatus.NO_USE_DETECTED.value
            explanation = "Account reactivated, but no voluntary use observed within observation window."
    else:
        meaningful_status = MeaningfulUseStatus.NOT_MEASURED_YET.value
        explanation = "Account is not in reactivated operational status."

    return barrier_status, meaningful_status, explanation
