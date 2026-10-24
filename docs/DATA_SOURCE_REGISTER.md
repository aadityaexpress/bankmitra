# Financial Inclusion Governance Engine (FIGE): Data Source Register

**Document Classification:** Master Source Registry & Provenance Audit  
**Version:** 1.0.0 (Phase 1 Baseline)  
**Date of Audit:** 23 October 2026  
**Auditor Rule:** Every source must document its legal owner, primary URL, reporting period, unit of analysis, statutory definitions, segmentation variables, access tier, extraction status, and structural limitations. No source may be claimed as extracted or validated unless actually performed in the codebase.

---

## 1. Evidence Classification Hierarchy

All data inputs within the FIGE platform are rigorously classified into five mutually exclusive tiers:

| Tier | Tier Label | Legal / Epistemological Definition | Usage Boundary in FIGE Platform |
|---|---|---|---|
| **Tier A** | **Verified Public Data** | Publicly accessible, officially released open data from sovereign or multilateral bodies with verifiable methodologies. | Permitted for macro benchmarking, geographic prioritization, and baseline indicators. |
| **Tier B** | **Published Findings (Not Independently Reproduced)** | Peer-reviewed or pre-print academic research and secondary report summaries whose underlying micro-computations have not been independently reproduced from raw datasets. | Permitted as analytical context and comparative benchmarks; must be explicitly flagged with caveat warnings. |
| **Tier C** | **Research Hypotheses** | Plausible causal relationships, process failure assumptions, and behavioral propositions requiring field validation. | Permitted only to define rule evaluation pathways and intervention routing criteria; never cited as empirical facts. |
| **Tier D** | **Synthetic Demonstration Records** | Deterministically generated fictional records engineered to test system edge cases, stress-test rules, and demonstrate user interfaces. | Must be watermarked, flagged with `is_synthetic: true`, and isolated from public macro-aggregates. Zero real PII. |
| **Tier E** | **Restricted Institutional Access Data** | Sensitive regulatory or bank-internal records (CBS ledgers, customer transaction histories, Aadhaar linkage tables) requiring lawful statutory authority. | Documented as technical deployment prerequisites; **NEVER** fabricated, joined, or scraped in hackathon prototypes. |

---

## 2. Master Data Source Inventory

