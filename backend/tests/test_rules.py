"""
Unit Tests for Transparent Rules Engine (R1 to R8)
Validates all deterministic logic, edge cases, and guardrails.
"""
import pytest
from datetime import datetime
from backend.rules import evaluate_case_rules, is_route_fresh_and_verified, evaluate_outcome_separation
from backend.schemas import (
    BarrierPrimary,
    EvidenceSource,
    ConsentStatus,
    PreferredChannel,
    AccountStatusAfter,
    MeaningfulUseStatus
)

def test_rule_r1_customer_declined_or_opt_out():
    """Rule R1: Customer opt-out or no-contact preference suppresses all outreach."""
    case = {
        "case_id": "CASE-TEST-01",
        "consent_status": ConsentStatus.DECLINED.value,
        "contact_permission": False,
        "preferred_channel": PreferredChannel.NO_FURTHER_CONTACT.value
    }
    assessment = {
        "barrier_primary": BarrierPrimary.KYC_MISMATCH.value,
        "customer_confirmed": True,
        "evidence_source": EvidenceSource.CUSTOMER_CONFIRMED.value
    }
    result = evaluate_case_rules(case, assessment)
    assert result.rule_id == "R1"
    assert result.intervention_type == "SUPPRESS_OUTREACH"
    assert "declined" in result.reason.lower() or "opt out" in result.reason.lower()
    assert result.can_auto_proceed is True

def test_rule_r2_customer_confirmed_kyc_mismatch():
    """Rule R2: Customer-confirmed KYC issue routes to verified bank activation path."""
    case = {
        "case_id": "CASE-TEST-02",
        "consent_status": ConsentStatus.CONSENTED.value,
        "contact_permission": True,
        "preferred_channel": PreferredChannel.AUTHORISED_BC.value
    }
    assessment = {
        "barrier_primary": BarrierPrimary.KYC_MISMATCH.value,
        "barrier_secondary": "AADHAAR_NAME_SPELLING_MISMATCH",
        "customer_confirmed": True,
        "evidence_source": EvidenceSource.CUSTOMER_CONFIRMED.value
    }
    service_point = {
        "service_id": "SRV-TEST-01",
        "service_type": "AUTHORISED_BC_KIOSK",
        "authorised_status": True,
        "last_verified_at": "2026-10-01T10:00:00Z" # 20 days old (Fresh)
    }
    result = evaluate_case_rules(case, assessment, service_point)
    assert result.rule_id == "R2"
    assert result.intervention_type == "OFFICIAL_KYC_PATHWAY"
    assert result.destination_verified is True
    assert result.can_auto_proceed is True
    assert "RBI circulars" in result.reason

def test_rule_r3_access_friction_verified_vs_stale_route():
    """Rule R3: Physical access friction with fresh verified point succeeds, stale route blocks."""
    case = {
        "case_id": "CASE-TEST-03",
        "consent_status": ConsentStatus.CONSENTED.value,
        "contact_permission": True,
        "preferred_channel": PreferredChannel.AUTHORISED_BC.value
    }
    assessment = {
        "barrier_primary": BarrierPrimary.PHYSICAL_ACCESS.value,
        "barrier_secondary": "DISTANCE_OVER_15KM",
        "customer_confirmed": True,
        "evidence_source": EvidenceSource.CUSTOMER_CONFIRMED.value
    }
    # Subtest 1: Fresh verified route
    fresh_service = {
        "service_id": "SRV-FRESH-01",
        "location_label": "Kalyanpur Kiosk",
        "authorised_status": True,
        "last_verified_at": "2026-09-25T10:00:00Z"
    }
    res_fresh = evaluate_case_rules(case, assessment, fresh_service)
    assert res_fresh.rule_id == "R3"
    assert res_fresh.intervention_type == "VERIFIED_BC_ASSIST"
    assert res_fresh.destination_verified is True
    assert res_fresh.can_auto_proceed is True

    # Subtest 2: Stale route (>90 days old)
    stale_service = {
        "service_id": "SRV-STALE-01",
        "location_label": "Defunct Point",
        "authorised_status": True,
        "last_verified_at": "2026-03-01T10:00:00Z" # >200 days old
    }
    res_stale = evaluate_case_rules(case, assessment, stale_service)
    assert res_stale.rule_id == "R3"
    assert res_stale.intervention_type == "HUMAN_REVIEW_HOLD"
    assert res_stale.destination_verified is False
    assert res_stale.can_auto_proceed is False
    assert "stale or unverified" in res_stale.triggering_evidence

    # Subtest 3: Explicitly unauthorized route
    unauth_service = {
        "service_id": "SRV-UNAUTH-01",
        "authorised_status": False,
        "last_verified_at": "2026-10-01T10:00:00Z"
    }
    res_unauth = evaluate_case_rules(case, assessment, unauth_service)
    assert res_unauth.destination_verified is False
    assert res_unauth.can_auto_proceed is False

