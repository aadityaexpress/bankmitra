# Financial Inclusion Governance Engine (FIGE): Data Gaps, Epistemic Boundaries & Assumptions

**Document Classification:** Epistemic Audit, Data Gap Register & Assumptions Log  
**Version:** 1.0.0 (Phase 1 Baseline)  
**Date:** 23 October 2026  
**Auditor Rule:** Intellectual honesty requires documenting what is NOT known or cannot be lawfully linked. Under no circumstances may an agent or researcher invent synthetic joins between administrative welfare registries and private citizen bank accounts.

---

## 1. The "Missing Join" in Public Financial Data

A core vulnerability in many policy proposals is assuming that an integrated, end-to-end database exists connecting a citizen's bank transactions, welfare benefits, financial literacy, and personal motivations. **No such public database exists, and constructing one without statutory authority and explicit consent violates Indian law (Aadhaar Act 2016, DPDP Act 2023).**

```
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│ PUBLIC SCHEME TOTALS   │      │ STATUTORY SURVEYS      │      │ PRIVATE CBS LEDGERS    │
│ PMJDY Progress Reports │      │ Global Findex & NCFE   │      │ Commercial Bank Cores  │
│ (Gross accounts/RuPay) │      │ (Self-reported barriers│      │ (Real transaction logs │
│                        │      │  & literacy scores)    │      │  & inoperancy flags)   │
└───────────┬────────────┘      └───────────┬────────────┘      └───────────┬────────────┘
            │                               │                               │
            ✕ NO LAWFUL PUBLIC JOIN         ✕ NO LAWFUL PUBLIC JOIN         ✕
            └───────────────────────┬───────┴───────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │               THE STRUCTURAL DATA VOID                  │
       │  • Cannot link individual literacy score to inoperancy  │
       │  • Cannot link DBT receipt failure to bank branch type  │
       │  • Cannot verify survey self-reports against bank logs  │
       └─────────────────────────────────────────────────────────┘
```

The table below details these structural gaps and FIGE's governance remedy:

| Structural Gap | What Evaluators Expect | Why It Cannot Be Publicly Known | FIGE Governance Remedy |
|---|---|---|---|
| **The Inactivity–Literacy Join** | "Does low financial literacy directly cause account dormancy?" | NCFE NFLIS-2019 measures literacy; Global Findex measures usage; Core Banking Systems measure inoperancy. They survey completely different people with no shared identifier. | **Prohibition of Inference:** FIGE strictly bans predicting a citizen's literacy from their account inactivity band or demographics. |
| **The DBT–Inoperancy Failure Join** | "How many rural women lost DBT benefits because their account became inoperative?" | DBT Bharat publishes aggregate outlays; banks segregate benefit credits under RBI Dec 2024 circulars, but rejected credit return files are restricted. | **Statutory Safeguard Rule (R5):** Automatic classification of DBT accounts for non-blocking of incoming government credits, regardless of dormancy band. |
| **Administrative Reason Codes in CBS** | "What percentage of accounts are inoperative due to KYC vs. distance?" | Core Banking Systems (Finacle, BaNCS) historically record only a binary active/inoperative flag (`AC_STAT = 'I'`) without systematic customer reason codes. | **Consented Barrier Discovery:** Barriers are documented only through voluntary, customer-confirmed dialogue or verified branch incident tickets. |
| **Longitudinal Behavioral Panel Data** | "Do account holders who attend CFL camps stay active after 12 months?" | Global Findex and NCFE are cross-sectional snapshots of different random samples, not longitudinal tracking panels. | **Triangulated 90-Day Outcome Window:** Operational prototype tracks explicit follow-up states (`VERIFIED_VOLUNTARY_USE` vs `NO_USE_DETECTED`) at 30, 60, and 90 days. |
| **Last-Mile Touchpoint Health & Liquidity** | "Is the local BC kiosk open and stocked with cash today?" | NPCI AePS data publishes national macro volume/values; district-level downtime, biometric failure rates, and cash shortages are not publicly streamable. | **Freshness Cutoff Gate (Rule R3):** Any service directory point unverified within 90 days is marked `STALE` and locked from automated routing. |