### 2.1 Source DSR-01: World Bank Global Findex Database (2021)
- **Source Identifier:** `DSR-01-WB-FINDEX-2021`
- **Source Owner / Authority:** World Bank Group (Development Research Group)
- **Primary URLs:**
  - Full Report (Chapter on Usage): [World Bank Publications (Doc 9781464818974)](https://embed-rech-01.dialog.cm/world.bank.publications/docs/9781464818974/154?e=154&o=1)
  - India Country Brief: [World Bank Country Brief PDF (2023 Draft)](https://thedocs.worldbank.org/en/doc/0e271c416d4afa3237cf3a6226884d3b-0430062023/original/Findex2021-IndiaCountryBrief-DRAFT-2-03-23.pdf)
  - Microdata Portal: [World Bank Microdata Catalog](https://microdata.worldbank.org/index.php/catalog/global-findex)
- **Reporting Period:** Survey fielded during calendar year 2021 (published mid-2022).
- **Unit of Analysis:** Individual adult respondent (nationally representative sample aged 15+).
- **Key Definitions:**
  - *Account Ownership:* Possession of an account at a formal financial institution or mobile money provider (`account == 1`).
  - *Survey Inactive Account:* Account owner who reported zero customer-induced transactions (deposits, withdrawals, or incoming/outgoing digital payments) in the preceding 12 months.
- **Reported Benchmark Statistics:**
  - National Account Ownership: 78% of adults.
  - Survey Inactivity Rate among Account Owners: ~35% (vs. ~5% developing economies excluding India).
  - Female Inactivity Rate: 42%; Male Inactivity Rate: 30% (12 pp gender gap).
  - Stated Barriers among Inactive Owners: Distance (~50%), Lack of Trust (~50%), No Perceived Need (~50%), Insufficient Funds (~40%), Uncomfortable Using Independently (~30%: 34% men, 26% women).
- **Segmentation Variables:** Gender, Age, Education level, Household income quintile, Rural/Urban residence, Workforce status.
- **Evidence Tier:** **Tier A (Verified Public Data)**
- **Access Requirements:** Open public access via World Bank Open Data license.
- **Extraction Status in Project:** **Documented and Registered for Phase 2 Pipeline Ingestion.** Microdata dictionary verified; raw microdata CSV pending local download in Phase 2.
- **Limitations & Caveats:** Survey was conducted during the COVID-19 pandemic (2021); self-reported recall bias; individual respondents could select multiple inactivity reasons, so reason percentages cannot be summed.

---

### 2.2 Source DSR-02: World Bank Global Findex Database (2025)
- **Source Identifier:** `DSR-02-WB-FINDEX-2025`
- **Source Owner / Authority:** World Bank Group
- **Primary URLs:**
  - Report Overview: [World Bank Global Findex 2025 Report Portal](https://www.worldbank.org/en/publication/globalfindex/report)
  - India Microdata Catalogue: [World Bank Microdata Catalog #7916](https://microdata.worldbank.org/catalog/7916)
  - Microdata Variable `fin11b` (Expensive Fees): [Variable V42](https://microdata.worldbank.org/catalog/7916/variable/V42)
  - Microdata Variable `fin11d` (Insufficient Money): [Variable V44](https://microdata.worldbank.org/catalog/7916/variable/F1/V44?name=fin11d)
- **Reporting Period:** Survey fielded across 141 economies in calendar year 2024 (reported 2025).
- **Unit of Analysis:** Individual adult respondent aged 15+.
- **Key Definitions:**
  - Updated inclusion metrics incorporating mobile phone ownership, internet connectivity, and digital safety/fraud awareness.
  - Inactivity in secondary summaries reported at ~16% of account owners (18% among women).
- **Segmentation Variables:** Gender, age bands, income quintiles, digital device ownership, connectivity status.
- **Evidence Tier:** **Tier A (Verified Public Data) / Tier B (Secondary Summaries until Raw Microdata Replicated)**
- **Access Requirements:** Microdata requires standard World Bank Microdata user registration and terms of use acceptance.
- **Extraction Status in Project:** **Catalog Metadata Inspected; Raw File Registered for Ingestion.** Variables `fin11b` and `fin11d` catalogued.
- **Limitations & Caveats:** Critical distinction: Variables `fin11a`–`fin11d` capture reasons for **not owning an account** (unbanked barriers), NOT reasons why an existing account became inactive. Secondary summary reports must be checked against full codebooks before computing custom cross-tabs.

---

### 2.3 Source DSR-03: NCFE National Financial Literacy and Inclusion Survey (NFLIS-2019) & RBI NSFE 2020–2025
- **Source Identifier:** `DSR-03-NCFE-NFLIS-2019`
- **Source Owner / Authority:** National Centre for Financial Education (NCFE), supported by the Technical Group of the Sub-Committee of FSDC (RBI, SEBI, IRDAI, and PFRDA).
- **Primary URLs:**
  - Official Survey Archive: [NCFE NFLIS Reports Portal](https://ncfe.org.in/nflis/)
  - Sovereign Policy Strategy: [RBI National Strategy for Financial Education (NSFE 2020-25)](https://www.rbi.org.in/Scripts/PublicationReportDetails.aspx?UrlPage=&ID=1156)
- **Reporting Period:** Survey conducted from June 2018 to October 2019 (published March/August 2020).
- **Unit of Analysis:** Adult respondent aged 18–79 years across all Indian states and Union Territories (Sample: 75,000 individuals).
- **Table / Location in Primary Reports:**
  - *Primary Table:* NSFE 2020–2025 Section 1.4 / Table 1.2 (Baseline Survey Metrics).
  - *Supporting Section:* NCFE-FLIS 2019 Report, Chapter on Zonal Financial Literacy Distributions.
- **Key Definitions:**
  - *Financial Literacy Benchmark:* Evaluated on OECD-INFE methodology covering three distinct components: Financial Knowledge (score $\ge 6/8$), Financial Attitude (score $\ge 3/5$), and Financial Behaviour (score $\ge 6/9$). Overall financial literacy defined as achieving the minimum benchmark across all three dimensions simultaneously.
- **Reported Verbatim Benchmark Statistics:**
  - National Adult Financial Literacy Benchmark: **27.18%** (~27% rounded in summary text).
  - Zonal Breakdown (Verbatim from Table 1.2):
    - **East Zone:** $20.0\%$ (Bihar, West Bengal, Odisha, Jharkhand)
    - **Central Zone:** $21.0\%$ (Uttar Pradesh, Madhya Pradesh, Chhattisgarh, Uttarakhand)
    - **South Zone:** $30.0\%$ (Kerala, Tamil Nadu, Karnataka, Andhra Pradesh, Telangana)
    - **North Zone:** $32.0\%$ (Punjab, Haryana, Rajasthan, Himachal Pradesh, Delhi, J&K)
    - **North-East Zone:** $33.0\%$ (Assam, Sikkim, Meghalaya, Tripura, etc.)
    - **West Zone:** $37.0\%$ (Maharashtra, Gujarat, Goa)
- **Phase 5 Evidence Reconciliation Note:**
  - A draft discrepancy in Phase 4 documentation citing an unverified set of figures (East: 23.74%, Central: 24.75%, South: 29.74%, North: 28.09%, North-East: 25.75%, West: 39.97%) was investigated. Those values could not be verified in primary tables and were classified as `UNVERIFIED_DRAFT_DISCREPANCY` and permanently excised. The engine strictly retains the verbatim figures from Table 1.2.
- **Extracted File & Integrity:**
  - Extracted File: `backend/data/extracted/ncfe_flis_2019_zonal_literacy.csv`
  - SHA-256 Checksum: `8c420a479858c7e6d1e2a3f31181824778623eb5c0a72e9c068fd3fe9735ff40`
- **Segmentation Variables:** Statutory Zone, State/UT, Gender, Age, Educational attainment, Occupational status, Rural vs. Urban.
- **Evidence Tier:** **Tier A (Verified Sovereign Survey Benchmark)**
- **Limitations & Caveats:** Data reflects 2018–2019 baseline; does NOT contain Core Banking System (CBS) transaction links or individual inoperancy reason codes. Macro literacy cannot be disaggregated to infer individual account status.

---

### 2.4 Source DSR-04: PMJDY Official Progress Report & DFS Reports
- **Source Identifier:** `DSR-04-DFS-PMJDY-PROGRESS`
- **Source Owner / Authority:** Department of Financial Services (DFS), Ministry of Finance, Government of India.
- **Primary URLs:**
  - Dynamic Progress Dashboard: [PMJDY Official Portal Progress Report](https://pmjdy.gov.in/account)
  - Scheme Overview: [DFS PMJDY Overview](https://www.financialservices.gov.in/pradhan-mantri-jan-dhan-yojana-pmjdy)
- **Reporting Period:** Weekly dynamic reporting; cited figures audited as of 28 February 2025.
- **Unit of Analysis:** Bank-reported aggregate accounts and deposit balances.
- **Key Definitions:**
  - *Total Beneficiary Accounts:* Gross savings bank accounts opened under PMJDY.
  - *Rural/Semi-urban Beneficiaries:* Accounts opened at rural or semi-urban bank branch networks.
  - *RuPay Debit Cards:* Cards issued against opened accounts.
- **Reported Benchmark Statistics (as of 28 Feb 2025):**
  - Total Accounts: 54.97 crore.
  - Total Deposits: ₹2,52,750 crore.
  - Women Beneficiaries: 30.60 crore (55.67%).
  - Rural/Semi-Urban Accounts: 36.59 crore (66.56%).
  - RuPay Cards Issued: 37.60 crore.
- **Segmentation Variables:** Bank category (Public Sector Banks, Regional Rural Banks, Private Sector Banks), Rural/Semi-urban vs. Urban/Metro, Gender.
- **Evidence Tier:** **Tier A (Verified Public Data)**
- **Access Requirements:** Unrestricted public dashboard.
- **Extraction Status in Project:** **Baseline Aggregates Audited and Documented.** Snapshot date stamped.
- **Limitations & Caveats:** Administrative gross counts; does not report active transaction velocity or inoperancy rates on the public portal; RuPay card issuance does not indicate card activation or active point-of-sale usage.

---

### 2.5 Source DSR-05: RBI Instructions on Inoperative Accounts & Amendments
- **Source Identifier:** `DSR-05-RBI-INOPERATIVE-RULES`
- **Source Owner / Authority:** Reserve Bank of India (Department of Regulation / Financial Inclusion & Development Department)
- **Primary URLs:**
  - Circular Id: 12589 (01 Jan 2024): [Revised Instructions on Inoperative Accounts / Unclaimed Deposits](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12589)
  - Circular Id: 12750 (02 Dec 2024): [Customer Facilitation & Review Protocol](https://www.rbi.org.in/Scripts/NotificationUser.aspx/NotificationUser.aspx?Id=12750)
  - Circular Index Id: 12864 (12 Jun 2025): [KYC Updation Facilities & BC Role](https://www.rbi.org.in/Scripts/BS_CircularIndexDisplay.aspx?Id=12864)
- **Reporting Period:** Regulatory circulars issued 2024–2025; legally binding on all commercial and cooperative banks.
- **Unit of Analysis:** Statutory legal mandate / bank regulatory instructions.
- **Key Statutory Definitions & Mandates:**
  - *Inoperative Account:* A savings or current account where there have been no customer-induced transactions for a continuous period of exceeding two years.
  - *Annual Pre-Inoperative Review:* Banks must review accounts with zero customer-induced transactions for over one year and initiate outreach before inoperative classification.
  - *Government Benefit / DBT Account Protection:* Accounts opened for scholarships or Direct Benefit Transfer (DBT/EBT) must be segregated; incoming government credits must NOT be blocked even if an account is categorized as inoperative.
  - *Zero Reactivation Charges:* No fees or penalties may be levied for inoperative status or account reactivation.
  - *Decentralized KYC Updation:* Mandate to allow KYC updates for reactivation at ANY branch (including non-home branches), via Video KYC (V-CIP), and through authorised Business Correspondents (BCs).
  - *Customer Tracing Obligation:* Mandatory proactive tracing of account holders through registered contact points and local branch outreach.
- **Evidence Tier:** **Tier A (Verified Sovereign Policy & Regulatory Baseline)**
- **Access Requirements:** Unrestricted public regulatory publication.
- **Extraction Status in Project:** **Fully Analyzed and Codified into FIGE Deterministic Rules Engine (Rules R1 to R8).**
- **Limitations & Caveats:** Establishes regulatory compliance rules; does NOT publish national bank-by-bank counts or percentage breakdowns of reasons for customer abandonment.

---

### 2.6 Source DSR-06: RBI Annual Report & Financial Inclusion Index (FI-Index)
- **Source Identifier:** `DSR-06-RBI-FI-INDEX`
- **Source Owner / Authority:** Reserve Bank of India
- **Primary URLs:**
  - RBI Annual Report 2024–25: [RBI Publications Portal](https://www.rbi.org.in/scripts/AnnualReportPublications.aspx?Id=1434)
- **Reporting Period:** Annual publication (March 2024 / March 2025 releases).
- **Unit of Analysis:** Composite national index score (0 to 100) and institutional infrastructure aggregates.
- **Key Definitions & Benchmark Figures:**
  - *FI-Index:* Composite index capturing Access (weight 35%), Usage (weight 45%), and Quality (weight 20%). Score stood at **64.2 in March 2024** (up from 60.1 in March 2023).
  - *Centres for Financial Literacy (CFLs):* Operational nationwide network of **2,421 CFLs** as of 31 March 2025, operating under RBI's special inclusion drive.
- **Evidence Tier:** **Tier A (Verified Public Data)**
- **Access Requirements:** Public report.
- **Extraction Status in Project:** **FI-Index Dimensions and CFL Network Parameters Documented.**
- **Limitations & Caveats:** Macro composite index; individual sub-indices are not released at sub-district or granular person-level cross-tabs.

---

### 2.7 Source DSR-07: DBT Bharat Portal Aggregates
- **Source Identifier:** `DSR-07-DBT-BHARAT-AGGREGATES`
- **Source Owner / Authority:** DBT Mission, Cabinet Secretariat, Government of India.
- **Primary URLs:**
  - Official Portal: [DBT Bharat Portal](https://www.dbtbharat.gov.in/)
- **Reporting Period:** Financial Year continuous reporting (FY 2023–24, FY 2024–25).
- **Unit of Analysis:** Scheme-level, ministry-level, and state-level aggregate expenditure and beneficiary transaction counts.
- **Key Definitions:**
  - Total Schemes: 300+ welfare schemes across 50+ ministries.
  - Transfer Volume / Value: Total direct benefit transfers processed via Aadhaar Payment Bridge (APB) and Electronic Clearing System.
- **Evidence Tier:** **Tier A (Verified Public Aggregate Data)**
- **Access Requirements:** Public web reporting; beneficiary lists are restricted under DPDP Act / Aadhaar Act.
- **Extraction Status in Project:** **Macro Scope Audited.** Scheme typology extracted.
- **Limitations & Caveats:** Portal provides aggregate fiscal amounts and transaction volumes. It does NOT identify which welfare beneficiaries possess inoperative accounts, nor does it disclose failed credit return logs to the public.

---

### 2.8 Source DSR-08: NPCI Payment Rails Statistics (UPI, AePS, DigiDhan)
- **Source Identifier:** `DSR-08-NPCI-PAYMENTS`
- **Source Owner / Authority:** National Payments Corporation of India (NPCI) & Ministry of Electronics and Information Technology (MeitY).
- **Primary URLs:**
  - UPI Product Statistics: [NPCI UPI Statistics](https://www.npci.org.in/product/upi/product-statistics)
  - AePS Product Statistics: [NPCI AePS Statistics](https://www.npci.org.in/what-we-do/aeps/product-statistics/2024-25)
  - UPI Ecosystem Metrics: [NPCI UPI Ecosystem](https://www.npci.org.in/what-we-do/upi/upi-ecosystem-statistics)
  - DigiDhan Dashboard: [MeitY DigiPay Portal](https://digipay.gov.in/dashboard/default.aspx)
- **Reporting Period:** Monthly statistics (FY 2024–25 and ongoing).
- **Unit of Analysis:** Aggregate transaction volume (count) and transaction value (₹ crore).
- **Key Definitions:**
  - *AePS Transactions:* Cash withdrawal, balance enquiry, and fund transfer conducted via biometric authentication at Business Correspondent points.
  - *UPI Volumes:* Monthly retail digital transactions processed.
- **Evidence Tier:** **Tier A (Verified Public Data)**
- **Access Requirements:** Public aggregate release.
- **Extraction Status in Project:** **Infrastructure Metrics Documented.**
- **Limitations & Caveats:** High transaction volumes indicate national digital velocity, but do NOT prove that dormant PMJDY accounts are participating. Transaction growth is heavily concentrated in urban merchant commerce.

---

### 2.9 Source DSR-09: MoSPI Comprehensive Annual Modular Survey (CAMS)
- **Source Identifier:** `DSR-09-MOSPI-CAMS`
- **Source Owner / Authority:** Ministry of Statistics and Programme Implementation (MoSPI), National Sample Survey Office (NSSO).
- **Primary URLs:**
  - Official Catalogue: [MoSPI eSankhyiki CAMS Catalog](https://esankhyiki.mospi.gov.in/catalogue-main/catalogue?product=CAMS)
- **Reporting Period:** Survey round 2022–2023 / 2023–2024.
- **Unit of Analysis:** Sample household and individual respondent.
- **Key Definitions:**
  - Socioeconomic, ICT access, mobile telephone ownership, and internet penetration indicators across rural and urban sectors.
- **Evidence Tier:** **Tier A (Verified Public Microdata / Statistical Catalogue)**
- **Access Requirements:** Accessible via MoSPI eSankhyiki portal upon registration.
- **Extraction Status in Project:** **Variable Catalog Inspected; Ingestion Specifications Drafted.**
- **Limitations & Caveats:** Measures digital and socioeconomic context; cannot be used as an administrative record of bank account activity or formal financial literacy.

---

### 2.10 Source DSR-10: Academic Latent Class Analysis on Findex Barriers (2025)
- **Source Identifier:** `DSR-10-MPRA-FINDEX-ANALYSIS`
- **Source Owner / Authority:** Munich Personal RePEc Archive (MPRA Paper No. 129012)
- **Primary URLs:**
  - Pre-print Archive: [MPRA Paper 129012](https://mpra.ub.uni-muenchen.de/129012/)
- **Reporting Period:** Published 2025, analyzing Global Findex 2021 India microdata.
- **Unit of Analysis:** Latent class clustering of survey-reported inactive account holders.
- **Key Findings & Analytical Typology:**
  - Categorizes reported barriers into three latent clusters:
    1. *Structural Barriers:* Remote geography, insufficient income, digital illiteracy.
    2. *Low Perceived Need:* Absence of transaction requirements, reliance on family accounts.
    3. *Institutional Distrust:* Fear of hidden bank charges, dispute resolution failures.
- **Evidence Tier:** **Tier B (Published Findings, Not Independently Reproduced)**
- **Access Requirements:** Open access academic working paper.
- **Extraction Status in Project:** **Conceptual Typology Adopted for Barrier Taxonomy.** Microdata replication planned for Phase 2.
- **Limitations & Caveats:** Econometric analytical model; not an administrative banking classification. Provides conceptual grounding for FIGE barrier mapping, not statutory counts.

---

### 2.11 Source DSR-11: Parliamentary QA Records on Inoperative PMJDY Accounts
- **Source Identifier:** `DSR-11-PARL-QA-PMJDY-INOPERATIVE`
- **Source Owner / Authority:** Ministry of Finance, Government of India (Lok Sabha / Rajya Sabha Questions).
- **Primary Reference:** Unstarred Question / Official Ministry Submission cited in parliamentary reports dated 22 January 2025.
- **Reporting Period:** Snapshot as of January 2025.
- **Unit of Analysis:** Aggregate proportion of PMJDY accounts categorized as inoperative by reporting banks.
- **Reported Benchmark Figure:** Secondary press and search references indicate **21.17% of PMJDY accounts** were inoperative as of 22 January 2025.
- **Evidence Tier:** **Tier B (Published Official Finding Pending Direct Hansard Text Verification)**
- **Access Requirements:** Digital Lok Sabha / Rajya Sabha question archive.
- **Extraction Status in Project:** **Provisional Benchmark Registered.** Direct parliamentary Hansard question PDF must be retrieved and checksummed in Phase 2 before citing as Tier A fact.
- **Limitations & Caveats:** Specifically restricted to PMJDY accounts; does not represent general commercial bank savings accounts; reflects bank self-reporting.

---

## 3. Data Availability Matrix & Gap Summary

| Core Research / Policy Question | Available Verified Public Data (Tier A/B) | Unresolved Empirical Gap (Requires Tier E or Primary Pilot) |
|---|---|---|
| **What is the scale of account inactivity in India?** | Global Findex 2021: 35% survey inactivity. Findex 2025 summaries: 16%. Parliamentary answer: 21.17% inoperative PMJDY accounts. | Real-time, all-bank Core Banking System (CBS) count of inoperative accounts across private, public, and rural banks. |
| **How does inactivity vary by gender?** | Findex 2021: 42% women vs 30% men (12 pp gap). Findex 2025 summaries: 18% women. | Bank-reported administrative inoperative counts disaggregated by gender. |
| **Why do accounts become inactive?** | Findex 2021 self-reported survey barriers (distance, trust, need, money, discomfort). RBI circular observations (KYC pendency, detail mismatch). | National breakdown of CBS administrative reason codes or frozen account logs. |
| **What is the current level of financial literacy?** | NCFE NFLIS-2019: 27.18% national benchmark. RBI NSFE 2020–25 framework. | A post-2020 national financial literacy survey directly linking literacy scores to bank account transaction velocity. |
| **How many welfare/DBT recipients have inoperative accounts?** | DBT Bharat gross volumes; RBI mandate to protect DBT credit routing in inoperative accounts. | Public joined dataset linking DBT beneficiary lists, Aadhaar seeding, and inoperancy status (legally restricted). |
| **Are physical touchpoints available to resolve barriers?** | 2,421 operational RBI CFLs; aggregate PMJDY rural branch counts; NPCI AePS transaction totals. | Granular, real-time operating status, uptime, biometric failure rate, and liquidity of local BC kiosks. |
