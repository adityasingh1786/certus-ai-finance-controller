# 🏛️ Certus — Autonomous 3-Way Reconciliation & Revenue Recovery Controller
## Executive Pitch Deck & Submission Dossier (Track 4: Autonomous Financial Controller)

---

### Slide 1: Title & Team
- **Product**: Certus AI Finance Controller (v2.4)
- **Tagline**: Autonomous 3-Way Reconciliation & Revenue Recovery for Multi-Rail Digital Commerce
- **Track**: Razorpay AI Buildathon 2026 — Track 04 (Autonomous Financial Controller)
- **Author & Team**:
  - **Aditya Singh** — *Lead Architect & Systems Engineer* (Reconciliation Engine, Invariant Rules, Compliance Gates)
  - **Team Certus** — *Frontend UI/UX, Data Visualization & Test Reliability*

---

### Slide 2: The Enterprise Financial Bleed
- **The Problem**: High-growth merchants processing ₹10Cr+ monthly lose **1.5% to 2.5% of net GMV** in post-settlement leakage:
  - **MDR Fee Drift**: Gateways deducting fees exceeding contracted rate cards (e.g. 2.50% charged vs 2.00% agreed).
  - **Bank CMS Truncation**: 16-digit NEFT/RTGS UTR numbers truncated or reformatted in HDFC/ICICI bank statements.
  - **ERP Journal Lag**: Sales invoices sitting in draft status in Tally/SAP without matched ledger credits.
  - **Tax Miscalculation**: Inaccurate 1% Section 194-O TDS or 18% CGST deductions on payment gateway fees.
- **Why Existing Tools Fail**: Traditional reconcilers are passive, batch-mode CSV diff tools that report errors weeks too late without diagnosing *why* they happened or how to recover the funds.

---

### Slide 3: Why Razorpay Dashboard Alone Isn't Enough (Differentiation)
- **The Obvious Question**: *"Doesn't Razorpay already provide settlement reports?"*
- **The Reality**:
  - **Razorpay Dashboard**: Only has visibility into **Rail 1 (Gateway)**. It knows what Razorpay settled.
  - **The Blindspot**: Razorpay cannot see **Rail 2 (The Merchant's HDFC/ICICI CMS Bank Account)** to confirm if the funds actually credited, nor can it see **Rail 3 (The Merchant's Tally/SAP ERP)** to verify if the sales invoice was closed.
  - **Certus is the 3-Way Bridge**: Sits across all three rails simultaneously, ensuring 1 rupee in Razorpay = 1 rupee credited in Bank = 1 rupee cleared in ERP.

---

### Slide 4: 6-Layer Architecture Overview
```text
┌──────────────────────────────────────────────────────────────────────────┐
│                   CERTUS 6-LAYER RUNTIME ARCHITECTURE                    │
└──────────────────────────────────────────────────────────────────────────┘
  Layer 0: 4-Channel Ingest    → Gateway (Razorpay) × Bank CMS × ERP Ledgers
  Layer 1: Deterministic Rules → 55 Invariant Rules on Integer Paisa Math (0 Float Drift)
  Layer 2: RapidFuzz Composite → 50% Amount + 30% Reference (UTR) + 20% Date Proximity
  Double-Lock Gate             → Requires Composite Score ≥ 0.75 AND Invariant Pass
  Layer 3: Quarantine Hub      → Fail-closed isolation with automated root-cause diagnosis
  Layer 4: Revenue Recovery    → 6-Step autonomous dispute, UTR re-fetch, and ERP posting loop
  Layer 5: Sovereign ReAct     → Natural-language financial queries & 14-day cash runway
```

---

### Slide 5: Layer 4 — Autonomous Revenue Recovery Loop
```text
QUARANTINED DISCREPANCY
         ↓
1. DETECTION    → Identifies exact recoverable variance (e.g. ₹217.50 excess MDR)
2. DIAGNOSIS    → RapidFuzz root-cause attribution (MDR Drift / Missing UTR / ERP Lag)
3. STRATEGY     → Action selection: Gateway Dispute / Bank UTR Re-fetch / ERP Posting / Write-off
4. COMPLIANCE   → Checked by 100% Deterministic Python Gate (RBI Fair Practices §6.2)
5. EXECUTION    → Auto-generates Razorpay dispute payload with cryptographic audit key
6. MEMORY       → Recency-weighted learning (N=50, decay=0.95) optimizes future strategy ranking
```

---

### Slide 6: Deterministic Compliance Gate (Zero-LLM Safety)
> **Core Principle**: Regulatory compliance and financial math are NEVER delegated to probabilistic LLMs.