---

## 2. Inventory of Research Hypotheses (Tier C)

The following propositions represent plausible design hypotheses derived from behavioral economics and regulatory observations. **They are treated as testable assumptions, NOT established facts:**

1. **Hypothesis H1 (Friction-Specific Outreach):**
   *Proposition:* Routing an inoperative account holder to an intervention specifically tailored to their stated barrier (e.g., non-home branch KYC for a moved worker) yields significantly higher sustained reactivation than generic blanket reactivation reminders.
   *Verification Path:* Requires an institutional A/B pilot with a participating Scheduled Commercial Bank comparing generic SMS with FIGE routing.
2. **Hypothesis H2 (Grievance-First Sequencing):**
   *Proposition:* Pushing account reactivation or financial literacy training on a customer with an unresolved ATM debit grievance increases institutional distrust and causes permanent churn. Resolving the grievance first restores engagement.
   *Verification Path:* Auditing customer decision rates under Rule R4 in pilot field deployments.
3. **Hypothesis H3 (Channel Preference Alignment):**
   *Proposition:* Rural female account holders facing digital discomfort prefer assisted human touchpoints (authorised female Bank Sakhi / BC) over video KYC (V-CIP) or digital self-service.
   *Verification Path:* Field validation surveys aligned with RBI's CFL network.

---

## 3. Inventory of Synthetic Demonstration Assumptions (Tier D)

To demonstrate the full end-to-end functionality of FIGE without risking live citizen data or breaching banking secrecy, the platform incorporates **200 synthetic test profiles (`CASE-0001` to `CASE-0200`)**. These records represent controlled mathematical models with the following explicit assumptions:

| Assumption ID | Parameter / Scenario | Synthetic Model Setting | Rationale & Boundary |
|---|---|---|---|
| **ASM-01** | **Inactivity Duration Distribution** | 40% 2–3 yrs; 30% 3–5 yrs; 20% 5–10 yrs; 10% >10 yrs. | Mirrors the aging profile of dormant accounts observed in RBI supervisory findings. |
| **ASM-02** | **Account Origins** | 50% PMJDY; 20% Scholarship/DBT; 20% General; 10% MGNREGA. | Reflects the high concentration of basic savings bank deposit accounts in inclusion drives. |
| **ASM-03** | **Customer Confirmation Rigour** | 70% customer-confirmed; 20% staff documented; 10% contradictory system signals. | Tests Rule R6, ensuring the engine refuses to make automated diagnoses on ambiguous data. |
| **ASM-04** | **Service Point Verification Staleness** | 20% of service directory touchpoints have `last_verified_at > 90` days. | Rigorously tests Rule R3, verifying that the engine catches stale touchpoints and prevents bad referrals. |
| **ASM-05** | **Customer Opt-Out Rate** | 15% of cases choose to decline contact or state no further use wanted. | Validates Rule R1, proving that the system suppresses outreach and respects citizen agency. |

---

## 4. Ethical & Statutory Safeguards Against Improper Joins

1. **Aadhaar Act 2016 Compliance:** Under Section 29 of the Aadhaar Act, core biometric data and Aadhaar numbers must never be published, displayed, or joined into public databases. FIGE uses randomized, salted pseudonymous customer tokens (`CUST-SYN-XXXX`) that have zero mathematical link to 12-digit Aadhaar numbers or bank account numbers.
2. **DPDP Act 2023 Purpose Limitation:** Operational case data processed for inoperative account facilitation cannot be joined with credit scoring engines, marketing databases, or third-party lead generators.
3. **Prevention of Predatory Reactivation:** Banks are prohibited from using FIGE to coerce account activation merely to prevent DEA Fund transfers or inflate active customer counts for quarterly analyst calls.
