"""
Independent Audit & Robustness Validation Tests (Phase 3 Verified)
Validates malformed source files, missing values, incorrect denominators,
duplicate records, source-period consistency, and sensitivity analysis reproducibility.
"""

import pytest
from pydantic import ValidationError
from backend.ingestion.pipeline import (
    PmjdyRecord,
    FindexTimeSeriesRecord,
    NcfeZonalRecord,
    RbiFiIndexRecord,
    load_csv,
    generate_fipi_rankings_and_sensitivity,
    generate_pmjdy_segmentation
)

def test_malformed_source_rejection():
    """Assert that invalid types or out-of-bound values raise ValidationError."""
    # 1. Negative beneficiaries in PMJDY
    with pytest.raises(ValidationError):
        PmjdyRecord(
            bank_category="Test Bank",
            rural_semiurban_beneficiaries_crore=-1.5,
            urban_metro_beneficiaries_crore=10.0,
            female_beneficiaries_crore=5.0,
            total_beneficiaries_crore=15.0,
            deposits_in_accounts_inr_crore=100.0,
            rupay_cards_issued_crore=5.0,
            reporting_date="2026-10-14"
        )

    # 2. Account ownership percentage exceeding 100% in Findex
    with pytest.raises(ValidationError):
        FindexTimeSeriesRecord(
            year=2024,
            account_ownership_pct_total=105.4,
            account_ownership_pct_female=89.0,
            account_ownership_pct_male=88.0,
            gender_gap_pp=1.0,
            account_ownership_poorest_40pct=80.0,
            account_ownership_richest_60pct=90.0,
            wealth_gap_pp=-10.0
        )

    # 3. Zonal literacy percentage negative or over 100
    with pytest.raises(ValidationError):
        NcfeZonalRecord(
            zone="TestZone",
            representative_states="Test States",
            fl_overall_pct=-5.0,
            sample_size_approx=1000,
            survey_year=2019,
            source_table_ref="Test Ref",
            verification_status="TEST"
        )

def test_zero_denominator_safe_handling():
    """Assert that zero beneficiaries do not cause unhandled ZeroDivisionError in segmentation."""
    zero_row = [{
        "bank_category": "Zero Branch Test Bank",
        "rural_semiurban_beneficiaries_crore": 0.0,
        "urban_metro_beneficiaries_crore": 0.0,
        "female_beneficiaries_crore": 0.0,
        "total_beneficiaries_crore": 0.0,
        "deposits_in_accounts_inr_crore": 0.0,
        "rupay_cards_issued_crore": 0.0,
        "reporting_date": "2026-10-14"
    }]
    seg = generate_pmjdy_segmentation(zero_row)
    assert len(seg["categories"]) == 1
    assert "rural_semiurban_share_pct" not in seg["categories"][0]

def test_duplicate_records_detection():
    """Assert duplicate records in extracted files can be detected."""
    ncfe_rows = load_csv("ncfe_flis_2019_zonal_literacy.csv")
    zone_names = [r["zone"] for r in ncfe_rows]
    assert len(zone_names) == len(set(zone_names)), "Duplicate zone names found in NCFE dataset!"

    findex_rows = load_csv("findex_india_timeseries_2011_2024.csv")
    years = [r["year"] for r in findex_rows]
    assert len(years) == len(set(years)), "Duplicate years found in Findex time series!"

def test_missing_values_not_silently_zero():
    """Assert that missing or blank fields fail strict Pydantic validation."""
    with pytest.raises(ValidationError):
        PmjdyRecord(
            bank_category="Incomplete Bank",
            rural_semiurban_beneficiaries_crore=10.0,
            urban_metro_beneficiaries_crore=5.0,
            female_beneficiaries_crore=7.0,
            deposits_in_accounts_inr_crore=100.0,
            rupay_cards_issued_crore=5.0,
            reporting_date="2026-10-14"
        )

