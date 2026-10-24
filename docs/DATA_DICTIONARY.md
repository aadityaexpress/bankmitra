# Financial Inclusion Governance Engine (FIGE): Master Data Dictionary

**Document Classification:** Technical Data Dictionary & Schema Specification  
**Version:** 1.0.0 (Phase 1 Baseline)  
**Date:** 23 October 2026  
**Auditor Rule:** Missing data must never silently become zero. Every field must declare its data type, constraints, nullability semantics, provenance, evidence tier (A through E), and DPDP Act sensitivity.

---

## 1. Architecture Overview: Two-Tier Data Model

The FIGE platform enforces a strict architectural boundary between two distinct data universes:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TIER 1: MACRO & SURVEY EVIDENCE                      │
│   (Public Aggregates, Representative Surveys, Geospatial Targets)      │
│   • Global Findex 2021 & 2025 Microdata (Tier A/B)                     │
│   • NCFE NFLIS-2019 Literacy Tables (Tier A)                           │
│   • DFS PMJDY Scheme Progress Aggregates (Tier A)                      │
│   • RBI FI-Index & CFL Network Metadata (Tier A)                       │
│   • NPCI Payment Rails Volumes & Values (Tier A)                       │
│   • DBT Bharat Welfare Outlay Aggregates (Tier A)                      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │  (Air-gapped; informs geographic
                                   │   prioritisation, NOT individual routing)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│             TIER 2: OPERATIONAL CASE & GOVERNANCE SCHEMA               │
│         (Controlled Decision Support, Routing & Accountability)        │
│   • cases (Pseudonymous Tokens, Zero Real PII) (Tier D)                │
│   • barrier_assessments (Diagnosed Friction & Evidence Source) (Tier D)│
│   • interventions (Deterministic Rules R1–R8 & Routing) (Tier D)       │
│   • outcomes (Triangulated Resolution & Meaningful Usage) (Tier D)     │
│   • service_directory (Touchpoint Uptime & 90-Day Freshness) (Tier D)  │
│   • audit_events (Immutable Append-Only Audit Trail) (Tier D)          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Part 1: Macro & Survey Data Dictionary

### 2.1 Table: `macro_findex_indicators`
Stores survey-weighted indicators from the World Bank Global Findex Database (2021 & 2025 rounds).

| Field Name | Data Type | Nullable? | Evidence Tier | Description & Permitted Values | Provenance / Codebook Variable |
|---|---|---|---|---|---|
| `survey_year` | INTEGER | No | Tier A | Survey round calendar year: `2021`, `2024`. | World Bank Global Findex metadata |
| `country_iso3` | TEXT(3) | No | Tier A | ISO 3166-1 alpha-3 code: `IND`. | Standard ISO |
| `strata_id` | TEXT | No | Tier A | Sampling stratum identifier within India survey design. | Findex Microdata `strata` |
| `wgt` | REAL | No | Tier A | Survey weight applied to respondent to reproduce national estimates. Must never be omitted. | Findex Microdata `wgt` |
| `has_account` | BOOLEAN | No | Tier A | Formal financial institution or mobile money account ownership: `1` (Yes), `0` (No). | Findex Microdata `account` |
| `inactive_survey` | BOOLEAN | Yes | Tier A | No deposits, withdrawals, or digital payments in prior 12 months: `1` (Inactive), `0` (Active), `NULL` (Unbanked). | Findex Microdata `inactive` |
| `reason_distance` | BOOLEAN | Yes | Tier A | Stated barrier: Financial institutions too far away: `1` (Yes), `0` (No), `NULL` (Not asked/Active). | Findex 2021 Microdata `fin13a` |
| `reason_distrust` | BOOLEAN | Yes | Tier A | Stated barrier: Lack of trust in financial institutions: `1` (Yes), `0` (No), `NULL`. | Findex 2021 Microdata `fin13c` |
| `reason_no_need` | BOOLEAN | Yes | Tier A | Stated barrier: No perceived need for an account: `1` (Yes), `0` (No), `NULL`. | Findex 2021 Microdata `fin13d` |
| `reason_no_money` | BOOLEAN | Yes | Tier A | Stated barrier: Insufficient funds to use an account: `1` (Yes), `0` (No), `NULL`. | Findex 2021 Microdata `fin13b` |
| `reason_discomfort`| BOOLEAN | Yes | Tier A | Stated barrier: Uncomfortable using account independently: `1` (Yes), `0` (No), `NULL`. | Findex 2021 Microdata `fin13e` |
| `gender` | INTEGER | No | Tier A | Respondent gender: `1` (Female), `2` (Male). | Findex Microdata `female` |
| `income_quintile` | INTEGER | No | Tier A | Household income quintile: `1` (Poorest 20%) to `5` (Richest 20%). | Findex Microdata `inc_q` |
| `age_band` | TEXT | No | Tier A | Categorical age group: `15_24`, `25_34`, `35_54`, `55_PLUS`. | Computed from `age` |
| `education_level` | TEXT | No | Tier A | Attainment: `PRIMARY_OR_LESS`, `SECONDARY`, `TERTIARY_PLUS`. | Findex Microdata `educ` |

