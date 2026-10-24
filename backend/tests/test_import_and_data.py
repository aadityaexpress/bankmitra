"""
Tests for Synthetic Data Import, Validation, and Duplicate Handling
"""
import pytest
import tempfile
import csv
from pathlib import Path
from backend.generator import generate_synthetic_dataset, validate_and_import_csv, seed_database
from backend.database import get_connection, init_db

def test_generate_synthetic_dataset_counts():
    """Verifies that generator produces exactly 200 cases and expected related records."""
    data = generate_synthetic_dataset(count=200, seed=42)
    assert len(data["cases"]) == 200
    assert len(data["barrier_assessments"]) == 200
    assert len(data["interventions"]) == 200
    assert len(data["outcomes"]) == 200
    assert len(data["audit_events"]) == 200
    assert len(data["service_directory"]) >= 5

    # Check that customer tokens are pseudonymous
    for c in data["cases"]:
        assert c["customer_token"].startswith("CUST-SYN-")
        assert c["is_synthetic"] is True

def test_import_validation_and_duplicate_handling():
    """Tests duplicate detection and invalid record rejection during CSV import."""
    with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".db") as tmp_db:
        db_path = tmp_db.name

    init_db(db_path)

    # Create temporary CSV with 1 valid row, 1 duplicate row, and 1 missing key row
    with tempfile.NamedTemporaryFile(mode="w", newline="", delete=False, suffix=".csv") as tmp_csv:
        csv_path = Path(tmp_csv.name)
        writer = csv.DictWriter(tmp_csv, fieldnames=[
            "case_id", "customer_token", "status_source", "review_date",
            "inactivity_band", "account_origin", "consent_status", "contact_permission",
            "preferred_channel", "source_authorisation"
        ])
        writer.writeheader()
        # Row 1: Valid
        writer.writerow({
            "case_id": "CASE-TEST-001",
            "customer_token": "CUST-TEST-001",
            "status_source": "CBS_BATCH_REVIEW",
            "review_date": "2026-08-01",
            "inactivity_band": "2_TO_3_YEARS",
            "account_origin": "PMJDY_BENEFIT",
            "consent_status": "CONSENTED",
            "contact_permission": "True",
            "preferred_channel": "AUTHORISED_BC",
            "source_authorisation": "MANDATE-01"
        })
        # Row 2: Duplicate of Row 1
        writer.writerow({
            "case_id": "CASE-TEST-001",
            "customer_token": "CUST-TEST-001",
            "status_source": "CBS_BATCH_REVIEW",
            "review_date": "2026-08-01",
            "inactivity_band": "2_TO_3_YEARS",
            "account_origin": "PMJDY_BENEFIT",
            "consent_status": "CONSENTED",
            "contact_permission": "True",
            "preferred_channel": "AUTHORISED_BC",
            "source_authorisation": "MANDATE-01"
        })
        # Row 3: Missing required case_id
        writer.writerow({
            "case_id": "",
            "customer_token": "CUST-TEST-002",
            "status_source": "CBS_BATCH_REVIEW",
            "review_date": "2026-08-01",
            "inactivity_band": "2_TO_3_YEARS",
            "account_origin": "PMJDY_BENEFIT",
            "consent_status": "CONSENTED",
            "contact_permission": "True",
            "preferred_channel": "AUTHORISED_BC",
            "source_authorisation": "MANDATE-01"
        })

    valid, dupes, errors = validate_and_import_csv(csv_path, "cases", db_path=db_path)
    assert valid == 1
    assert dupes == 1
    assert len(errors) == 1
    assert "Missing required primary key" in errors[0]

    # Clean up temp files
    csv_path.unlink(missing_ok=True)
    Path(db_path).unlink(missing_ok=True)
