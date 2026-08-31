# 🎬 Certus — Official Video Pitch Script & Recording Storyboard

> **Razorpay AI Buildathon 2026 — Track 4 (Autonomous Financial Controller & Revenue Recovery)**  
> **Target Video Length**: 3 minutes 30 seconds – 4 minutes  
> **Presenter / Author**: Aditya Singh (Lead Architect & Systems Engineer)

---

## 🛠️ Recording Setup Checklist

- [ ] **Screen Resolution**: 1920x1080 (1080p, 60 FPS) via OBS Studio or Loom.
- [ ] **Tabs Open Ready in Browser**:
  1. `http://localhost:3000` (Certus React UI)
  2. `http://localhost:8000/docs` (FastAPI Interactive Swagger API)
  3. `https://github.com/adityasingh1786/certus-ai-finance-controller` (GitHub Repo)
- [ ] **Terminal Open Ready in Background**:
  - Window 1: Backend running (`uvicorn app.main:app --port 8000`)
  - Window 2: Ready to run `pytest tests/ -v` or `python demo.py`

---

## ⏱️ Scene-by-Scene Storyboard & Spoken Transcript

```text
====================================================================================================
TIMECODE        SCENE / VISUAL ACTION                       SPOKEN DIALOGUE & EMPHASIS
====================================================================================================
```

### 📍 Scene 1: The Hook, Team & The Problem (0:00 – 0:35)

| Timecode | Visual on Screen | What to Click / Do |
| :--- | :--- | :--- |
| **0:00 – 0:35** | Full screen on **Certus Landing Page** with **3D WebGL Multi-Rail Canvas** animating. | Mouse smoothly hovers over the 3 Rails: *Gateway Rail (Razorpay)* $\to$ *Bank CMS Rail* $\to$ *ERP Ledger Rail*. |

#### 🎙️ Spoken Script (Scene 1):
> *"Hi judges, we are Team Certus for Track 4: Autonomous Financial Controller.*  
>  
> *In India’s digital economy, high-volume merchants process millions of transactions daily across UPI, Cards, NetBanking, and Wallets. But behind this scale lies a massive financial bleed:*  
>  
> *Enterprises lose up to **2.5% of net GMV** in silent post-settlement leakages—unauthorized MDR fee drifts, truncated 16-digit bank UTR numbers in CMS batches, and unposted ERP vouchers.*  
>  
> *Razorpay's dashboard knows what was settled on the gateway side, but cannot see if the money actually credited to the merchant's HDFC CMS account, or if the invoice cleared in Tally. **Meet Certus**—the autonomous 3-way reconciliation operating system that bridges Gateway, Bank, and ERP simultaneously under strict RBI compliance."*

---

### 📍 Scene 2: 3-Way Multi-Rail Ingestion & Real-Time Match (0:35 – 1:15)

| Timecode | Visual on Screen | What to Click / Do |
| :--- | :--- | :--- |
| **0:35 – 1:15** | Navigate to **Reconciliation Workspace** (`/reconciliation`). | 1. Click **"Scenario 01 — D2C Fashion Flash Sale"** or drop 3 CSVs.<br>2. Click **"Execute 3-Way Cross-Reconciliation"**.<br>3. Show the instant result matrix and sub-2ms per record throughput. |

#### 🎙️ Spoken Script (Scene 2):
> *"Let’s see Certus in action on an enterprise batch of 1,000 multi-rail transactions across Razorpay Gateway settlements, HDFC Bank CMS statements, and Tally ERP ledgers.*  
>  
> *(Click Reconcile)*  
>  
> *In under **120 milliseconds**—processing over **8,300 records per second**—Certus runs our **RapidFuzz Composite Signal Engine**.*  
>  
> *Notice our mathematical formula: 50% Amount Precision evaluated on strict **integer paisa constraints** to eliminate floating-point drift, 30% Reference Strength parsing unstructured Indian bank narration strings, and 20% Date Proximity.*  
>  
> *If a record clears our **Double-Lock Gate**—achieving both an invariant pass and a composite confidence $\ge 0.75$—it is automatically cleared directly to the general ledger with zero manual intervention."*

---

### 📍 Scene 3: Fail-Closed Quarantine Hub & Root-Cause Diagnosis (1:15 – 2:00)

| Timecode | Visual on Screen | What to Click / Do |
| :--- | :--- | :--- |
| **1:15 – 2:00** | Click on the **Quarantine Hub** tab in the sidebar (`/quarantine`). | 1. Show the **"Active Containment Shield"** banner.<br>2. Click on **Record `QR-001-MDR`** (Unauthorized MDR).<br>3. Open the **Record Audit Drawer** on the right side. |

#### 🎙️ Spoken Script (Scene 3):
> *"When a transaction has a discrepancy, Certus operates on a strict **Fail-Closed Anomaly Containment Shield**.*  
>  
> *Here in the Quarantine Hub, anomalous transactions are isolated before they can corrupt corporate accounting.*  
>  
> *Let’s inspect record `QR-001-MDR`. Certus immediately attributes the exact root-cause: the gateway deducted a 2.50% fee instead of the contracted 2.0% rate card + 18% GST, causing an excess deduction of exactly ₹217.50.*  
>  
> *Our 4-Model **Consensus Relay**—chaining Groq Llama-3.3, Google Gemini, OpenAI GPT-4o, and Anthropic Claude—cross-audited this discrepancy with early-exit logic to maintain sub-second response times."*

---

### 📍 Scene 4: Autonomous Revenue Recovery & RBI Compliance Gate (2:00 – 2:45)