---

### 2.2 Table: `macro_ncfe_literacy`
Stores state-level and demographic financial literacy benchmarks from NCFE NFLIS-2019.

| Field Name | Data Type | Nullable? | Evidence Tier | Description & Permitted Values | Provenance / Reference |
|---|---|---|---|---|---|
| `state_ut_name` | TEXT | No | Tier A | Name of Indian State or Union Territory (e.g., `Bihar`, `Kerala`). | NCFE NFLIS-2019 Table 4.1 |
| `state_iso_code` | TEXT(5) | No | Tier A | Standard ISO 3166-2:IN code (e.g., `IN-BR`, `IN-KL`). | National standard |
| `sample_size_n` | INTEGER | No | Tier A | Number of surveyed adult respondents in state sample. | NCFE NFLIS-2019 |
| `fl_benchmark_pct`| REAL | No | Tier A | Percentage of adults meeting OECD-INFE minimum threshold ($\ge 6/8$ Knowledge, $\ge 3/5$ Attitude, $\ge 6/9$ Behaviour). Range: `0.0` to `100.0`. | NCFE NFLIS-2019 Table 4.2 |
| `knowledge_pass_pct`| REAL | No | Tier A | Percentage scoring $\ge 6/8$ on financial knowledge. | NCFE NFLIS-2019 |
| `attitude_pass_pct` | REAL | No | Tier A | Percentage scoring $\ge 3/5$ on financial attitude. | NCFE NFLIS-2019 |
| `behaviour_pass_pct`| REAL | No | Tier A | Percentage scoring $\ge 6/9$ on financial behaviour. | NCFE NFLIS-2019 |
| `rural_sample_pct` | REAL | No | Tier A | Proportion of state sample residing in rural areas. | NCFE NFLIS-2019 |
| `survey_vintage` | TEXT | No | Tier A | Survey execution period: `JUNE_2018_TO_OCTOBER_2019`. | NCFE Official Record |

---

### 2.3 Table: `macro_pmjdy_progress`
Stores bank-reported aggregate operational metrics from the Department of Financial Services.

| Field Name | Data Type | Nullable? | Evidence Tier | Description & Permitted Values | Provenance / Reference |
|---|---|---|---|---|---|
| `snapshot_date` | TEXT (ISO 8601)| No | Tier A | Date of official report snapshot (e.g., `2025-02-28`). | DFS PMJDY Progress Report |
| `bank_category` | TEXT | No | Tier A | Institutional group: `PUBLIC_SECTOR_BANKS`, `REGIONAL_RURAL_BANKS`, `PRIVATE_SECTOR_BANKS`, `ALL_BANKS`. | PMJDY Table Column 1 |
| `accounts_rural_semiurban`| INTEGER | No | Tier A | Number of accounts in rural/semi-urban branches. | PMJDY Official Portal |
| `accounts_urban_metro` | INTEGER | No | Tier A | Number of accounts in urban/metro branches. | PMJDY Official Portal |
| `total_accounts` | INTEGER | No | Tier A | Total accounts opened: `accounts_rural_semiurban + accounts_urban_metro`. | PMJDY Official Portal |
| `women_accounts` | INTEGER | No | Tier A | Number of accounts held by female beneficiaries. | PMJDY Official Portal |
| `women_share_pct`| REAL | No | Tier A | Percentage of female account holders: `(women_accounts / total_accounts) * 100`. | Computed |
| `deposit_balance_inr_cr`| REAL | No | Tier A | Total balance deposited across accounts (in ₹ Crore). | PMJDY Official Portal |
| `rupay_cards_issued` | INTEGER | No | Tier A | Total RuPay debit cards issued to account holders. | PMJDY Official Portal |
| `inoperative_rate_est` | REAL | Yes | Tier B | Estimated inoperative proportion from parliamentary disclosure (e.g., `21.17`). `NULL` if not officially reported for snapshot date. | Parliament QA 22 Jan 2025 |

