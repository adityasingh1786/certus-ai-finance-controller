# 🏛️ Certus — Sovereign Autonomous AI Financial Controller

> **Deterministic Financial Invariants & Autonomous 3-Way Reconciliation System**  
> Designed for enterprise multi-rail reconciliation across Payment Gateways (Razorpay), Corporate Bank Statements (HDFC/ICICI CMS), and ERP General Ledgers (Tally Prime / SAP / NetSuite).

---

## ⚡ Core Engineering Highlights

- **Hybrid Multi-Signal Reconciliation Engine**: Combines RapidFuzz token-set string matching with a weighted composite signal heuristic ($50\%$ Amount Precision, $30\%$ Reference Strength, $20\%$ Date Proximity).
- **Double-Lock Verification Gate**: Enforces dual-condition consensus ($\text{CompositeConfidence} \ge 0.75$ and 55 invariant rules) before any general ledger clearing occurs.
- **Fail-Closed Quarantine Engine**: Discrepancies (unauthorized MDR fee drift, missing bank UTRs, unposted ERP vouchers) are isolated at Layer 1 with exact paisa variances.
- **Autonomous AI Copilot**: Dual-Loop ReAct agent delivering structured 4-tier forensic audit reports (`⚡ Executive Summary`, `📊 Verified Evidence Table`, `🔍 Root-Cause Diagnosis`, `🛠️ Remediation Playbook`) with zero write capabilities on live rails.
- **Zero-Network Air-Gapped Fallback**: Guaranteed audit continuity directly from SQLite WAL shared memory even during cloud LLM outages.

---

## 📊 Live Measured Performance Benchmarks

The following throughput and latency numbers were measured using the standalone benchmark test harness (`benchmarks/benchmark_reconciler.py`) on local execution:

| Batch Size | Execution Time (s) | Throughput (ops/s) | Avg Latency / Record | Match Rate |
| :--- | :---: | :---: | :---: | :---: |
| **1,000 records** | `1.371s` | **`729 ops/s`** | `1.37 ms` | 90.0% Matched / 10.0% Quarantined |
| **5,000 records** | `9.048s` | **`552 ops/s`** | `1.81 ms` | 90.0% Matched / 10.0% Quarantined |
| **10,000 records** | `35.148s` | **`284 ops/s`** | `3.51 ms` | 90.0% Matched / 10.0% Quarantined |
| **20,000 records** | `409.936s` | **`48 ops/s`** | `20.50 ms` | 90.0% Matched / 10.0% Quarantined |

---

## 🏗️ Architecture & Signal Scoring

$$\text{CompositeConfidence} = 0.50 \times \text{AmountConfidence} + 0.30 \times \text{ReferenceConfidence} + 0.20 \times \text{DateConfidence}$$

* **Amount Precision**: Evaluated on integer paisa constraints (`int(round(amount * 100))`) to eliminate IEEE-754 floating-point drift.
* **Reference Strength**: Exact UTR match ($1.0$), Transaction ID match ($0.98$), Narration substring extraction ($0.85$), and RapidFuzz fuzzy merchant scoring.
* **Date Proximity**: Same-day clearance ($1.0$), $\pm 1$ day window ($0.95$), decay curve for older settlements.

For detailed architecture diagrams and mathematical formalisms, see [**docs/ARCHITECTURE.md**](docs/ARCHITECTURE.md).

---

## 🛠️ Quickstart & Local Setup

### Prerequisites
- Python `>= 3.11`
- Node.js `>= 20.x` & `npm`

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/adityasingh1786/certus-ai-finance-controller.git
cd certus-ai-finance-controller

# Install Python backend dependencies
pip install -r backend/requirements.txt

# Install Frontend React dependencies
cd frontend && npm install && cd ..
```

### 2. Launch Full-Stack Application
```bash
# Using Makefile
make dev

# Or directly with Python orchestrator
python run.py
```
* **Frontend UI**: `http://localhost:3000`
* **FastAPI Swagger Docs**: `http://localhost:8000/docs`

### 3. Run Automated Test Suite & Benchmarks
```bash
# Run pytest test suite (55 tests)
make test

# Run performance benchmark suite
make bench
```

---

## 📘 Documentation & Runbooks
- [**System Architecture & Design**](docs/ARCHITECTURE.md)
- [**Controller Incident Runbook (SOPs)**](docs/RUNBOOK.md)
- [**Changelog & Release Notes**](CHANGELOG.md)

---

## ⚖️ License & Attribution
Engineered by **Aditya Singh** (Lead Architect & Full-Stack AI Systems Engineer).  
Licensed under the [MIT License](LICENSE).