| Timecode | Visual on Screen | What to Click / Do |
| :--- | :--- | :--- |
| **2:00 – 2:45** | Click on the **"Autonomous Revenue Recovery"** sub-tab in the Quarantine Hub. | 1. Show the **Recovery Pipeline Cards** and **9 RBI Rules Registry**.<br>2. Click **"Run Autonomous Recovery"** button.<br>3. Watch the status transition to `RECOVERED` with cryptographic audit commitment hashes. |

#### 🎙️ Spoken Script (Scene 4):
> *"Now for our core innovation: **Layer 4 — Autonomous Revenue Recovery**.*  
>  
> *(Click Run Autonomous Recovery)*  
>  
> *Certus executes our 6-step loop: Detection $\to$ Diagnosis $\to$ Strategy $\to$ Compliance Gate $\to$ Execution $\to$ Adaptive Memory.*  
>  
> *Crucially: **Zero financial math or regulatory decisions are delegated to probabilistic LLMs**.*  
>  
> *Every single recovery action must pass through our **100% Deterministic Compliance Gate** enforcing **9 hard-coded Python rules** mapped to **5 Indian regulatory frameworks**:*  
> - *RBI Fair Practices Code Section 6.2 restricting outbound disputes to 9 AM to 6 PM IST,*  
> - *Section 194-O Income Tax Act 1% TDS validation,*  
> - *CGST 18% fee reconciliation, and strict idempotency invariant keys to prevent duplicate disputes.*  
>  
> *Disputes are automatically generated with Razorpay API citations, recovered amounts are logged, and strategy rankings adapt dynamically in our sliding window memory."*

---

### 📍 Scene 5: Empirical Baseline Comparison & Treasury Runway (2:45 – 3:20)

| Timecode | Visual on Screen | What to Click / Do |
| :--- | :--- | :--- |
| **2:45 – 3:20** | Navigate to **Executive Dashboard** (`/dashboard`). | 1. Scroll to the **Naive Baseline vs Certus AI Benchmark Matrix** widget.<br>2. Highlight the **+10.0% Measured Accuracy Gain** and explain the honest throughput trade-off.<br>3. Point to the **14-Day Treasury Cash Runway Chart**. |

#### 🎙️ Spoken Script (Scene 5):
> *"To prove to our judges that our AI adds genuine, measurable value, we built an integrated **Empirical Baseline Benchmark Engine**.*  
>  
> *Side-by-side on the exact same dataset, a naive exact-matcher leaves 400 total unlinked orphan rows across the 3 ledgers. Certus AI cross-matches 300 of them, delivering **90.0% accuracy—a verified +10.0% net accuracy lift**—while eliminating false positive ledger entries.*  
>  
> *We trade raw CPU string hashing for deep fuzzy scoring, yet at **8,345 records/sec**, Certus reconciles a full day of 100,000 transactions in under 12 seconds—well within real-time banking SLAs.*  
>  
> *Simultaneously, our **Treasury Engine** forecasts our 14-day audited cash runway, calculating live inflow pipelines and liquidity float."*

---

### 📍 Scene 6: Architecture, 127 Passing Tests & Closing Pitch (3:20 – 3:50)

| Timecode | Visual on Screen | What to Click / Do |
| :--- | :--- | :--- |
| **3:20 – 3:50** | 1. Switch to terminal and run `pytest tests/ -v`.<br>2. Show `127 passed in 43.75s`.<br>3. Switch briefly to Swagger API docs (`http://localhost:8000/docs`).<br>4. Return to Landing Page logo. | 1. Run `pytest` command.<br>2. Scroll through green passing tests.<br>3. Show Swagger endpoints.<br>4. End on full-screen Certus UI. |

#### 🎙️ Spoken Script (Scene 6):
> *"Under the hood, Certus is production-ready. Our test harness contains **127 verified automated tests** covering invariants, cybersecurity mesh, prompt injection defense, and regulatory gates.*  
>  
> *With 45+ React components, a FastAPI OpenAPI backend, SQLite WAL storage, and air-gapped fallback resilience, Certus is designed as the native reconciliation engine for **RazorpayX Enterprise merchants**.*  
>  
> *Our team is eager to pilot this with the Razorpay Core Banking & Settlement team under the Track 4 internship. Thank you!"*

---

## 🎯 Jury Q&A Defense Cheat Sheet (Keep beside you during presentation)

| Likely Judge Question | Your 10-Second Winning Answer |
| :--- | :--- |
| **"Why is your throughput 8.3k vs 186k ops/s in naive matching?"** | *"Exact string hashing is instantaneous but blind. We trade 1.3ms per record for RapidFuzz composite scoring and double-lock consensus, catching 100 additional matched records per thousand while remaining fast enough to reconcile 100,000 transactions in under 12 seconds."* |
| **"Where does the 400 orphan row number come from?"** | *"In a 3-way reconciliation of 1,000 gateway, 900 bank, and 800 ERP records, naive matching fails to link 200 gateway + 100 bank + 100 ERP records (400 total unlinked rows). Certus resolves 300 of these into verified 3-way matches."* |
| **"How does this differentiate from Razorpay's settlement dashboard?"** | *"Razorpay's dashboard only sees Razorpay's side. It cannot see internal HDFC CMS bank statements, NEFT UTR settlement batches, or Tally/SAP ERP draft invoices. Certus is the 3-way bridge between Razorpay, the merchant's corporate bank, and the merchant's ERP."* |
| **"Does the LLM decide dispute amounts or tax rates?"** | *"Never. Every fee variance, TDS rate, CGST calculation, and dispute amount is computed via deterministic Python math on integer paise. LLMs are only used as an audited Consensus Relay for unstructured narration ambiguity."* |
