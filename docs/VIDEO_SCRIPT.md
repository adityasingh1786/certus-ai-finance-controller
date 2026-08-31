# 🎬 Certus — Official Video Pitch Script & Recording Storyboard

> **Razorpay AI Buildathon 2026 — Track 4 (Autonomous Financial Controller & Revenue Recovery)**  
> **Target Video Length**: 3 minutes 30 seconds – 4 minutes  
> **Pacing**: Confident, technical, authoritative (~130 words/minute)  
> **Presenter**: Aditya Singh (Lead Architect & Systems Engineer)

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

### 📍 Scene 1: The Hook & The Problem (0:00 – 0:35)

| Timecode | Visual on Screen | What to Click / Do |
| :--- | :--- | :--- |
| **0:00 – 0:35** | Full screen on **Certus Landing Page** with **3D WebGL Multi-Rail Canvas** animating. | Mouse smoothly hovers over the 3 Rails: *Gateway Rail (Razorpay)* $\to$ *Bank CMS Rail* $\to$ *ERP Ledger Rail*. |

#### 🎙️ Spoken Script (Scene 1):
> *"In India’s fast-moving digital economy, high-volume merchants process millions of transactions daily across UPI, Credit Cards, NetBanking, and Wallets. But behind this scale lies a hidden crisis:*  
>  
> *Every single day, Indian enterprises lose up to **2.5% of their net operating revenue** to silent settlement leakages—unauthorized MDR fee drifts, truncated 16-digit bank UTR numbers, unposted ERP vouchers, and Section 194-O TDS mismatches.*  
>  
> *Existing reconcilers only flag passive errors in CSVs weeks later. **Meet Certus**—the world’s first Sovereign Autonomous AI Financial Controller that doesn’t just detect discrepancies—it actively cross-reconciles 3 rails in real-time and autonomously recovers trapped revenue under strict RBI compliance."*

---

### 📍 Scene 2: 3-Way Multi-Rail Ingestion & Real-Time Match (0:35 – 1:15)

| Timecode | Visual on Screen | What to Click / Do |
| :--- | :--- | :--- |
| **0:35 – 1:15** | Navigate to **Reconciliation Workspace** (`/reconciliation`). | 1. Click **"Scenario 01 (Code: 01) — D2C Fashion Flash Sale"** or drop 3 CSVs.<br>2. Click **"Execute 3-Way Cross-Reconciliation"**.<br>3. Show the instant result matrix and 729+ ops/s throughput badge. |

#### 🎙️ Spoken Script (Scene 2):
> *"Let’s see Certus in action. We’ll trigger a live enterprise dataset with 1,000 transactions across Razorpay Gateway settlements, HDFC Bank CMS statements, and Tally ERP ledgers.*  
>  
> *(Click Reconcile)*  
>  
> *In under **120 milliseconds**—a throughput of over **8,300 operations per second**—Certus executes our **RapidFuzz Composite Signal Engine**.*  
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
> *"Now, what happens when a transaction is anomalous? Unlike traditional tools that blindly force a match, Certus operates on a strict **Fail-Closed Anomaly Containment Shield**.*  
>  
> *Here in the Quarantine Hub, we see discrepancies isolated before they can corrupt corporate accounting.*  
>  
> *Let’s inspect this transaction, `QR-001-MDR`. Certus immediately attributes the exact root-cause: the gateway charged a 2.50% fee instead of the contracted 2.0% rate card + 18% GST, causing an excess deduction of exactly ₹217.50.*  
>  
> *Our 4-Model **Consensus Relay**—chaining Groq Llama-3.3, Google Gemini, OpenAI GPT-4o, and Anthropic Claude—cross-audited this discrepancy in serial with hard red-flag containment."*

---

### 📍 Scene 4: Autonomous Revenue Recovery & RBI Compliance Gate (2:00 – 2:45)

| Timecode | Visual on Screen | What to Click / Do |
| :--- | :--- | :--- |
| **2:00 – 2:45** | Click on the **"Autonomous Revenue Recovery"** sub-tab in the Quarantine Hub. | 1. Show the **Recovery Pipeline Cards** and **9 RBI Rules Registry**.<br>2. Click **"Run Autonomous Recovery"** button.<br>3. Watch the status transition to `RECOVERED` with ZK-proof hashes and ₹2,450 recovered. |

