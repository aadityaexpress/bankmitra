# BankMitra: Field Validation and Discovery Plan

**Project:** BankMitra: Inactive Account Re-engagement Engine  
**Theme:** Financial Inclusion & Meaningful Banking Access (The India @ 71/100 Challenge)  
**Date of Plan:** 21 October 2026  
**Status:** Prospective Field Protocol (No interviews or partnerships have been fabricated).

---

## 1. Research Objectives & Methodology

The purpose of this field validation protocol is to empirically stress-test BankMitra’s proposed **Barrier Taxonomy** and **Intervention Workflow** in real-world community contexts before any production software deployment.

### Primary Research Inquiries:
1. **Taxonomy Completeness:** Do the five hypothesised barrier categories (KYC/detail mismatch, physical access, unresolved service/trust issues, digital/transaction friction, changed utility) capture the lived reality of account holders, or are there significant omitted categories?
2. **Channel Trust:** Which communication channels (direct SMS, voice IVR, authorized local BC, or branch officer) do customers perceive as authentic versus phishing attempts?
3. **Agency & Refusal:** Why do customers choose not to reactivate an account, and how do they respond to neutral no-action or structured closure options?
4. **BC Operational Feasibility:** What technical, liquidity, or regulatory roadblocks prevent authorized Business Correspondents from facilitating KYC updation or barrier resolution on the ground?

---

## 2. Participant Sampling & Cohort Design

To avoid unrepresentative convenience sampling while operating within ethical boundaries, discovery interviews are structured across three distinct stakeholder groups:

```
┌─────────────────────────────────────────────────────────────┐
│               QUALITATIVE DISCOVERY SAMPLE                  │
├──────────────────────────────┬──────────────────────────────┤
│ Customer Cohort              │ 12–15 Account Holders        │
│ • Direct Benefit Recipients  │ (Semi-urban, rural, peri-    │
│ • Migrant / Transferred      │  urban mix; gender-balanced) │
│ • Students / First-time      │                              │
├──────────────────────────────┼──────────────────────────────┤
│ Field Delivery Cohort        │ 6–8 Active BCs / Bank Mitras │
│ • CSP Kiosk Operators        │ (Varied bank affiliations,   │
│ • Women BC Sakhis            │  operating 1–5+ years)       │
├──────────────────────────────┼──────────────────────────────┤
│ Bank Operations Cohort       │ 3–4 Branch Staff Officers    │
│ • Rural Branch Managers      │ (Public Sector, RRBs, SFBs)  │
│ • Customer Service Officers  │                              │
└──────────────────────────────┴──────────────────────────────┘
```

### Sampling Limitations & Constraints:
- **Non-Representative Scale:** A qualitative sample of 20–25 participants cannot establish statistical causality or national percentage prevalence. Findings must be treated strictly as directional hypothesis-validation.
- **Selection Bias:** Inactive account holders whose registered mobile numbers are deactivated are harder to reach, risking under-representation of migrant and disconnected populations.
- **Power Asymmetry:** Customers interviewing in the presence of bank staff may under-report dissatisfaction or unresolved grievances. All customer interviews must be conducted independently in neutral community settings.

---

## 3. Informed Consent & Privacy Protocol (DPDP Act 2023 Aligned)

Every interview participant must be protected by the following non-negotiable privacy protocol:

1. **Oral & Written Plain-Language Consent:** Consent forms available in local languages (Hindi, Marathi, Bengali, Tamil, etc.) explaining that participation is voluntary, unpaid, and completely independent of their banking relationship or welfare entitlements.
2. **Strict Anonymisation:** No full names, bank account numbers, Aadhaar numbers, PANs, or phone numbers are recorded. Participants are assigned anonymised research tokens (`P-CUST-01`, `P-BC-01`).
3. **Explicit Right to Withdraw:** Participants can stop the interview at any time or decline to answer specific questions without consequence.
4. **Zero Authentication Data Collection:** Researchers must never ask for OTPs, ATM PINs, passbook photocopies, or digital banking passwords.

---

## 4. Non-Leading Qualitative Interview Guides

To prevent observer bias and social desirability bias, questions are formulated as open-ended, non-judgmental prompts.

