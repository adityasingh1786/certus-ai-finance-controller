"""
Phase 2 Tests: Dynamic Column Detection & 3-File Drop-and-Go Workflow
"""

import io
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.column_detector import column_detector, ColumnDetector
from app.services.reconciliation_service import MatchStatus


@pytest.fixture
def client():
    return TestClient(app)


class TestDynamicColumnDetector:
    """Verify that arbitrary CSV headers get mapped to canonical fields."""

    def test_detect_mapping_standard_headers(self):
        detector = ColumnDetector()
        rows = [
            {
                "transaction_id": "TXN_101",
                "gross_amount": "50000.00",
                "fee": "1000.00",
                "tax": "180.00",
                "net_amount": "48820.00",
                "settlement_date": "2026-08-16",
                "merchant_name": "Acme Retail",
            }
        ]
        mapping = detector.detect_mapping(rows)
        assert mapping.get("amount") in ("net_amount", "gross_amount")
        assert mapping.get("date") == "settlement_date"
        assert mapping.get("reference") == "transaction_id"
        assert mapping.get("merchant") == "merchant_name"

    def test_detect_mapping_messy_bank_statement_headers(self):
        detector = ColumnDetector()
        rows = [
            {
                "Txn Date": "16/08/2026",
                "Chq/Ref No": "UTIB86846326096",
                "Credit Amount": "47261.75",
                "Particulars": "CR UTIB86846326096 RAZORPAY SETTLEMENT",
            }
        ]
        mapping = detector.detect_mapping(rows)
        assert mapping.get("date") == "Txn Date"
        assert mapping.get("reference") == "Chq/Ref No"
        assert mapping.get("amount") == "Credit Amount"
        assert mapping.get("narration") == "Particulars"

    def test_detect_mapping_erp_ledger_headers(self):
        detector = ColumnDetector()
        rows = [
            {
                "Voucher Date": "2026-08-16",
                "Voucher No": "INV-7912-132",
                "Party Name": "FreshMart Groceries",
                "Gross Invoice Value": "48698.35",
                "Razorpay Order ID": "order_180929449cc1",
            }
        ]
        mapping = detector.detect_mapping(rows)
        assert mapping.get("date") == "Voucher Date"
        assert mapping.get("invoice_number") == "Voucher No" or mapping.get("reference") == "Voucher No"
        assert mapping.get("merchant") == "Party Name"
        assert mapping.get("amount") == "Gross Invoice Value" or mapping.get("gross_amount") == "Gross Invoice Value"

    def test_normalize_records_preserves_canonical_structure(self):
        detector = ColumnDetector()
        raw = [
            {
                "Txn Date": "2026-08-16",
                "Ref Number": "UTR999888777",
                "Deposit": "15,200.50",
                "Party": "Test Vendor",
            }
        ]
        norm = detector.normalize_records(raw, source_label="bank_statement")
        assert len(norm) == 1
        r = norm[0]
        assert r["settlement_date"] == "2026-08-16"
        assert r["utr_number"] == "UTR999888777"
        assert float(r["net_amount"]) == 15200.50
        assert r["merchant_name"] == "Test Vendor"


class TestReconciliationEndpoints:
    """Test 3-file upload and 1-click demo reconciliation APIs."""

    def test_demo_reconcile_endpoint(self, client):
        response = client.post("/api/v1/reconcile/demo")
        assert response.status_code == 200
        data = response.json()

        assert "run_id" in data
        assert "summary" in data
        assert "results" in data
        assert "column_mappings" in data

        summary = data["summary"]
        assert summary["total_records"] > 0
        assert summary["matched"] > 0
        assert "match_rate_percentage" in summary
        assert "throughput_records_per_second" in summary

        # Check that results map to 4-label vocabulary
        valid_statuses = {MatchStatus.MATCHED, MatchStatus.MISMATCHED, MatchStatus.MISSING, MatchStatus.DUPLICATE}
        for item in data["results"]:
            assert item["status"] in valid_statuses
            assert "reason" in item
            assert len(item["reason"]) > 5

    def test_three_file_upload_endpoint(self, client):
        gw_csv = (
            "transaction_id,utr_number,net_amount,gross_amount,settlement_date,merchant_name\n"
            "TXN-1,UTIB123456789,10000.00,10000.00,2026-08-16,Alpha Store\n"
            "TXN-2,UTIB999999999,5000.00,5000.00,2026-08-16,Beta Store\n"
        )
        bank_csv = (
            "Chq/Ref No,Deposit Amount,Value Date,Particulars\n"
            "UTIB123456789,10000.00,2026-08-16,CR UTIB123456789 RAZORPAY\n"
            "UTIB999999999,4800.00,2026-08-16,CR UTIB999999999 RAZORPAY\n"  # Amount mismatch
        )
        erp_csv = (
            "Invoice No,Gross Value,Invoice Date,Party Name\n"
            "INV-01,10000.00,2026-08-16,Alpha Store\n"
            "INV-02,5000.00,2026-08-16,Beta Store\n"
        )

        files = {
            "gateway_file": ("gateway.csv", io.BytesIO(gw_csv.encode("utf-8")), "text/csv"),
            "bank_file": ("bank.csv", io.BytesIO(bank_csv.encode("utf-8")), "text/csv"),
            "erp_file": ("erp.csv", io.BytesIO(erp_csv.encode("utf-8")), "text/csv"),
        }

        response = client.post("/api/v1/reconcile", files=files)
        assert response.status_code == 200
        data = response.json()

        assert data["summary"]["total_records"] >= 2
        # TXN-1 should match
        txn1 = next((r for r in data["results"] if r["record_id"] == "TXN-1"), None)
        assert txn1 is not None
        assert txn1["status"] == MatchStatus.MATCHED

    def test_get_past_reconciliation_run(self, client):
        # 1. Run demo to generate run_id
        demo_resp = client.post("/api/v1/reconcile/demo")
        assert demo_resp.status_code == 200
        run_id = demo_resp.json()["run_id"]

        # 2. Fetch by run_id
        fetch_resp = client.get(f"/api/v1/reconcile/{run_id}")
        assert fetch_resp.status_code == 200
        assert fetch_resp.json()["run_id"] == run_id