---

### 2.4 Table: `macro_infrastructure_payments`
Stores infrastructure velocity indicators from RBI, NPCI, and MeitY.

| Field Name | Data Type | Nullable? | Evidence Tier | Description & Permitted Values | Provenance / Reference |
|---|---|---|---|---|---|
| `reporting_month` | TEXT(7) | No | Tier A | Year and month: `YYYY-MM` (e.g., `2025-03`). | NPCI / RBI Official Release |
| `rbi_fi_index` | REAL | Yes | Tier A | National RBI Financial Inclusion Index score (0 to 100). Reported annually in March. | RBI Annual Report |
| `cfl_operational_count` | INTEGER | Yes | Tier A | Total operational Centres for Financial Literacy. | RBI Annual Report (2,421 in Mar 2025) |
| `upi_volume_million` | REAL | No | Tier A | Total monthly retail UPI transactions (Millions). | NPCI UPI Product Statistics |
| `upi_value_inr_cr` | REAL | No | Tier A | Total monthly retail UPI transaction value (₹ Crore). | NPCI UPI Product Statistics |
| `aeps_volume_million`| REAL | No | Tier A | Total monthly AePS biometric transactions (Millions). | NPCI AePS Statistics |
| `aeps_value_inr_cr` | REAL | No | Tier A | Total monthly AePS transaction value (₹ Crore). | NPCI AePS Statistics |
| `dbt_transfer_inr_cr`| REAL | Yes | Tier A | Total monthly direct benefit transfers (₹ Crore). | DBT Bharat Portal |

---

### 2.5 Table: `macro_finsi_zonal_indicators`
Stores source-verified inputs, normalisation values, and composite needs-screening scores across the 6 statutory RBI administrative zones.

| Field Name | Data Type | Nullable? | Evidence Tier | Description & Permitted Values | Provenance / Primary Source |
|---|---|---|---|---|---|
| `zone` | TEXT | No | Tier A | Official RBI statutory zone: `East`, `Central`, `South`, `North`, `North-East`, `West`. | RBI Zonal Framework |
| `fl_overall_pct` | REAL | No | Tier B | NCFE verbatim adult financial literacy score. Range: `20.0` to `37.0` (National Benchmark: `27.18`). | NCFE NFLIS-2019 / NSFE 2020–2025 Table 1.2 |
| `fl_deficit` | REAL | No | Tier B | Financial literacy deficit: `100.0 - fl_overall_pct`. Range: `63.0` to `80.0`. | Derived from Table 1.2 |
| `rural_pop_share` | REAL | No | Tier A | Zonal rural/semi-urban concentration share. Range: `0.55` to `0.78`. | Census / PMJDY Portal |
| `pmjdy_acc_crores`| REAL | No | Tier A | Total PMJDY gross account scale (Crores). Range: `1.76` to `17.65`. | DFS PMJDY Live Table (14 Oct 2026) |
| `score_minmax` | REAL | No | Tier B | Composite score under Min-Max $[0, 1]$ normalization. Range: `0.1870` to `0.7820`. | Analytical Pipeline |
| `score_zscore` | REAL | No | Tier B | Composite score under Z-score standardization ($\mu=0, \sigma=1$). Range: `-0.4657` to `+0.9880`. | Analytical Pipeline |
| `borda_points` | INTEGER | No | Tier B | Non-parametric Borda rank points. Range: `3` to `18`. | Analytical Pipeline |
| `rank_provisional`| INTEGER | No | Tier B | Priority rank under baseline weights (50% Lit, 30% Rural, 20% Vol). `1` to `6`. | Analytical Pipeline |
| `evidence_coverage_pct`| REAL | No | Tier A | Ratio of observed vs expected indicators (Strictly `100.0`%). | Quality Pipeline |
| `direct_inoperancy_observed`| BOOLEAN| No| Tier A | Explicit flag declaring whether CBS dormancy was directly observed: Strictly `0` (False). | Governance Boundary Rule |
| `missing_data_warnings`| TEXT | No | Tier A | Recorded data gaps: `None (Clean Zonal Inputs)`. | Pipeline Audit |

