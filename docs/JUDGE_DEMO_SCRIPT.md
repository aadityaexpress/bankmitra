# Judge Demonstration Script & Presentation Guide
## Financial Inclusion Governance Engine (FIGE / BankMitra)
**Competition:** IIT Bombay Techfest — The India @ 71/100 Challenge  
**Theme:** Theme 3: Financial Inclusion  
**Audience:** Technical Judges, Policy Evaluators & Banking Regulators  
**Presentation Time:** 5 to 7 Minutes  
**Live URL:** `http://127.0.0.1:5173/` (Frontend) • `http://127.0.0.1:8001/docs` (Backend API Docs)  

---

## 1. Executive Framing for Judges (1 Minute)

> **"Judges, welcome to BankMitra—the Financial Inclusion Governance Engine.**  
>
> In India today, over **53 crore PMJDY accounts** have achieved near-universal banking access. Yet multilateral data from the World Bank and RBI reveals that **up to 20–35% of formal bank accounts slip into inoperative dormancy**.
>
> Many tech solutions make the fatal error of building a black-box AI targeting tool or a marketing dashboard. **BankMitra takes a fundamentally different public policy stance:**
> 1. **Data Integrity Over Hype:** We distinguish Macro Needs-Screening from operational bank account targeting. Macro financial-literacy deficits tell you where to build physical infrastructure (CFLs and BC networks); they do **not** tell you which citizen has a dormant account.
> 2. **Procedural Governance Over Black Boxes:** Every case is governed by transparent, deterministic rules (Rules R1–R8) and an audited state machine that respects customer agency and statutory privacy (DPDP Act 2023 & RBI Directions 2024).
> 3. **Outcome Accountability:** We do not count an account unfreeze as a success. We track whether that account experiences **sustained voluntary utility over a 90-day post-reactivation window**."

---

## 2. Step-by-Step Live Demonstration Script (5 Minutes)

### Step 1: Verified Macro Evidence & Needs-Screening (Tab: `Macro Evidence & FINSI`)
- **Action:** Click the **Macro Evidence & FINSI** tab in the navigation bar.
- **Narrative to Judges:**
  > *"Notice first that our Macro Evidence dashboard displays **100% verified sovereign and multilateral data**. We draw directly from the World Bank Global Findex API, Department of Financial Services PMJDY reports, RBI FI-Index, and verbatim tables from NCFE NFLIS-2019.
  >
  > Notice the amber badge at the top: **FINSI is explicitly classified as a Needs-Screening Index, NOT an individual dormancy predictor.** We have excised the methodological fallacy of assuming low regional financial literacy predicts individual bank account inoperancy."*

