"""
Unit and Integration Tests for Phase 6: Governance Workflow & Policy Accountability
Validates G1-G5 indicators, state-machine transitions, synthetic data separation, and RBAC audit logs.
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import get_connection, init_db
from backend.generator import seed_database
from backend.schemas import WorkflowStage, CustomerDecision, AccountStatusAfter, MeaningfulUseStatus

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_db():
    init_db()
    seed_database()

def test_governance_indicators_g1_to_g5_denominators_and_numerators():
    """Verify that all five governance indicators G1-G5 declare correct numerators, denominators, and sources."""
    res = client.get("/api/governance/outcomes")
    assert res.status_code == 200
    data = res.json()

    assert data["is_synthetic_demonstration"] is True
    assert "indicators" in data
    indicators = data["indicators"]

    # G1: Referral Dispatch Rate (RDR)
    assert "G1" in indicators
    g1 = indicators["G1"]
    assert g1["denominator"] == 200
    assert g1["numerator"] > 0
    assert g1["rate_pct"] == round((g1["numerator"] / g1["denominator"]) * 100, 2)
    assert "Verified Service Directory" in g1["source_requirement"]

    # G2: Intervention Completion Rate (ICR)
    assert "G2" in indicators
    g2 = indicators["G2"]
    assert g2["denominator"] > 0
    assert g2["numerator"] > 0
    assert g2["rate_pct"] == round((g2["numerator"] / g2["denominator"]) * 100, 2)
    assert "Branch Operations" in g2["source_requirement"]

    # G3: Verified Account Reactivation Rate (VARR)
    assert "G3" in indicators
    g3 = indicators["G3"]
    assert g3["denominator"] == g2["numerator"]
    assert g3["numerator"] > 0
    assert g3["rate_pct"] == round((g3["numerator"] / g3["denominator"]) * 100, 2)
    assert "CBS Account Master Table" in g3["source_requirement"]

    # G4: Sustained Meaningful Usage Rate (SMUR_90d)
    assert "G4" in indicators
    g4 = indicators["G4"]
    assert g4["denominator"] == g3["numerator"]
    assert g4["numerator"] > 0
    assert g4["rate_pct"] == round((g4["numerator"] / g4["denominator"]) * 100, 2)
    assert "90-day" in g4["time_window"]

    # G5: Unresolved Barrier & Grievance Rate (UBR)
    assert "G5" in indicators
    g5 = indicators["G5"]
    assert g5["denominator"] > 0
    assert g5["numerator"] > 0
    assert g5["rate_pct"] == round((g5["numerator"] / g5["denominator"]) * 100, 2)
    assert "Grievance" in g5["source_requirement"]

def test_workflow_valid_sequential_transitions():
    """Verify that a case can step cleanly through the full verified lifecycle."""
    case_id = "CASE-0001"
    
    # 1. Transition to REFERRAL with fresh touchpoint
    res = client.post(f"/api/cases/{case_id}/workflow-transition", json={
        "target_stage": "REFERRAL",
        "service_id": "SRV-RAMPUR-BC-01",
        "actor_role": "BRANCH_OFFICER",
        "notes": "Referred to local verified BC kiosk for non-home KYC"
    })
    assert res.status_code == 200
    assert res.json()["current_stage"] == "REFERRAL"

    # 2. Customer accepts intervention
    res = client.post(f"/api/cases/{case_id}/workflow-transition", json={
        "target_stage": "ACCEPTED_INTERVENTION",
        "customer_decision": "ACCEPTED",
        "actor_role": "BRANCH_OFFICER",
        "notes": "Customer agreed to attend BC appointment"
    })
    assert res.status_code == 200
    assert res.json()["current_stage"] == "ACCEPTED_INTERVENTION"

    # 3. BC completes procedure
    res = client.post(f"/api/cases/{case_id}/workflow-transition", json={
        "target_stage": "COMPLETED",
        "actor_role": "BC_AGENT",
        "barrier_resolved_verified": True,
        "notes": "Aadhaar demographic update submitted at kiosk"
    })
    assert res.status_code == 200
    assert res.json()["current_stage"] == "COMPLETED"

    # 4. Bank updates Core Banking System ledger to Active
    res = client.post(f"/api/cases/{case_id}/workflow-transition", json={
        "target_stage": "VERIFIED_REACTIVATION",
        "actor_role": "BRANCH_OFFICER",
        "notes": "CBS unfreeze confirmed in ledger"
    })
    assert res.status_code == 200
    assert res.json()["current_stage"] == "VERIFIED_REACTIVATION"

    # 5. Sustained voluntary usage observed at 90 days
    res = client.post(f"/api/cases/{case_id}/workflow-transition", json={
        "target_stage": "SUSTAINED_USAGE",
        "actor_role": "COMPLIANCE_AUDITOR",
        "notes": "Voluntary cash deposit and AePS withdrawal recorded"
    })
    assert res.status_code == 200
    assert res.json()["current_stage"] == "SUSTAINED_USAGE"

def test_workflow_invalid_transitions_rejected():
    """Verify that jumping stages or skipping verification is strictly rejected with HTTP 422."""
    case_id = "CASE-0002"
    
    # Reset case to ASSESSMENT
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE cases SET workflow_stage = 'ASSESSMENT' WHERE case_id = ?", (case_id,))
    cursor.execute("UPDATE outcomes SET account_status_after = 'INOPERATIVE_UNCHANGED', meaningful_use_status = 'NOT_MEASURED_YET' WHERE case_id = ?", (case_id,))
    conn.commit()
    conn.close()

    # Attempt illegal jump directly from ASSESSMENT to SUSTAINED_USAGE
    res = client.post(f"/api/cases/{case_id}/workflow-transition", json={
        "target_stage": "SUSTAINED_USAGE",
        "actor_role": "BRANCH_OFFICER"
    })
    assert res.status_code == 422
    assert "Cannot skip intermediate verification stages" in res.json()["detail"]

    # Attempt illegal jump from ASSESSMENT to VERIFIED_REACTIVATION
    res = client.post(f"/api/cases/{case_id}/workflow-transition", json={
        "target_stage": "VERIFIED_REACTIVATION",
        "actor_role": "BRANCH_OFFICER"
    })
    assert res.status_code == 422

def test_workflow_stale_route_blocked_diverts_to_unresolved():
    """Verify Rule R3 guardrail: attempting referral to a stale touchpoint diverts to UNRESOLVED_BARRIERS."""
    case_id = "CASE-0003"
    
    # SRV-RAMPUR-BC-02 is stale (>190 days)
    res = client.post(f"/api/cases/{case_id}/workflow-transition", json={
        "target_stage": "REFERRAL",
        "service_id": "SRV-RAMPUR-BC-02",
        "actor_role": "BRANCH_OFFICER"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["current_stage"] == "UNRESOLVED_BARRIERS"
    assert "stale (>90 days) or unverified" in data["message"]

def test_workflow_opt_out_immediate_suppression():
    """Verify Rule R1: customer opting out halts outreach and suppresses further transitions."""
    case_id = "CASE-0004"
    
    # Opt-out transition
    res = client.post(f"/api/cases/{case_id}/workflow-transition", json={
        "target_stage": "OPTED_OUT",
        "actor_role": "BRANCH_OFFICER",
        "notes": "Customer requested no further communication"
    })
    assert res.status_code == 200
    assert res.json()["current_stage"] == "OPTED_OUT"

    # Attempting to re-engage an opted-out case without consent raises 422
    res_retry = client.post(f"/api/cases/{case_id}/workflow-transition", json={
        "target_stage": "REFERRAL",
        "service_id": "SRV-RAMPUR-BC-01",
        "actor_role": "BRANCH_OFFICER"
    })
    assert res_retry.status_code == 422
    assert "Outreach prohibited: Customer has opted out under Rule R1" in res_retry.json()["detail"]

def test_synthetic_and_observed_data_separation():
    """Assert that public macro evidence and simulated case records remain completely air-gapped."""
    # Macro evidence endpoint returns Tier A / Tier B public data
    macro_res = client.get("/api/macro/evidence")
    assert macro_res.status_code == 200
    macro = macro_res.json()
    assert macro["metadata"]["evidence_tier"] == "Tier A (Verified Sovereign and Multilateral Datasets)"

    # Operational cases endpoint strictly returns Tier D synthetic records
    cases_res = client.get("/api/cases?limit=10")
    assert cases_res.status_code == 200
    cases_data = cases_res.json()
    assert cases_data["is_synthetic"] is True
    for c in cases_data["items"]:
        assert c["is_synthetic"] == 1
        assert c["customer_token"].startswith("CUST-SYN-")

def test_rbac_actor_roles_recorded_in_audit_events():
    """Verify that RBAC actor roles are recorded in the immutable audit trail."""
    case_id = "CASE-0005"
    res = client.post(f"/api/cases/{case_id}/workflow-transition", json={
        "target_stage": "REFERRAL",
        "service_id": "SRV-RAMPUR-BC-01",
        "actor_role": "BC_AGENT",
        "notes": "Kiosk agent logged referral dispatch"
    })
    assert res.status_code == 200
    evt_id = res.json()["audit_event_id"]

    # Verify audit trail contains the recorded event with actor role
    audit_res = client.get(f"/api/cases/{case_id}")
    history = audit_res.json()["audit_history"]
    matched = [h for h in history if h["event_id"] == evt_id]
    assert len(matched) == 1
    assert matched[0]["actor_role"] == "BC_AGENT"

def test_retention_policy_endpoint():
    """Verify that statutory retention policy and simulated purge endpoint function correctly."""
    res = client.get("/api/governance/retention")
    assert res.status_code == 200
    data = res.json()
    assert data["total_audit_events"] >= 200
    assert len(data["policies"]) >= 3

    purge_res = client.post("/api/governance/retention/simulate-purge")
    assert purge_res.status_code == 200
    assert purge_res.json()["status"] == "retention_audit_complete"
