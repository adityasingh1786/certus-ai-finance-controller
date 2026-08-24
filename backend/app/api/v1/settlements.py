"""
AI Finance Controller — Settlement Ingestion & Reconciliation API Routes

POST /api/v1/settlements/ingest — upload file, get batch_id
GET  /api/v1/settlements/{batch_id}/status — poll processing
GET  /api/v1/settlements/{batch_id}/summary — get results
GET  /api/v1/settlements/{batch_id}/records — list records
POST /api/v1/settlements/reconcile — run multi-source reconciliation
POST /api/v1/settlements/demo-load — 1-click demo dataset loader
"""

import os
import csv
from fastapi import APIRouter, UploadFile, File, Request, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


def _get_synthetic_data_dir() -> str:
    """Finds the data/synthetic directory reliably across testing and production."""
    candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../data/synthetic")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/synthetic")),
        os.path.abspath("data/synthetic"),
        os.path.abspath("../data/synthetic"),
    ]
    for c in candidates:
        if os.path.exists(c) and os.path.isdir(c):
            return c
    return candidates[0]


@router.post("/ingest")
async def ingest_settlement(request: Request, file: UploadFile = File(...)):
    """
    Accept a settlement file (CSV, PDF, text, JSON).
    Returns a batch_id immediately. Processing is async.
    """
    ingestion_service = request.app.state.ingestion_service

    allowed_extensions = {".csv", ".txt", ".json", ".pdf"}
    filename = file.filename or "unknown"
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {allowed_extensions}"
        )

    content = await file.read()
    max_size = 10 * 1024 * 1024
    if len(content) > max_size:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({len(content)} bytes). Maximum: {max_size} bytes."
        )

    result = await ingestion_service.ingest_file(
        file_content=content,
        filename=filename,
        content_type=file.content_type or "application/octet-stream",
    )

    return result


@router.get("/{batch_id}/status")
async def get_batch_status(request: Request, batch_id: str):
    ingestion_service = request.app.state.ingestion_service
    batch = ingestion_service.get_batch_status(batch_id)

    if not batch:
        raise HTTPException(status_code=404, detail=f"Batch {batch_id} not found")

    return {
        "batch_id": batch_id,
        "status": batch["status"],
    }


@router.get("/{batch_id}/summary")
async def get_batch_summary(request: Request, batch_id: str):
    ingestion_service = request.app.state.ingestion_service
    summary = ingestion_service.get_batch_summary(batch_id)

    if not summary:
        raise HTTPException(status_code=404, detail=f"Batch {batch_id} not found")

    return summary


@router.get("/{batch_id}/records")
async def get_batch_records(request: Request, batch_id: str):
    ingestion_service = request.app.state.ingestion_service
    records = ingestion_service.get_batch_records(batch_id)
    return {"batch_id": batch_id, "count": len(records), "records": records}


def _get_production_data_dir() -> str:
    """Finds the data/production directory reliably across testing and production."""
    candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../data/production")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/production")),
        os.path.abspath("data/production"),
        os.path.abspath("../data/production"),
    ]
    for c in candidates:
        if os.path.exists(c) and os.path.isdir(c):
            return c
    return _get_synthetic_data_dir()


@router.post("/reconcile")
async def run_multi_source_reconciliation(request: Request):
    """
    Cross-checks Gateway vs Bank Statements vs ERP Ledgers.
    Returns match rate, throughput, matched pairs, and exception list.
    """
    ingestion_service = request.app.state.ingestion_service
    reconciliation_engine = request.app.state.reconciliation_engine

    gateway_records = ingestion_service.get_all_records()

    # Load production or synthetic bank and ERP records for reconciliation
    prod_dir = _get_production_data_dir()
    synth_dir = _get_synthetic_data_dir()

    bank_csv = os.path.join(prod_dir, "bank_statement_hdfc_icici.csv")
    if not os.path.exists(bank_csv):
        bank_csv = os.path.join(synth_dir, "bank_statement.csv")

    erp_csv = os.path.join(prod_dir, "erp_general_ledger_tally_sap.csv")
    if not os.path.exists(erp_csv):
        erp_csv = os.path.join(synth_dir, "erp_ledger.csv")

    bank_records = []
    if os.path.exists(bank_csv):
        with open(bank_csv, "r", encoding="utf-8") as f:
            bank_records = list(csv.DictReader(f))

    erp_records = []
    if os.path.exists(erp_csv):
        with open(erp_csv, "r", encoding="utf-8") as f:
            erp_records = list(csv.DictReader(f))

    results = reconciliation_engine.reconcile_sources(
        gateway_records=gateway_records,
        bank_records=bank_records,
        erp_records=erp_records,
    )
    return results


@router.post("/demo-load")
async def load_demo_dataset(request: Request):
    """
    1-Click production & benchmark dataset loader for live presentations and testing.
    Loads real production-spec Razorpay settlement batches with MDR, GST, and TDS breakdowns.
    """
    ingestion_service = request.app.state.ingestion_service
    prod_dir = _get_production_data_dir()
    synth_dir = _get_synthetic_data_dir()

    batch_path = os.path.join(prod_dir, "razorpay_settlement_recon_combined.csv")
    filename = "razorpay_settlement_recon_combined.csv"

    if not os.path.exists(batch_path):
        batch_path = os.path.join(synth_dir, "full_batch.csv")
        filename = "full_batch.csv"

    if not os.path.exists(batch_path):
        raise HTTPException(status_code=404, detail=f"Settlement dataset not found at {batch_path}")

    with open(batch_path, "rb") as f:
        content = f.read()

    result = await ingestion_service.ingest_file(
        file_content=content,
        filename=filename,
        content_type="text/csv",
    )

    batch_id = result["batch_id"]
    summary = ingestion_service.get_batch_summary(batch_id)
    return {
        "message": "Production-spec settlement dataset loaded successfully",
        "batch_id": batch_id,
        "summary": summary,
    }