def test_rule_r4_unresolved_grievance_or_trust():
    """Rule R4: Unresolved complaint routes to grievance redressal first; never pushes reactivation."""
    case = {
        "case_id": "CASE-TEST-04",
        "consent_status": ConsentStatus.CONSENTED.value,
        "contact_permission": True,
        "preferred_channel": PreferredChannel.BRANCH_VISIT.value
    }
    assessment = {
        "barrier_primary": BarrierPrimary.TRUST_GRIEVANCE.value,
        "barrier_secondary": "FAILED_ATM_DEBIT_WITHOUT_REVERSAL",
        "customer_confirmed": True,
        "evidence_source": EvidenceSource.CUSTOMER_CONFIRMED.value
    }
    result = evaluate_case_rules(case, assessment)
    assert result.rule_id == "R4"
    assert result.intervention_type == "GRIEVANCE_ESCALATION"
    assert "grievance" in result.reason.lower()
    assert "never promise refund" in result.limitations.lower()

def test_rule_r5_changed_utility_neutral_no_action():
    """Rule R5: Changed utility offers neutral info and structured no-action."""
    case = {
        "case_id": "CASE-TEST-05",
        "consent_status": ConsentStatus.CONSENTED.value,
        "contact_permission": True,
        "preferred_channel": PreferredChannel.PLAIN_SMS_GUIDE.value
    }
    assessment = {
        "barrier_primary": BarrierPrimary.CHANGED_UTILITY.value,
        "barrier_secondary": "COLLEGE_SCHOLARSHIP_CYCLE_ENDED",
        "customer_confirmed": True,
        "evidence_source": EvidenceSource.CUSTOMER_CONFIRMED.value
    }
    result = evaluate_case_rules(case, assessment)
    assert result.rule_id == "R5"
    assert result.intervention_type == "NEUTRAL_INFO_NO_ACTION"
    assert "Never push artificial transactions" in result.limitations

def test_rule_r6_system_signal_only_without_confirmation():
    """Rule R6: System signal or unconfirmed reason must hold for human review; no guessing."""
    case = {
        "case_id": "CASE-TEST-06",
        "consent_status": ConsentStatus.CONSENTED.value,
        "contact_permission": True,
        "preferred_channel": PreferredChannel.AUTHORISED_BC.value
    }
    # Unconfirmed system signal
    assessment = {
        "barrier_primary": BarrierPrimary.KYC_MISMATCH.value,
        "customer_confirmed": False, # NOT confirmed by customer
        "evidence_source": EvidenceSource.SYSTEM_SIGNAL_ONLY.value
    }
    result = evaluate_case_rules(case, assessment)
    assert result.rule_id == "R6"
    assert result.intervention_type == "HUMAN_REVIEW_HOLD"
    assert result.can_auto_proceed is False
    assert "system signal only" in result.triggering_evidence

def test_rule_r7_and_r8_outcome_separation():
    """Rules R7 & R8: Separation of operational reactivation, barrier resolution, and meaningful use."""
    # Test R7: Referral completed but verified resolution missing
    barrier_status, meaningful_status, expl = evaluate_outcome_separation(
        barrier_resolved_self_reported=True,
        barrier_resolved_verified=False,
        account_status_after=AccountStatusAfter.ACTIVATION_REQUESTED.value,
        customer_desires_use=True,
        actual_voluntary_use_recorded=False
    )
    assert barrier_status == "SELF_REPORTED_RESOLVED_UNVERIFIED"

    # Test R8: Reactivated operationally, but customer does NOT want ongoing use
    barrier_status, meaningful_status, expl = evaluate_outcome_separation(
        barrier_resolved_self_reported=True,
        barrier_resolved_verified=True,
        account_status_after=AccountStatusAfter.REACTIVATED_OPERATIONAL.value,
        customer_desires_use=False, # Customer does not want ongoing use
        actual_voluntary_use_recorded=False
    )
    assert barrier_status == "VERIFIED_RESOLVED"
    assert meaningful_status == MeaningfulUseStatus.NO_FURTHER_USE_WANTED.value
    assert "Rule R8 applied" in expl

    # Test Full Voluntary Success
    barrier_status, meaningful_status, expl = evaluate_outcome_separation(
        barrier_resolved_self_reported=True,
        barrier_resolved_verified=True,
        account_status_after=AccountStatusAfter.REACTIVATED_OPERATIONAL.value,
        customer_desires_use=True,
        actual_voluntary_use_recorded=True
    )
    assert barrier_status == "VERIFIED_RESOLVED"
    assert meaningful_status == MeaningfulUseStatus.VERIFIED_VOLUNTARY_USE.value