---

### 2.6 Entity: `macro_evidence_domains_matrix`
Defines the epistemic boundaries separating general inclusion need from bank account dormancy.

| Domain Name | Evidence Tier | Direct Inoperancy Link | Verified Data Points | Missing Operational Join |
|---|---|---|---|---|
| **Domain 1: Observed Account-Inactivity Evidence** | Tier B / E | Direct behavioral self-report & statutory inoperancy reports | World Bank Findex (35% in 2021; 16% in 2024); PMJDY Parliament QA (21.17%) | Core Banking System (CBS) transaction ledgers & KYC freeze codes |
| **Domain 2: Financial Literacy Evidence** | Tier B | Epistemically Unlinked | NCFE NFLIS-2019 / NSFE 2020-2025 Zonal Adult Benchmark (20.0%–37.0%; National: 27.18%) | Individual financial capability cannot be inferred from zonal aggregates |
| **Domain 3: Access & Infrastructure Evidence** | Tier A / B | Indirect Access Proxy | RBI CFL Network (2,421 centres); 1.48M active BCs; RRB rural concentration (84.70%) | BC kiosk uptime logs, cashout liquidity failure rates |
| **Domain 4: General Financial Inclusion Indicators** | Tier A | Macro Penetration Proxy Only | World Bank Account Ownership (89.02%); PMJDY 59.59 Cr Accounts; RBI FI-Index (64.2) | Distinguishing voluntary disuse from involuntary structural friction |

---

## 3. Part 2: Operational Governance & Case Schema

All operational tables handle **synthetic or controlled institutional review data only**. Absolutely zero real customer PII is stored.

```
       ┌──────────────────┐
       │      cases       │
       └────────┬─────────┘
                │
    ┌───────────┼───────────────────────┐
    │ 1:1       │ 1:1                   │ 1:1
    ▼           ▼                       ▼
┌────────┐ ┌──────────────┐       ┌──────────┐
│barrier_│ │interventions │       │ outcomes │
│assess- │ └──────┬───────┘       └──────────┘
│ments   │        │
└────────┘        │ references (M:1)
                  ▼
         ┌──────────────────┐
         │service_directory │
         └──────────────────┘

    ┌──────────────────┐
    │   audit_events   │ (Immutable chronological audit log)
    └──────────────────┘
```

---

### 3.1 Entity: `cases`
Represents an individual bank-identified review case flagged for statutory outreach under RBI instructions.

