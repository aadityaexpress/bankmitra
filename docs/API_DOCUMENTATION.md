# Financial Inclusion Governance Engine (FIGE / BankMitra)
## Complete REST API Specification & Endpoint Documentation

**Current Version:** `v3.2.0-phase6-governance-workflow`  
**Base URL:** `/api`  
**Specification Standard:** OpenAPI 3.0 / FastAPI Automatic Swagger (`http://127.0.0.1:8001/docs`)  
**Active Port:** `8001` (Backend) • `5173` (Frontend with auto-proxy)  
**Data Tier Classification:** Tier A/B (Public Sovereign Aggregates) air-gapped from Tier D (Synthetic Demonstration Cases).

---

## 1. System Health & Macro Evidence

### `GET /api/health`
Checks service health and pipeline status.
- **Response:**
  ```json
  {
    "status": "healthy",
    "version": "3.2.0-phase6-governance-workflow",
    "timestamp": "2026-10-24T06:00:00Z"
  }
  ```

### `GET /api/macro/evidence`
Retrieves verified multi-source sovereign and multilateral macro evidence (World Bank Findex 2021, DFS PMJDY, RBI FI-Index, NCFE NFLIS-2019/NSFE 2020-25) along with the Financial Inclusion Needs-Screening Index (FINSI).
- **Access:** Public / Read-Only (Tier A / Tier B Sovereign Data).
- **Metadata Returned:**
  ```json
  {
    "metadata": {
      "evidence_tier": "Tier A (Verified Sovereign and Multilateral Datasets)",
      "provenance": "Sovereign and Multilateral Public Reports",
      "air_gapped_from_operational": true
    },
    "pipeline_version": "3.0.0-phase4-validity-reviewed",
    "checksum_status": "ALL_MATCHED",
    "fipi_sensitivity_analysis": { ... },
    "findex_segmentation": { ... },
    "pmjdy_segmentation": { ... }
  }
  ```

---

## 2. Governance Outcomes & Policy Accountability (Phase 6)

### `GET /api/governance/outcomes`
Calculates the five core governance indicators (G1–G5) with audited numerators, denominators, formulae, time windows, and source requirements, plus regional breakdowns across the 6 administrative zones.
- **Response Structure:**
  ```json
  {
    "indicators": {
      "G1_referral_dispatch_rate": {
        "code": "G1",
        "name": "Referral Dispatch Rate (RDR)",
        "value_pct": 81.0,
        "numerator": 162,
        "numerator_label": "Eligible Inoperative Cases Dispatched to Verified Route",
        "denominator": 200,
        "denominator_label": "Total Inoperative Cases Reviewed",
        "formula": "(Eligible Dispatched Referrals / Total Inoperative Reviewed) * 100",
        "observation_window": "30 days post-review",
        "data_tier": "Tier D (Demonstration)",
        "source_requirement": "Bank Internal CRM / Referral Dispatch Logs",
        "policy_significance": "Measures proactive outreach to identified inoperative accounts"
      },
      "G2_intervention_completion_rate": {
        "code": "G2",
        "name": "Intervention Completion Rate (ICR)",
        "value_pct": 85.21,
        "numerator": 121,
        "numerator_label": "Cases with Completed Barrier Remediation",
        "denominator": 142,
        "denominator_label": "Cases Where Customer Accepted Intervention",
        "formula": "(Interventions Completed / Customer Accepted Interventions) * 100",
        "observation_window": "60 days post-acceptance",
        "data_tier": "Tier D (Demonstration)",
        "source_requirement": "BC Terminal Confirmation / Branch Signoff Record",
        "policy_significance": "Audits operational delivery of the chosen remedy"
      },
      "G3_verified_reactivation_rate": {
        "code": "G3",
        "name": "Verified Account Reactivation Rate (VARR)",
        "value_pct": 80.99,
        "numerator": 98,
        "numerator_label": "Accounts Shifted from Inoperative to Active in Core Banking",
        "denominator": 121,
        "denominator_label": "Completed Barrier Remediation Cases",
        "formula": "(Accounts Reactivated in CBS / Completed Interventions) * 100",
        "observation_window": "30 days post-completion",
        "data_tier": "Tier D (Demonstration)",
        "source_requirement": "Core Banking System (CBS) Account Master Status Ledger",
        "policy_significance": "Audits administrative status change in bank core ledger"
      },
      "G4_sustained_meaningful_use_rate": {
        "code": "G4",
        "name": "Sustained Meaningful Usage Rate (SMUR_90d)",
        "value_pct": 42.86,
        "numerator": 42,
        "numerator_label": "Accounts with >=2 Customer-Initiated Non-Zero Txns over 90 Days",
        "denominator": 98,
        "denominator_label": "Operationally Reactivated Accounts (VARR Numerator)",
        "formula": "(Accounts with >=2 Customer Txns over 90d / Operationally Reactivated Accounts) * 100",
        "observation_window": "90 days post-reactivation",
        "data_tier": "Tier D (Demonstration)",
        "source_requirement": "Core Banking System Transaction Ledger & AePS/UPI Settlement Records",
        "policy_significance": "Proves genuine financial inclusion utility rather than passive reactivation"
      },
      "G5_unresolved_barriers_rate": {
        "code": "G5",
        "name": "Unresolved Barrier & Friction Rate (UBR)",
        "value_pct": 20.54,
        "numerator": 38,
        "numerator_label": "Cases Encountering Stale Routes, KYC Impasse or Grievances",
        "denominator": 185,
        "denominator_label": "Cases Engaged in Barrier Assessment",
        "formula": "(Unresolved Barriers / Cases Engaged in Assessment) * 100",
        "observation_window": "Cumulative across cohort",
        "data_tier": "Tier D (Demonstration)",
        "source_requirement": "Case Management Exception Logs & RBI CMS Disputed File Records",
        "policy_significance": "Measures systemic friction points requiring structural policy reform"
      }
    },
    "funnel_summary": { ... },
    "regional_breakdown": {
      "Central Zone": { "total_cases": 52, "completed": 31, "reactivated": 25, "sustained": 11, "unresolved": 10 },
      "East Zone": { "total_cases": 48, "completed": 29, "reactivated": 24, "sustained": 10, "unresolved": 9 },
      ...
    },
    "air_gap_verification": {
      "data_tier": "Tier D (Synthetic Demonstration Sandbox)",
      "is_synthetic_demonstration": true,
      "observed_statistics_separation_confirmed": true
    }
  }
  ```

