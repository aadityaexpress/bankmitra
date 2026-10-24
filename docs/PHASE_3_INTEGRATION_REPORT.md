# Financial Inclusion Governance Engine (FIGE): Phase 3 Integration Report

**Document Classification:** Source-Verified Data Correction & Dashboard Integration Baseline  
**Initiative:** IIT Bombay Techfest — The India @ 71/100 Challenge | Theme 3: Financial Inclusion  
**Auditor & Lead Architect:** Software Architecture & Public Policy Research Engineering Team  
**Audit & Implementation Date:** 23 October 2026  
**Status:** Ingestion Corrected, Frontend Wired, 32/32 Tests Passing, Build Succeeded  

---

## 1. Executive Summary & Phase 3 Actions Completed

Phase 3 transitions the FIGE platform from an audited architecture into a **source-verified, end-to-end evidence engine**:
1. **Unverified State Estimates Excluded:** The interpolated state percentages previously present in `ncfe_flis_2019_state_literacy.csv` were formally **excluded from all calculations** and replaced with verbatim, source-verified zonal tables from the published NCFE NFLIS-2019 report and RBI NSFE 2020–25 Table 1.2.
2. **Global Findex Microdata Boundary Maintained:** Survey inactivity estimates (~35% national, 42% female, 30% male) are strictly labeled across all CSVs, APIs, and UI views as **Published Multilateral Report Findings**, pending institutional access to the raw World Bank microdata library.
3. **Excised Inferential Fallacies:** All claims equating plastic RuPay card issuance with account dormancy or aggregate UPI/AePS growth with dormant-account reactivation have been thoroughly excised.
4. **FIPI Recalculated at Zonal Level:** The Financial Inclusion Prioritisation Index (FIPI) has been re-implemented in [`backend/ingestion/pipeline.py`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/ingestion/pipeline.py) using only defensible, source-verified zonal metrics, with explicit documentation that parameter sensitivity stability does **not** equal empirical predictive validity.
5. **Dashboard Connected to Live Pipeline API:** The React frontend was integrated with the FastAPI backend endpoint [`/api/macro/evidence`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/main.py), creating an interactive **Macro Evidence & FIPI Prioritisation Studio** in [`MacroEvidenceView.tsx`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/frontend/src/components/MacroEvidenceView.tsx).

---

## 2. Corrected Datasets & Provenance Updates

The extracted data directory [`backend/data/extracted/`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted) now hosts seven verified datasets with updated cryptographic hashes in [`provenance_manifest.json`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/provenance_manifest.json):

| Dataset Filename | Verification Status | Exact Provenance Reference | Key Corrections Applied |
|---|---|---|---|
| [`ncfe_flis_2019_zonal_literacy.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/ncfe_flis_2019_zonal_literacy.csv) | **VERIFIED VERBATIM** | NCFE NFLIS-2019 Report / RBI NSFE 2020–25 Table 1.2 | Replaced interpolated state rows with official verbatim zonal benchmarks: East (20%), Central (21%), South (30%), North (32%), North-East (33%), West (37%), All-India (27.18%). |
| [`findex_2021_inactivity_barriers.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/findex_2021_inactivity_barriers.csv) | **PUBLISHED REPORT FINDING** | World Bank Global Findex 2021 Report (p. 154) | Corrected unit inconsistency on Row 9: moved absolute count (160 Million) out of `value_pct` to `value_count_million`. Added explicit `evidence_status` column. |
| [`pmjdy_live_snapshot_2026.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/pmjdy_live_snapshot_2026.csv) | **VERIFIED OFFICIAL SCRAPE** | DFS Live Portal (`pmjdy.gov.in/account`) | Snapshot date 14 Oct 2026. Added caveat: RuPay issuance measures card distribution, not active account usage. |
| [`findex_india_timeseries_2011_2024.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/findex_india_timeseries_2011_2024.csv) | **VERIFIED SOVEREIGN API** | World Bank Open Data API (`FX.OWN...`) | Multi-year series verified (2011 to 2024). Confirms female ownership parity at 89.25% in 2024. |
| [`rbi_fi_index_timeseries.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/rbi_fi_index_timeseries.csv) | **VERIFIED OFFICIAL RELEASE** | RBI Annual Reports (2021–2025) | Historical composite series (March 2021: 53.9 to March 2024: 64.2) and CFL center count (2,421). |
| [`npci_payment_rails_aggregates.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/npci_payment_rails_aggregates.csv) | **VERIFIED OPERATIONAL DATA** | NPCI Product Stats & DBT Bharat | Preserved with strict disclaimer: payment rail growth does NOT measure dormant Jan Dhan account reactivation. |
| [`pmjdy_benchmark_2025.csv`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/backend/data/extracted/pmjdy_benchmark_2025.csv) | **VERIFIED BENCHMARK** | DFS Summary & Parliamentary QA (22 Jan 2025) | Labeled as parliamentary disclosure for PMJDY accounts. |

---

## 3. Recalculated Zonal FIPI Prioritisation

Following the exclusion of unverified state data, FIPI prioritisation operates on source-verified geographical zones:

$$\text{FIPI}_z = 0.50 \cdot \tilde{X}_{\text{literacy deficit}} + 0.30 \cdot \tilde{X}_{\text{rural exposure}} + 0.20 \cdot \tilde{X}_{\text{volume need}}$$

