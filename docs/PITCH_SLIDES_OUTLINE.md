# Pitch Deck & Demonstration Structure
### Track 04: AI Finance Controller — Razorpay AI Buildathon 2026

---

### Slide 1: The Problem
- **Headline:** Finance teams spend 40% of their month reconciling data that should already agree.
- **The Friction:** Gateway settlement files, delayed bank credits, and ERP invoices use different IDs, net amounts after gateway fees and GST, and cryptic narrations.
- **The AI Trap:** Most teams build chatbots that guess and hallucinate. In finance, **verification capacity > generation speed**.

---

### Slide 2: The Solution — AI Finance Controller
- **The Core Engine:** Dual-layer validation pipeline with 12 deterministic rules running first, followed by read-only LLM reasoning, gated by post-LLM Pydantic validation.
- **Three Capabilities:**
  1. Multi-source ingestion & isolation of anomalies into Quarantine.
  2. 3-Way Cross-Reconciliation (Gateway ↔ Bank ↔ ERP) with 400+ rec/sec throughput.
  3. Conversational treasury assistant with mandatory source citations and 7-day WMA forecasting.

---

### Slide 3: Architecture & Security
- **The "2 AM Crash" Protocol:** Per-record error boundary wrapping. One corrupt record never halts the batch.
- **Strict Least Privilege:** Agent has zero write-capable tools. No transfer, mutation, or deletion permissions.
- **Immutable Audit Trail:** Insert-only audit logging for every validation and Human-in-the-Loop resolution.

---

### Slide 4: Live Demo Highlights
- Ingesting a realistic 60-record dataset with 7 injected corruptions.
- 53 records committed instantly to trusted ledger; 7 isolated in Quarantine with human-readable diagnostic reason codes.
- Human-in-the-Loop 1-click resolution.
- 3-Way Triangulation with RapidFuzz.
- Conversational cash queries with clickable `#TXN` citations.

---

### Slide 5: Business Impact & Roadmap
- **Immediate Value:** 90%+ reduction in month-end reconciliation cycle time.
- **Zero Hallucination Guarantee:** Provable trust boundaries.
- **Production-Ready:** 16 REST endpoints with OpenAPI documentation, Supabase RLS, and automated CI test suites.
