# Financial Inclusion Governance Engine (FIGE): Project Charter

**Project Title:** Financial Inclusion Governance Engine (FIGE) / BankMitra  
**Initiative:** IIT Bombay Techfest — The India @ 71/100 Challenge  
**Theme:** Theme 3: Financial Inclusion & Meaningful Banking Access  
**Document Classification:** Foundational Policy & System Charter  
**Version:** 1.0.0 (Phase 1 Baseline)  
**Date:** 23 October 2026  

---

## 1. Executive Summary & Policy Context

Over the past decade, India has engineered one of the most remarkable financial inclusion expansions in global history. Through the *Pradhan Mantri Jan Dhan Yojana* (PMJDY) framework, the Aadhaar identity architecture, and the proliferation of digital payment rails (UPI, AePS), formal account ownership surged from **35% of adults in 2011 to 78% in 2021 (Global Findex)**, and approached **89–90% in 2024–2025** across official scheme records and survey summaries. As of 28 February 2025, PMJDY alone covers **54.97 crore accounts** with deposits exceeding **₹2,52,750 crore**, with women comprising 55.7% (30.60 crore) and rural/semi-urban branches hosting 66.6% (36.59 crore).

However, universal account *ownership* does not equate to active, confident, or meaningful *usage*. The World Bank Global Findex 2021 database revealed that **approximately 35% of Indian account holders had inactive accounts** (defined as no deposit, withdrawal, or digital payment in the prior 12 months) — roughly **seven times the developing economy average (excluding India) of 5%**. Crucially, this inactivity exhibits a persistent gender gap: **42% of female account owners experienced inactivity compared to 30% of male owners** (a 12-percentage-point divide). While Global Findex 2025 secondary summaries suggest overall survey inactivity dropped to approximately 16% in 2024, administrative inoperative accounts (defined under Reserve Bank of India instructions as savings/current accounts without customer-induced transactions for over two years) remain substantial across commercial banks and Regional Rural Banks (RRBs).

Historically, financial institutions have treated account inactivity through one of two suboptimal extremes:
1. **Administrative Neglect:** Allowing balances to stagnate until they meet the 10-year threshold and transfer to the RBI Depositor Education and Awareness (DEA) Fund.
2. **Coercive, Blanket Reactivation Nudges:** Sending generic SMS blasts urging customers to "visit your home branch to avoid freezing," ignoring structural impediments such as transport distance, lost trust following unresolved transaction grievances, KYC documentation spelling mismatches, or voluntary life-stage changes.

The **Financial Inclusion Governance Engine (FIGE)** is a serious public-policy technology platform engineered to bridge this governance divide. **FIGE is a decision-support, targeting, and institutional accountability engine — not a new financial product, speculative crypto rail, or aggressive marketing tool.**

---

## 2. Core Problem Statement

India's financial inclusion challenge has evolved from an **access problem** (opening accounts) into a **governance and usability problem** (sustaining voluntary, confident, and friction-free banking engagement).

```
   Universal Account Opening (~90%)
                 │
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│ The Usage Chasm: Survey Inactivity (~16–35%) & Bank Inoperancy (~21%)  │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
[Structural Friction & Barriers]                [Governance Failure]
• Physical Distance to Touchpoint (>15km)       • Blanket SMS Nudging
• KYC Mismatches (Aadhaar / Name Spelling)      • Opaque Cause Attribution
• Grievance Friction (Failed Debits / Fear)     • Missing Institutional Feedback
• Gender Gaps in Capability & Digital Access    • Conflating Re-activation with
• Natural Scheme Utility Expiry (Scholarship)     Meaningful Sustained Access
```

Public survey evidence (Global Findex 2021) demonstrates that inactive account holders face distinct, overlapping barriers:
- **Physical Distance:** Cited by ~50% of inactive account owners.
- **Lack of Institutional Trust:** Cited by ~50%.
- **No Perceived Need / Alternative Support:** Cited by ~50%.
- **Insufficient Funds to Transact:** Cited by ~40%.
- **Discomfort Operating Accounts Independently:** Cited by ~30% (34% among men, 26% among women).

