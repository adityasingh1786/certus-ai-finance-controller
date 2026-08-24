"""
Phase 3 Tests: SQLite Database Persistence & Server Restart Durability
"""

import pytest
from app.db.session import SessionLocal, init_db
from app.models.orm import (
    BatchModel,
    SettlementRecordModel,
    QuarantineRecordModel,
    AuditLogModel,
    ReconciliationRunModel,
)
from app.services.ingestion_service import IngestionService
from app.services.column_detector import column_detector
from app.services.reconciliation_service import MultiSourceReconciliationEngine
from app.api.v1.reconcile import _save_run_to_db, _RUN_STORE


@pytest.fixture(autouse=True)
def ensure_db():
    init_db()


class TestSQLitePersistence:
    """Verify that records, batches, and reconciliation runs are persisted in SQLite."""

    @pytest.mark.asyncio
    async def test_batch_and_record_persistence_survives_memory_clear(self):
        service = IngestionService()
        csv_data = (
            b"transaction_id,merchant_id,gross_amount,fee,tax,net_amount,settlement_date,currency,payment_method,status\n"
            b"TXN_PERSIST_101,MRCH001,5000.00,100.00,18.00,4882.00,2026-08-16,INR,UPI,settled\n"
            b"TXN_PERSIST_102,MRCH001,3000.00,60.00,10.80,2929.20,2026-08-16,INR,UPI,settled\n"
        )

        res = await service.ingest_file(
            file_content=csv_data,
            filename="persist_test.csv",
            content_type="text/csv",
        )
        batch_id = res["batch_id"]

        # Simulate server restart by creating a completely fresh service instance with empty in-memory dicts
        fresh_service = IngestionService()
        assert len(fresh_service.records) == 0

        # Query records through the new instance — should load from SQLite DB
        records = fresh_service.get_batch_records(batch_id)
        assert len(records) == 2
        txn_ids = {r["transaction_id"] for r in records}
        assert "TXN_PERSIST_101" in txn_ids
        assert "TXN_PERSIST_102" in txn_ids

    def test_reconciliation_run_persistence(self):
        run_id = "test_run_persist_999"
        mock_payload = {
            "run_id": run_id,
            "summary": {
                "total_records": 10,
                "matched": 8,
                "mismatched": 1,
                "missing": 1,
                "duplicates": 0,
                "match_rate": 0.8,
                "avg_confidence": 0.94,
            },
            "results": [
                {"record_id": "TXN_001", "status": "Matched", "reason": "Exact UTR match"}
            ],
        }

        # Save to DB
        _save_run_to_db(mock_payload)

        # Clear in-memory cache
        if run_id in _RUN_STORE:
            del _RUN_STORE[run_id]

        # Verify record exists in SQLite
        with SessionLocal() as db:
            saved = db.query(ReconciliationRunModel).filter_by(run_id=run_id).first()
            assert saved is not None
            assert saved.matched_count == 8
            assert saved.total_records == 10
            assert float(saved.match_rate) == 0.8

    @pytest.mark.asyncio
    async def test_quarantine_and_audit_persist_across_restart(self):
        service = IngestionService()
        # Ingest record with negative amount (guaranteed Layer 1 quarantine)
        bad_csv = (
            b"transaction_id,merchant_id,gross_amount,fee,tax,net_amount,settlement_date,currency,payment_method,status\n"
            b"TXN_BAD_999,MRCH001,-5000.00,0,0,-5000.00,2026-08-16,INR,UPI,settled\n"
        )
        res = await service.ingest_file(
            file_content=bad_csv,
            filename="bad_file.csv",
            content_type="text/csv",
        )
        batch_id = res["batch_id"]

        # Simulate fresh process restart
        fresh_service = IngestionService()
        assert len(fresh_service.quarantine_records) == 0

        # Query quarantine from SQLite via the fresh instance
        q_records = fresh_service.get_quarantine_records(batch_id=batch_id)
        assert len(q_records) >= 1
        assert q_records[0]["reason_code"] == "IMPOSSIBLE_VALUE"

        # Query audit log from SQLite via the fresh instance
        audit_logs = fresh_service.get_audit_log(record_id="TXN_BAD_999")
        assert len(audit_logs) >= 1

    def test_explicit_paise_declared_unit_conversion(self):
        service = IngestionService()
        # Explicit paise declaration
        raw_paise = {
            "transaction_id": "TXN_PAISE_01",
            "gross_amount": 150000, # 1,50,000 paise = 1,500.00 INR
            "fee": 3000,
            "tax": 540,
            "currency_unit": "paise",
            "settlement_date": "2026-08-16",
        }
        normalized = service._normalize_record(raw_paise, "batch_1")
        assert float(normalized["gross_amount"]) == 1500.00
        assert float(normalized["fee"]) == 30.00

        # Standard rupee without paise declaration — NEVER guessed or divided
        raw_rupee = {
            "transaction_id": "TXN_RUPEE_01",
            "gross_amount": 150000, # 1,50,000 INR
            "settlement_date": "2026-08-16",
        }
        normalized_rupee = service._normalize_record(raw_rupee, "batch_2")
        assert float(normalized_rupee["gross_amount"]) == 150000.00