### Cohort A: Inactive / Intermittent Account Holders

| Question Objective | Non-Leading Prompt | Prohibited Leading / Coercive Question |
|---|---|---|
| **Account Genesis** | "Can you tell me about how and when you first opened this bank account?" | *"Did you open this Jan-Dhan account just to get government subsidies?"* |
| **Usage Cessation** | "Thinking back to when you were actively using the account, what was happening around the time transactions slowed down or stopped?" | *"Did you stop using the account because the bank branch was too far?"* |
| **Documentation & KYC** | "Have you ever had an experience where a transaction or account update could not be completed? What explanation was given?" | *"Did the bank reject you because of an Aadhaar name mismatch?"* |
| **Trust & Charges** | "Have you ever seen an unexpected charge, deduction, or failed transaction on this or any other account? How was that handled?" | *"Did the bank cheat you with unfair SMS charges?"* |
| **Alternative Facilities** | "How do you currently handle payments, cash savings, or receiving money today?" | *"Are you suffering without access to your bank account?"* |
| **Agency & Need** | "Looking ahead, does this specific account serve a purpose you currently need, or would you prefer to leave it as it is, or close it?" | *"Wouldn't you like our team to help you reactivate this account today?"* |

### Cohort B: Business Correspondents (Bank Mitras / CSPs)

| Question Objective | Non-Leading Field Prompt |
|---|---|
| **Customer Walk-ins** | "When a customer comes to your kiosk and their transaction fails due to an inoperative flag or KYC error, what specific message does your terminal show?" |
| **Resolution Authority** | "Under your current bank agreement and software, what steps are you permitted to perform on the spot, and what requires sending the customer to a branch?" |
| **Verification & Rejection** | "What are the most common reasons why an account reactivation or KYC updation submitted through your point gets rejected or delayed?" |
| **Incentives & Burden** | "How does your institution compensate the time spent helping a customer fix an inactive account compared to conducting fresh cash transactions?" |

### Cohort C: Bank Branch Operations Officers

| Question Objective | Non-Leading Inquiry |
|---|---|
| **Review Workflows** | "How does your branch currently execute the annual review and customer-tracing mandates required under RBI’s 2024 circular?" |
| **Verification Bottlenecks**| "When customers visit to reactivate an inoperative account, what are the primary friction points encountered during verification (e.g., signature mismatch, address change, biometric sync)?" |
| **De-duplication & Closure**| "What is the standard procedure when a customer visits wanting to close a redundant inoperative account rather than reactivate it?" |

---

## 5. Protocol for Validating and Refining the Barrier Taxonomy

The 5-barrier taxonomy implemented in BankMitra must be validated using a structured **Taxonomy Fit Matrix**:

```
Taxonomy Fit = (Explicitly Tagged Customer Statements) / (Total Qualitative Critical Incidents)
```

1. **Transcript Coding:** Two independent researchers code anonymised qualitative transcripts into:
   - `KYC_MISMATCH`
   - `PHYSICAL_ACCESS`
   - `TRUST_GRIEVANCE`
   - `DIGITAL_FRICTION`
   - `CHANGED_UTILITY`
   - `UNKNOWN_OR_OTHER`
2. **Inter-Rater Reliability:** Compute Cohen's Kappa ($\kappa$). If $\kappa < 0.75$, category definitions must be disambiguated.
3. **Emergence of New Categories:** If `UNKNOWN_OR_OTHER` accounts for $>15\%$ of coded incidents, an inductive thematic review will determine whether a new top-level barrier category (e.g., `MIGRATION_INTERSTATE`, `ACCOUNT_CONSOLIDATION`) must be formally added to the schema.

---

## 6. Verification and Disclosure Notice

> [!IMPORTANT]
> **Field Validation Disclosure:**  
> As of 21 October 2026, this document represents an institutional research protocol and ethical evaluation plan. In strict adherence to hackathon integrity guidelines, **no fabricated field data, synthetic survey percentages, or fictional bank interviews have been claimed as real empirical evidence**. Execution of this plan is designated as Phase 1 of prospective institutional pilot work.
