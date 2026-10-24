# Financial Inclusion Governance Engine (FIGE): Privacy, Legal Safeguards & Regulatory Governance

**Document Classification:** Statutory Compliance Framework & Privacy Blueprint  
**Version:** 1.0.0 (Phase 1 Baseline)  
**Date:** 23 October 2026  
**Auditor Rule:** Use applicable RBI, NPCI, DBT, and Indian data-protection requirements as constraints to rigorously verify, NOT as unverified marketing claims of automatic compliance. Zero real PII shall ever be ingested or stored.

---

## 1. Statutory Alignment Framework

The FIGE platform is engineered to comply with India's evolving data governance and banking regulatory jurisprudence:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      INDIAN LEGAL & REGULATORY APEX                    │
├──────────────────────────────────┬─────────────────────────────────────┤
│ Digital Personal Data            │ Reserve Bank of India (RBI)         │
│ Protection (DPDP) Act, 2023      │ Banking Regulation Circulars        │
│ • Purpose Limitation (Sec 6)     │ • 01 Jan 2024: Inoperative Review   │
│ • Data Minimisation              │ • 02 Dec 2024: Customer Tracing/DBT │
│ • Free & Informed Consent        │ • 12 Jun 2025: KYC at Non-Home / BC │
│ • Unconditional Right to Opt-Out │ • Master Directions on Know Your    │
│ • Data Fiduciary Obligations     │   Customer (KYC)                    │
└──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 2. DPDP Act 2023 Compliance Constraints

The Digital Personal Data Protection Act, 2023 establishes legally enforceable obligations on Data Fiduciaries (banks) and Data Processors (governance platforms like FIGE). The table below outlines how FIGE operationalizes each statutory constraint:

| DPDP Act Provision | Statutory Mandate | Architectural & Operational Implementation in FIGE |
|---|---|---|
| **Section 5 (Notice)** | Clear, comprehensible notice in plain language (and regional languages) informing the citizen of data processed and purpose. | Operational workflows require bank agents/BCs to provide structured, plain-language notices prior to recording barrier assessments. |
| **Section 6 (Consent & Limitation)** | Personal data may only be processed for specific, lawful purposes to which the citizen gave clear consent. | **Purpose Code Tagging:** Every database mutation records a `purpose_code` (e.g., `RBI_CIRCULAR_FACILITATION`). Processing beyond inoperative account resolution is technically blocked. |
| **Section 6(4) (Withdrawal / Opt-Out)** | The Data Principal has the unconditional right to withdraw consent at any time with comparable ease. | **Deterministic Rule R1:** Immediate suppression of all automated outreach and task dispatch upon recording `consent_status = 'WITHDRAWN'` or `contact_permission = false`. |
| **Data Minimisation** | Only collect data strictly necessary to fulfill the defined statutory purpose. | **Zero Real PII:** No citizen names, 12-digit Aadhaar numbers, PANs, phone numbers, or account balances are stored in FIGE tables. |
| **Section 8 (Data Erasure & Retention)** | Obligation to erase personal data upon purpose fulfillment or consent withdrawal. | Configurable data retention policies with automated archiving of closed review cases after 180 days. |

---

## 3. Reserve Bank of India (RBI) Regulatory Constraints

FIGE treats RBI master directions and circulars as hard programmatic invariants:

### 3.1 Inoperative Account Definition & Review (Circular Id: 12589 & 12750)
- **Two-Year Inactivity Threshold:** The platform respects the regulatory definition that an account transitions to inoperative status only after 24 continuous months without customer-induced transactions. System review alerts trigger at the 12-month mark (annual pre-inoperative review).
- **Prohibition of Inoperative Charges:** RBI strictly prohibits levying penalties or maintenance fees on inoperative accounts. FIGE has zero billing or fee-deduction logic.
- **Active Interest Crediting:** Savings account interest must continue to accrue on inoperative balances. FIGE leaves balance ledgers entirely to Core Banking Systems.

### 3.2 Protection of DBT / Government Scholarship Credits (Circular Id: 12750)
- **Non-Blocking Rule:** Banks are mandated to segregate accounts opened for Direct Benefit Transfer (DBT/EBT) and government scholarships so that incoming welfare credits are NEVER rejected or frozen due to inoperative status.
- **Enforcement in FIGE:** Encoded into **Rule R5**. If `account_origin` is `PMJDY_BENEFIT` or `SCHOLARSHIP_DBT`, the system flags the account as protected, generates neutral educational guidance on Aadhaar seeding portability, and blocks any automated account restriction.