| Column Name | Data Type | Constraints | Nullable? | Description & Allowed Domain | DPDP Sensitivity |
|---|---|---|---|---|---|
| `case_id` | TEXT | PRIMARY KEY | No | Synthetic case identifier: `CASE-0001` to `CASE-9999`. | Internal Synthetic Token |
| `customer_token` | TEXT | UNIQUE, NOT NULL | No | Pseudonymous, cryptographically hashed token (e.g., `CUST-SYN-0001`). Never real identifiers. | Pseudonymous Token |
| `status_source` | TEXT | NOT NULL | No | Detection trigger: `CBS_BATCH_REVIEW`, `BRANCH_AUDIT`, `BC_TRANSACTION_FAIL`. | Non-PII Metadata |
| `review_date` | TEXT (ISO 8601)| NOT NULL | No | Date flagged for periodic review: `YYYY-MM-DD`. | Non-PII Timestamp |
| `inactivity_band` | TEXT | NOT NULL | No | Duration of dormancy: `2_TO_3_YEARS`, `3_TO_5_YEARS`, `5_TO_10_YEARS`, `OVER_10_YEARS`. | Operational Account Attribute |
| `account_origin` | TEXT | NOT NULL | No | Scheme genesis: `PMJDY_BENEFIT`, `SCHOLARSHIP_DBT`, `GENERAL_SAVINGS`, `RURAL_EMPLOYMENT_MGNREGA`. | Operational Classification |
| `consent_status` | TEXT | NOT NULL | No | Customer consent: `CONSENTED`, `PENDING_CONSENT`, `WITHDRAWN`, `DECLINED`. | Critical Privacy State |
| `contact_permission`| BOOLEAN | NOT NULL | No | Proactive outreach permitted by citizen: `1` (True), `0` (False). | Critical Privacy State |
| `preferred_channel` | TEXT | NOT NULL | No | Preferred touchpoint: `AUTHORISED_BC`, `BRANCH_VISIT`, `PLAIN_SMS_GUIDE`, `NO_FURTHER_CONTACT`. | Operational Choice |
| `source_authorisation`| TEXT | NOT NULL | No | Bank institutional mandate reference (e.g., `AUTH-MANDATE-2026-B1`). | Statutory Audit Ref |
| `is_synthetic` | BOOLEAN | NOT NULL, DEFAULT 1 | No | Mandatory synthetic badge: `1` (Always true in demonstration system). | Audit Integrity |

---

### 3.2 Entity: `barrier_assessments`
Documents the diagnosed friction preventing account utilization, preserving explicit provenance and confidence level.

| Column Name | Data Type | Constraints | Nullable? | Description & Allowed Domain | DPDP Sensitivity |
|---|---|---|---|---|---|
| `assessment_id` | TEXT | PRIMARY KEY | No | Assessment identifier: `ASM-0001` to `ASM-9999`. | Internal Synthetic Token |
| `case_id` | TEXT | FOREIGN KEY, UNIQUE | No | References `cases.case_id`. | Foreign Key |
| `barrier_primary` | TEXT | NOT NULL | No | Friction domain: `KYC_MISMATCH`, `PHYSICAL_ACCESS`, `TRUST_GRIEVANCE`, `DIGITAL_FRICTION`, `CHANGED_UTILITY`, `UNKNOWN_OR_CONTRADICTORY`. | Operational Diagnosis |
| `barrier_secondary`| TEXT | NULLABLE | Yes | Granular motive (e.g., `AADHAAR_NAME_SPELLING`, `DISTANCE_OVER_15KM`, `FAILED_ATM_DEBIT_UNRESOLVED`, `FEAR_OF_BIOMETRIC_FAIL`, `ONE_TIME_SCHEME_ENDED`, `INSUFFICIENT_EVIDENCE`). | Granular Diagnostic Note |
| `evidence_source` | TEXT | NOT NULL | No | Assessment grounding: `CUSTOMER_CONFIRMED`, `AUTHORISED_STAFF_NOTE`, `SYSTEM_SIGNAL_ONLY`, `UNKNOWN`. | Evidence Verification |
| `confidence_label`| TEXT | NOT NULL | No | Epistemic certainty: `HIGH_CONFIRMED`, `MEDIUM_DOCUMENTED`, `LOW_INFERRED`, `UNRESOLVED`. | Reliability Rating |
| `customer_confirmed`| BOOLEAN | NOT NULL | No | Whether the customer personally verified this barrier: `1` (Yes), `0` (No). | Consent & Agency State |
| `recorded_at` | TEXT (ISO 8601)| NOT NULL | No | Timestamp when barrier was logged. | Audit Timestamp |
| `notes` | TEXT | NULLABLE | Yes | Fictional non-PII operational notes. | Diagnostic Context |

---

### 3.3 Entity: `interventions`
Tracks the deterministic routing recommendation generated by rules R1 to R8, touchpoint verification, and citizen agency response.