These barriers cannot be solved by generic financial literacy lectures or automated transaction triggers. They require an institutional accountability system that accurately diagnoses root barriers, routes citizens only through verified and lawful existing touchpoints, and respects citizen autonomy.

---

## 3. Project Objectives & Scope

### 3.1 Primary Objectives
1. **Data-Driven Geographical & Demographic Targeting:**
   Synthesize disparate, verified public macro-indicators (PMJDY dashboards, Global Findex microdata, RBI Financial Inclusion Index, NCFE NFLIS 2019, NPCI digital payment statistics, and DBT Bharat figures) to construct an explainable, composite **Financial Inclusion Prioritisation Index (FIPI)** at state and district levels without fabricating individual records.
2. **Proportionate, Verified Institutional Routing:**
   Map identified friction barriers to authorised, existing institutional redressal mechanisms mandated by RBI circulars (including non-home branch KYC, authorised Business Correspondent e-KYC under RBI Circular Index 12864, and Banking Ombudsman / Internal Grievance desks).
3. **Triangulated Outcome Governance:**
   Decouple operational account reactivation (a bank-ledger status change) from verified barrier resolution (customer-confirmed removal of friction) and sustained meaningful usage (voluntary transactions over a 30–90 day observation window).
4. **Institutional Accountability & Policy Feedback:**
   Provide state-level banking committees (SLBCs), Lead District Managers (LDMs), and bank compliance teams with auditable metrics on service touchpoint health, referral fidelity, and drop-off causes.

### 3.2 In-Scope vs. Out-of-Scope

| Functional Area | In-Scope (FIGE Governance Platform) | Out-of-Scope (Prohibited / Non-Goal) |
|---|---|---|
| **Core Function** | Decision support, geographic prioritization, compliance verification, and routing rules. | Building a neo-bank, payment gateway, mobile wallet, or consumer credit product. |
| **Data Ingestion** | Verified public datasets, survey microdata with weights, bank-level aggregates, and synthetic demo cases. | Intercepting live Core Banking Systems (CBS) without regulatory sandbox approval. |
| **Identity & Privacy** | Pseudonymous tokens, k-anonymity for public aggregates, zero credential handling (no Aadhaar, PAN, OTP, PIN). | Centralized national registry of citizen bank balances or live Aadhaar biometric joins. |
| **Decision Logic** | Deterministic, inspectable, rule-based routing with explicit rule IDs (R1–R8) and mathematical scoring formulas. | Black-box deep learning, generative LLMs making automated credit or welfare decisions, or blockchain smart contracts. |
| **Customer Choice** | Explicit opt-out rights, right to non-use, suppression of outreach upon request. | Aggressive reactivation nudges, penalizing dormant accounts, or automated account closings. |

---

## 4. The 10 Core Design Principles

Every architectural artifact, code line, and empirical calculation in FIGE conforms to ten non-negotiable principles:

