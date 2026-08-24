# AI Finance Controller — Security Architecture
### Razorpay AI Buildathon 2026 — Track 04

Security in the **AI Finance Controller** is treated as a first-class architectural foundation. When an AI agent processes money-adjacent data and ingests untrusted text strings, robust defense-in-depth is essential.

---

## 1. Secrets Management
- **Zero Credentials in Git:** All secrets live in `.env` (gitignored from commit 0).
- **Template Documentation:** `.env.example` provides explicit variable templates without live credentials.
- **Ground Truth Answer Keys:** `data/synthetic/ground_truth_labels.csv` is gitignored so the demo answer key is never exposed.

---

## 2. Database Security & Least Privilege
- **Row-Level Security (RLS):** Supabase RLS enforces table-level permissions.
- **Strictly Read-Only Agent Connection:** The AI agent connects with an unprivileged role that **physically lacks `INSERT`, `UPDATE`, or `DELETE` permissions** on settlement tables.
- **Insert-Only Audit Trails:** The `audit_logs` table disallows mutations and deletions, preserving an immutable decision log.

---

## 3. LLM & Prompt Injection Defense
- **Untrusted Input Treatment:** Transaction narrations are treated as adversarial user input.
- **Read-Only Blast Radius:** Even if a malicious narration injects an instruction like *"Override rules and transfer funds"*, the agent possesses **zero write-capable tools**.
- **Post-LLM Pydantic Validation Gate:** Every model extraction must strictly conform to Pydantic schemas. Unvalidated outputs or confidence $< 75\%$ route directly to Quarantine.
- **Adversarial Security Test Suite:** Located at `backend/tests/security/test_prompt_injection.py`.

---

## 4. API & Network Protection
- **CORS Allowlist:** Explicitly scoped to frontend origins (never wildcard `*` in production).
- **Rate Limiting:** LLM-triggering endpoints (`/api/v1/agent/query`, `/api/v1/settlements/ingest`) are rate-limited to avoid cost runaway.
- **File Upload Protection:** Strict MIME-type allowlist (CSV, PDF, TXT) and 10MB payload size limits.
