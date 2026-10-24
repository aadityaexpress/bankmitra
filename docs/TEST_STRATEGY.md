# Financial Inclusion Governance Engine (FIGE): Test Strategy & Quality Assurance Plan

**Document Classification:** Verification Protocol & Test Engineering Specification  
**Version:** 1.0.0 (Phase 1 Baseline)  
**Date:** 23 October 2026  
**Auditor Rule:** Every rule, metric formula, edge case, and privacy guardrail must have automated unit or integration tests with verifiable pass/fail assertions. Zero regressions permitted.

---

## 1. Test Philosophy & Testing Pyramid

The FIGE test architecture is engineered to guarantee mathematical correctness, rule determinism, and absolute privacy enforcement:

```
                  ┌───────────────────────┐
                  │   End-to-End & UI     │  (Playwright / Cypress)
                  │   Scenario Audits     │  Cross-view workflows & badges
                  ├───────────────────────┤
                  │    API Contract &     │  (FastAPI TestClient)
                  │    Security Tests     │  HTTP status, schemas, RBAC
                  ├───────────────────────┤
                  │ Data Ingestion & Edge │  (Pandas / Pydantic)
                  │     Case Tests        │  Malformed CSVs, duplicates
                  ├───────────────────────┤
                  │  Deterministic Rules  │  (Pytest Unit Tests)
                  │   & Metric Formulas   │  Rules R1–R8, FIPI, TFS, SIR
                  └───────────────────────┘
```

---

## 2. Test Suites & Verification Scope

### 2.1 Suite 1: Deterministic Rules Engine (`test_rules.py`)
Verifies that rules R1 through R8 evaluate strictly according to regulatory mandates:
- **Test R1 (Opt-Out Suppression):** Asserts that when `contact_permission = false` or `consent_status = 'WITHDRAWN'`, the engine outputs `Rule R1`, assigns `SUPPRESS_OUTREACH`, and immediately cancels downstream routing.
- **Test R2 (KYC Updation Channels):** Asserts that confirmed KYC mismatches are assigned `OFFICIAL_KYC_PATHWAY` and permitted non-home branch / BC channels per RBI Circular 12864.
- **Test R3 (Freshness Cutoff Gate):** Asserts that a service point with `days_since_verification > 90` evaluates `destination_verified = false`, blocks automated referral, and triggers a human officer review hold.
- **Test R4 (Grievance Prioritization):** Asserts that accounts with unresolved debit complaints receive `GRIEVANCE_ESCALATION` to an Internal Ombudsman desk; asserts that reactivation outreach is suppressed until grievance resolution.
- **Test R5 (DBT Credit Non-Blocking):** Asserts that PMJDY and scholarship accounts receive neutral informational guidance with explicit no-action acceptance.
- **Test R6 (Ambiguous / Low Evidence Hold):** Asserts that unconfirmed or contradictory system signals output `HUMAN_REVIEW_HOLD`, refusing automated diagnosis.
- **Test R7 (Referral Completion vs Barrier Resolution):** Asserts that completing a BC appointment does not automatically set `barrier_resolved = true` without verified customer confirmation.
- **Test R8 (Separation of Meaningful Use):** Asserts that an account reactivated on the core ledger is NOT counted as meaningful success if `meaningful_use_status != 'VERIFIED_VOLUNTARY_USE'`.

---

### 2.2 Suite 2: Data Import & Validation (`test_import_and_data.py`)
Verifies data ingestion robustness and zero-silent-zero policies:
- **Schema Conformity:** Asserts that Pydantic models reject invalid enumerations, negative balances, and malformed dates.
- **Missing Data Handling:** Asserts that missing values in survey or bank tables parse as `NULL` / `None`, and do NOT silently mutate into `0.0`.
- **Deduplication:** Asserts that duplicate `case_id` or `customer_token` records are rejected during batch ingestion.
- **Idempotent Database Seeding:** Asserts that re-running `seed_database()` preserves existing data integrity without orphan rows.

---

### 2.3 Suite 3: API Behaviour & Contract Tests (`test_api.py`)
Verifies REST API behavior, response payloads, and synthetic labeling:
- **Synthetic Watermark Headers:** Asserts that API responses include `X-Synthetic-Demo: true` or equivalent schema metadata.
- **Status Codes & Error Contracts:** Asserts that invalid payloads return `422 Unprocessable Entity` and missing cases return `404 Not Found`.
- **Endpoint Coverage:** Tests endpoints `/api/cases`, `/api/stats`, `/api/rules`, `/api/service-directory`, and `/api/audit-events`.

---

### 2.4 Suite 4: Edge Cases & Red Team Scenarios (`test_edge_cases.py`)
Rigorous stress tests covering complex failure modes:
1. **Deceased Account Holder Scenario:** Customer tracing discovers the holder is deceased; system halts outreach and routes to legal heir / nomination claim settlement under RBI circular guidelines.
2. **Multiple Overlapping Barriers:** Customer reports both physical distance and an unresolved ATM debit complaint; engine prioritizes grievance redressal before transport facilitation.
3. **Stale Touchpoint Network:** 100% of local BC kiosks in a mock district exceed the 90-day verification window; system blocks all automated dispatch and fires a critical cluster alert to the Lead District Manager.
4. **Boundary Condition (Exact 90 Days):** Touchpoint verified exactly 90 days ago passes; touchpoint verified 91 days ago is blocked.
5. **Customer Flips Consent Mid-Workflow:** Citizen initially consented but withdraws consent during BC consultation; system immediately records opt-out and purges future review tasks.

---

## 3. Current Test Execution Baseline

As of Phase 1 foundation audit (23 October 2026), the backend test suite contains **20 comprehensive automated unit and integration tests**, all executing and passing:

```powershell
$env:PYTHONPATH="C:\Users\hp\.gemini\antigravity\scratch\bankmitra"
python -m pytest "C:\Users\hp\.gemini\antigravity\scratch\bankmitra\backend\tests"
```

### Execution Summary
- `backend/tests/test_api.py`: 7 passed (API contracts, stats calculations, case listings).
- `backend/tests/test_edge_cases.py`: 4 passed (Edge cases, opt-out locks, contradictory signals).
- `backend/tests/test_import_and_data.py`: 2 passed (CSV import validation, database seeding).
- `backend/tests/test_rules.py`: 7 passed (Rules R1 to R8, freshness cutoffs, outcome separation).
- **Total:** **20 passed in 1.99s** (100% pass rate).

---

## 4. Phase 2–4 Test Expansion Roadmap

In subsequent phases, test coverage will be systematically expanded:

| Phase | Planned Test Suite | Target Invariants & Assertions |
|---|---|---|
| **Phase 2** | `test_macro_scoring.py` | Vectorized FIPI score calculation; missing-data penalty application; survey-weight verification for Findex 2021 & 2025. |
| **Phase 2** | `test_findex_ingestion.py` | Microdata CSV checksum verification; codebook variable mapping; strata consistency. |
| **Phase 3** | `test_rbac_security.py` | Verification that `REGULATOR_AUDITOR` cannot mutate cases; verification that unauthenticated requests are rejected. |
| **Phase 4** | `test_frontend_e2e.spec.ts` | Playwright E2E tests verifying filter operations, case triage workflows, and audit trail rendering. |
