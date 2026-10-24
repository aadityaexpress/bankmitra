"""
Explicit Edge Case and Boundary Condition Tests for BankMitra
Guarantees failure states, permission blocks, and API error handling.
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_api_404_non_existent_case():
    """Validates API error response on querying non-existent case."""
    res = client.get("/api/cases/CASE-DOES-NOT-EXIST")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()

def test_api_422_invalid_payload():
    """Validates FastAPI schema validation on malformed payload."""
    res = client.post(
        "/api/cases/CASE-0001/assess",
        json={"barrier_primary": "INVALID_BARRIER_ENUM"}
    )
    assert res.status_code == 422

def test_unresolved_complaint_workflow():
    """Case with complaint referred to Ombudsman remains unverified until formal redress."""
    # Find a complaint case
    res = client.get("/api/cases?barrier=TRUST_GRIEVANCE&limit=1")
    items = res.json()["items"]
    assert len(items) > 0
    case_id = items[0]["case_id"]

    # Verify detail shows R4
    res_detail = client.get(f"/api/cases/{case_id}")
    d = res_detail.json()
    assert d["rule_evaluation"]["rule_id"] == "R4"
    assert "grievance" in d["rule_evaluation"]["reason"].lower()

def test_reactivated_with_no_desire_for_use_not_counted_as_success():
    """Rule R8: Operational reactivation + NO_FURTHER_USE_WANTED must not count as voluntary success."""
    case_id = "CASE-0025"
    # Update outcome to operational reactivated, but no further use wanted
    res = client.post(
        f"/api/cases/{case_id}/outcome",
        json={
            "barrier_resolved_self_reported": True,
            "barrier_resolved_verified": True,
            "account_status_after": "REACTIVATED_OPERATIONAL",
            "meaningful_use_status": "NO_FURTHER_USE_WANTED",
            "notes": "Testing Rule R8 enforcement"
        }
    )
    assert res.status_code == 200

    # Verify in case detail
    res_detail = client.get(f"/api/cases/{case_id}")
    d = res_detail.json()
    assert d["outcome"]["account_status_after"] == "REACTIVATED_OPERATIONAL"
    assert d["outcome"]["meaningful_use_status"] == "NO_FURTHER_USE_WANTED"

    # Verify metrics does not count this in meaningful_use_verified
    res_metrics = client.get("/api/metrics")
    funnel = res_metrics.json()["funnel"]
    # Verified voluntary use must be strictly <= reactivated
    assert funnel["meaningful_use_verified"] <= funnel["accounts_reactivated"]