| Column Name | Data Type | Constraints | Nullable? | Description & Allowed Domain | DPDP Sensitivity |
|---|---|---|---|---|---|
| `intervention_id` | TEXT | PRIMARY KEY | No | Intervention identifier: `INT-0001` to `INT-9999`. | Internal Synthetic Token |
| `case_id` | TEXT | FOREIGN KEY, UNIQUE | No | References `cases.case_id`. | Foreign Key |
| `rule_id` | TEXT | NOT NULL | No | Deterministic Rule ID applied: `R1`, `R2`, `R3`, `R4`, `R5`, `R6`, `R7`, `R8`. | Algorithmic Audit Code |
| `intervention_type`| TEXT | NOT NULL | No | Proportionate action: `OFFICIAL_KYC_PATHWAY`, `VERIFIED_BC_ASSIST`, `GRIEVANCE_ESCALATION`, `NEUTRAL_INFO_NO_ACTION`, `HUMAN_REVIEW_HOLD`, `SUPPRESS_OUTREACH`. | Routing Taxonomy |
| `service_id` | TEXT | FOREIGN KEY, NULLABLE | Yes | References `service_directory.service_id` if routing to physical point. | Touchpoint Linkage |
| `destination_verified`| BOOLEAN | NOT NULL | No | Verified active touchpoint status: `1` (Verified), `0` (Stale/Unverified). | Quality Gate Flag |
| `assigned_channel`| TEXT | NOT NULL | No | Execution channel: `BANK_BRANCH`, `AUTHORISED_BC`, `CUSTOMER_SELF_SERVICE`, `INTERNAL_REVIEW`. | Routing Channel |
| `customer_decision`| TEXT | NOT NULL | No | Customer agency response: `ACCEPTED`, `DECLINED`, `REQUESTED_NO_ACTION`, `PENDING_DECISION`, `OPTED_OUT`. | Free Agency Decision |
| `completion_status`| TEXT | NOT NULL | No | Status: `NOT_OFFERED`, `OFFERED`, `IN_PROGRESS`, `COMPLETED`, `BLOCKED_UNVERIFIED`, `DECLINED`. | Workflow State |
| `offered_at` | TEXT (ISO 8601)| NOT NULL | No | Timestamp routing was presented. | Audit Timestamp |
| `completed_at` | TEXT (ISO 8601)| NULLABLE | Yes | Timestamp routing completed. `NULL` if ongoing/declined. | Audit Timestamp |

---

### 3.4 Entity: `outcomes`
Measures three distinct dimensions of resolution at follow-up (30–90 days). Enforces absolute separation between operational reactivation and meaningful usage.

| Column Name | Data Type | Constraints | Nullable? | Description & Allowed Domain | DPDP Sensitivity |
|---|---|---|---|---|---|
| `outcome_id` | TEXT | PRIMARY KEY | No | Outcome identifier: `OUT-0001` to `OUT-9999`. | Internal Synthetic Token |
| `case_id` | TEXT | FOREIGN KEY, UNIQUE | No | References `cases.case_id`. | Foreign Key |
| `barrier_resolved_self_reported`| BOOLEAN | NOT NULL | No | Customer confirms friction removed: `1` (True), `0` (False). | Citizen Agency Report |
| `barrier_resolved_verified`| BOOLEAN | NOT NULL | No | Institutional record confirms fix: `1` (True), `0` (False). | Institutional Verification |
| `account_status_after`| TEXT | NOT NULL | No | Core Banking ledger status: `INOPERATIVE_UNCHANGED`, `ACTIVATION_REQUESTED`, `REACTIVATED_OPERATIONAL`, `CLOSED_BY_REQUEST`. | Bank Ledger State |
| `meaningful_use_status`| TEXT | NOT NULL | No | Voluntary usage outcome: `VERIFIED_VOLUNTARY_USE`, `SELF_REPORTED_USE`, `NO_FURTHER_USE_WANTED`, `NO_USE_DETECTED`, `NOT_MEASURED_YET`. | Longitudinal Outcome |
| `outcome_source` | TEXT | NOT NULL | No | Audit origin: `CONSENTED_FOLLOW_UP`, `BRANCH_RECORD`, `BC_TRANSACTION_LOG`, `UNVERIFIED`. | Provenance Audit |
| `follow_up_date` | TEXT (ISO 8601)| NULLABLE | Yes | Date follow-up was recorded: `YYYY-MM-DD`. | Follow-up Timestamp |
| `opt_out` | BOOLEAN | NOT NULL, DEFAULT 0 | No | Customer exercised right to opt-out at follow-up: `1` (True), `0` (False). | Privacy State |

