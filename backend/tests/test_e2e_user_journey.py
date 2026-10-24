"""
Phase 7 End-to-End User Journey and Validation Script
Tests all 10 user journey checkpoints, metric consistency, and privacy/audit controls.
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.generator import seed_database
from backend.database import init_db

client = TestClient(app)

def test_full_user_journey_e2e():
    init_db()
    seed_database()

    # 1 & 2. Macro Evidence & FINSI Zonal Score Inspection
    macro_res = client.get("/api/macro/evidence")
    assert macro_res.status_code == 200
    macro_data = macro_res.json()
    assert "fipi_sensitivity_analysis" in macro_data
    rankings = macro_data["fipi_sensitivity_analysis"]["rankings"]
    assert len(rankings) == 6
    east_zone = next(r for r in rankings if r["zone"] == "East Zone")
    assert east_zone["fl_overall_pct"] == 20.0
    assert east_zone["verification_status"] == "VERIFIED_VERBATIM"
    assert east_zone["direct_inoperancy_observed"] is False
    assert east_zone["evidence_coverage_pct"] == 100.0

    # 3. Changing Prioritisation Weight Schemes
    schemes = ["provisional_baseline", "literacy_heavy", "rural_heavy", "equal_weight"]
    for s in schemes:
        scores = [r["scores"][s] for r in rankings]
        assert len(scores) == 6
        assert rankings[0]["zone"] == "East Zone"

    # 4 & 5. Case Selection and Progression Through Valid Stages
    res_cases = client.get("/api/cases?workflow_stage=ASSESSMENT&limit=5")
    assert res_cases.status_code == 200
    assessment_cases = res_cases.json()["items"]
    test_case = assessment_cases[0]
    case_id = test_case["case_id"]

    # ASSESSMENT -> REFERRAL
    r_ref = client.post(f"/api/cases/{case_id}/workflow-transition", json={
        "target_stage": "REFERRAL",
        "service_id": "SRV-RAMPUR-BC-01",
        "actor_role": "BRANCH_OFFICER",
        "notes": "Test referral dispatch"
    })
    assert r_ref.status_code == 200

    # REFERRAL -> ACCEPTED_INTERVENTION
    r_acc = client.post(f"/api/cases/{case_id}/workflow-transition", json={
        "target_stage": "ACCEPTED_INTERVENTION",
        "actor_role": "BC_AGENT",
        "notes": "Customer accepted home visit"
    })
    assert r_acc.status_code == 200

    # ACCEPTED_INTERVENTION -> COMPLETED
    r_comp = client.post(f"/api/cases/{case_id}/workflow-transition", json={
        "target_stage": "COMPLETED",
        "actor_role": "BC_AGENT",
        "notes": "Aadhaar biometric update complete"
    })
    assert r_comp.status_code == 200

    # COMPLETED -> VERIFIED_REACTIVATION
    r_react = client.post(f"/api/cases/{case_id}/workflow-transition", json={
        "target_stage": "VERIFIED_REACTIVATION",
        "actor_role": "BRANCH_OFFICER",
        "notes": "CBS unfrozen status confirmed"
    })
    assert r_react.status_code == 200

    # VERIFIED_REACTIVATION -> SUSTAINED_USAGE
    r_sust = client.post(f"/api/cases/{case_id}/workflow-transition", json={
        "target_stage": "SUSTAINED_USAGE",
        "actor_role": "COMPLIANCE_AUDITOR",
        "notes": "90d transactions observed in ledger"
    })
    assert r_sust.status_code == 200

    # 6. Invalid Stage Transition Rejection
    case_2 = assessment_cases[1]["case_id"]
    r_inv = client.post(f"/api/cases/{case_2}/workflow-transition", json={
        "target_stage": "SUSTAINED_USAGE",
        "actor_role": "BRANCH_OFFICER",
        "notes": "Illegal forward jump test"
    })
    assert r_inv.status_code == 422
    assert "Invalid transition" in r_inv.json()["detail"]

    # 7. Opt-Out Path and Outreach Suppression
    r_opt = client.post(f"/api/cases/{case_2}/workflow-transition", json={
        "target_stage": "OPTED_OUT",
        "actor_role": "BRANCH_OFFICER",
        "notes": "Customer requested no contact"
    })
    assert r_opt.status_code == 200

    r_opt_retry = client.post(f"/api/cases/{case_2}/workflow-transition", json={
        "target_stage": "REFERRAL",
        "actor_role": "BRANCH_OFFICER",
        "notes": "Illegal outreach test"
    })
    assert r_opt_retry.status_code == 422
    assert "Outreach prohibited: Customer has opted out" in r_opt_retry.json()["detail"]

    # 8. Governance & Outcomes Numerator / Denominator Check
    gov_res = client.get("/api/governance/outcomes")
    assert gov_res.status_code == 200
    gov = gov_res.json()
    for code, ind in [
        ("G1", gov["indicators"]["G1_referral_dispatch_rate"]),
        ("G2", gov["indicators"]["G2_intervention_completion_rate"]),
        ("G3", gov["indicators"]["G3_verified_reactivation_rate"]),
        ("G4", gov["indicators"]["G4_sustained_meaningful_use_rate"]),
        ("G5", gov["indicators"]["G5_unresolved_barriers_rate"])
    ]:
        expected_rate = round((ind["numerator"] / ind["denominator"]) * 100, 2)
        assert abs(ind["value_pct"] - expected_rate) < 0.05

    # 9. Refresh and Persistence Verification
    detail_res = client.get(f"/api/cases/{case_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["case"]["workflow_stage"] == "SUSTAINED_USAGE"
    assert len(detail["audit_history"]) >= 5

    # 10. Public Macro vs Synthetic Operational Separation
    assert macro_data["metadata"]["air_gapped_from_operational"] is True
    assert gov["air_gap_verification"]["is_synthetic_demonstration"] is True
    assert gov["air_gap_verification"]["observed_statistics_separation_confirmed"] is True
