# AI Finance Controller — Architecture Blueprint & Trust Boundaries

## Overview

The **AI Finance Controller** is an autonomous financial operations system designed to ingest, normalize, validate, and reconcile heterogeneous settlement streams without hallucinating financial figures or mutably altering ledgers.

---

## 1. High-Level System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │       Settlement Upload / Ingestion          │
                               │  (CSV, Bank PDF, ERP Ledger, Razorpay MCP)   │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │      Layer 1: Deterministic Rules Engine     │
                               │  • Zero-cost Python boundary validation      │
                               │  • Schema checks, regex, currency whitelist  │
                               │  • Value sanity (net <= gross, > 0)          │
                               └───────────┬──────────────┬──────────────┬────┘
                                           │              │              │
                           ┌───────────────┘              │              └────────────────┐
                    [PASS] │                     [FAIL]   │                               │ [AMBIGUOUS]
                           ▼                              ▼                               ▼
               ┌───────────────────────┐      ┌───────────────────────┐      ┌─────────────────────────┐
               │    Trusted Database   │      │   Quarantine Store    │      │ Layer 2: LLM Extraction │
               │ (SQLite / PostgreSQL) │      │  (Reason Diagnostics) │      │ (Groq / Gemini Flash)   │
               └───────────┬───────────┘      └───────────┬───────────┘      └────────────┬────────────┘
                           │                              │                               │
                           │                              │                       [Pydantic Validation]
                           │                              │                     Pass ──► DB │ Fail ──► Quarantine
                           ▼                              ▼                               ▼
               ┌───────────────────────────────────────────────────────────────────────────────────────┐
               │                               Agent Orchestrator Layer                                │
               │               Strictly READ-ONLY Tools • Mandatory Source Citations                   │
               │   • get_cash_position()     • get_pending_settlements()   • search_transaction_history()│
               │   • razorpay_mcp_client()   • Weighted Moving Average Cash Forecaster                 │
               └───────────────────────────────────────────────────────────────────────────────────────┘
                                                          ▲
                                                          │ Natural Language Queries
                               ┌──────────────────────────┴───────────────────────────┐
                               │           Glassmorphic Frontend Dashboard            │
                               │  1-Click Demo • 3-Way Match Matrix • Quarantine Q    │
                               └──────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Pillars

### A. Dual-Layer Validation Boundary
1. **Layer 1 (Deterministic Rules Engine)**:
   - Evaluates 100% of incoming records before calling any LLM.
   - Evaluates:
     - Null / missing field constraints
     - Whitelisted settlement currencies (`INR`, `USD`, `EUR`, `GBP`)
     - Value consistency (`gross > 0`, `fee >= 0`, `tax >= 0`, `net == gross - fee - tax`)
     - Non-future dates (`settlement_date <= today + 30 days`)
     - Uniqueness of `transaction_id` per batch.
2. **Layer 2 (Probabilistic LLM Extraction with Pydantic Gating)**:
   - Escalates unstructured bank narration strings to fast LLM (Groq / Gemini / Claude).
   - Strict post-LLM Pydantic parsing: if schema validation fails or confidence is below 0.75, the record is immediately quarantined (`LLM_SCHEMA_FAIL` or `LOW_CONFIDENCE`).

### B. Bounded Read-Only Agent Authority
- The agent has **no write permissions** to ledger or transaction tables.
- Mutation keywords (`transfer`, `send money`, `disburse`, `payout`, `debit`) are intercepted at the orchestrator layer and rejected outright.
- Responses without source record citations are rejected before delivery to the user.

### C. Multi-Source 3-Way Reconciliation
- Stream 1: **Razorpay Payment Gateway** (`payment_id`, `amount`, `fee`)
- Stream 2: **Bank Statements** (`utr_number`, settlement batches, net amount)
- Stream 3: **Internal ERP Ledgers** (`invoice_number`, merchant company names)
- Fuzzy entity resolution via RapidFuzz token sorting (e.g. matching *"Acme India Private Limited"* to *"Acme India Pvt Ltd"*).

---

## 3. Failure Recovery & The "2 AM Crash" Runbook

| Failure Scenario | Automatic System Behavior | Human Action Required |
|---|---|---|
| Malformed / corrupted line in 500-record batch | Record is isolated in Quarantine Store; remaining 499 records process uninterrupted. | Review in Quarantine Queue. |
| Negative gross amount | Flagged as `IMPOSSIBLE_VALUE`; quarantined immediately. | Reject or apply manual correction in UI. |
| Duplicate `transaction_id` across batches | Flagged as `DUPLICATE_ID` referencing initial batch ID. | Dismiss duplicate. |
| LLM API rate limit or outage | Graceful fallback to deterministic rule extraction; marked with fallback flags. | None. |
| Prompt injection attack embedded in settlement narration | Read-only guardrail treats narration strictly as passive text data; blocks execution. | None. |
