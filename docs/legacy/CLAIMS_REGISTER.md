# BankMitra: Claims Register and Evidence Audit

**Project:** BankMitra: Inactive Account Re-engagement Engine  
**Theme:** Financial Inclusion & Meaningful Banking Access (The India @ 71/100 Challenge)  
**Date of Audit:** 21 October 2026  
**Auditor Rule:** If an assertion cannot be defended by an official regulatory citation, an empirical field dataset, or an inspectable code rule, it must be flagged as **UNSAFE** and banned from the submission.

---

## 1. Claims Governance Protocol

This Claims Register acts as the authoritative truth boundary for the hackathon presentation, pitch deck, documentation, and user interface. Every claim is assigned:
- **Evidence Baseline:** Sourced citation or prototype design rationale.
- **Confidence Level:** High (Verified Fact), Medium (Supported Design Hypothesis), or Low (Unsubstantiated / Synthetic Assumption).
- **Safety Verdict:**
  - ✅ **SAFE:** Permitted in submission with verbatim or recommended phrasing.
  - ⚠️ **RESTRICTED:** Permitted only when accompanied by explicit qualifications and limitations.
  - ❌ **UNSAFE (BANNED):** Prohibited from all submission materials, UI text, and evaluator pitches.

---

## 2. Master Claims Register Table

| ID | Claim Category | Candidate Wording | Evidence Baseline | Confidence | Limitations & Caveats | Safety Verdict & Safe Alternative Wording |
|---|---|---|---|---|---|---|
| **C1** | **National Prevalence** | "India has over 10 crore dormant bank accounts holding ₹50,000 crore." | None verified for exact national total across all account categories simultaneously. RBI report cites DEA Fund totals and observations of high inoperative volumes at several banks. | Low | Conflates 10-year unclaimed deposits (DEA Fund) with 2-year inoperative bank accounts; extrapolates partial data to an unsupported national total. | ❌ **UNSAFE**<br><br>✅ **Safe Wording:** "RBI supervisory analysis observed that inoperative accounts and unclaimed deposits remain high at several banks relative to total deposits, driven by long customer inactivity, KYC pendency, and detail mismatches (RBI, 02 Dec 2024)." |
| **C2** | **Causes of Inactivity** | "42% of accounts are inactive due to physical distance, 28% due to KYC failure, and 30% due to loss of trust." | None. Public RBI data does not provide a national percentage breakdown by customer motive. | Low | Invented causal percentages. Synthetic data distributions must not be cited as real-world findings. | ❌ **UNSAFE**<br><br>✅ **Safe Wording:** "Field studies and regulatory observations suggest inactivity stems from diverse barriers including KYC friction, physical distance, digital hurdles, and unresolved complaints; however, reliable national cause-by-cause prevalence data is not publicly available." |
| **C3** | **Machine Learning & AI** | "BankMitra uses advanced AI and machine learning to predict why a customer's account went dormant." | Inaccurate. BankMitra uses a deterministic, rule-based decision engine with explicit rule IDs (R1 to R8). | Low | Calling deterministic `if/else` logic "AI" misleads evaluators and violates research integrity. Transaction data alone cannot predict intent without hallucinations. | ❌ **UNSAFE**<br><br>✅ **Safe Wording:** "BankMitra employs a transparent, deterministic rules engine that maps customer-confirmed barriers and verified evidence sources to approved intervention pathways with complete explainability." |
| **C4** | **Reactivation Efficacy** | "BankMitra reactivates 65% of all dormant accounts it touches." | None. The prototype runs on synthetic test cases (`CASE-0001` to `CASE-0200`). | Low | Any outcome rate reported before a real institutional pilot with a controlled denominator and follow-up window is purely hypothetical. | ❌ **UNSAFE**<br><br>✅ **Safe Wording:** "In our synthetic demonstration dataset of 200 cases, the workflow routes 100% of confirmed barriers to verified official paths, while isolating unverified or stale routes for human review. Real-world efficacy requires an authorised institutional pilot." |
| **C5** | **Ecosystem Novelty** | "BankMitra is India's first and only platform for inoperative account reactivation." | Inaccurate. Banks, Business Correspondents, Core Banking Systems, and RBI's UDGAM portal already operate in this domain. | Low | Disregards existing banking infrastructure, statutory circulars, and commercial bank CRM tools. | ❌ **UNSAFE**<br><br>✅ **Safe Wording:** "While banks already perform inoperative account reviews and UDGAM searches unclaimed deposits, BankMitra proposes an auditable workflow connecting customer-confirmed barrier diagnosis with verified, proportionate intervention routing and separate outcome measurement." |
| **C6** | **Regulatory Alignment** | "Under RBI regulations, accounts with no customer-induced transactions for over two years are classified as inoperative." | RBI Consolidated Circular DBOD.No.Leg.BC. 12589/2024 (01 Jan 2024) and Master Direction. | High | Does not apply to accounts with standing instructions, fixed deposits maturing into savings, or active operations on linked accounts under specific circular exceptions. | ✅ **SAFE**<br><br>Use verbatim with citation of RBI Circular dated 01 January 2024. |
| **C7** | **KYC & BC Guidelines** | "RBI allows banks to enable KYC updation for inoperative account activation at non-home branches and through authorised Business Correspondents." | RBI Circular Index Id: 12864 (12 June 2025). | High | Only applies to *authorised* BCs operating under bank-mandated secure systems and applicable KYC directions. Does not authorise third-party apps. | ✅ **SAFE**<br><br>Always clarify that this applies to bank-authorised personnel and official banking channels. |
| **C8** | **UDGAM Scope** | "UDGAM is a centralised portal launched by RBI to search unclaimed deposits across participating banks." | RBI Press Release (17 Aug 2023) and UDGAM FAQ (04 Mar 2024). | High | UDGAM indexes unclaimed deposits transferred to DEA Fund (10+ years), not 2-year inoperative accounts on active ledgers. | ✅ **SAFE**<br><br>Always specify that UDGAM serves 10-year unclaimed deposits across participating banks (30 banks covering ~90% of DEA Fund value as of March 2024). |
| **C9** | **Scale of Financial Inclusion** | "PMJDY has expanded formal banking to over 54.50 crore account holders with deposits exceeding ₹2.44 lakh crore." | Department of Financial Services (DFS) Annual Report 2024–25 (as of 08 January 2025). | High | Reflects gross accounts opened; does not represent the proportion of accounts currently in active daily use. | ✅ **SAFE**<br><br>Accurately illustrates macro reach while reinforcing the distinction between account opening and ongoing meaningful access. |
| **C10** | **Agency & Customer Choice** | "A customer has the right to decline reactivation or state that an account is no longer needed, and this choice must be respected without penalty or repeated nudging." | Core product philosophy, aligned with DPDP Act 2023 principles and RBI Fair Practices Code. | High | Operationalised in BankMitra via Rule R1 and immediate automated outreach suppression upon opt-out. | ✅ **SAFE**<br><br>Highlight customer agency as a foundational strength of the architecture. |
| **C11** | **Separation of Outcomes** | "Operational account reactivation, customer barrier resolution, and meaningful ongoing use are distinct outcomes that cannot be conflated." | Core architectural model of BankMitra; supported by behavioral economics literature. | High | Demonstrated by separate database schema columns and dashboard KPI cards. | ✅ **SAFE**<br><br>Core differentiator that protects the project from perverse incentives. |
| **C12** | **Verified Routing Guardrail** | "BankMitra never directs a customer to an unverified or stale service point." | Programmed into Rule R3 and service directory schema (`authorised_status == true` and `days_since_verification <= 90`). | High | Strictly enforced in local SQLite database and deterministic rule engine. | ✅ **SAFE**<br><br>Demonstrates consumer protection and operational reliability. |

