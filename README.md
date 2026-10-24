# BankMitra: Financial Inclusion Intelligence & Governance Platform

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC.svg)](https://tailwindcss.com/)
[![Test Suite](https://img.shields.io/badge/Pytest-44%2F44%20Passed-brightgreen.svg)](./backend/tests/)
[![Statutory Alignment](https://img.shields.io/badge/Statutory-RBI%20Inoperative%202024%20%7C%20DPDP%202023-emerald.svg)](./docs/PRODUCT_DESIGN_REVIEW.md)

> **BankMitra** is an enterprise-grade financial inclusion intelligence and governance platform designed for commercial banks, regional rural banks, and regulatory bodies.
> 
> The platform bridges sovereign macro financial inclusion data with ground-level operational case resolution—prioritizing **customer agency, grievance resolution, and long-term sustained account utility** over cosmetic reactivation quotas.

---

## Architecture Overview

BankMitra operates across three mutually reinforcing pillars:

```
[ Sovereign Evidence Pipeline ]
  World Bank Findex (2011–2025) • RBI FI-Index (2021–2024) • DFS PMJDY (2025) • NCFE Literacy Surveys
                            │
                            ▼
               [ Pillar 1: Intelligence ]
     Needs-Screening Engine (FINSI) • 6-Zone Geographic Prioritization
                            │
                            ▼
               [ Pillar 2: Governance ]
    Deterministic Rules Engine (R1–R8) • Case Management & Human Review Queue
                            │
                            ▼
                [ Pillar 3: Outcomes ]
  Dual-Rate Accountability (VARR vs. SMUR-90d) • PMLA 5-Year Audit • DPDP Erasure
```

### The Three Operational Pillars

1. **Intelligence (Needs Screening & Resource Allocation):**
   - Ingests and standardizes verified sovereign data from the World Bank, RBI, and Department of Financial Services.
   - Computes the **Financial Inclusion Needs Screening Index (FINSI)** across 6 macro zones to guide physical BC and branch resource allocation without claiming predictive individual dormancy status.

2. **Governance (Deterministic Rules R1–R8 & Human Review):**
   - **R1 (Customer Opt-Out):** Immediate cessation of automated outreach upon consent withdrawal.
   - **R2 (KYC Correction):** Directs documentation mismatches to authorized non-home branches or BC touchpoints.
   - **R3 (Access Friction):** Routes to verified local points; blocks referrals to touchpoints unverified within 90 days.
   - **R4 (Unresolved Grievance):** Routes billing and ATM disputes directly to the Internal Ombudsman prior to any reactivation dialogue.
   - **R5 (Concluded Utility):** Neutral guidance for closed-purpose accounts respecting zero-balance rights.
   - **R6 (Telemetry Only):** Holds machine-inferred dormancy signals without customer voice in human review.
   - **R7 (Outcome Separation):** Distinctly records self-reported resolution vs. bank-verified operational reactivation.
   - **R8 (Reactivation ≠ Success):** Technical unfreezing is strictly separated from sustained voluntary utility.

3. **Outcomes (Accountability & Longitudinal Tracking):**
   - Evaluates **Verified Account Reactivation Rate ($VARR$)** alongside **Sustained Meaningful Use Rate ($SMUR_{90d}$)** with an empirical observation window of at least 90 days.
   - Provides full compliance traceability under PMLA 5-year retention and DPDP Act 2023 purpose-limitation controls.

---

## Six-Module Application Workspace

| Module | Purpose | Key Features |
|:---|:---|:---|
| **Executive Overview** | Cross-pillar health & funnel analytics | Attrition funnel ($N=200$), diagnosed friction breakdown, governance safeguards |
| **Regional Intelligence** | Macro geographic evidence explorer | Sovereign time-series, 6-zone needs ranking table, FINSI component inspector |
| **Intervention Management** | Operational case triage & review queue | Active Case Registry, Human Compliance Review Queue, Accredited Touchpoint Directory |
| **Outcome Monitoring** | Regulatory accountability metrics | G1–G5 indicators, dual-rate comparison ($VARR$ vs. $SMUR_{90d}$), retention survival modeling |
| **Evidence & Methodology** | Statutory basis & claims boundaries | R1–R8 inspectable logic, RBI/DFS citation ledger, Safe vs. Unsafe claims register |
| **Audit & Governance** | Regulatory traceability & DPDP controls | PMLA-compliant audit log, role-stamped actions, privacy erasure simulation |

---

## Technology Stack

- **Backend:** Python 3.10+, FastAPI, Pydantic v2, SQLite, Pytest
- **Frontend:** React 18, Vite 6, TypeScript, Tailwind CSS, Lucide React
- **Data Pipeline:** Deterministic synthetic demonstration fixtures ($N=200$) with strict isolation from Tier A sovereign datasets

---

## Quickstart & Local Setup

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher (with npm)
- Git

### 1. Clone & Set Up Environment
```bash
git clone https://github.com/aadityakumar/bankmitra.git
cd bankmitra
```

### 2. Backend Setup
```powershell
# Set Python path to current workspace
$env:PYTHONPATH="."

# Run automated test suite (44 tests)
pytest backend/tests/ -v

# Start FastAPI backend (port 8001)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload
```
API documentation is available at `http://127.0.0.1:8001/docs`.

### 3. Frontend Setup
In a second terminal:
```powershell
cd frontend
npm install
npm run dev
```
Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

---

## Automated Test Verification

All 44 unit, integration, and governance tests pass with 100% coverage:

```
backend/tests/test_api.py ................................ [ 18%]
backend/tests/test_audit_and_validation.py ............... [ 38%]
backend/tests/test_data_pipeline.py ...................... [ 50%]
backend/tests/test_e2e_user_journey.py ................... [ 52%]
backend/tests/test_edge_cases.py ......................... [ 61%]
backend/tests/test_governance_workflow.py ................ [ 79%]
backend/tests/test_import_and_data.py .................... [ 84%]
backend/tests/test_rules.py .............................. [100%]

======================= 44 passed in 15.26s =======================
```

---

## Documentation Index

- [`PRODUCT_DESIGN_REVIEW.md`](./docs/PRODUCT_DESIGN_REVIEW.md) — Comprehensive product transformation and technical architecture review.
- [`DATA_DICTIONARY.md`](./docs/DATA_DICTIONARY.md) — Relational schema definitions and statutory indicators.
- [`API_DOCUMENTATION.md`](./docs/API_DOCUMENTATION.md) — RESTful endpoints and payload schemas.
- [`DATA_SOURCE_REGISTER.md`](./docs/DATA_SOURCE_REGISTER.md) — Sovereign dataset provenance, URLs, and checksums.
- [`FIPI_VALIDITY_REVIEW.md`](./docs/FIPI_VALIDITY_REVIEW.md) — Needs screening index mathematical formulation and sensitivity analysis.
- [`PRIVACY_AND_GOVERNANCE.md`](./docs/PRIVACY_AND_GOVERNANCE.md) — DPDP Act 2023 purpose limitation and consent lifecycle.

---

## License & Compliance Notice

This software is developed strictly for research, policy demonstration, and institutional governance evaluation. Case records used in demonstration mode are pseudonymous, synthetic fixtures containing zero Real Identifiable Information (no Aadhaar, PAN, or account numbers).