### 3.3 Decentralized KYC Updation (Circular Index Id: 12864)
- **Non-Home Branch & BC Facilities:** Banks must provide KYC updation facilities for inoperative accounts across all branches (not just the home branch), through V-CIP, and via authorised Business Correspondents (BCs).
- **Enforcement in FIGE:** Encoded into **Rule R2**. When a customer confirms a KYC spelling or address mismatch, FIGE routes the case to the nearest verified non-home branch or authorised BC kiosk, eliminating unnecessary travel to remote home branches.

---

## 4. Technical Privacy Safeguards: Zero PII Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   THE AIR-GAPPED PRIVACY PERIMETER                     │
│                                                                        │
│   BANK INTERNAL CBS LEDGER (RESTRICTED)                                │
│   • Real Citizen Name: "Sunita Sharma"                                 │
│   • Real Account Number: "987654321012"                                │
│   • 12-Digit Aadhaar: "XXXX-XXXX-1234"                                 │
│                                                                        │
│                    │                                                   │
│                    ▼ (One-Way Cryptographic HMAC-SHA256 Tokenization)  │
│                                                                        │
│   FIGE GOVERNANCE PLATFORM (ZERO PII BOUNDARY)                         │
│   • Pseudonymous Token: "CUST-SYN-0482"                                │
│   • Account Origin: "PMJDY_BENEFIT"                                    │
│   • Diagnosed Barrier: "KYC_MISMATCH"                                  │
│   • Assigned Intervention: "Rule R2 -> Non-Home Branch Desk"           │
│   • Public Macro Indicator: "State FIPI Score: 0.642"                  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

1. **One-Way Tokenization:** The mapping between real customer account numbers and pseudonymous tokens (`CUST-SYN-XXXX`) resides exclusively inside the bank's internal firewalled CBS perimeter. FIGE receives and stores only the pseudonymous token.
2. **K-Anonymity for Macro Displays:** In public-facing aggregate visualizations, any demographic cell or geographical slice with fewer than 10 respondents ($k < 10$) is automatically suppressed to prevent re-identification.
3. **No Biometric Data:** Under Section 29 of the Aadhaar Act, biometric data is strictly prohibited from collection, storage, or transmission. FIGE contains zero biometric fields or biometric SDKs.

---

## 5. Non-Coercion & Customer Agency Guarantee

FIGE is built on the foundational ethical premise that **account inactivity is not a crime, and banking is a voluntary right, not a forced labor.**

1. **The Right to Non-Use:** A citizen may open an account to receive a one-off government relief transfer or marriage grant. Once that purpose concludes, the citizen has the legitimate right to leave the account dormant without harassment.
2. **Immediate Outreach Suppression (Rule R1):** If a customer indicates during outreach that they do not wish to use the account or do not want further contact, the system:
   - Sets `contact_permission = false`.
   - Sets `customer_decision = 'OPTED_OUT'`.
   - Cancels all pending branch/BC outreach tasks.
   - Logs an audit event with purpose code `OPT_OUT_ENFORCED`.
   - Permanently suppresses the case from future automated review queues.
3. **Prohibition of Predatory Inactivity Nudges:** Automated SMS blasts or threat notifications ("Your account will be frozen unless you transact within 7 days") are strictly banned from FIGE routing templates.

---

## 6. Immutable Audit Trail & Regulatory Governance

To ensure institutional accountability, every administrative or automated action in FIGE generates an immutable audit event in `audit_events`:

- **Audit Record Invariants:** Every record contains `event_id`, `case_id`, `actor_role`, `action`, UTC `timestamp`, `details` (JSON delta), and `purpose_code`.
- **Append-Only Immutability:** The database engine forbids `UPDATE` and `DELETE` operations on the audit log. In PostgreSQL production, this is enforced via database-level triggers.
- **Regulatory Inspection Readiness:** Regulators (RBI/DFS) can query the audit trail to verify whether banks are respecting customer opt-outs, investigating debit grievances before reactivation, and adhering to the 90-day service point freshness rule.
