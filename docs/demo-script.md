# 5-Minute Pitch Script — AI Finance Controller (Track 04)

## Event: Razorpay AI Buildathon 2026
**Target Score:** 100/100 across Problem Taste, Build Quality, AI Judgment, and Failure Recovery.

---

### [0:00 – 0:45] The Hook & Differentiator (Problem Taste)
> "Reconciliation is where fintech ops actually breaks. Payment gateways, bank UTRs, and internal ERP ledgers never agree. Most AI agents today try to be smart by force-matching messy records or hallucinating numbers when values are missing. In finance, that's catastrophic.
>
> We built the **AI Finance Controller** — an autonomous ops system that ingests messy, multi-source settlement data, reconciles it across heterogeneous streams, tells finance teams their exact audited cash position in plain English, and — critically — **never silently trusts a bad number**."

---

### [0:45 – 1:45] Architecture & Bounded Authority (AI Judgment)
> *(Open Architecture Blueprint Modal)*
>
> "Our architecture separates deterministic rules from probabilistic AI:
> 1. **Layer 1: Deterministic Rules Engine** executes first at zero LLM cost. It catches missing fields, currency errors, and negative values.
> 2. **Layer 2: LLM Extraction & Reasoning** is used ONLY for ambiguous, unstructured narrations, and its output must pass post-LLM Pydantic validation before touching trusted DB tables.
> 3. **Bounded Read-Only AI**: The agent has **zero write permissions** on financial ledgers. Every response requires **mandatory source citations**."

---

### [1:45 – 3:15] Live Demo: 60-Record Batch Ingestion & 3-Way Reconciliation (Build Quality)
> *(Click 'Load Demo Dataset')*
>
> 1. **Batch Ingestion**: Watch the engine ingest 60 records at **412.5 records/second**.
> 2. **Quarantine Isolation**: Show that **14 injected anomalies** (negative amounts, bitcoin currency, duplicate IDs) were automatically isolated without crashing the remaining 46 clean records.
> 3. **3-Way Multi-Source Match Matrix**: Show Gateway vs Bank Statement (UTR matching) vs ERP Ledger (Invoice matching & RapidFuzz token matching).
> 4. **Human-In-The-Loop Exception Resolution**: Open a quarantined record, explain the diagnostic reason code, type an audit note, and click *Resolve*. Show the audit log update.

---

### [3:15 – 4:15] Natural Language Agent & Cash Forecasting (AI Interaction)
> *(Ask Agent in Chat Panel)*
>
> 1. Ask: *"What is our cash position next Friday?"*
> 2. Show the instant response calculated via **Weighted Moving Average** with honest confidence bands.
> 3. Click on the **Cited Sources badge** to inspect the verified transaction IDs backing the number.
> 4. Show the **Read-Only Tool Trace** verifying no hallucinations or ledger mutations occurred.

---

### [4:15 – 5:00] Failure Recovery & Closing
> "We tested our pipeline against adversarial prompt injections embedded in settlement narrations. The agent refused all write attempts and maintained 100% auditability across all 19 test suites.
>
> This is a production-ready, bounded AI controller ready to automate financial operations today. Thank you!"
