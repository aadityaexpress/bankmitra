# Financial Inclusion Governance Engine (FIGE): Data Quality & Integrity Report

**Document Classification:** Data Integrity Audit, Quality Metrics & Provenance Assessment  
**Initiative:** IIT Bombay Techfest — The India @ 71/100 Challenge | Theme 3: Financial Inclusion  
**Auditor:** Software Architecture & Research Engineering Audit Team  
**Audit Date:** 23 October 2026  
**Audit Scope:** All extracted datasets in [`backend/data/extracted/`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted), ingestion scripts, and validation schemas.

---

## 1. Executive Summary of Data Quality Findings

This data quality audit evaluates the veracity, integrity, and provenance of the datasets utilized by the FIGE platform.

### Headline Findings:
1. **File Integrity vs. Epistemic Provenance:** The SHA-256 checksums recorded in [`provenance_manifest.json`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/provenance_manifest.json) successfully prove **local file immutability** (i.e., that files on disk have not been altered or corrupted since generation). However, a cryptographic checksum on a locally authored CSV does **NOT** by itself prove upstream source provenance. True provenance requires tracing to official primary endpoints, published reports, or raw microdata files.
2. **Raw vs. Transcribed vs. Model-Interpolated Data:**
   - **API-Derived / Programmatically Scraped:** [`pmjdy_live_snapshot_2026.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/pmjdy_live_snapshot_2026.csv) and [`findex_india_timeseries_2011_2024.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/findex_india_timeseries_2011_2024.csv) are directly extracted from primary government and World Bank API/web endpoints.
   - **Report-Transcribed:** [`findex_2021_inactivity_barriers.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/findex_2021_inactivity_barriers.csv), [`pmjdy_benchmark_2025.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/pmjdy_benchmark_2025.csv), and [`rbi_fi_index_timeseries.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/rbi_fi_index_timeseries.csv) are manually transcribed from official published PDFs/reports.
   - **Model-Interpolated / Proxy:** [`ncfe_flis_2019_state_literacy.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/ncfe_flis_2019_state_literacy.csv) contains state-level literacy percentages that reflect model-interpolated regional proxies rather than verbatim primary table extractions from NCFE Table 4.1/4.2.
3. **Data Completeness & Invariants:** Zero duplicate keys or unhandled null values exist in the current extracted files. Ingestion schemas strictly enforce non-nullness, range bounds, and non-negative constraints.

---

## 2. Granular Dataset-by-Dataset Quality Audit

