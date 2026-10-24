"""
Synthetic Data Generator & Import Validator for BankMitra
Generates 200 deliberately varied fictional cases.
Strictly zero real PII or bank records.
"""
import csv
import json
import random
import os
from pathlib import Path
from datetime import datetime, date, timedelta, timezone
from typing import List, Dict, Any, Tuple, Optional

from backend.database import get_connection, init_db, log_audit_event
from backend.rules import evaluate_case_rules, is_route_fresh_and_verified
from backend.schemas import (
    InactivityBand,
    AccountOrigin,
    ConsentStatus,
    PreferredChannel,
    BarrierPrimary,
    EvidenceSource,
    ConfidenceLabel,
    CustomerDecision,
    CompletionStatus,
    AccountStatusAfter,
    MeaningfulUseStatus
)

DATA_DIR = Path(__file__).resolve().parent / "data"

SERVICE_DIRECTORY_SEEDS = [
    {
        "service_id": "SRV-RAMPUR-BC-01",
        "institution": "Synthetic Gramin Bank",
        "service_type": "AUTHORISED_BC_KIOSK",
        "location_label": "Kalyanpur Gram Panchayat CSP Kiosk",
        "authorised_status": True,
        "verification_source": "LEAD_BANK_OFFICER_AUDIT",
        "last_verified_at": "2026-09-15T10:00:00Z", # Fresh (36 days ago)
        "contact_route": "CSP-Code-88210 / Ph: 0522-290001 (Simulated)",
        "is_synthetic": True
    },
    {
        "service_id": "SRV-RAMPUR-BC-02",
        "institution": "Synthetic Gramin Bank",
        "service_type": "AUTHORISED_BC_KIOSK",
        "location_label": "Badaun Crossroad BC Sakhi Point",
        "authorised_status": True,
        "verification_source": "CORPORATE_BC_AUDIT",
        "last_verified_at": "2026-04-10T11:00:00Z", # Stale (>190 days ago)
        "contact_route": "CSP-Code-99412 / Ph: 0522-290002 (Simulated)",
        "is_synthetic": True
    },
    {
        "service_id": "SRV-CENTRAL-BR-01",
        "institution": "State Bank of India (Synthetic Sim)",
        "service_type": "NON_HOME_BRANCH",
        "location_label": "Civil Lines Non-Home Hub, District HQ",
        "authorised_status": True,
        "verification_source": "RBI_BRANCH_ROSTER_Q3",
        "last_verified_at": "2026-10-01T09:30:00Z", # Fresh (20 days ago)
        "contact_route": "Branch Code: 04218 / Helpdesk: 1800-SYNTH-01",
        "is_synthetic": True
    },
    {
        "service_id": "SRV-RURAL-BR-02",
        "institution": "Punjab National Bank (Synthetic Sim)",
        "service_type": "NON_HOME_BRANCH",
        "location_label": "Block Development Road Branch",
        "authorised_status": False, # Unauthorised / suspended
        "verification_source": "BANK_COMPLIANCE_NOTICE",
        "last_verified_at": "2026-08-01T12:00:00Z",
        "contact_route": "Branch Code: 09114 (Temporarily Closed)",
        "is_synthetic": True
    },
    {
        "service_id": "SRV-VCIP-PORTAL-01",
        "institution": "Bank of Baroda (Synthetic Sim)",
        "service_type": "OFFICIAL_VCIP_PORTAL",
        "location_label": "Official Bank Video-KYC Direct Gateway",
        "authorised_status": True,
        "verification_source": "CYBER_SECURITY_AUDIT",
        "last_verified_at": "2026-10-15T08:00:00Z", # Fresh (6 days ago)
        "contact_route": "https://synthetic.bankofbaroda.sim/vcip",
        "is_synthetic": True
    },
    {
        "service_id": "SRV-OMBUDSMAN-DESK-01",
        "institution": "Lead District Bank Redressal Cell",
        "service_type": "INTERNAL_OMBUDSMAN_DESK",
        "location_label": "Lead District Office Grievance Cell",
        "authorised_status": True,
        "verification_source": "DISTRICT_COLLECTORATE_AUDIT",
        "last_verified_at": "2026-09-20T14:00:00Z", # Fresh
        "contact_route": "grievance-leadbank@synthetic.sim / Toll-free: 1800-SYNTH-99",
        "is_synthetic": True
    }
]