def test_source_period_chronology_and_vintage():
    """Assert multi-year series are strictly chronologically sorted and within bounds."""
    findex_rows = load_csv("findex_india_timeseries_2011_2024.csv")
    years = [int(r["year"]) for r in findex_rows]
    assert years == sorted(years), "Findex years are not chronologically sorted!"
    assert years[0] == 2011 and years[-1] == 2024

    rbi_rows = load_csv("rbi_fi_index_timeseries.csv")
    assert len(rbi_rows) == 4
    for r in rbi_rows:
        assert r["reporting_period"].startswith("March")
        val = float(r["fi_index_composite"])
        assert 0.0 <= val <= 100.0

def test_sensitivity_analysis_mathematical_properties():
    """Assert that sensitivity analysis produces reproducible rankings with high rank stability."""
    ncfe_rows = load_csv("ncfe_flis_2019_zonal_literacy.csv")
    results = generate_fipi_rankings_and_sensitivity(ncfe_rows)
    rankings = results["rankings"]

    base_ranks = [r["baseline_rank"] for r in rankings]
    lit_ranks = [r["rank_literacy_heavy"] for r in rankings]
    rural_ranks = [r["rank_rural_heavy"] for r in rankings]
    eq_ranks = [r["rank_equal_weight"] for r in rankings]

    def spearman_rho(r1, r2):
        n = len(r1)
        d_sq = sum((a - b)**2 for a, b in zip(r1, r2))
        return 1.0 - (6.0 * d_sq) / (n * (n**2 - 1))

    rho_lit = spearman_rho(base_ranks, lit_ranks)
    rho_rural = spearman_rho(base_ranks, rural_ranks)
    rho_eq = spearman_rho(base_ranks, eq_ranks)

    assert rho_lit >= 0.90, f"Literacy scheme correlation too low: {rho_lit}"
    assert rho_rural >= 0.90, f"Rural scheme correlation too low: {rho_rural}"
    assert rho_eq >= 0.90, f"Equal weight scheme correlation too low: {rho_eq}"

    # Verify that East Zone remains Rank 1 across all schemes
    east_record = [r for r in rankings if r["zone"] == "East Zone"][0]
    assert east_record["baseline_rank"] == 1
    assert east_record["rank_literacy_heavy"] == 1
    assert east_record["rank_rural_heavy"] == 1

def test_fipi_epistemic_warnings_and_coverage():
    """Assert that FIPI explicitly warns against claiming inoperancy prevalence and tracks coverage."""
    ncfe_rows = load_csv("ncfe_flis_2019_zonal_literacy.csv")
    results = generate_fipi_rankings_and_sensitivity(ncfe_rows)
    
    # Assert model classification and qualified regulatory uses
    assert "suitability" in results
    assert "REGULATED & CONDITIONED" in results["suitability"]["account_level_targeting"]
    assert "DPDP Act 2023" in results["suitability"]["account_level_targeting"]
    assert results["suitability"]["inoperancy_prevalence_estimation"].startswith("UNSUITABLE")
    assert "epistemic_warning" in results
    
    # Assert each zone has coverage and warnings
    for z in results["rankings"]:
        assert z["evidence_coverage_pct"] == 100.0
        assert z["direct_inoperancy_observed"] is False
        assert len(z["missing_data_warnings"]) >= 2
        assert any("proxy screening" in w.lower() for w in z["missing_data_warnings"])

def test_fipi_normalization_sensitivity():
    """Assert that Z-score standardization yields identical rank ordering to Min-Max."""
    ncfe_rows = load_csv("ncfe_flis_2019_zonal_literacy.csv")
    results = generate_fipi_rankings_and_sensitivity(ncfe_rows)
    rankings = results["rankings"]
    
    for z in rankings:
        # Z-score rank shift should be exactly 0
        assert z["rank_shift_z_score_norm"] == 0
        assert z["baseline_rank"] == z["rank_z_score_norm"]

def test_incompatible_geographical_units_rejected():
    """Assert that national aggregate row is excluded from zonal ranking."""
    ncfe_rows = load_csv("ncfe_flis_2019_zonal_literacy.csv")
    results = generate_fipi_rankings_and_sensitivity(ncfe_rows)
    zone_names = [z["zone"] for z in results["rankings"]]
    assert "All-India Benchmark" not in zone_names
    assert "All India Benchmark" not in zone_names
    assert len(zone_names) == 6