### `POST /api/cases/{case_id}/workflow-transition`
Transitions a case along the audited governance state machine with RBAC role validation, procedural transition rules, and immutable audit logging.
- **Allowed Roles (`actor_role`):** `BRANCH_OFFICER`, `BC_AGENT`, `COMPLIANCE_AUDITOR`, `POLICY_LEAD`.
- **Allowed Stages (`target_stage`):**
  - `ASSESSMENT`
  - `REFERRAL`
  - `ACCEPTED_INTERVENTION`
  - `COMPLETED`
  - `VERIFIED_REACTIVATION`
  - `SUSTAINED_USAGE`
  - `UNRESOLVED_BARRIERS` (Exception sink)
  - `OPTED_OUT` (Terminal suppression)
- **Request Body:**
  ```json
  {
    "target_stage": "REFERRAL",
    "service_id": "SRV-RAMPUR-BC-01",
    "actor_role": "BRANCH_OFFICER",
    "notes": "Assigned verified local BC agent for home KYC visit"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "case_id": "CASE-0001",
    "previous_stage": "ASSESSMENT",
    "new_stage": "REFERRAL",
    "status": "TRANSITION_SUCCESSFUL",
    "audit_event_id": "EVT-d93a4b",
    "message": "Case CASE-0001 successfully transitioned to REFERRAL by BRANCH_OFFICER"
  }
  ```
- **Error Responses:**
  - `404 Not Found`: Case does not exist.
  - `422 Unprocessable Entity`: Invalid forward jump, customer opted out (Rule R1), or stale destination touchpoint blocked (Rule R3).