def generate_synthetic_dataset(count: int = 200, seed: int = 42) -> Dict[str, List[Dict[str, Any]]]:
    """
    Generates 200 deterministic, reproducible synthetic cases with varied conditions.
    """
    random.seed(seed)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    cases = []
    assessments = []
    interventions = []
    outcomes = []
    audit_events = []

    # Barrier allocation targets for 200 cases:
    # 1-40: KYC Mismatch (customer confirmed)
    # 41-75: Physical Access (35 cases: 20 fresh BC, 15 stale/unverified BC)
    # 76-105: Trust / Unresolved Grievance (30 cases)
    # 106-135: Changed / Low Utility (30 cases)
    # 136-160: Digital / Transaction Friction (25 cases)
    # 161-185: Unknown / Contradictory / System-signal only (25 cases)
    # 186-200: Opted out / Contact declined (15 cases)

    for i in range(1, count + 1):
        case_id = f"CASE-{i:04d}"
        customer_token = f"CUST-SYN-{i:04d}"
        
        # Chronological cohorts: Cases achieving sustained usage must have an observed
        # post-activation window >= 90 days. Earlier stages have shorter windows (<90d).
        is_sustained_cohort = (36 <= i <= 60) or (i > 60 and i < 186 and (i % 2 == 0) and (i % 4 != 0) and (i % 3 != 0))
        if is_sustained_cohort:
            review_date = (date(2026, 5, 1) + timedelta(days=(i % 25))).isoformat()
        else:
            review_date = (date(2026, 8, 1) + timedelta(days=(i % 45))).isoformat()
        
        inactivity_band = random.choice([
            InactivityBand.TWO_TO_THREE_YEARS.value,
            InactivityBand.THREE_TO_FIVE_YEARS.value,
            InactivityBand.FIVE_TO_TEN_YEARS.value
        ])
        if i % 18 == 0:
            inactivity_band = InactivityBand.OVER_TEN_YEARS.value

        origin = random.choice([
            AccountOrigin.PMJDY_BENEFIT.value,
            AccountOrigin.SCHOLARSHIP_DBT.value,
            AccountOrigin.GENERAL_SAVINGS.value,
            AccountOrigin.RURAL_EMPLOYMENT_MGNREGA.value
        ])

        # Edge cohort 1: Opt-outs / declined (Cases 186 to 200)
        if i >= 186:
            consent_status = ConsentStatus.DECLINED.value if i % 2 == 0 else ConsentStatus.WITHDRAWN.value
            contact_permission = False
            preferred_channel = PreferredChannel.NO_FURTHER_CONTACT.value
        else:
            consent_status = ConsentStatus.CONSENTED.value
            contact_permission = True
            preferred_channel = random.choice([
                PreferredChannel.AUTHORISED_BC.value,
                PreferredChannel.BRANCH_VISIT.value,
                PreferredChannel.PLAIN_SMS_GUIDE.value
            ])

        if i <= 48:
            region = "East Zone"
        elif i <= 100:
            region = "Central Zone"
        elif i <= 136:
            region = "South Zone"
        elif i <= 168:
            region = "North Zone"
        elif i <= 178:
            region = "North-East Zone"
        else:
            region = "West Zone"

        cases.append({
            "case_id": case_id,
            "customer_token": customer_token,
            "region": region,
            "workflow_stage": "ASSESSMENT",
            "status_source": "CBS_BATCH_REVIEW" if i % 2 == 0 else "BC_TRANSACTION_FAIL",
            "review_date": review_date,
            "inactivity_band": inactivity_band,
            "account_origin": origin,
            "consent_status": consent_status,
            "contact_permission": contact_permission,
            "preferred_channel": preferred_channel,
            "source_authorisation": "AUTH-MANDATE-2026-B1",
            "is_synthetic": True
        })

        # Barrier Assessment logic
        assessment_id = f"ASM-{i:04d}"
        recorded_at = (date(2026, 8, 5) + timedelta(days=(i % 55))).isoformat() + "T10:00:00Z"

        if i <= 40:
            # KYC Mismatch
            barrier_primary = BarrierPrimary.KYC_MISMATCH.value
            barrier_secondary = random.choice([
                "AADHAAR_NAME_SPELLING_MISMATCH",
                "ADDRESS_CHANGED_POST_MIGRATION",
                "MINOR_TO_MAJOR_STATUS_PENDING"
            ])
            evidence_source = EvidenceSource.CUSTOMER_CONFIRMED.value
            confidence_label = ConfidenceLabel.HIGH_CONFIRMED.value
            customer_confirmed = True
            assigned_service_id = "SRV-CENTRAL-BR-01" if i % 2 == 0 else "SRV-RAMPUR-BC-01"
            notes = "Customer verified that name spelling differs between Aadhaar and CBS ledger."

        elif i <= 75:
            # Physical Access
            barrier_primary = BarrierPrimary.PHYSICAL_ACCESS.value
            barrier_secondary = random.choice([
                "DISTANCE_OVER_15KM_NO_TRANSIT",
                "BRANCH_OPERATING_HOURS_CLASH_WAGES",
                "ELDERLY_MOBILITY_IMPEDIMENT"
            ])
            evidence_source = EvidenceSource.CUSTOMER_CONFIRMED.value
            confidence_label = ConfidenceLabel.HIGH_CONFIRMED.value
            customer_confirmed = True
            # Cases 61-75 assigned to stale or unverified service points!
            if i > 60:
                assigned_service_id = "SRV-RAMPUR-BC-02" if i % 2 == 0 else "SRV-RURAL-BR-02"
            else:
                assigned_service_id = "SRV-RAMPUR-BC-01"
            notes = "Customer reports roundtrip bus fare (₹80) exceeds transaction benefit."

        elif i <= 105:
            # Trust / Grievance
            barrier_primary = BarrierPrimary.TRUST_GRIEVANCE.value
            barrier_secondary = random.choice([
                "FAILED_ATM_DEBIT_WITHOUT_REVERSAL",
                "UNEXPECTED_SMS_ALERT_DEDUCTIONS",
                "RUDE_BEHAVIOR_AT_HOME_BRANCH"
            ])
            evidence_source = EvidenceSource.CUSTOMER_CONFIRMED.value
            confidence_label = ConfidenceLabel.HIGH_CONFIRMED.value
            customer_confirmed = True
            assigned_service_id = "SRV-OMBUDSMAN-DESK-01"
            notes = "Customer ceased using card after ₹1,500 ATM failed debit took 4 months to dispute."

        elif i <= 135:
            # Changed Utility
            barrier_primary = BarrierPrimary.CHANGED_UTILITY.value
            barrier_secondary = random.choice([
                "COLLEGE_SCHOLARSHIP_CYCLE_ENDED",
                "FAMILY_MOVED_PRIMARY_BANKING_TO_POST_OFFICE",
                "ACCOUNT_OPENED_FOR_ONE_TIME_FLOOD_RELIEF"
            ])
            evidence_source = EvidenceSource.CUSTOMER_CONFIRMED.value
            confidence_label = ConfidenceLabel.HIGH_CONFIRMED.value
            customer_confirmed = True
            assigned_service_id = None
            notes = "Customer states no immediate transactions planned; prefers keeping account dormant without penalty."

        elif i <= 160:
            # Digital / Transaction friction
            barrier_primary = BarrierPrimary.DIGITAL_FRICTION.value
            barrier_secondary = random.choice([
                "LOCKED_UPI_PIN_FORGOTTEN",
                "REPEATED_BIOMETRIC_FAIL_AT_MICRO_ATM",
                "FEAR_OF_ONLINE_FRAUD_AFTER_MISSED_CALL"
            ])
            evidence_source = EvidenceSource.CUSTOMER_CONFIRMED.value
            confidence_label = ConfidenceLabel.HIGH_CONFIRMED.value
            customer_confirmed = True
            assigned_service_id = "SRV-RAMPUR-BC-01"
            notes = "Elderly customer faces dry-finger biometric mismatch on AePS terminal."

        elif i <= 185:
            # Unknown / Contradictory / System-signal only
            barrier_primary = BarrierPrimary.UNKNOWN_OR_CONTRADICTORY.value
            barrier_secondary = "INSUFFICIENT_EVIDENCE_SYSTEM_FLAG_ONLY"
            evidence_source = EvidenceSource.SYSTEM_SIGNAL_ONLY.value
            confidence_label = ConfidenceLabel.LOW_INFERRED.value
            customer_confirmed = False
            assigned_service_id = None
            notes = "CBS flagged zero balance and 36 months inactivity. Customer has not yet been interviewed."

        else:
            # Opted-out cohort (186-200)
            barrier_primary = BarrierPrimary.UNKNOWN_OR_CONTRADICTORY.value
            barrier_secondary = "CUSTOMER_DECLINED_DIAGNOSIS"
            evidence_source = EvidenceSource.UNKNOWN.value
            confidence_label = ConfidenceLabel.UNRESOLVED.value
            customer_confirmed = False
            assigned_service_id = None
            notes = "Customer requested to be excluded from any outreach."

        assessments.append({
            "assessment_id": assessment_id,
            "case_id": case_id,
            "barrier_primary": barrier_primary,
            "barrier_secondary": barrier_secondary,
            "evidence_source": evidence_source,
            "confidence_label": confidence_label,
            "customer_confirmed": customer_confirmed,
            "recorded_at": recorded_at,
            "notes": notes,
            "is_synthetic": True
        })

        # Intervention logic using Rules Engine
        service_dict = next((s for s in SERVICE_DIRECTORY_SEEDS if s["service_id"] == assigned_service_id), None)
        rule_res = evaluate_case_rules(
            case=cases[-1],
            assessment=assessments[-1],
            service_point=service_dict,
            outcome=None
        )

        intervention_id = f"INT-{i:04d}"
        if is_sustained_cohort:
            offered_at = (date(2026, 5, 15) + timedelta(days=(i % 20))).isoformat() + "T11:00:00Z"
            default_completed = (date(2026, 6, 1) + timedelta(days=(i % 20))).isoformat() + "T16:00:00Z"
            follow_up_date = (date(2026, 9, 20) + timedelta(days=(i % 25))).isoformat()
        else:
            offered_at = (date(2026, 8, 10) + timedelta(days=(i % 40))).isoformat() + "T11:00:00Z"
            default_completed = (date(2026, 9, 1) + timedelta(days=(i % 25))).isoformat() + "T16:00:00Z"
            follow_up_date = (date(2026, 9, 20) + timedelta(days=(i % 20))).isoformat()
        
        # Decide customer response and completion status based on cohort
        if rule_res.rule_id == "R1":
            cust_decision = CustomerDecision.OPTED_OUT.value
            completion_status = CompletionStatus.DECLINED.value
            completed_at = offered_at
        elif rule_res.rule_id == "R6" or not rule_res.can_auto_proceed:
            cust_decision = CustomerDecision.PENDING_DECISION.value
            completion_status = CompletionStatus.BLOCKED_UNVERIFIED.value if "BLOCKED" in rule_res.triggering_evidence else CompletionStatus.NOT_OFFERED.value
            completed_at = None
        else:
            # Varied acceptance
            if is_sustained_cohort:
                cust_decision = CustomerDecision.ACCEPTED.value
                completion_status = CompletionStatus.COMPLETED.value
                completed_at = default_completed
            elif i % 7 == 0:
                cust_decision = CustomerDecision.DECLINED.value
                completion_status = CompletionStatus.DECLINED.value
                completed_at = offered_at
            elif i % 5 == 0:
                cust_decision = CustomerDecision.REQUESTED_NO_ACTION.value
                completion_status = CompletionStatus.COMPLETED.value
                completed_at = offered_at
            else:
                cust_decision = CustomerDecision.ACCEPTED.value
                completion_status = CompletionStatus.COMPLETED.value if i % 3 != 0 else CompletionStatus.IN_PROGRESS.value
                completed_at = default_completed if completion_status == CompletionStatus.COMPLETED.value else None

        interventions.append({
            "intervention_id": intervention_id,
            "case_id": case_id,
            "rule_id": rule_res.rule_id,
            "intervention_type": rule_res.intervention_type,
            "service_id": rule_res.service_id,
            "destination_verified": rule_res.destination_verified,
            "assigned_channel": rule_res.assigned_channel,
            "customer_decision": cust_decision,
            "completion_status": completion_status,
            "offered_at": offered_at,
            "completed_at": completed_at,
            "explanation_note": rule_res.reason,
            "is_synthetic": True
        })

        # Outcome logic
        outcome_id = f"OUT-{i:04d}"

        # Edge cohort: Cases 1-20 -> Referral completed, but verified resolution is false (Rule R7)
        if 1 <= i <= 20:
            barrier_self_reported = True
            barrier_verified = False # Not verified by branch/BC audit
            acct_status = AccountStatusAfter.ACTIVATION_REQUESTED.value
            meaningful_use = MeaningfulUseStatus.SELF_REPORTED_USE.value
            opt_out = False
            outcome_src = "CONSENTED_FOLLOW_UP"
            notes = "Customer says barrier resolved; official bank activation flag not yet verified."

        # Edge cohort: Cases 21-35 -> Reactivated operationally, but customer does NOT want further use (Rule R8)
        elif 21 <= i <= 35:
            barrier_self_reported = True
            barrier_verified = True
            acct_status = AccountStatusAfter.REACTIVATED_OPERATIONAL.value
            meaningful_use = MeaningfulUseStatus.NO_FURTHER_USE_WANTED.value # Rule R8: Strictly NOT counted as meaningful success!
            opt_out = False
            outcome_src = "BRANCH_RECORD"
            notes = "Account reactivated during camp; customer explicitly informed staff they do not need daily use."

        # Cases 36-60 -> Full voluntary success
        elif 36 <= i <= 60:
            barrier_self_reported = True
            barrier_verified = True
            acct_status = AccountStatusAfter.REACTIVATED_OPERATIONAL.value
            meaningful_use = MeaningfulUseStatus.VERIFIED_VOLUNTARY_USE.value
            opt_out = False
            outcome_src = "BC_TRANSACTION_LOG"
            notes = "Customer completed Aadhaar KYC at local BC and successfully deposited savings."

        # Cases 186-200 -> Opt-out cohort
        elif i >= 186:
            barrier_self_reported = False
            barrier_verified = False
            acct_status = AccountStatusAfter.INOPERATIVE_UNCHANGED.value
            meaningful_use = MeaningfulUseStatus.NOT_MEASURED_YET.value
            opt_out = True
            outcome_src = "CONSENTED_FOLLOW_UP"
            notes = "Outreach suppressed per customer explicit decline."

        else:
            # Remaining mix
            if interventions[-1]["completion_status"] == CompletionStatus.COMPLETED.value:
                barrier_self_reported = True
                barrier_verified = (i % 2 == 0)
                acct_status = AccountStatusAfter.REACTIVATED_OPERATIONAL.value if barrier_verified else AccountStatusAfter.INOPERATIVE_UNCHANGED.value
                meaningful_use = MeaningfulUseStatus.VERIFIED_VOLUNTARY_USE.value if is_sustained_cohort else MeaningfulUseStatus.NO_USE_DETECTED.value
            else:
                barrier_self_reported = False
                barrier_verified = False
                acct_status = AccountStatusAfter.INOPERATIVE_UNCHANGED.value
                meaningful_use = MeaningfulUseStatus.NOT_MEASURED_YET.value
            opt_out = False
            outcome_src = "UNVERIFIED"
            notes = "Standard synthetic progression."

        outcomes.append({
            "outcome_id": outcome_id,
            "case_id": case_id,
            "barrier_resolved_self_reported": barrier_self_reported,
            "barrier_resolved_verified": barrier_verified,
            "account_status_after": acct_status,
            "meaningful_use_status": meaningful_use,
            "outcome_source": outcome_src,
            "follow_up_date": follow_up_date,
            "opt_out": opt_out,
            "notes": notes,
            "is_synthetic": True
        })

        # Determine and assign final workflow stage for synthetic demonstration
        if opt_out or i >= 186:
            stage = "OPTED_OUT"
        elif meaningful_use == MeaningfulUseStatus.VERIFIED_VOLUNTARY_USE.value:
            stage = "SUSTAINED_USAGE"
        elif acct_status == AccountStatusAfter.REACTIVATED_OPERATIONAL.value:
            stage = "VERIFIED_REACTIVATION"
        elif interventions[-1]["completion_status"] == CompletionStatus.COMPLETED.value:
            stage = "COMPLETED"
        elif interventions[-1]["completion_status"] == CompletionStatus.BLOCKED_UNVERIFIED.value or barrier_primary in [BarrierPrimary.TRUST_GRIEVANCE.value, BarrierPrimary.UNKNOWN_OR_CONTRADICTORY.value] or not customer_confirmed:
            stage = "UNRESOLVED_BARRIERS"
        elif interventions[-1]["customer_decision"] == CustomerDecision.ACCEPTED.value:
            stage = "ACCEPTED_INTERVENTION"
        elif interventions[-1].get("service_id") and interventions[-1].get("destination_verified"):
            stage = "REFERRAL"
        else:
            stage = "ASSESSMENT"
        cases[-1]["workflow_stage"] = stage

        # Seed initial audit event
        audit_events.append({
            "event_id": f"EVT-{i:04d}-INIT",
            "case_id": case_id,
            "actor_role": "SYSTEM_ENGINE",
            "action": "CASE_INITIALIZED",
            "timestamp": review_date + "T09:00:00Z",
            "details": f"Synthetic case created from {cases[-1]['status_source']}; rule {rule_res.rule_id} evaluated.",
            "purpose_code": "FINANCIAL_INCLUSION_REVIEW",
            "is_synthetic": True
        })

    return {
        "service_directory": SERVICE_DIRECTORY_SEEDS,
        "cases": cases,
        "barrier_assessments": assessments,
        "interventions": interventions,
        "outcomes": outcomes,
        "audit_events": audit_events
    }