---

## 3. Side-by-Side Wording Guidelines for Presentation Slides & Write-Ups

To avoid unintentional hyperbole, team members and presentation authors must follow this quick-reference phrasing guide:

| ❌ NEVER SAY IN PITCH / WRITEUP | ✅ ALWAYS SAY INSTEAD |
|---|---|
| "Our revolutionary AI diagnoses why people abandon accounts." | "Our transparent, rule-based decision engine maps customer-confirmed barriers to official resolution paths." |
| "We automatically reactivate dormant accounts." | "We assist authorised institutions in removing customer-facing friction so the bank and customer can complete lawful reactivation." |
| "We will reactivate millions of accounts across rural India." | "In a prospective pilot with an authorised bank partner, we aim to measure whether barrier-matched routing improves voluntary re-engagement over standard blast reminders." |
| "UDGAM tracks all inactive bank accounts." | "UDGAM enables customers to search 10-year unclaimed deposits across participating banks in the DEA Fund." |
| "Customers abandon accounts because they are poor or uneducated." | "Account inactivity is driven by structural and operational frictions—including KYC mismatches, travel costs, unresolved complaints, or life-stage transitions." |
| "A non-responsive customer is a failed lead." | "Customer non-response or voluntary non-use is an autonomous choice that the system logs and respects without further intrusion." |

---

## 4. Verification Checkoff Prior to Demo Submission

- [x] All aggregate metrics displayed in the Operations Dashboard are computed dynamically from synthetic database records (`cases`, `interventions`, `outcomes`).
- [x] Every chart and table in the user interface displays the permanent watermark: **"Synthetic demonstration data"**.
- [x] The rules engine outputs explicit `rule_id`, `triggering_evidence`, `reason`, `required_verification`, and `limitations` for every recommendation.
- [x] No credentials (passwords, PINs, OTPs, Aadhaar, PAN) are requested or stored anywhere in the application.
- [x] Service directory entries older than 90 days or marked unverified are blocked from customer referral.