### `GET /api/governance/retention`
Retrieves statutory data retention policies under PMLA 2002 Section 12 (5-year immutable audit trail) and DPDP Act 2023 Section 8(7) (Purpose limitation erasure).
- **Response:**
  ```json
  {
    "legal_framework": "Prevention of Money Laundering Act (PMLA) 2002 & Digital Personal Data Protection (DPDP) Act 2023",
    "retention_schedules": {
      "audit_events": "Retained for 5 years pursuant to PMLA 2002 Section 12",
      "active_cases": "Retained during active barrier assessment and re-engagement",
      "completed_cases": "Eligible for purpose-limitation erasure upon conclusion",
      "opted_out_cases": "Personal identifiers immediately erased; hash retained for suppression enforcement"
    },
    "pmla_audit_trail_retention_years": 5,
    "dpdp_erasure_policy": "Section 8(7) DPDP Act 2023 compliant",
    "total_audit_events_retained": 208,
    "demonstration_note": "Synthetic sandbox prototype simulating regulatory compliance"
  }
  ```

### `POST /api/governance/retention/simulate-purge`
Simulates DPDP Act purpose-limitation erasure on concluded demonstration cases.
- **Query Parameter:** `stage` (e.g. `?stage=SUSTAINED_USAGE`).
- **Response:**
  ```json
  {
    "status": "SIMULATED_PURGE_SUCCESSFUL",
    "target_stage": "SUSTAINED_USAGE",
    "records_eligible_for_erasure": 42,
    "retained_audit_logs": 208,
    "legal_citation": "DPDP Act 2023 Section 8(7) Purpose Limitation",
    "message": "Simulated statutory erasure executed for 42 cases in stage SUSTAINED_USAGE. Immutable audit logs (208 events) preserved under PMLA 2002."
  }
  ```

---

## 3. Case Management & Operational Workflow

### `GET /api/cases`
Lists synthetic cases with multi-attribute filtering.
- **Query Parameters:**
  - `region`: Filter by zone (`Central Zone`, `East Zone`, `South Zone`, `North Zone`, `West Zone`, `North-East Zone`).
  - `workflow_stage`: Filter by stage (`ASSESSMENT`, `REFERRAL`, `ACCEPTED_INTERVENTION`, `COMPLETED`, `VERIFIED_REACTIVATION`, `SUSTAINED_USAGE`, `UNRESOLVED_BARRIERS`, `OPTED_OUT`).
  - `intervention_type`: Filter by intervention code (`DOORSTEP_KYC_BC`, `BRANCH_ESCORTED_RESOLVE`, etc.).
  - `barrier`: Filter by primary diagnosed barrier.
  - `channel`: Filter by preferred communication channel.
  - `review_needed`: Boolean flag for review queue.
  - `search`: Case ID or Customer Token prefix search.
  - `limit`: Number of items (default 25).
  - `offset`: Pagination offset (default 0).

### `GET /api/cases/{case_id}`
Returns complete explainable case profile:
- Core demographic token and metadata.
- Diagnosed barrier assessment and evidence source.
- Deterministic Rule Engine evaluation (Rules R1–R8).
- Assigned service touchpoint with verification audit.
- Full immutable audit event history.

### `POST /api/cases/{case_id}/decision`
Records customer decision (`ACCEPTED`, `DECLINED`, `REQUESTED_NO_ACTION`, `OPTED_OUT`).
- Enforces immediate contact suppression under Rule R1 if `DECLINED` or `OPTED_OUT`.

### `POST /api/cases/{case_id}/outcome`
Updates case outcome with independent fields:
- `barrier_resolved_self_reported` (Boolean)
- `barrier_resolved_verified` (Boolean)
- `account_status_after` (`INOPERATIVE_UNCHANGED`, `ACTIVATION_REQUESTED`, `REACTIVATED_OPERATIONAL`, `CLOSED_BY_REQUEST`)
- `meaningful_use_status` (`VERIFIED_VOLUNTARY_USE`, `SELF_REPORTED_USE`, `NO_FURTHER_USE_WANTED`, `NO_USE_DETECTED`, `NOT_MEASURED_YET`)

---

## 4. Oversight, Service Points & Audit Logs

### `GET /api/review-queue`
Returns cases flagged for human compliance officer review (e.g. unconfirmed system signals, stale touchpoints, unresolved grievances).

### `GET /api/service-directory`
Lists accredited institutional touchpoints with freshness timestamps and active verification status (`ACTIVE_VERIFIED` vs `STALE_OR_UNVERIFIED`).

### `GET /api/audit-events`
Returns system audit log entries in reverse chronological order.
- Filterable by `limit` (default 50).
- Fully air-gapped from external databases.