1. **Strict Public vs. Operational Separation:** Public aggregate statistics (PMJDY, Findex, NCFE) must remain strictly segregated from restricted operational or synthetic case records.
2. **Zero Fabrication of Person-Level Data:** Individual account-level records must never be fabricated and presented as real empirical findings.
3. **Uncompromising Synthetic Labelling:** Every demonstration record, synthetic API payload, and mock dashboard view must display explicit, visual "SYNTHETIC DEMO" watermarks and schema flags (`is_synthetic: true`).
4. **Prohibition of Literacy Inference:** The system must never infer an individual's financial literacy, capability, or cognitive intent from demographic attributes (gender, age, caste, income) or account inactivity.
5. **Full Explainability & Formula Transparency:** Every composite score, ranking, or recommendation must expose its mathematical formula, raw inputs, data sources, reporting dates, and known caveats.
6. **No Silent Zeroes:** Missing or uncollected data points must never silently default to zero. They must be explicitly flagged as `MISSING`, `UNRECORDED`, or penalized via confidence discounts.
7. **Role-Based Access Control (RBAC) & Immutable Auditing:** Complete segregation of duties across Regulators, Bank Officers, Business Correspondents, and Auditors, backed by immutable audit event trails.
8. **Statutory Alignment as Constraints, Not Claims:** Applicable RBI circulars, DPDP Act 2023 mandates, and NPCI guidelines are treated as operational constraints to rigorously test against, not marketing claims of automatic compliance.
9. **Triangulated Outcome Separation:** Operational reactivation, customer barrier resolution, and meaningful ongoing use must be measured and reported as three separate dimensions.
10. **Aggregate Governance vs. Person-Level Targeting:** Macro prioritisation scores indicate where institutional resources (CFLs, BC kiosks, camp drives) are needed, and must never be weaponized for person-level surveillance or commercial targeting.

---

## 5. Stakeholder Matrix & Institutional Ecosystem

FIGE is designed to integrate into India's existing financial architecture rather than reinventing institutional wheels:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        REGULATORY SUPERVISION                          │
│               Reserve Bank of India (FIDD, DEA Fund)                   │
│               Department of Financial Services (DFS, MoF)              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
      ┌────────────────────────────┴────────────────────────────┐
      ▼                                                         ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│     MACRO POLICY LEVEL       │              │    OPERATIONAL BANK LEVEL    │
│  State Level Bankers'        │              │  Scheduled Commercial Banks, │
│  Committees (SLBCs) &        │              │  RRBs, Small Finance Banks   │
│  Lead District Managers (LDM)│              │  (Lead Compliance & Ops)     │
└──────────────┬───────────────┘              └──────────────┬───────────────┘
               │                                             │
               ▼                                             ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  AWARENESS & INFRASTRUCTURE  │              │     LAST-MILE FULFILLMENT    │
│  Centres for Financial       │              │  Authorised Business         │
│  Literacy (CFLs / NCFE)      │              │  Correspondents (BCs) &      │
│  (2,421 operational centres) │              │  Non-Home Branch Desks       │
└──────────────────────────────┘              └──────────────┬───────────────┘
                                                             │
                                                             ▼
                                              ┌──────────────────────────────┐
                                              │      CITIZEN / CUSTOMER      │
                                              │  Informed Consent, Agency,   │
                                              │  Right to Decline / Non-Use  │
                                              └──────────────────────────────┘
```

---

## 6. Project Phasing & Milestone Boundaries

The FIGE platform is developed across four phased deliverables:

- **Phase 1: Project Foundation & Architecture (Current Phase)**
  Inspection of workspace assets; formalization of Project Charter, Data Source Register, Data Dictionary, Metric Definitions, Data Gaps & Assumptions, Technical Architecture, Implementation Roadmap, Privacy & Governance Plan, and Test Strategy.
- **Phase 2: Ingestion Pipeline & Macro Prioritisation Engine**
  Implementation of validated CSV/JSON data ingestion pipelines for Findex 2021/2025, NCFE 2019, PMJDY, and NPCI; execution of state/district Financial Inclusion Prioritisation Index (FIPI) with explainable weighting and missing-data penalties.
- **Phase 3: Operational Decision Engine & Service Directory Governance**
  Refinement of deterministic rules engine (R1–R8); touchpoint freshness verification (90-day staleness lockouts); role-based case workflow; and integration of synthetic edge-case generator (200 diverse cases).
- **Phase 4: Triangulated Outcomes, Policy Feedback & Validation**
  Interactive React + TypeScript dashboard with aggregate macro views, operational case management, immutable audit log explorer, and automated end-to-end test suite execution.

---

## 7. Approval & Evidence Commitment

This charter establishes the baseline standard of intellectual integrity. No data point shall be claimed as verified without explicit primary provenance, no person-level data shall be fabricated as real, and no algorithm shall obscure institutional accountability.