---

### 3.5 Entity: `service_directory`
Maintains verified physical and digital touchpoints, enforcing a strict 90-day verification expiry rule.

| Column Name | Data Type | Constraints | Nullable? | Description & Allowed Domain | DPDP Sensitivity |
|---|---|---|---|---|---|
| `service_id` | TEXT | PRIMARY KEY | No | Touchpoint identifier: `SRV-001` to `SRV-999`. | Facility Registry ID |
| `institution` | TEXT | NOT NULL | No | Authorised financial institution name (synthetic). | Institutional Brand |
| `service_type` | TEXT | NOT NULL | No | Facility category: `NON_HOME_BRANCH`, `AUTHORISED_BC_KIOSK`, `OFFICIAL_VCIP_PORTAL`, `INTERNAL_OMBUDSMAN_DESK`. | Channel Taxonomy |
| `location_label` | TEXT | NOT NULL | No | Physical/administrative location (synthetic). | Geographic Reference |
| `authorised_status`| BOOLEAN | NOT NULL | No | Whether touchpoint has statutory accreditation: `1` (Active), `0` (Revoked). | Regulatory Credential |
| `verification_source`| TEXT | NOT NULL | No | Auditing authority: `LEAD_BANK_OFFICER`, `CORPORATE_BC_AUDIT`, `UNVERIFIED_STALE`. | Audit Origin |
| `last_verified_at`| TEXT (ISO 8601)| NOT NULL | No | Date of last field verification: `YYYY-MM-DD`. Stale if $>90$ days elapsed. | Freshness Cutoff |
| `contact_route` | TEXT | NOT NULL | No | Official contact number/desk (synthetic). | Public Access Desk |

---

### 3.6 Entity: `audit_events`
Immutable, append-only log capturing every system evaluation, routing decision, operator update, and consent withdrawal.

| Column Name | Data Type | Constraints | Nullable? | Description & Allowed Domain | DPDP Sensitivity |
|---|---|---|---|---|---|
| `event_id` | TEXT | PRIMARY KEY | No | Event identifier: `EVT-0001` to `EVT-9999`. | Audit Unique ID |
| `case_id` | TEXT | NOT NULL | No | Linked case identifier. | Foreign Key Reference |
| `actor_role` | TEXT | NOT NULL | No | User role initiating action: `SYSTEM_ENGINE`, `BANK_OFFICER`, `AUTHORISED_BC`, `AUDITOR`. | RBAC Role Identifier |
| `action` | TEXT | NOT NULL | No | Action type: `RULE_EVALUATED`, `INTERVENTION_OFFERED`, `DECISION_RECORDED`, `OUTCOME_UPDATED`, `OPT_OUT_ENFORCED`. | Statutory Event Type |
| `timestamp` | TEXT (ISO 8601)| NOT NULL | No | UTC timestamp of event execution. | Non-repudiation Stamp |
| `details` | TEXT | NOT NULL | No | Structured JSON or text delta describing the decision. | Decision Transparency |
| `purpose_code` | TEXT | NOT NULL | No | Statutory legal purpose code: `RBI_CIRCULAR_FACILITATION`, `CONSENTED_DISCOVERY`, `STATUTORY_COMPLIANCE_AUDIT`. | DPDP Purpose Limitation |

---

## 4. Nullability & Missing Data Handling Rules

1. **No Silent Zeroes:** An unrecorded or missing metric must NEVER default to `0`. If a bank has not reported inoperative counts, the value is stored as `NULL` and flagged in UI/API responses as `"data_available": false`.
2. **Missing Input Penalties:** In composite geographic scoring, if a district has missing NCFE or AePS data, the calculation engine does not impute an arbitrary score; it assigns a `confidence_penalty` discount and flags the score with an asterisk (`* Missing Indicators`).
3. **Foreign Key Integrity:** A case cannot exist in `barrier_assessments`, `interventions`, or `outcomes` without a matching record in `cases`.
4. **Synthetic Data Watermark:** The `is_synthetic` column is hardcoded to `1` across all demo tables and cannot be set to `0` via prototype APIs.
