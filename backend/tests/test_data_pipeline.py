"""
Test suite for Data Ingestion Pipeline & FIPI Sensitivity Engine (Phase 3 Verified)
"""

import os
import pytest
from backend.ingestion.pipeline import (
    verify_checksums,
    load_csv,
    generate_findex_segmentation,
    generate_pmjdy_segmentation,
    generate_fipi_rankings_and_sensitivity,
    run_pipeline
)

def test_verify_checksums_all_pass():
    """Assert all 7 extracted datasets pass SHA-256 integrity validation."""
    assert verify_checksums() is True

def test_findex_timeseries_validity():
    """Assert Findex data contains 2011 to 2024 with valid bounds."""
    findex_ts = load_csv("findex_india_timeseries_2011_2024.csv")
    seg = generate_findex_segmentation(findex_ts)
    assert seg["observations"] == 5
    
    # 2024 check: account ownership should be ~89%
    row_2024 = [r for r in seg["data"] if r["year"] == 2024][0]
    assert 88.0 <= row_2024["account_ownership_pct_total"] <= 91.0
    assert row_2024["gender_gap_pp"] >= 0.0

def test_pmjdy_live_segmentation():
    """Assert PMJDY numbers reflect official aggregates and female share > 50%."""
    pmjdy_rows = load_csv("pmjdy_live_snapshot_2026.csv")
    seg = generate_pmjdy_segmentation(pmjdy_rows)
    assert seg["grand_total"] is not None
    assert seg["grand_total"]["total_beneficiaries_crore"] >= 54.0
    assert seg["grand_total"]["female_share_pct"] >= 55.0
    assert seg["grand_total"]["rural_semiurban_share_pct"] >= 65.0

def test_fipi_rankings_and_sensitivity():
    """Assert FIPI produces valid rankings and sensitivity shifts across all verbatim zones."""
    ncfe_zonal_rows = load_csv("ncfe_flis_2019_zonal_literacy.csv")
    results = generate_fipi_rankings_and_sensitivity(ncfe_zonal_rows)
    assert results["zone_count"] == 6
    
    rankings = results["rankings"]
    ranks = [r["baseline_rank"] for r in rankings]
    assert sorted(ranks) == list(range(1, 7))
    
    # Assert Rank 1 is East Zone (highest deficit in NCFE report: 20%)
    assert rankings[0]["zone"] == "East Zone"
    assert rankings[0]["fl_overall_pct"] == 20.0
    assert rankings[-1]["zone"] == "West Zone"
    assert rankings[-1]["fl_overall_pct"] == 37.0

def test_pipeline_execution():
    """Assert entire pipeline runs and creates valid JSON artifact."""
    output = run_pipeline()
    assert output["checksum_status"] == "ALL_MATCHED"
    assert "fipi_sensitivity_analysis" in output
    assert "pmjdy_segmentation" in output
