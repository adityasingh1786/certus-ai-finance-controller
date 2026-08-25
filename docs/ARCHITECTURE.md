# 🏛️ Certus AI Finance Controller — System Architecture & Design

This document describes the concrete, production implementation of the **Certus AI Finance Controller**, an autonomous financial reconciliation and forensic audit platform.

---

## 1. High-Level System Architecture

Certus continuously cross-references and reconciles three asynchronous financial streams:

```
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│   RAZORPAY GATEWAY API    │      │    BANK CMS STATEMENTS    │      │    ERP GENERAL LEDGER     │
│ • payment_id / order_id   │      │ • 16/22-digit UTR No.     │      │ • Invoice Number / Order  │
│ • Gross / Fee / Tax / Net │      │ • Credit / Debit amounts  │      │ • Customer Legal Entity   │
│ • Settlement Batch IDs    │      │ • Narration String lines  │      │ • Journal Vouchers (SAP)  │
└─────────────┬─────────────┘      └─────────────┬─────────────┘      └─────────────┬─────────────┘
              │                                  │                                  │
              └─────────────────────────┐        │        ┌─────────────────────────┘
                                        ▼        ▼        ▼
                      ┌───────────────────────────────────────────────────┐
                      │    MULTISOURCE RECONCILIATION ENGINE              │
                      │    • Deterministic Indexing (UTR, Order, Invoice) │
                      │    • RapidFuzz Token-Set Ratio Matcher            │
                      │    • 50/30/20 Weighted Multi-Signal Scoring       │
                      │    • Integer Paisa Constraint Verifier            │
                      └─────────────────────────┬─────────────────────────┘
                                                │
                                                ▼
                      ┌───────────────────────────────────────────────────┐
                      │    DOUBLE-LOCK INVARIANT VERIFICATION GATE        │
                      │    • Rule Score ≥ 0.75 & Consensus Verification   │
                      │    • Rate Card Drift Detection (MDR & 18% GST)    │
                      └─────────────────────────┬─────────────────────────┘
                                                │
                               ┌────────────────┴────────────────┐
                               ▼                                 ▼
                     [ ✅ Auto-Matched ]              [ ⚠️ Quarantined Exception ]
                     • Cleared for Ledger             • Isolated at Layer 1
                     • Zero Balance Drift             • Playbook in Review Studio
```

---

## 2. Multi-Signal Reconciliation Algorithm

The matching engine uses a hybrid deterministic and fuzzy heuristic algorithm implemented in `app/services/reconciliation_service.py`:

### Signal Dimensions & Weights:
1. **Amount Precision ($50\%$ weight)**:
   $$\text{AmountConfidence} = \max\left(0.0, 1.0 - \frac{|\text{Expected} - \text{Actual}|}{\max(|\text{Expected}|, |\text{Actual}|, 0.01)}\right)$$
2. **Reference Identifier Strength ($30\%$ weight)**:
   - Exact UTR Match $\to 1.0$
   - Exact Transaction ID Match $\to 0.98$
   - Narration Substring Regex Match $\to 0.85$
   - RapidFuzz Token-Set Fuzzy Merchant Match $\to \frac{\text{score}}{100.0}$
3. **Settlement Date Proximity ($20\%$ weight)**:
   - Same Day $\to 1.0$
   - $\pm 1$ Day $\to 0.95$
   - $\pm 2$ Days $\to 0.85$
   - $> 10$ Days $\to 0.30$

$$\text{CompositeConfidence} = 0.50 \times \text{Amount} + 0.30 \times \text{Reference} + 0.20 \times \text{Date}$$

---

## 3. Double-Lock Consensus Gate

Auto-reconciliation requires that **both** of the following conditions are independently met:
1. $\text{CompositeConfidence} \ge 0.75$
2. Invariant Rules #01 through #55 pass (including strict gross-versus-net checks and MDR fee tolerance).

If either condition fails, the record is immediately trapped **fail-closed** and routed to **Tab 2 (Quarantine & Exceptions)** with an exact discrepancy variance.

---

## 4. Persistence & Concurrency Model

- **Storage Engine**: SQLite in `WAL` (Write-Ahead Logging) mode.
- **Concurrency**: Single-writer / unlimited concurrent readers with `PRAGMA synchronous = NORMAL` and `PRAGMA journal_mode = WAL`.
- **Integer Paisa Safety**: To prevent floating-point inaccuracies (`0.1 + 0.2 != 0.3`), all financial arithmetic operates on Python `Decimal` with `ROUND_HALF_UP` and integer paisa constraints.

---

## 5. Security & Read-Only AI Guardrail

The AI Copilot operates within an air-gapped read-only sandbox:
- Direct write actions to banking rails or general ledger tables are blocked at the orchestrator layer (`SEC-GATE-FAIL-CLOSED`).
- Natural language queries cannot alter balances, execute disbursements, or bypass double-lock rules.