- **Rule 1 (`COMP-01`) Contact Window**: Outbound disputes restricted to **9:00 AM – 6:00 PM IST** (RBI Fair Practices §6.2). Actions after 6 PM are automatically scheduled for next business day.
- **Rule 2 (`COMP-02`) Attempt Caps**: Hard cap of max 3 automated dispute attempts before mandatory human escalation.
- **Rule 3 (`COMP-03`) Idempotency Invariant**: Cryptographic key `{record_id}:{action}:{attempt}` prevents duplicate dispute submissions.
- **Rule 4 (`COMP-06`) Rate Card Verification**: Enforces agreed rate card (UPI 0%, Debit 0.4%/0.9%, Credit 2.0%, NetBanking 1.5%).
- **Rule 5 (`COMP-08`) Section 194-O TDS**: Validates 1% standard TDS deduction (5% if PAN not furnished).
- **Rule 6 (`COMP-07`) CGST 18% on MDR**: Validates exact 18% service tax component with ₹1.00 tolerance.

---

### Slide 7: Empirical Benchmark — Naive Baseline vs Certus AI
> **Dataset**: 1,000 multi-rail records with real-world Indian merchant anomalies (MDR drift, UTR truncation, date lag).

| Metric | 1. Naive Exact-ID Baseline | 2. Certus AI-Enhanced | Honest Engineering Analysis |
| :--- | :---: | :---: | :--- |
| **Gateway Match Rate** | 80.0% (800 / 1,000) | **90.0% (900 / 1,000)** | **`+10.0% Net Accuracy Gain`** via fuzzy UTR & narration extraction |
| **Total 3-Rail Orphan Rows** | 400 unlinked rows *(200 GW + 100 Bank + 100 ERP)* | **100 Attributed Exceptions** | Certus cross-matches 300 orphan rows that exact-ID failed to link |
| **Exception Diagnostics** | 0% (Blind failure flag) | **100% (Root-Cause Attributed)** | Classifies MDR drift vs bank lag vs ERP draft status |
| **False Positive Rate** | High (Uncontrolled exact matches) | **0% (Double-Lock Gate ≥ 0.75)** | High confidence required before ledger auto-clear |
| **Throughput & Latency** | 186,050 ops/s (0.005ms) | **8,345 ops/s (1.37ms/record)** | **Honest Trade-off**: 22x CPU overhead for fuzzy scoring, but easily processes 100k daily txns in 12s |

---

### Slide 8: 3 Hard Engineering Challenges Solved
1. **Integer Paisa Quantization**:
   - *Problem*: In IEEE-754 floating-point math, `0.1 + 0.2 != 0.3`. In accounting, a ₹0.01 discrepancy fails statutory audits.
   - *Solution*: All ledgers, rate calculations, and invariant rules operate on strict integer paise (`int(round(amount * 100))`).
2. **High-Entropy Narration Parsing**:
   - *Problem*: Indian bank statements contain chaotic narration formats (e.g. `CMS/CR/UTR44910283910/RAZORPAYSETTLE/FLIPKART`).
   - *Solution*: 5-regex extraction cascade paired with RapidFuzz token-set scoring.
3. **Multi-Model Consensus with Sub-Second Latency**:
   - *Problem*: Querying 4 LLMs on every discrepancy causes unacceptable 10s+ latency.
   - *Solution*: Early-exit heuristics (if Model 1 confidence $\ge 0.90$, exit immediately) and hard red-flag containment.

---

### Slide 9: Product Maturity & Verification
- **127 / 127 Automated Pytest Tests Passed** (Unit, Invariant, Regulatory, Cybersecurity, Prompt Injection).
- **Full-Stack Application**: 45+ React components with real-time 3D WebGL multi-rail stream visualizer.
- **Production FastAPI Backend**: 7 OpenAPI 3.1 endpoints with interactive Swagger UI (`/docs`).
- **Air-Gapped Local Resilience**: Full SQLite WAL database support for uninterrupted offline operation.

---

### Slide 10: The Ask & Future Roadmap
- **What We Are Asking For**:
  - **Track 4 Buildathon Win & ₹75k/month Internship**: Direct mentorship with the Razorpay Core Banking & Settlement team.
  - **RazorpayX Pilot Integration**: Integrate Certus as a native reconciliation app on RazorpayX Marketplace for high-volume enterprise merchants.
- **Roadmap (Next 90 Days)**:
  - **Month 1**: Direct webhook connectors for Razorpay Route (marketplace split settlement) and HDFC SmartHub.
  - **Month 2**: Tally Prime XML auto-voucher export via background desktop agent.
  - **Month 3**: Support for GST e-Invoice JSON validation (IRN & QR code cross-matching).

---

### 🛡️ Judge Defense Quick Reference
- **"Why is your throughput 8.3k vs 186k?"** $\to$ *"Exact string hashing is instantaneous but blind. We trade 1.3ms per record for RapidFuzz composite scoring and double-lock consensus, catching 100 additional matched records per thousand while remaining 100x faster than real-time payment gateway traffic."*
- **"Where does the 400 orphan row number come from?"** $\to$ *"In a 3-way reconciliation of 1,000 gateway, 900 bank, and 800 ERP records, naive matching fails to link 200 gateway + 100 bank + 100 ERP records (400 total unlinked rows). Certus resolves 300 of these into verified 3-way matches."*
- **"Does the LLM decide dispute amounts?"** $\to$ *"Never. Every fee variance, TDS rate, and dispute amount is computed via deterministic Python math on integer paise."*