### Step 2: Score Component Inspector (Drill-Down into East Zone)
- **Action:** Scroll to the Zonal Needs-Screening table. Click the **Inspect** button next to **East Zone** (Rank #1).
- **Narrative to Judges:**
  > *"When we click Inspect, the engine opens our Score Component Inspector. The judge can trace every single mathematical operation:
  > - **Raw Literacy Deficit:** $(100 - 20.0\%) = 80.0\%$ deficit from NCFE Table 4.1.
  > - **Min-Max Normalized Score:** $1.0000$ (highest structural need).
  > - **Z-Score Standardization:** $+1.412\sigma$ above national mean.
  > - **Sensitivity Invariance:** Notice that whether you apply Baseline, Literacy-Heavy, Rural-Heavy, or Equal-Weight schemes, the rank order remains invariant ($\rho = 1.0000$).
  > - **Missing Data Check:** Zero missing values ($100\%$ evidence coverage)."*
- **Action:** Close the modal.

### Step 3: Operational Case Management & Explainable Rule Engine (Tab: `Case Management`)
- **Action:** Click the **Case Management** tab.
- **Narrative to Judges:**
  > *"Now let us cross into the operational re-engagement workflow. Notice the persistent amber warning banner: **All operational cases are strictly synthetic demonstration records (`CUST-SYN-*`) running in an isolated sandbox.** We never use real Aadhaar, PAN, or live customer data.
  >
  > Let's select case `CASE-0001` or use the Region filter to select **Central Zone** and workflow stage **ASSESSMENT**."*
- **Action:** Click **Inspect** on an `ASSESSMENT` case.
- **Narrative to Judges:**
  > *"Here is the complete explainable case profile:
  > - **Diagnosed Barrier:** KYC spelling mismatch between Aadhaar and Bank Passbook.
  > - **Evidence Source:** Customer-confirmed during field survey (not an automated telemetry guess).
  > - **Rule Triggered:** Rule R2—recommends an authorized Doorstep BC visit with biometric re-authentication.
  > - **Touchpoint Freshness:** The assigned BC kiosk (`SRV-RAMPUR-BC-01`) was audited within 30 days and has active accreditation."*

### Step 4: State Machine Progression & Procedural Enforcement
- **Action:** In the Case Detail drawer, locate the **Workflow Stage Control & RBAC** panel.
- **Demonstration 1 (Invalid Jump Rejection):**
  - Click `[Test Invalid Jump → 422]`.
  - **Narrative:** *"Notice the engine immediately rejects the transition with HTTP 422: `Invalid transition: cannot jump from ASSESSMENT to SUSTAINED_USAGE`. The system enforces that procedural remediation steps cannot be bypassed."*
- **Demonstration 2 (Sequential Progression):**
  - Click **Dispatch Referral (G1)**. Current stage updates to `REFERRAL`.
  - Click **Customer Confirms Acceptance**. Stage updates to `ACCEPTED_INTERVENTION`.
  - Click **Confirm Intervention Completed (G2)**. Stage updates to `COMPLETED`.
  - Click **Verify Core Banking Status: Reactivated (G3)**. Stage updates to `VERIFIED_REACTIVATION`.
  - Click **Verify 90-Day Sustained Voluntary Use (G4)**. Stage updates to `SUSTAINED_USAGE`.
  - **Narrative:** *"Every transition recorded the actor role (`BRANCH_OFFICER`, `BC_AGENT`, `COMPLIANCE_AUDITOR`) in the immutable audit log below, meeting PMLA Section 12 compliance."*
- **Demonstration 3 (Opt-Out Suppression):**
  - Open another case and click **Customer Opt-Out (Rule R1)**.
  - Attempt to dispatch referral.
  - **Narrative:** *"Rule R1 is absolute. If a customer declines or opts out, the case enters terminal suppression and all automated outreach is immediately blocked."*

### Step 5: Policy Accountability Dashboard (Tab: `Governance & Outcomes`)
- **Action:** Click the **Governance & Outcomes (G1–G5)** tab.
- **Narrative to Judges:**
  > *"Finally, we come to the policy governance heart of BankMitra: the **G1–G5 Accountability Dashboard**.
  >
  > Look at the critical distinction between Indicator G3 and Indicator G4:
  > - **G3 (Verified Reactivation Rate):** $80.99\%$ ($98 / 121$). This measures the administrative status change in the bank's core ledger.
  > - **G4 (Sustained Meaningful Usage Rate):** $42.86\%$ ($42 / 98$). This measures whether the customer conducted $\ge 2$ voluntary non-zero transactions over a 90-day post-reactivation observation window.
  >
  > In other words, over $57\%$ of unfrozen accounts showed zero voluntary post-reactivation usage. A dashboard tracking only reactivation would claim $81\%$ success; BankMitra holds the system accountable to the true financial inclusion rate of $43\%$."*
- **Action:** Scroll to the **Air-Gap Verification Matrix** and **Statutory Retention Controls**.
- **Narrative to Judges:**
  > *"Below, judges can inspect our **Air-Gap Matrix** proving zero PII leakage, and click **Simulate DPDP Statutory Purge** to demonstrate how customer contact identifiers are erased upon conclusion of purpose while preserving the 5-year PMLA cryptographic audit trail."*

---

## 3. Judge Q&A Defense & Anticipated Questions

### Q1: "Why not use Machine Learning to predict which individual accounts are dormant?"
> **Answer:** *"Under the Digital Personal Data Protection (DPDP) Act 2023 (Section 6) and RBI Fair Practices Code, automated profiling of citizens using proxy demographic data for targeted intervention is legally and ethically hazardous. Furthermore, there is **zero lawful statistical join** between public survey data (NCFE/Findex) and private bank ledgers. 
> 
> BankMitra uses machine learning where it belongs—on macro demographic clustering for allocating public resource centres (CFLs)—while using deterministic, explainable rule engines (Rules R1–R8) for customer-facing re-engagement."*

### Q2: "How do you prove the 90-day usage window is actually real?"
> **Answer:** *"In our demonstration database, we audited the actual timestamps of all 200 cases. For accounts in `SUSTAINED_USAGE`, the elapsed time between `completed_at` and `follow_up_date` ranges between **$101$ and $131$ days** (average $113.0$ days), strictly exceeding the 90-day statutory threshold. Accounts in earlier stages have elapsed windows of $\le 41$ days. The window is an empirical property of the data, not a cosmetic label."*

### Q3: "How does BankMitra handle citizen consent and privacy?"
> **Answer:** *"Three layers of protection:
> 1. **Rule R1 Immediate Opt-Out:** Customer refusal halts all automated outreach permanently.
> 2. **Air-Gapped Architecture:** Zero connection between public statistics and operational records.
> 3. **Statutory Retention:** PMLA Section 12 mandates 5-year audit trail retention; DPDP Act Section 8(7) mandates purpose-limitation erasure once re-engagement succeeds."*

---

## 4. Summary of Verification & Test Suite

| Test Suite | File | Tests Passed | Key Capabilities Verified |
| :--- | :--- | :---: | :--- |
| **API Endpoints** | `test_api.py` | 8 / 8 | Health, metrics, case detail, review queue, directory freshness |
| **Audit & Epistemics** | `test_audit_and_validation.py` | 9 / 9 | Malformed data rejection, zero denominator safety, sensitivity invariance |
| **Data Pipeline** | `test_data_pipeline.py` | 5 / 5 | SHA-256 checksums, Findex timeseries, PMJDY segmentation |
| **Edge Cases** | `test_edge_cases.py` | 4 / 4 | HTTP 404, HTTP 422, grievance escalation, Rule R8 outcome separation |
| **Governance Workflow**| `test_governance_workflow.py` | 8 / 8 | Indicators G1–G5, state transitions, opt-out suppression, air-gap |
| **Synthetic Generator**| `test_import_and_data.py` | 2 / 2 | Deterministic generation, duplicate handling |
| **Policy Rules Engine** | `test_rules.py` | 7 / 7 | Rules R1 through R8 individual evaluation |
| **End-to-End Journey** | `test_e2e_user_journey.py` | 1 / 1 | Full 10-checkpoint user journey validation |
| **Total Automated Tests**| **All 8 Test Suites** | **44 / 44 (100%)** | **Clean execution in 3.97s** |
| **Frontend Production** | `npm run build` | **Clean Build** | **Built in 9.52s; 0 TypeScript errors** |
