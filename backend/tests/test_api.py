"""
Integration Tests for BankMitra FastAPI Endpoints
Tests health, metrics calculation from SQLite, case workflows, and review queues.
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import get_connection

client = TestClient(app)

def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["environment"] == "synthetic_demonstration"
    assert data["real_bank_connection"] is False

def test_api_metrics_calculated_from_db():
    response = client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()

    # Check that sample size matches exactly
    funnel = data["funnel"]
    assert funnel["sample_size"] == 200
    assert funnel["data_label"] == "Synthetic demonstration data"
    assert funnel["observation_window_days"] == 90
    assert funnel["eligible_reviewed"] == 200

    # Ensure separate metrics
    assert "barriers_resolved_self_reported" in funnel
    assert "barriers_resolved_verified" in funnel
    assert "meaningful_use_verified" in funnel
    assert "accounts_reactivated" in funnel
    assert "opt_outs" in funnel

    # Cross-check directly against SQLite
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM cases WHERE is_synthetic = 1")
    count = c.fetchone()[0]
    conn.close()
    assert funnel["eligible_reviewed"] == count

def test_api_list_cases_and_filters():
    # Test basic listing
    res = client.get("/api/cases?limit=10&offset=0")
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) == 10
    assert data["total"] >= 200

    # Test filtering by barrier
    res_barrier = client.get("/api/cases?barrier=KYC_MISMATCH")
    assert res_barrier.status_code == 200
    b_data = res_barrier.json()
    for item in b_data["items"]:
        assert item["barrier_primary"] == "KYC_MISMATCH"

    # Test search query
    res_search = client.get("/api/cases?search=CASE-0010")
    assert res_search.status_code == 200
    s_data = res_search.json()
    assert len(s_data["items"]) >= 1
    assert s_data["items"][0]["case_id"] == "CASE-0010"

def test_api_get_case_detail():
    res = client.get("/api/cases/CASE-0001")
    assert res.status_code == 200
    detail = res.json()
    assert detail["case"]["case_id"] == "CASE-0001"
    assert detail["assessment"] is not None
    assert detail["rule_evaluation"] is not None
    assert "rule_id" in detail["rule_evaluation"]
    assert "reason" in detail["rule_evaluation"]
    assert "limitations" in detail["rule_evaluation"]
    assert detail["is_synthetic_demo"] is True

def test_api_record_decision_opt_out_enforcement():
    """Testing that recording OPTED_OUT immediately updates permission and suppresses outreach."""
    case_id = "CASE-0005"
    res = client.post(
        f"/api/cases/{case_id}/decision",
        json={"decision": "OPTED_OUT", "notes": "Customer requested immediate exclusion"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "opt_out_enforced"
    assert data["rule_applied"] == "R1"

    # Verify case record has contact_permission = 0
    res_case = client.get(f"/api/cases/{case_id}")
    c_data = res_case.json()
    assert c_data["case"]["contact_permission"] is False
    assert c_data["case"]["consent_status"] == "DECLINED"
    assert c_data["rule_evaluation"]["rule_id"] == "R1"
    assert c_data["rule_evaluation"]["intervention_type"] == "SUPPRESS_OUTREACH"

def test_api_review_queue():
    res = client.get("/api/review-queue")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] > 0
    for item in data["items"]:
        assert len(item["queue_reasons"]) > 0

def test_api_service_directory_freshness():
    res = client.get("/api/service-directory")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] >= 5
    statuses = [s["fresh_status"] for s in data["items"]]
    assert "ACTIVE_VERIFIED" in statuses
    assert "STALE_OR_UNVERIFIED" in statuses

def test_api_macro_evidence_endpoint():
    res = client.get("/api/macro/evidence")
    assert res.status_code == 200
    data = res.json()
    assert data["checksum_status"] == "ALL_MATCHED"
    assert "findex_segmentation" in data
    assert "pmjdy_segmentation" in data
    assert "fipi_sensitivity_analysis" in data
    assert len(data["fipi_sensitivity_analysis"]["rankings"]) == 6
    assert data["fipi_sensitivity_analysis"]["rankings"][0]["zone"] == "East Zone"