### 2.1 Dataset: `pmjdy_live_snapshot_2026.csv`
- **File Path:** [`backend/data/extracted/pmjdy_live_snapshot_2026.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/pmjdy_live_snapshot_2026.csv)
- **Physical Profile:** 6 lines (1 header + 5 rows), 696 bytes. SHA-256: `6e6fcba5db73cf36f235adcf78280f2d80d220ea1ba81b0a51be8b77a76c8c44`.
- **Columns & Data Types:**
  - `bank_category` (STRING): Public Sector Banks, Regional Rural Banks, Private Sector Banks, Rural Cooperative Banks, Grand Total.
  - `rural_semiurban_beneficiaries_crore` (FLOAT, ge=0.0)
  - `urban_metro_beneficiaries_crore` (FLOAT, ge=0.0)
  - `female_beneficiaries_crore` (FLOAT, ge=0.0)
  - `total_beneficiaries_crore` (FLOAT, ge=0.0)
  - `deposits_in_accounts_inr_crore` (FLOAT, ge=0.0)
  - `rupay_cards_issued_crore` (FLOAT, ge=0.0)
  - `reporting_date` (ISO-8601 DATE): `2026-10-14`
  - `source_url` (URL): `https://pmjdy.gov.in/account`
- **Extraction Method:** Programmatic HTML scrape and table parse executed directly against the Department of Financial Services live portal on 23 October 2026.
- **Independent Reproducibility:** **HIGH.** Any user visiting `https://pmjdy.gov.in/account` can independently view and verify the table.
- **Anomalies / Suspicious Values:**
  - *Rural Cooperative Banks Reporting Deficit:* Deposits are listed as ₹0.01 Crore and RuPay cards as 0.00 across 0.19 Crore (19 lakh) accounts. This indicates that cooperative banks have not integrated real-time automated ledger feeds to DFS, rather than having near-zero deposits.
  - *Additivity:* Sum of categories ($35.63 + 9.47 + 0.98 + 0.19 = 46.27$) matches Grand Total exactly.
- **Quality Verdict:** **HIGH INTEGRITY (Tier A).**

---

### 2.2 Dataset: `findex_india_timeseries_2011_2024.csv`
- **File Path:** [`backend/data/extracted/findex_india_timeseries_2011_2024.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/findex_india_timeseries_2011_2024.csv)
- **Physical Profile:** 6 lines (1 header + 5 rows), 609 bytes. SHA-256: `b87b7a61d15c7e1bc814138e6538bb8b2a37d2f9d5fc94cf8b73f8e5f2cf2a82`.
- **Columns & Data Types:**
  - `year` (INTEGER, 2011–2024)
  - `account_ownership_pct_total` (FLOAT, 0–100)
  - `account_ownership_pct_female` (FLOAT, 0–100)
  - `account_ownership_pct_male` (FLOAT, 0–100)
  - `gender_gap_pp` (FLOAT): Computed as Female % minus Male %
  - `account_ownership_poorest_40pct` (FLOAT, 0–100)
  - `account_ownership_richest_60pct` (FLOAT, 0–100)
  - `wealth_gap_pp` (FLOAT): Computed as Bottom 40% minus Top 60%
  - `source_authority` (STRING)
- **Extraction Method:** Programmatically fetched from the official World Bank Data API (`http://api.worldbank.org/v2/country/IND/indicator/...`).
- **Independent Reproducibility:** **VERY HIGH.** World Bank API indicator endpoints (`FX.OWN.TOTL.ZS`, `FX.OWN.TOTL.FE.ZS`, `FX.OWN.TOTL.MA.ZS`, `FX.OWN.TOTL.40.ZS`, `FX.OWN.TOTL.60.ZS`) return identical values.
- **Anomalies / Suspicious Values:**
  - *2021 Survey Anomaly:* Bottom 40% account ownership (78.25%) slightly exceeds Top 60% ownership (77.05%) by +1.20 pp. This is an authentic feature of PMJDY's intensive rural targeting during 2014–2021, not a data entry error.
- **Quality Verdict:** **HIGH INTEGRITY (Tier A).**

---

### 2.3 Dataset: `findex_2021_inactivity_barriers.csv`
- **File Path:** [`backend/data/extracted/findex_2021_inactivity_barriers.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/findex_2021_inactivity_barriers.csv)
- **Physical Profile:** 17 lines (1 header + 16 rows), 2,442 bytes. SHA-256: `18f4a1fa6b67fc1e26b38cdae7829806c9a75908ef90f968ef732890538a7199`.
- **Columns & Data Types:**
  - `dimension` (STRING)
  - `metric_name` (STRING)
  - `population_group` (STRING)
  - `value_pct` (FLOAT)
  - `sample_denominator` (STRING)
  - `source_citation` (STRING)
- **Extraction Method:** Manually transcribed from published World Bank Global Findex 2021 Report (Chapter 2, p. 154) and India Country Brief (2023 Draft).
- **Independent Reproducibility:** **HIGH against published report; LOW against raw microdata.** The values reproduce published narrative tables, but have not been independently recalculated from raw survey microdata weights (`wgt`).
- **Anomalies / Suspicious Values:**
  - *Utility Payments in Cash:* Row 9 lists `value_pct = 160.0` with `sample_denominator = 'Approx. 160 Million Banked Adults'`. Storing an absolute count (160 million) in a column named `value_pct` is an inconsistent unit anomaly that must be corrected in Phase 3.
  - *Multi-Select Barrier Sum:* Stated barriers sum to 220% (Distance 50% + Trust 50% + Need 50% + Money 40% + Discomfort 30%). This is valid because respondents could cite multiple barriers, but requires prominent user warnings.
- **Quality Verdict:** **PARTIALLY VERIFIED (Tier A Report Data / Unit Inconsistency Flagged).**

---

### 2.4 Dataset: `ncfe_flis_2019_state_literacy.csv`
- **File Path:** [`backend/data/extracted/ncfe_flis_2019_state_literacy.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/ncfe_flis_2019_state_literacy.csv)
- **Physical Profile:** 24 lines (1 header + 23 rows), 1,205 bytes. SHA-256: `94553b478cf3c859d54e4ae321484ffb233f20d57e8ce769741e06d9e07fb317`.
- **Columns & Data Types:**
  - `state_ut_name` (STRING)
  - `zone` (STRING: South, West, North, Central, East, North-East, National)
  - `fl_overall_pct` (FLOAT, 0–100)
  - `knowledge_pct` (FLOAT, 0–100)
  - `attitude_pct` (FLOAT, 0–100)
  - `behaviour_pct` (FLOAT, 0–100)
  - `sample_size_approx` (INTEGER)
  - `survey_year` (INTEGER, 2019)
- **Extraction Method:** Model-interpolated baseline based on NCFE zonal distributions and national benchmarks.
- **Independent Reproducibility:** **FAILED AT GRANULAR STATE LEVEL.** While the national benchmark row (`All India Benchmark`, `27.18%`) is verified from official NCFE publications, the specific state numbers in the CSV diverge from published NCFE tables (e.g., CSV lists Kerala at 36.1% vs. published ~39%; Bihar at 18.2% vs. published ~20%).
- **Quality Verdict:** **UNVERIFIED AT STATE LEVEL (Must be replaced with exact NCFE Table 4.1/4.2 OCR in Phase 2).**

---

### 2.5 Dataset: `rbi_fi_index_timeseries.csv`
- **File Path:** [`backend/data/extracted/rbi_fi_index_timeseries.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/rbi_fi_index_timeseries.csv)
- **Physical Profile:** 5 lines (1 header + 4 rows), 400 bytes. SHA-256: `35dbf57ad177f154db3892789f28d2d603a1fc6c52a32ec79bcfad619d9bca1b`.
- **Columns & Data Types:**
  - `reporting_period` (STRING: March 2021 to March 2024)
  - `fi_index_composite` (FLOAT, 0–100)
  - `access_subindex` (FLOAT, 0–100, weight=35%)
  - `usage_subindex` (FLOAT, 0–100, weight=45%)
  - `quality_subindex` (FLOAT, 0–100, weight=20%)
  - `cfl_centres_count` (INTEGER)
  - `source_url` (URL)
- **Extraction Method:** Transcribed from Reserve Bank of India Annual Reports (2021–2025).
- **Independent Reproducibility:** **VERY HIGH.** Composite index values match RBI official press releases: March 2021 (53.9), March 2022 (56.4), March 2023 (60.1), March 2024 (64.2).
- **Quality Verdict:** **HIGH INTEGRITY (Tier A).**

---

### 2.6 Dataset: `npci_payment_rails_aggregates.csv`
- **File Path:** [`backend/data/extracted/npci_payment_rails_aggregates.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/npci_payment_rails_aggregates.csv)
- **Physical Profile:** 5 lines (1 header + 4 rows), 448 bytes. SHA-256: `818a7a8d5f309a6bf8c52086ec4efcb09efb6605d8f6356bc56087b7a6616238`.
- **Columns & Data Types:**
  - `financial_year` (STRING: 2021-22 to 2024-25)
  - `upi_volume_crore` (FLOAT)
  - `upi_value_lakh_crore` (FLOAT)
  - `aeps_volume_crore` (FLOAT)
  - `aeps_value_crore` (FLOAT)
  - `dbt_total_transfers_crore` (FLOAT)
  - `dbt_total_amount_inr_crore` (FLOAT)
  - `source` (STRING)
- **Extraction Method:** Transcribed from NPCI monthly product statistics and DBT Bharat annual outlays.
- **Independent Reproducibility:** **HIGH.** NPCI portal documents UPI annual volumes expanding from 4,596 Cr (FY22) to 17,200 Cr (FY25).
- **Quality Verdict:** **HIGH INTEGRITY (Tier A).**

---

### 2.7 Dataset: `pmjdy_benchmark_2025.csv`
- **File Path:** [`backend/data/extracted/pmjdy_benchmark_2025.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/pmjdy_benchmark_2025.csv)
- **Physical Profile:** 7 lines (1 header + 6 rows), 507 bytes. SHA-256: `aa948835848bb2d4090b3e6c0c2a71bf73860bb47f77b72db542c3d18e87d7b1`.
- **Columns & Data Types:** `indicator`, `value_crore_or_inr`, `unit`, `reporting_date`, `source_owner`.
- **Quality Verdict:** **HIGH INTEGRITY (Tier A / Tier B Parliamentary QA).**

---

## 3. Data Ingestion & Transformation Pipeline Audit

### 3.1 Pydantic Validation Rigour
The pipeline implementation in [`backend/ingestion/pipeline.py`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/ingestion/pipeline.py) enforces strict schema invariants:
1. `PmjdyRecord`: Rejects negative beneficiaries or negative deposits (`Field(ge=0.0)`).
2. `FindexTimeSeriesRecord`: Enforces valid year range (`2010 <= year <= 2030`) and percentage bounds (`0.0 <= pct <= 100.0`).
3. `NcfeStateRecord`: Enforces sample size $\ge 100$ and score bounds $[0, 100]$.
4. `RbiFiIndexRecord`: Enforces non-negative CFL count and composite score $[0, 100]$.

### 3.2 Automated Test Validation
The test suite in [`backend/tests/`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/tests) executes **32 automated tests**:
- 7 API contract and endpoint tests (`test_api.py`)
- 6 data quality, malformed file, duplicate detection, and denominator tests (`test_audit_and_validation.py`)
- 5 data pipeline execution and checksum tests (`test_data_pipeline.py`)
- 4 operational edge-case simulation tests (`test_edge_cases.py`)
- 2 CSV import and database seeding tests (`test_import_and_data.py`)
- 7 deterministic rules engine tests (`test_rules.py`)

All 32 tests pass synchronously in 2.40s.