### Official Zonal Prioritisation Results:

| Geographical Zone | Member States Representation | NCFE Literacy % | Baseline Priority Rank | Literacy-Heavy Rank | Rural-Heavy Rank | Equal-Weight Rank | Baseline Priority Score |
|---|---|---|---|---|---|---|---|
| **East Zone** | Bihar, West Bengal, Odisha, Jharkhand | **20.0%** | **#1** | #1 | #1 | #1 | **0.7820** |
| **Central Zone** | Uttar Pradesh, Madhya Pradesh, Chhattisgarh | **21.0%** | **#2** | #2 | #2 | #2 | **0.7471** |
| **North Zone** | Punjab, Haryana, Rajasthan, Himachal, Delhi | **32.0%** | **#3** | #4 | #4 | #4 | **0.3741** |
| **South Zone** | Kerala, Tamil Nadu, Karnataka, AP, Telangana | **30.0%** | **#4** | #3 | #3 | #3 | **0.3638** |
| **North-East Zone**| Assam, Sikkim, Meghalaya, Tripura, etc. | **33.0%** | **#5** | #5 | #5 | #5 | **0.3376** |
| **West Zone** | Maharashtra, Gujarat, Goa | **37.0%** | **#6** | #6 | #6 | #6 | **0.1870** |

*Methodological Audit Statement:*
- **Top Priority Need:** East Zone (Rank 1) and Central Zone (Rank 2) remain invariant across all four policy weight schemes.
- **Epistemic Limitation:** High rank stability across alternative weight schemes demonstrates mathematical robustness to parameter choices ($\rho \ge 0.90$), **NOT** empirical predictive validity of real-world outcomes.

---

## 4. Frontend Dashboard Integration Details

The React frontend has been connected to the backend pipeline:
1. **New Primary Navigation View:** Added **"Macro Evidence & FIPI"** to [`frontend/src/components/Navbar.tsx`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/frontend/src/components/Navbar.tsx) and routed in [`frontend/src/App.tsx`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/frontend/src/App.tsx).
2. **Interactive Prioritisation Studio ([`MacroEvidenceView.tsx`](file:///C:/Users/hp/.gemini/antigravity/scratch/bankmitra/frontend/src/components/MacroEvidenceView.tsx)):**
   - Displays real-time World Bank ownership series with female ownership parity indicators.
   - Renders live PMJDY institutional breakdown (59.59 Cr accounts, ₹3.24L Cr deposits) with bank-sector distribution cards.
   - Interactive weight scheme dropdown allowing evaluators to simulate Provisional Baseline, Literacy-Heavy, Rural-Heavy, and Equal-Weight policy models.
   - Comprehensive provenance tags on every metric (Source URL, Reporting Period, Denominator, Verification Status).
3. **Strict Visual Isolation of Evidence:**
   - **Green Badge:** Verified Sovereign/Multilateral Data (World Bank, DFS, RBI).
   - **Amber Banner:** Synthetic Demonstration Cases (N=200 local sandbox records).
   - **Red Header Box:** Explicitly highlights excised inferential fallacies (card issuance vs. usage, and payment growth vs. dormancy).

---

## 5. Verification & Test Execution Results

### 5.1 Backend Test Execution (Pytest 9.1.1)
```powershell
$env:PYTHONPATH="C:\Users\hp\.gemini\antigravity\scratch\bankmitra"
python -m pytest "C:\Users\hp\.gemini\antigravity\scratch\bankmitra\backend\tests"
```
**Results:** **32 passed, 2 warnings in 1.63s (100% Pass Rate)**
- `test_api.py`: 8 passed (includes `/api/macro/evidence` schema assertion).
- `test_audit_and_validation.py`: 6 passed (malformed file rejection, zero denominator guards, duplicate detection).
- `test_data_pipeline.py`: 5 passed (checksum validation, zonal FIPI rankings, pipeline execution).
- `test_edge_cases.py`: 4 passed (deceased holders, contradictory signals, opt-out enforcement).
- `test_import_and_data.py`: 2 passed (database seeding and CSV validation).
- `test_rules.py`: 7 passed (deterministic rules R1–R8).

### 5.2 Frontend Build Execution (Vite + TypeScript)
```powershell
cd "C:\Users\hp\.gemini\antigravity\scratch\bankmitra\frontend" ; npm run build
```
**Results:** **Exit code 0, built in 7.70s with zero TypeScript compilation errors.**
- `dist/index.html` (0.73 kB)
- `dist/assets/index-C9RaE81l.css` (28.47 kB)
- `dist/assets/index-DJguGuJE.js` (236.79 kB)

---

## 6. Remaining Blockers & Next Steps

1. **World Bank Raw Microdata Library Access:** Currently awaiting manual account approval on the World Bank Microdata Library (`catalog/7916`) to independently execute Stata/Python survey-weighted regressions on the 2024 microdata file. Until approved, Findex inactivity figures remain categorized as **Published Report Findings**.
2. **State-Level Primary NCFE Tables:** While the zonal tables are 100% verified from NSFE 2020–25 Table 1.2, acquiring verbatim OCR extracts of all 28 individual state annexure tables remains an open task if granular district-level scoring is desired in subsequent research phases.
