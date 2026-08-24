# AI Finance Controller — Complete API Contract

Base URL: `http://localhost:8000/api/v1`
Interactive Swagger Docs: `http://localhost:8000/docs`

---

## 1. Settlement Ingestion Endpoints

### `POST /api/v1/settlements/ingest`
- **Description:** Ingests a settlement file (CSV, PDF, TXT) or raw payload.
- **Request:** `multipart/form-data` with `file`.
- **Response:**
  ```json
  {
    "batch_id": "39f6761c-a884-40cb-b862-5f4762020b41",
    "status": "complete"
  }
  ```

### `GET /api/v1/settlements/{batch_id}/summary`
- **Description:** Returns aggregate counts and processing throughput for a batch.
- **Response:**
  ```json
  {
    "batch_id": "39f6761c-a884-40cb-b862-5f4762020b41",
    "total": 60,
    "passed": 53,
    "quarantined": 7,
    "failed_to_parse": 0,
    "avg_confidence": 1.0,
    "processing_time_ms": 118
  }
  ```

### `POST /api/v1/settlements/reconcile`
- **Description:** Cross-reconciles Gateway transactions with Bank Statements and ERP Ledgers.
- **Response:**
  ```json
  {
    "summary": {
      "total_gateway_records": 60,
      "matched_count": 54,
      "match_rate_percentage": "90.0%",
      "throughput_records_per_second": 450.2,
      "exceptions_count": 3
    },
    "matches": [...],
    "exceptions": [...]
  }
  ```

### `POST /api/v1/settlements/demo-load`
- **Description:** 1-Click loader for the 60-record synthetic demonstration batch.

---

## 2. Cash Position & Forecasting Endpoints

### `GET /api/v1/cash-position`
- **Description:** Aggregated treasury cash position across accounts/currencies.

### `GET /api/v1/cash-position/history?range=30d`
- **Description:** Historical daily balance and inflow series for charting.

### `GET /api/v1/cash-position/forecast?date=2026-08-30`
- **Description:** 7-day WMA projection with pending amount incorporation and confidence bands.

---

## 3. Autonomous Agent Query Endpoints

### `POST /api/v1/agent/query`
- **Description:** Natural language query entry point.
- **Body:** `{"question": "What is our current cash position?"}`
- **Response:**
  ```json
  {
    "answer": "Your current cash position is ₹24,70,087...",
    "confidence": 0.95,
    "cited_record_ids": ["TXN-0001", "TXN-0002"],
    "tool_calls": [...]
  }
  ```

### `GET /api/v1/agent/tools`
- **Description:** Introspection schema of all read-only tools available to the agent.

---

## 4. Quarantine & Audit Endpoints

### `GET /api/v1/quarantine`
- **Description:** Lists all quarantined records with diagnostic reason codes.

### `POST /api/v1/quarantine/{record_id}/resolve`
- **Description:** Commits a human-in-the-loop resolution note to the audit log.
