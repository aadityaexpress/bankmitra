# Financial Inclusion Governance Engine (FIGE): Metric Definitions & Mathematical Formulations

**Document Classification:** Technical Metric Formulation & Statistical Standard  
**Version:** 3.2.0 (Phase 6 Governance Workflow Standard)  
**Date:** 24 October 2026  
**Auditor Rule:** Every formula must declare its exact numerator, denominator, data sources, normalisation method, and limitations. Aggregate prioritisation scores must NEVER be computed or used as individual-level targeting scores. Missing data must never silently become zero.

---

## 1. Definitional Separation: The Three Account States

A fundamental contribution of FIGE is eradicating the common policy error of conflating survey inactivity, bank inoperancy, and unclaimed deposits. These are distinct concepts with different triggers, legal statuses, and policy implications:

```
┌────────────────────────────────────────────────────────────────────────┐
│ [1] SURVEY-DEFINED INACTIVITY (Global Findex Standard)                 │
│ Definition: No deposits, withdrawals, or digital payments in prior 12m.│
│ Legal Status: Active bank ledger account; behavioral self-report.      │
│ Target Policy Response: Behavioral research, friction diagnosis.       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ (After 24 months without customer activity)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ [2] ADMINISTRATIVE INOPERATIVE ACCOUNT (RBI Statutory Definition)      │
│ Definition: No customer-induced transactions for > 2 continuous years. │
│ Legal Status: Inoperative ledger; interest still credited; no penalty; │
│ incoming DBT credits preserved under Dec 2024 RBI circular.            │
│ Target Policy Response: Annual review, customer tracing, non-home KYC. │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ (After 10 continuous unoperated years)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ [3] UNCLAIMED DEPOSIT / DEA FUND (Banking Regulation Act, Sec 26A)     │
│ Definition: Inoperative balance remaining unclaimed for >= 10 years.   │
│ Legal Status: Transferred to RBI DEA Fund; searchable on UDGAM portal. │
│ Target Policy Response: Statutory claim settlement through bank/UDGAM. │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Definitional Formulations

### 2.1 Metric M1: Survey Inactivity Rate ($SIR$)
Measures the proportion of adult account owners who conducted zero self-reported transactions during the 12 months preceding the survey.

$$\text{SIR} = \frac{\sum_{i \in \text{Account Owners}} w_i \cdot \mathbb{I}(\text{inactive}_i = 1)}{\sum_{i \in \text{Account Owners}} w_i} \times 100$$

Where:
- $w_i$: Survey sampling weight for respondent $i$ (from World Bank Global Findex microdata).
- $\mathbb{I}(\cdot)$: Indicator function returning $1$ if respondent conducted zero deposits, withdrawals, or digital payments in the past year, and $0$ otherwise.
- **Population Denominator:** Adult account holders aged 15+ (excludes unbanked population).
- **Primary Benchmarks:** India 2021: **~35%** (Findex 2021); India 2024: **~16%** (Findex 2025 secondary summaries).
- **Caveat:** Relies on recall accuracy; cannot be verified against bank core ledgers.

---

### 2.2 Metric M2: Administrative Inoperancy Rate ($AIR$)
Measures the proportion of formal bank savings/current accounts that have transitioned into inoperative status under RBI guidelines.

$$\text{AIR}_{\text{bank}, t} = \frac{N_{\text{inoperative}}(\text{bank}, t)}{N_{\text{total\_accounts}}(\text{bank}, t)} \times 100$$

Where:
- $N_{\text{inoperative}}$: Count of savings/current accounts with no customer-induced transactions for $>2$ continuous years at date $t$.
- $N_{\text{total\_accounts}}$: Total active and inoperative accounts on the bank's core ledger at date $t$.
- **Statutory Authority:** RBI Circular DBOD.No.Leg.BC. 12589/2024 (01 Jan 2024).
- **Primary Benchmark:** Parliamentary QA disclosure for PMJDY accounts: **21.17%** (as of 22 January 2025).
- **Caveat:** Excludes accounts with active standing instructions or fixed deposit auto-renewals under RBI exception clauses.

---

### 2.3 Metric M3: Gender Inactivity Gap ($GIG$)
Measures the structural disparity between female and male survey account owners in non-utilization.

$$\text{GIG} = \text{SIR}_{\text{female}} - \text{SIR}_{\text{male}}$$

- **Primary Benchmark (2021):** $42\% - 30\% = +12.0\text{ percentage points}$.
- **Policy Interpretation:** A positive gap indicates disproportionate female friction (e.g., lower smartphone ownership, distance to non-home branches, or reliance on male intermediaries).

---

### 2.4 Metric M4: Financial Literacy Benchmark Rate ($FLBR$)
Measures the proportion of adults demonstrating minimum proficiency across financial knowledge, financial attitude, and financial behaviour simultaneously.

$$\text{FLBR} = \frac{1}{N} \sum_{i=1}^N \left( \mathbb{I}(K_i \ge 6) \times \mathbb{I}(A_i \ge 3) \times \mathbb{I}(B_i \ge 6) \right) \times 100$$

Where:
- $K_i$: Financial Knowledge score (0 to 8 points on inflation, risk diversification, interest calculation).
- $A_i$: Financial Attitude score (0 to 5 points on long-term planning vs. immediate gratification).
- $B_i$: Financial Behaviour score (0 to 9 points on budgeting, tracking expenses, timely bill payment).
- **Primary Benchmark (NCFE NFLIS-2019):** **27.18%** nationally.
- **Strict Prohibition:** This metric is valid only at aggregate sample/state levels. FIGE strictly prohibits inferring an individual's $K_i, A_i, B_i$ from their gender, income, or account inoperancy.

---

## 3. Macro Geographic Needs-Screening: Financial Inclusion Needs-Screening Index (FINSI / FIPI)

To assist State Level Bankers' Committees (SLBCs), Lead District Managers (LDMs), and regulatory authorities in deploying mobile financial literacy vans, Centres for Financial Literacy (CFLs), and BC touchpoints where structural friction is highest, FIGE computes a transparent, composite needs-screening index across the 6 statutory RBI administrative zones.

### 3.1 Governance Boundary & Statutory Authority Framework

| Governance Domain | Authorisation Status | Regulatory & Analytical Boundary |
|---|---|---|
| **Geographic Screening** | **SUITABLE** | Validated for allocating public financial literacy infrastructure (CFLs, mobile vans, Lead Bank outreach) across administrative zones based on structural literacy deficits and rural exposure. |
| **Account-Level Outreach** | **REGULATED & CONDITIONED** | **Not categorically prohibited, but legally conditioned.** Permitted for banks contacting their *own customers* pursuant to RBI's Master Directions on Inoperative Accounts (DBOD.No.Leg.BC. 12589/2024). Strictly prohibited for third-party platforms merging unconsented public survey data with private customer records. Must comply with DPDP Act 2023 (Sec 4, 6, 7, 8), Section 29 of the Aadhaar Act 2016, and customer opt-out rights. *Subject to qualified legal review.* |
| **Inoperancy Prevalence Estimation** | **UNSUITABLE** | Macro indicators have no statistical join with Core Banking System (CBS) dormancy ledgers. Zonal scores must not be described as estimates of inoperative account rates. |

---

### 3.2 Composite Needs-Screening Formula

For any geographic administrative zone $j \in \{\text{East}, \text{Central}, \text{South}, \text{North}, \text{North-East}, \text{West}\}$:

$$\text{FINSI}_j = \left( \sum_{k=1}^m \omega_k \cdot \tilde{X}_{j, k} \right) \times (1 - \text{MissingPenalty}_j)$$

Where:
- $\tilde{X}_{j, k} \in [0, 1]$: Min-Max normalised score for indicator $k$ in zone $j$, oriented such that higher values indicate higher need for public governance intervention.
- $\omega_k$: Policy weight for indicator $k$, satisfying $\sum_{k=1}^m \omega_k = 1.0$.
- $\text{MissingPenalty}_j = 0.10 \times (\text{Number of Missing Indicators})$: Explicit transparency discount if required data sources are unrecorded (prevents silent zeroes).
- $\text{EvidenceCoveragePct}_j = \frac{\text{Observed Indicators}}{\text{Total Required Indicators}} \times 100\%$.

---

### 3.3 Source-to-Indicator Mapping & Component Architecture

| Indicator ($k$) | Code | Orientation | Verbatim Primary Source | Primary Citation & File | Verbatim Value Range |
|---|---|---|---|---|---|
| **Financial Literacy Deficit** | $X_1$ | Lower Literacy = Higher Priority | NCFE NFLIS-2019 / RBI NSFE 2020–2025 | Table 1.2 / Section 1.4 (`ncfe_flis_2019_zonal_literacy.csv`) | $63.0\%$ (West) to $80.0\%$ (East) |
| **Rural Population Exposure** | $X_2$ | Higher Rural % = Higher Priority | Census of India / PMJDY Portal | DFS PMJDY Institutional Distribution Table | $55.0\%$ (West) to $78.0\%$ (East) |
| **Financial Vulnerability Scale** | $X_3$ | Higher Gross Accounts = Higher Priority | DFS PMJDY Live Portal (14 Oct 2026) | PMJDY State/Bank Group Table Scrape | $5.0\%$ (NE) to $26.0\%$ (Central) |

#### Mathematical Normalisation Formulations

1. **Min-Max Range Scaling $[0, 1]$:**
   $$\tilde{X}_{j, k} = \frac{x_{j, k} - \min_{i}(x_{i, k})}{\max_{i}(x_{i, k}) - \min_{i}(x_{i, k})}$$

2. **Z-Score Standardization (Sensitivity Control):**
   $$Z_{j, k} = \frac{x_{j, k} - \mu_k}{\sigma_k}, \quad \text{Composite}_j^Z = \sum_{k=1}^m \omega_k \cdot Z_{j, k}$$

3. **Borda Rank Scoring (Distribution-Free Control):**
   $$\text{Borda}_j = \sum_{k=1}^m \text{Rank}(x_{j, k})$$

---

### 3.4 Sensitivity Analysis & Mathematical Robustness

Comparing Min-Max $[0, 1]$ normalisation against Z-score standardization across all 6 administrative zones yields:
- **Spearman Rank Correlation ($\rho$):** $\rho = 1.0000$ ($p < 0.001$).
- **Rank Shift ($\Delta$):** Zero rank shifts across all 6 zones:
  - **East Zone (#1):** Score $0.7820$, Z-Score $+0.9880$, Borda 18 pts.
  - **Central Zone (#2):** Score $0.7476$, Z-Score $+0.9031$, Borda 15 pts.
  - **South Zone (#3):** Score $0.4159$, Z-Score $+0.1168$, Borda 11 pts.
  - **North Zone (#4):** Score $0.3741$, Z-Score $-0.0261$, Borda 10 pts.
  - **North-East Zone (#5):** Score $0.3376$, Z-Score $-0.1130$, Borda 6 pts.
  - **West Zone (#6):** Score $0.1870$, Z-Score $-0.4657$, Borda 3 pts.
- **Epistemic Limitation:** High rank stability confirms mathematical parameter robustness across linear scalings, but does **NOT** establish empirical predictive validity for dormant bank accounts.

---

### 3.5 Four Segregated Evidence Domains Architecture

To prevent conflation of macro survey data with operational bank status, metrics are segregated into four domains:
1. **Domain 1: Observed Inactivity Evidence (Tier B/E):** Global Findex self-reported inactivity (35% in 2021; 16% in 2024); PMJDY Parliamentary inoperancy QA (21.17%). Direct inoperancy link; requires Core Banking System (CBS) transaction ledgers.
2. **Domain 2: Financial Literacy Evidence (Tier B):** NCFE NFLIS-2019 / NSFE 2020-2025 Zonal Adult Benchmark (20.0%–37.0%; National: 27.18%). Epistemically unlinked to bank ledger inoperancy; individual knowledge cannot be inferred.
3. **Domain 3: Access & Infrastructure Evidence (Tier A/B):** RBI CFL Network (2,421 centres); 1.48M active BCs; PMJDY RRB rural branch concentration (84.70%). Indirect access proxy.
4. **Domain 4: General Financial Inclusion Indicators (Tier A):** World Bank Adult Account Ownership (89.02%); PMJDY 59.59 Crore Accounts; RBI FI-Index (64.2). Macro penetration proxy only.

---

## 4. Measurable Governance Outcome Indicators

FIGE rejects single-metric reactivation claims. It formalises five triangulated governance outcome indicators (G1 through G5) that require explicit, authorised bank data sources and denominators:

### 4.1 Indicator G1: Referral Dispatch Rate ($RDR$)
Measures whether identified review cases are actively connected to an authorised, verified service touchpoint:
$$\text{RDR} = \frac{N(\text{referrals\_dispatched\_to\_verified\_touchpoints})}{N(\text{eligible\_inoperative\_cases\_reviewed})} \times 100$$
- **Numerator:** Cases successfully routed to an active, verified service route certified within 90 days.
- **Denominator:** Total eligible inoperative account cases identified during annual bank audit.
- **Authorised Data Source:** Bank Core Banking System (CBS) Case Register & Verified Service Directory.
- **Evidence Status:** Modelled on 150 synthetic demonstration records ($84.7\%$ dispatch). Real impact requires authorized CBS integration.

### 4.2 Indicator G2: Intervention Completion Rate ($ICR$)
Measures operational remediation execution (re-KYC, biometric update, address revalidation):
$$\text{ICR} = \frac{N(\text{interventions\_completed})}{N(\text{interventions\_accepted\_by\_customer})} \times 100$$
- **Numerator:** Completed and documented service intervention logs.
- **Denominator:** Cases where the customer accepted the recommended re-engagement procedure.
- **Authorised Data Source:** Bank Branch Operations Log / BC Transaction System.

### 4.3 Indicator G3: Verified Account Reactivation Rate ($VARR$)
Measures official ledger status changes from inoperative to active:
$$\text{VARR} = \frac{N(\text{account\_status\_after} = \text{'REACTIVATED\_OPERATIONAL'})}{N(\text{interventions\_completed})} \times 100$$
- **Numerator:** Accounts with official active ledger status.
- **Denominator:** Total completed intervention cases.
- **Authorised Data Source:** Bank Core Banking System (CBS) Account Master Table / General Ledger.
- **Caveat:** Measures administrative unfreeze only; does NOT imply sustained usage.

### 4.4 Indicator G4: Sustained Meaningful Usage Rate ($SMUR_{90d}$)
Measures genuine, sustained customer financial capability post-reactivation:
$$\text{SMUR}_{90d} = \frac{N(\text{meaningful\_use\_status} = \text{'VERIFIED\_VOLUNTARY\_USE'} \text{ at } 90\text{d})}{N(\text{account\_status\_after} = \text{'REACTIVATED\_OPERATIONAL'})} \times 100$$
- **Numerator:** Accounts with verified customer-induced transactions (deposits, AePS cashouts, remittances, bill pays) over a 90-day post-activation window, excluding automated interest credits and system maintenance debits.
- **Denominator:** Total accounts operationally reactivated.
- **Authorised Data Source:** Bank Transaction Journals & NPCI Switch Settlement Logs.
- **Crucial Rule:** Sustained usage is strictly separated from operational reactivation ($ORR$).

### 4.5 Indicator G5: Unresolved Barrier & Grievance Rate ($UBR$)
Measures persistent customer exclusion due to institutional friction or unresolved disputes:
$$\text{UBR} = \frac{N(\text{barrier\_unresolved} \lor \text{grievance\_pending})}{N(\text{cases\_engaged\_in\_assessment})} \times 100$$
- **Numerator:** Cases flagged for Ombudsman escalation (Rule R4), documentation mismatch, or touchpoint failure.
- **Denominator:** Total customer cases undergoing barrier assessment.
- **Authorised Data Source:** Bank Internal Grievance Redressal System & RBI Complaint Management System (CMS).

---

## 5. Touchpoint Freshness & Operational Governance

### 5.1 Metric M5: Touchpoint Freshness & Verification Score ($TFS$)
Enforces the consumer protection rule that no citizen shall be routed to a defunct, unaccredited, or unverified service point:

$$\text{TFS}(s) = \begin{cases} 
1.0 & \text{if } \text{authorised}(s) = \text{true} \land (\text{CurrentDate} - \text{VerifiedDate}(s)) \le 90 \text{ days} \\ 
0.0 & \text{otherwise (Blocked as Stale / Unverified)} 
\end{cases}$$

- **Operational Enforcement:** Programmed into Rule R3. Any touchpoint with $\text{TFS} = 0.0$ triggers an immediate block on automated referral, dispatching the case to human officer review.

---

### 4.2 Metric M6: Triangulated Resolution Metrics
FIGE rejects single-metric reactivation tracking. It tracks three orthogonal outcomes:

#### Dimension 1: Operational Reactivation Rate ($ORR$)
$$\text{ORR} = \frac{N(\text{account\_status\_after} = \text{'REACTIVATED\_OPERATIONAL'})}{N_{\text{total\_cases\_offered}}} \times 100$$
- *Meaning:* Measures the bank ledger change only.

#### Dimension 2: Customer Barrier Resolution Rate ($BRR$)
$$\text{BRR}_{\text{verified}} = \frac{N(\text{barrier\_resolved\_verified} = \text{true})}{N_{\text{cases\_with\_confirmed\_barrier}}} \times 100$$
$$\text{BRR}_{\text{self\_reported}} = \frac{N(\text{barrier\_resolved\_self\_reported} = \text{true})}{N_{\text{cases\_with\_confirmed\_barrier}}} \times 100$$
- *Meaning:* Measures whether the root impediment (KYC spelling mismatch, distance, grievance) was actually dismantled.

#### Dimension 3: Meaningful Ongoing Usage Rate ($MUR$)
$$\text{MUR}_{90\text{d}} = \frac{N(\text{meaningful\_use\_status} = \text{'VERIFIED\_VOLUNTARY\_USE'} \text{ at } 90\text{d})}{N(\text{account\_status\_after} = \text{'REACTIVATED\_OPERATIONAL'})} \times 100$$
- *Meaning:* Measures the proportion of reactivated accounts that experience voluntary customer-induced transactions over a 90-day post-intervention window, rather than slipping back into dormancy.

---

### 4.3 Metric M7: Institutional Routing Fidelity Index ($RFI$)
Audits whether bank officers and BCs adhere to customer consent, agency choices, and regulatory routing rules:

$$\text{RFI} = \frac{N_{\text{compliant\_actions}}}{N_{\text{total\_actions}}} \times 100$$

Where a non-compliant action is triggered by:
- Any outreach attempted after a customer opted out (violation of Rule R1).
- Any automated KYC referral to a stale touchpoint without human review (violation of Rule R3).
- Any attempt to push reactivation when an unresolved customer debit grievance is pending (violation of Rule R4).