def export_dataset_to_csv(dataset: Dict[str, List[Dict[str, Any]]], target_dir: Path = DATA_DIR) -> None:
    """Exports all datasets into individual CSV files."""
    target_dir.mkdir(parents=True, exist_ok=True)
    for table_name, records in dataset.items():
        if not records:
            continue
        file_path = target_dir / f"{table_name}.csv"
        fieldnames = list(records[0].keys())
        with open(file_path, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(records)

def seed_database(db_path: Optional[str] = None) -> Dict[str, int]:
    """Generates synthetic dataset, writes CSVs, and inserts into SQLite database."""
    init_db() if not db_path else init_db(db_path)
    conn = get_connection(db_path) if db_path else get_connection()
    cursor = conn.cursor()

    # Clear existing synthetic records
    cursor.execute("DELETE FROM audit_events WHERE is_synthetic = 1")
    cursor.execute("DELETE FROM outcomes WHERE is_synthetic = 1")
    cursor.execute("DELETE FROM interventions WHERE is_synthetic = 1")
    cursor.execute("DELETE FROM barrier_assessments WHERE is_synthetic = 1")
    cursor.execute("DELETE FROM cases WHERE is_synthetic = 1")
    cursor.execute("DELETE FROM service_directory WHERE is_synthetic = 1")
    conn.commit()

    dataset = generate_synthetic_dataset(count=200)
    export_dataset_to_csv(dataset)

    # Insert service directory
    for s in dataset["service_directory"]:
        cursor.execute("""
            INSERT INTO service_directory (
                service_id, institution, service_type, location_label,
                authorised_status, verification_source, last_verified_at, contact_route, is_synthetic
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            s["service_id"], s["institution"], s["service_type"], s["location_label"],
            1 if s["authorised_status"] else 0, s["verification_source"],
            s["last_verified_at"], s["contact_route"], 1
        ))

    # Insert cases
    for c in dataset["cases"]:
        cursor.execute("""
            INSERT INTO cases (
                case_id, customer_token, region, workflow_stage, status_source, review_date,
                inactivity_band, account_origin, consent_status, contact_permission,
                preferred_channel, source_authorisation, is_synthetic
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            c["case_id"], c["customer_token"], c.get("region", "Central Zone"), c.get("workflow_stage", "ASSESSMENT"),
            c["status_source"], c["review_date"], c["inactivity_band"], c["account_origin"], c["consent_status"],
            1 if c["contact_permission"] else 0, c["preferred_channel"], c["source_authorisation"]
        ))

    # Insert barrier assessments
    for b in dataset["barrier_assessments"]:
        cursor.execute("""
            INSERT INTO barrier_assessments (
                assessment_id, case_id, barrier_primary, barrier_secondary,
                evidence_source, confidence_label, customer_confirmed, recorded_at, notes, is_synthetic
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            b["assessment_id"], b["case_id"], b["barrier_primary"], b["barrier_secondary"],
            b["evidence_source"], b["confidence_label"],
            1 if b["customer_confirmed"] else 0, b["recorded_at"], b["notes"]
        ))

    # Insert interventions
    for it in dataset["interventions"]:
        cursor.execute("""
            INSERT INTO interventions (
                intervention_id, case_id, rule_id, intervention_type,
                service_id, destination_verified, assigned_channel, customer_decision,
                completion_status, offered_at, completed_at, explanation_note, is_synthetic
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            it["intervention_id"], it["case_id"], it["rule_id"], it["intervention_type"],
            it["service_id"], 1 if it["destination_verified"] else 0, it["assigned_channel"],
            it["customer_decision"], it["completion_status"], it["offered_at"],
            it["completed_at"], it["explanation_note"]
        ))

    # Insert outcomes
    for o in dataset["outcomes"]:
        cursor.execute("""
            INSERT INTO outcomes (
                outcome_id, case_id, barrier_resolved_self_reported, barrier_resolved_verified,
                account_status_after, meaningful_use_status, outcome_source, follow_up_date,
                opt_out, notes, is_synthetic
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            o["outcome_id"], o["case_id"],
            1 if o["barrier_resolved_self_reported"] else 0,
            1 if o["barrier_resolved_verified"] else 0,
            o["account_status_after"], o["meaningful_use_status"],
            o["outcome_source"], o["follow_up_date"],
            1 if o["opt_out"] else 0, o["notes"]
        ))

    # Insert audit events
    for a in dataset["audit_events"]:
        cursor.execute("""
            INSERT INTO audit_events (
                event_id, case_id, actor_role, action, timestamp, details, purpose_code, is_synthetic
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            a["event_id"], a["case_id"], a["actor_role"], a["action"],
            a["timestamp"], a["details"], a["purpose_code"]
        ))

    conn.commit()
    conn.close()

    return {
        "service_directory": len(dataset["service_directory"]),
        "cases": len(dataset["cases"]),
        "barrier_assessments": len(dataset["barrier_assessments"]),
        "interventions": len(dataset["interventions"]),
        "outcomes": len(dataset["outcomes"]),
        "audit_events": len(dataset["audit_events"])
    }

def validate_and_import_csv(csv_path: Path, table_name: str, db_path: Optional[str] = None) -> Tuple[int, int, List[str]]:
    """
    Validates CSV format, catches duplicates, missing fields, and records valid entries.
    Returns: (valid_count, duplicate_count, error_messages)
    """
    if not csv_path.exists():
        return 0, 0, [f"File {csv_path} does not exist."]

    valid_count = 0
    duplicate_count = 0
    errors = []

    conn = get_connection(db_path) if db_path else get_connection()
    cursor = conn.cursor()

    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        row_num = 1
        for row in reader:
            row_num += 1
            if table_name == "cases":
                case_id = row.get("case_id")
                cust_token = row.get("customer_token")
                if not case_id or not cust_token:
                    errors.append(f"Row {row_num}: Missing required primary key case_id or customer_token.")
                    continue
                # Check duplicate
                cursor.execute("SELECT case_id FROM cases WHERE case_id = ? OR customer_token = ?", (case_id, cust_token))
                if cursor.fetchone():
                    duplicate_count += 1
                    continue
                try:
                    cursor.execute("""
                        INSERT INTO cases (
                            case_id, customer_token, region, workflow_stage, status_source, review_date,
                            inactivity_band, account_origin, consent_status, contact_permission,
                            preferred_channel, source_authorisation, is_synthetic
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
                    """, (
                        case_id, cust_token, row.get("region", "Central Zone"), row.get("workflow_stage", "ASSESSMENT"),
                        row.get("status_source", "UNKNOWN"),
                        row.get("review_date", "2026-08-01"), row.get("inactivity_band", "2_TO_3_YEARS"),
                        row.get("account_origin", "PMJDY_BENEFIT"), row.get("consent_status", "CONSENTED"),
                        1 if row.get("contact_permission", "True").lower() == "true" else 0,
                        row.get("preferred_channel", "AUTHORISED_BC"),
                        row.get("source_authorisation", "MANDATE-TEST")
                    ))
                    valid_count += 1
                except Exception as e:
                    errors.append(f"Row {row_num}: SQL insertion error: {str(e)}")

    conn.commit()
    conn.close()
    return valid_count, duplicate_count, errors

if __name__ == "__main__":
    counts = seed_database()
    print("Database seeded successfully with synthetic data:")
    for tbl, cnt in counts.items():
        print(f"  - {tbl}: {cnt} records")
