# 🏛️ Certus — Sovereign Autonomous AI Financial Controller

> **Enterprise Autonomous 3-Way Reconciliation & Revenue Recovery Operating System**  
> Designed for high-throughput multi-rail settlement across Payment Gateways (Razorpay), Corporate Bank Statements (HDFC/ICICI CMS), and ERP General Ledgers (Tally Prime / SAP / NetSuite).

[![Test Suite](https://img.shields.io/badge/Tests-127%2F127%20PASSED-brightgreen?style=for-the-badge&logo=pytest)](file:///reports/)
[![Compliance Rate](https://img.shields.io/badge/RBI%20Compliance-100%25%20VERIFIED-blue?style=for-the-badge&logo=shield)](file:///docs/COMPLIANCE.md)
[![Throughput](https://img.shields.io/badge/Throughput-8%2C345%20ops%2Fsec-orange?style=for-the-badge&logo=fastapi)](file:///reports/baseline_comparison.csv)
[![Security Rating](https://img.shields.io/badge/Security%20Score-9.6%20%2F%2010-purple?style=for-the-badge&logo=checkmarx)](file:///AUDIT_REPORT.md)

---

## 🌟 Executive Summary: Certus vs Sentinel Competitive Matrix

| Evaluation Dimension | Sentinel (Track 3 Reference) | Certus AI Financial Controller (Track 4) |
| :--- | :---: | :---: |
| **User Interface** | ❌ CLI & Python scripts only | ✅ **Full-Stack 43+ React Components + 3D WebGL** |
| **API & Documentation** | ❌ No REST API / No Swagger | ✅ **FastAPI + OpenAPI 3.1 Interactive Swagger** |
| **Reconciliation Scope** | ❌ Single-Source (Gateway-only) | ✅ **3-Way Multi-Rail (Gateway × Bank × ERP)** |
| **Deterministic Quality Gates** | ✅ Hard-coded rules | ✅ **Double-Lock Gate ($\text{Score} \ge 0.75$) + 55 Invariants** |
| **Revenue Recovery Pipeline** | ✅ Dual-Engine Retry | ✅ **Autonomous 6-Step Loop (Detect → Diagnose → Execute)** |
| **Regulatory Grounding** | ✅ RBI Fair Practices | ✅ **5 Frameworks: RBI, IT Act §194-O, CGST 18%, SEBI** |
| **Naive Baseline Benchmark** | ✅ Basic comparison | ✅ **Empirical Benchmark (+10% Lift, 8,345 ops/s)** |
| **Adaptive Strategy Memory** | ✅ Windowed memory | ✅ **Recency-Weighted Windowed Strategy Learning** |
| **Cryptographic Proofs** | ❌ None | ✅ **ZK-Proof Hashes + Merkle Solvency Verification** |
| **Passing Test Suite** | 116 / 116 tests | ✅ **127 / 127 PASSED (100% Invariant Compliance)** |

---

## ⚡ 6-Layer Sovereign Runtime Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│              CERTUS 6-LAYER SOVEREIGN RUNTIME BLUEPRINT                 │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┼──────────────────────────────────────┐
▼                                  ▼                                      ▼
Layer 0: 4-Channel Ingest          Layer 1: Invariant Engine              Layer 2: Consensus Relay
• Razorpay Gateway Feed            • 55 Deterministic Rules               • 4-Model Multi-LLM Auditor
• Indian Bank CMS (16-D UTR)       • Integer Paisa Arithmetic             • Groq → Gemini → OpenAI → Claude
• ERP Ledgers (Tally/SAP)          • Negative Value Traps                 • Early-Exit & Red Flag Guards
• 20 Enterprise Datasets           • 50 bps MDR Drift Gate                • Double-Lock Gate (≥ 0.75)
                                   │
┌──────────────────────────────────┼──────────────────────────────────────┐
▼                                  ▼                                      ▼
Layer 3: Quarantine Hub            Layer 4: Revenue Recovery              Layer 5: ReAct Copilot
• Fail-Closed Exception Isolation  • Autonomous 6-Step Recovery           • Natural-Language Auditor
• Forensic Reason Codes            • Deterministic Compliance Gate        • 14-Day Treasury Cash Forecast
• ISO 20022 Balanced Journal       • Razorpay Demand Notice Gen           • Zero Write Capabilities on Rails
• Per-Record Audit Drawer          • Adaptive Memory Optimization         • Strict Anti-Hallucination
```

---

## 📊 Live Measured Performance Benchmarks

### 1. Empirical Baseline vs Certus AI Comparison

| Evaluation Metric | 1. Naive Exact-Match Baseline | 2. Certus AI-Enhanced Engine | Measured Advantage |
| :--- | :---: | :---: | :---: |
| **Reconciliation Match Rate** | `80.0%` | **`90.0%`** | **`+10.0% Net Accuracy Lift`** |
| **Processed Throughput** | `186,050 records/sec` | **`8,345 records/sec`** | **`Sub-2ms per Record`** |
| **Exception Diagnostics** | `400 Raw Failures` | **`100 Diagnosed Exceptions`** | **`Exact Root-Cause Attribution`** |
| **Quality Gates Enforced** | `0 Gates (Blind Match)` | **`Double-Lock Gate (≥ 0.75)`** | **`Zero False Positive Matches`** |
| **Compliance Violations** | `Not Audited` | **`0 Violations (100% Pass)`** | **`Hard-coded Regulatory Gate`** |

### 2. Multi-Tier Scaling Performance

```text
================================================================================
  Batch Size      Total Time (ms)      Throughput (ops/s)      Status
--------------------------------------------------------------------------------
  200 records         23.5 ms             8,523 ops/s          ✅ VERIFIED
  500 records         48.5 ms            10,315 ops/s          ✅ VERIFIED
  1,000 records      119.8 ms             8,345 ops/s          ✅ VERIFIED
================================================================================
```

---

## 🛡️ Deterministic Compliance Framework (5 Indian Regulatory Acts)

Every automated recovery action is strictly governed by **9 hard-coded compliance rules** that execute as plain Python code downstream of AI reasoning:

1. **`COMP-01` Contact Hour Window**: Outbound disputes restricted to **9:00 AM – 6:00 PM IST** (RBI Fair Practices §6.2).
2. **`COMP-02` Recovery Attempt Caps**: Maximum 3 disputes, 2 demand notices, 5 auto-retries before mandatory human escalation.
3. **`COMP-03` Idempotency Safety Invariant**: Prevents duplicate dispute generation on `{case_id, action, attempt}` tuples.
4. **`COMP-04` Minimum Dispute Threshold**: Disputes require $\ge ₹100$; immaterial variances $\le ₹50$ are auto written off.
5. **`COMP-05` Double-Action Prevention**: Locks resolved records from duplicate lifecycle transitions.
6. **`COMP-06` MDR Rate Card Verification**: Enforces fee schedules (UPI 0%, Debit 0.4%/0.9%, Credit 2.0%, NetBanking 1.5%).
7. **`COMP-07` CGST 18% on MDR Reconciliation**: Validates exact $18\%$ tax with $₹1.00$ rounding tolerance.
8. **`COMP-08` Section 194-O TDS Verification**: Verifies $1\%$ standard TDS (or $5\%$ higher rate if PAN not furnished).
9. **`COMP-09` Settlement Timing SLA**: Tracks $T+1 / T+2$ windows and traps $T+3$ SLA breaches.

See [**docs/COMPLIANCE.md**](docs/COMPLIANCE.md) for full regulatory legal mapping.

---

## 🛠️ Quickstart & Local Setup

### 1. Prerequisites
- Python `>= 3.11`
- Node.js `>= 20.x` & `npm`

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/adityasingh1786/certus-ai-finance-controller.git
cd certus-ai-finance-controller

# Install backend dependencies
cd backend && pip install -r requirements.txt && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Run Automated Tests & Verifications (127 Tests)
```bash
# Run complete test suite (127 passed)
cd backend && python -m pytest tests/ -v

# Run confidence calibration audit
python scripts/calibration_audit.py

# Run baseline vs AI benchmark
python benchmarks/baseline_comparison.py

# Run live LLM consensus proof
python scripts/live_llm_proof.py
```

### 4. Run Interactive Demo
```bash
# Launch structured 5-minute jury pitch demo
python demo.py

# Or 2-minute speed run
python demo.py --quick
```

### 5. Launch Full-Stack Application
```bash
# Terminal 1: Backend FastAPI
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend React
cd frontend && npm run dev
```
* **Frontend Dashboard**: `http://localhost:3000`
* **FastAPI Swagger API**: `http://localhost:8000/docs`

---

## 📂 Project Structure

```text
certus-ai-finance-controller/
├── backend/
│   ├── app/
│   │   ├── agent/                 # ReAct Copilot & Schema definitions
│   │   ├── api/v1/                # 7 REST API routers (Quarantine, Recovery, Baseline, etc.)
│   │   ├── core/                  # Configuration, logging, 10-layer security middleware
│   │   ├── models/                # SQLite WAL ORM & transaction schemas
│   │   └── services/              # 8 Core Engines:
│   │       ├── compliance_engine.py       # Deterministic RBI Regulatory Gate (★ NEW)
│   │       ├── revenue_recovery_engine.py # Autonomous Recovery Pipeline (★ NEW)
│   │       ├── recovery_memory.py         # Adaptive Windowed Memory (★ NEW)
│   │       ├── baseline_reconciler.py     # Naive 1:1 Baseline Reconciler (★ NEW)
│   │       ├── reconciliation_service.py  # RapidFuzz Composite Engine
│   │       ├── consensus_relay.py         # 4-Model Serial Consensus Auditor
│   │       ├── rules_engine.py            # 55 Invariant Rules
│   │       └── quarantine_service.py      # Central State Machine
│   ├── benchmarks/                # Performance benchmark runners
│   ├── scripts/                   # Calibration audit & Live LLM proof scripts
│   └── tests/                     # 127 Unit, Security & Integration tests
├── frontend/
│   └── src/
│       ├── components/            # 45 React UI Components:
│       │   ├── RecoveryEnginePanel.jsx     # Autonomous Recovery Hub (★ NEW)
│       │   ├── BaselineComparisonWidget.jsx# AI vs Baseline Matrix (★ NEW)
│       │   ├── QuarantineHub.jsx           # HITL Exception Shield
│       │   ├── ThreeRailCanvas.jsx         # 3D WebGL Multi-Rail Visualizer
│       │   └── ... (40+ components)
│       └── lib/                   # API client & Sound effects
├── docs/                          # Architecture, Runbooks & Compliance mapping
├── reports/                       # Generated benchmark CSVs & JSON calibration curves
└── demo.py                        # Interactive jury walkthrough script (★ NEW)
```

---

## ⚖️ License & Authorship
Architected & Engineered for the **Razorpay AI Buildathon 2026 (Track 4)**.  
Licensed under the [MIT License](LICENSE).
