# BankMitra: Implementation Status and Deployment Roadmap

**Project:** BankMitra: Inactive Account Re-engagement Engine  
**The India @ 71/100 Challenge** | Theme 3: Financial Inclusion & Meaningful Banking Access  
**Evaluation Date:** 21 October 2026  
**Status:** MVP Fully Completed, Tested, and Verified in Synthetic Demonstration Mode.

---

## 1. Feature Completion Matrix

| Module / Requirement | Specification in Prompt & Dossier | Implementation Status | Evidence / File Reference |
|---|---|---|---|
| **Phase 1: Research & Red-Team Audit** | Grounded problem framing, official links, boundary analysis, novelty audit, claims register, and discovery protocol. | ✅ **COMPLETED** | [`RESEARCH_AUDIT.md`](./RESEARCH_AUDIT.md)<br>[`COMPETITOR_AND_NOVELTY_AUDIT.md`](./COMPETITOR_AND_NOVELTY_AUDIT.md)<br>[`CLAIMS_REGISTER.md`](./CLAIMS_REGISTER.md)<br>[`FIELD_VALIDATION_PLAN.md`](./FIELD_VALIDATION_PLAN.md) |
| **Phase 2: Synthetic Data Model** | 200 varied fictional cases, relational SQLite tables, schema validation, import deduplication, and CSV exports. | ✅ **COMPLETED** | [`DATA_DICTIONARY.md`](./DATA_DICTIONARY.md)<br>[`backend/generator.py`](./backend/generator.py)<br>[`backend/data/`](./backend/data/) |
| **Phase 3: Transparent Rules Engine** | Deterministic rules R1–R8 with explicit rule IDs, triggers, reasons, verification requirements, and guardrail limitations. | ✅ **COMPLETED** | [`backend/rules.py`](./backend/rules.py)<br>[`backend/tests/test_rules.py`](./backend/tests/test_rules.py) |
| **Phase 4: Backend REST API** | FastAPI + SQLite + Pydantic v2. Endpoints for health, metrics, cases, triage, decision simulator, outcomes, directory, and audit logs. | ✅ **COMPLETED** | [`backend/main.py`](./backend/main.py)<br>[`backend/schemas.py`](./backend/schemas.py)<br>[`backend/database.py`](./backend/database.py) |
| **Phase 5: Operations Frontend** | React + Vite + TypeScript + Tailwind CSS. Operations Dashboard, Case Management, Review Queue, Service Directory, Evidence Views. | ✅ **COMPLETED** | [`frontend/src/App.tsx`](./frontend/src/App.tsx)<br>[`frontend/dist/`](./frontend/dist/) (Production build verified) |
| **Outcome Separation** | Strict separation between Operational Reactivation, Customer Barrier Resolution, and Verified Voluntary Use. | ✅ **COMPLETED** | Rule R7 & R8 enforced in [`backend/rules.py`](./backend/rules.py) and UI KPI cards. |
| **Customer Agency & Opt-Out** | Instant cessation of simulated outreach upon customer decline; no repeated nudges or penalty. | ✅ **COMPLETED** | Rule R1 enforced in [`backend/main.py`](./backend/main.py#L390). |
| **Service Directory Guardrail** | Touchpoints >90 days stale or marked unauthorized blocked from referral. | ✅ **COMPLETED** | Checked via `is_route_fresh_and_verified()` in [`backend/rules.py`](./backend/rules.py#L21). |
| **Privacy & Security Standards** | Zero credentials collected (no OTP, PIN, password, card details, Aadhaar, PAN). All synthetic records. | ✅ **COMPLETED** | Verified across all schemas, database columns, and frontend views. |
| **Automated Testing Suite** | Unit tests, API integration tests, and edge case tests executed via pytest. | ✅ **COMPLETED** | 20/20 tests passed; documented in [`TEST_REPORT.md`](./TEST_REPORT.md). |

---

## 2. Documented Simplifying Assumptions (Synthetic Demonstration Boundary)

To ensure academic and regulatory honesty, the following simplifications are explicitly documented:
1. **Synthetic Cohort Sampling:** The 200 cases reflect a designed distribution across 6 barrier categories to demonstrate all system states and edge cases; this is **not** a claim of national empirical prevalence.
2. **Follow-Up Window:** The 90-day observation window for measuring voluntary meaningful use is modeled deterministically in the synthetic generator; real pilots must track this longitudinally.
3. **Channel Telemetry Simulation:** Customer SMS responses and BC terminal appointments are simulated through interactive UI state changes rather than live telecom gateway integrations.

---

## 3. Real-World Deployment Dependencies

BankMitra cannot operate as an unassisted standalone mobile application. To transition from hackathon MVP to a live institutional trial, the following institutional dependencies must be established:

```
┌────────────────────────────────────────────────────────────────────────┐
│                     DEPLOYMENT DEPENDENCY MAP                          │
├────────────────────────────────┬───────────────────────────────────────┤
│ Institutional Sponsorship      │ Regulated Scheduled Commercial Bank,   │
│                                │ Regional Rural Bank, or Lead Bank.    │
├────────────────────────────────┼───────────────────────────────────────┤
│ Core Banking Integration       │ Secure read access to inoperative flag│
│                                │ dates via ISO 20022 / CBS APIs.       │
├────────────────────────────────┼───────────────────────────────────────┤
│ Data Protection Compliance     │ Data processing agreements and lawful │
│                                │ notices under the DPDP Act 2023.      │
├────────────────────────────────┼───────────────────────────────────────┤
│ BC Network Task Queuing        │ API linkage with Corporate BC networks│
│                                │ (CSC, Bank Mitra Sakhis, PayNearby).  │
├────────────────────────────────┼───────────────────────────────────────┤
│ Service Directory Audit Feed   │ Quarterly certified roster of active  │
│                                │ operating branches and accredited BCs.│
└────────────────────────────────┴───────────────────────────────────────┘
```

---

## 4. Immediate Next Steps for Prospective Pilot

1. **Qualitative Discovery Pilot:** Execute the protocol outlined in [`FIELD_VALIDATION_PLAN.md`](./FIELD_VALIDATION_PLAN.md) with 15 consented account holders and 8 active Business Correspondents to validate the barrier taxonomy.
2. **Lead Bank Partnership Outreach:** Present the explainable rule engine and research dossier to lead district managers for a prospective 1,000-account sandbox evaluation.
3. **Multilingual Localisation:** Extend frontend plain-language customer guidance into Hindi, Marathi, and regional state languages with community review.