#### 🎙️ Spoken Script (Scene 4):
> *"Here is where Certus revolutionizes financial engineering: **Layer 4 — Autonomous Revenue Recovery**.*  
>  
> *(Click Run Autonomous Recovery)*  
>  
> *Certus executes our 6-step loop: Detection $\to$ Diagnosis $\to$ Strategy $\to$ Compliance Gate $\to$ Execution $\to$ Adaptive Memory.*  
>  
> *Crucially: **Zero financial decisions or regulatory rules are delegated to probabilistic LLMs**.*  
>  
> *Every single recovery action must pass through our **100% Deterministic Compliance Gate** enforcing **9 hard-coded Python rules** mapped to **5 Indian regulatory frameworks**:*  
> - *RBI Fair Practices Code Section 6.2 restricting outbound disputes to 9 AM to 6 PM IST,*  
> - *Section 194-O Income Tax Act 1% TDS validation,*  
> - *CGST 18% fee reconciliation, and strict idempotency invariant keys.*  
>  
> *Disputes are automatically generated with Razorpay API citations, recovered amounts are logged, and every execution outputs a cryptographic **SHA-256 ZK-Proof Hash** for tamper-evident auditing."*

---

### 📍 Scene 5: Empirical Baseline Comparison & Treasury Runway (2:45 – 3:20)

| Timecode | Visual on Screen | What to Click / Do |
| :--- | :--- | :--- |
| **2:45 – 3:20** | Navigate to **Executive Dashboard** (`/dashboard`). | 1. Scroll to the **Naive Baseline vs Certus AI Benchmark Matrix** widget.<br>2. Hover over the **+10.0% Measured Accuracy Gain** and **8,345 ops/s Throughput**.<br>3. Point to the **14-Day Treasury Cash Runway Chart**. |

#### 🎙️ Spoken Script (Scene 5):
> *"To prove to our auditors and judges that our AI adds genuine, measurable value, we built an integrated **Empirical Baseline Benchmark Engine**.*  
>  
> *Side-by-side on the exact same dataset, the naive 1:1 exact-matcher achieves only 80% accuracy and misses 400 discrepancies. Certus AI achieves **90.0% accuracy—a verified +10.0% net accuracy lift**—while eliminating all false positive ledger entries.*  
>  
> *Simultaneously, our **Treasury Engine** forecasts our 14-day audited cash runway, calculating live inflow pipelines and liquidity float with Monte Carlo confidence bands."*

---

### 📍 Scene 6: Architecture, 127 Passing Tests & Closing Pitch (3:20 – 3:50)

| Timecode | Visual on Screen | What to Click / Do |
| :--- | :--- | :--- |
| **3:20 – 3:50** | 1. Switch to terminal and run `pytest tests/ -v`.<br>2. Show `127 passed in 43.75s`.<br>3. Switch briefly to Swagger API docs (`http://localhost:8000/docs`).<br>4. Return to Landing Page logo. | 1. Run `pytest` command.<br>2. Scroll through green passing tests.<br>3. Show Swagger endpoints.<br>4. End on full-screen Certus UI. |

#### 🎙️ Spoken Script (Scene 6):
> *"Under the hood, Certus is production-ready. Our test suite contains **127 verified automated tests** covering invariants, cybersecurity mesh, prompt injection defense, and regulatory gates.*  
>  
> *With 45+ React components, a FastAPI OpenAPI backend, SQLite WAL shared memory, and air-gapped fallback resilience, Certus provides the complete sovereign financial operating system for the next generation of digital commerce.*  
>  
> *Thank you—Certus is ready to power Razorpay's enterprise ecosystem."*

---

## 🎯 Jury Q&A Defense Cheat Sheet (Keep beside you during presentation)

| Likely Judge Question | Your 10-Second Winning Answer |
| :--- | :--- |
| **"Why not just use an LLM for the whole reconciliation?"** | *"LLMs are probabilistic and hallucinate numbers. In accounting, 1 paisa of drift is a compliance failure. We use deterministic RapidFuzz integer math for 99% of matching and strict Python code for compliance gates; LLMs are only used as an audited Consensus Relay for high-entropy exceptions."* |
| **"How do you comply with RBI regulations?"** | *"Our Compliance Engine (`compliance_engine.py`) has 9 hard-coded rules covering RBI Fair Practices Code §6.2 (contact hours 9AM-6PM IST), Section 194-O TDS (1%), and CGST 18% with fail-closed attempt caps."* |
| **"How fast does it run?"** | *"Measured benchmark throughput is 8,345 records/second on local hardware—sub-2ms per transaction."* |
| **"How is this different from Track 3's Sentinel?"** | *"Sentinel is a single-source gateway CLI with 116 tests. Certus is a full-stack 3-way reconciler across Gateway, Bank CMS, and ERP with 127 passing tests, WebGL UI, OpenAPI Swagger docs, and an empirical baseline benchmark."* |
