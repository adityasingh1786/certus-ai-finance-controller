"""
AI Finance Controller — 3-File Drop-and-Go Reconciliation Endpoint

Supports:
1. POST /api/v1/reconcile — Accepts 3 multipart CSV files (gateway, bank, ERP)
2. POST /api/v1/reconcile/demo — Instant 1-click execution using built-in synthetic datasets
3. GET  /api/v1/reconcile/{run_id} — Fetch past reconciliation run summary
"""

import csv
import io
import json
from decimal import Decimal
from pathlib import Path
from uuid import uuid4
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from pydantic import BaseModel

from app.services.column_detector import column_detector
from app.services.reconciliation_service import MultiSourceReconciliationEngine
from app.services.consensus_relay import consensus_relay
from app.db.session import SessionLocal
from app.models.orm import ReconciliationRunModel

router = APIRouter()
reconciliation_engine = MultiSourceReconciliationEngine()

# In-memory store for fast read cache
_RUN_STORE: Dict[str, Dict[str, Any]] = {}


def _save_run_to_db(payload: dict):
    """Persist reconciliation run summary and results to SQLite."""
    try:
        with SessionLocal() as db:
            summary = payload.get("summary", {})
            run = ReconciliationRunModel(
                run_id=payload["run_id"],
                total_records=summary.get("total_records", 0),
                matched_count=summary.get("matched", 0),
                mismatched_count=summary.get("mismatched", 0),
                missing_count=summary.get("missing", 0),
                duplicate_count=summary.get("duplicates", 0),
                match_rate=Decimal(str(summary.get("match_rate", 0.0))),
                avg_confidence=Decimal(str(summary.get("avg_confidence", 0.0))),
                results_json=json.dumps(payload.get("results", [])),
                summary_json=json.dumps(summary),
            )
            db.add(run)
            db.commit()
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Failed to persist reconciliation run to DB: {e}")


def _parse_csv_bytes(file_bytes: bytes) -> List[Dict[str, Any]]:
    """Decodes raw file bytes and returns list of row dicts."""
    try:
        content = file_bytes.decode("utf-8-sig")  # handle BOM gracefully
    except UnicodeDecodeError:
        content = file_bytes.decode("latin-1", errors="replace")

    reader = csv.DictReader(io.StringIO(content))
    return [row for row in reader if any(row.values())]


def _load_demo_file(relative_path: str) -> List[Dict[str, Any]]:
    """Loads bundled synthetic CSV from disk."""
    base_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
    file_path = base_dir / "data" / "synthetic" / relative_path

    if not file_path.exists():
        # Try alternate path relative to backend
        file_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "synthetic" / relative_path

    if not file_path.exists():
        raise FileNotFoundError(f"Synthetic file not found at {file_path}")

    with open(file_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        return [row for row in reader if any(row.values())]


@router.post("/reconcile")
async def reconcile_three_files(
    gateway_file: UploadFile = File(..., description="Razorpay Gateway CSV extract"),
    bank_file: UploadFile = File(..., description="Bank Statement CSV extract"),
    erp_file: UploadFile = File(..., description="Accounting / ERP Ledger CSV extract"),
):
    """
    Core Drop-and-Go Endpoint:
    Accepts 3 heterogeneous CSV files, dynamically detects column structures,
    normalizes all entries, executes the double-lock reconciliation engine,
    and classifies every record as Matched, Mismatched, Missing, or Duplicate.
    """
    # 1. Read files
    try:
        gw_bytes = await gateway_file.read()
        bank_bytes = await bank_file.read()
        erp_bytes = await erp_file.read()

        raw_gateway = _parse_csv_bytes(gw_bytes)
        raw_bank = _parse_csv_bytes(bank_bytes)
        raw_erp = _parse_csv_bytes(erp_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse uploaded CSV files: {str(e)}")

    if not raw_gateway:
        raise HTTPException(status_code=400, detail="Gateway file is empty or missing headers.")

    # 2. Dynamic column detection & unified normalization
    normalized_gateway = column_detector.normalize_records(raw_gateway, source_label="gateway")
    normalized_bank = column_detector.normalize_records(raw_bank, source_label="bank_statement")
    normalized_erp = column_detector.normalize_records(raw_erp, source_label="erp_ledger")

    # 3. Run reconciliation engine
    run_id = f"run_{uuid4().hex[:12]}"
    recon_output = reconciliation_engine.reconcile_sources(
        gateway_records=normalized_gateway,
        bank_records=normalized_bank,
        erp_records=normalized_erp,
    )

    response_payload = {
        "run_id": run_id,
        "summary": recon_output["summary"],
        "results": recon_output["results"],
        "exceptions": recon_output["exceptions"],
        "column_mappings": {
            "gateway": column_detector.detect_mapping(raw_gateway),
            "bank": column_detector.detect_mapping(raw_bank),
            "erp": column_detector.detect_mapping(raw_erp),
        },
    }

    _RUN_STORE[run_id] = response_payload
    _save_run_to_db(response_payload)
    return response_payload


from app.services.dataset_registry import (
    SCENARIO_CATALOG,
    generate_vast_4_channel_dataset,
    get_scenario_manifest,
)
from fastapi import Query


@router.get("/reconcile/scenarios")
async def get_scenario_catalog():
    """Returns the catalog of 20 hyper-realistic enterprise financial scenarios."""
    return {"total_scenarios": len(SCENARIO_CATALOG), "scenarios": SCENARIO_CATALOG}


@router.post("/reconcile/demo")
async def reconcile_demo_dataset(
    request: Request,
    scenario_id: Optional[int] = Query(None, description="Optional Scenario ID (1..20). If omitted, randomly picks a scenario."),
):
    """
    1-Click Demo Endpoint:
    Dynamically generates and reconciles one of the 20 vast enterprise scenarios across 4 channels.
    """
    # 1. Generate or load 4-channel dataset
    dataset = generate_vast_4_channel_dataset(scenario_id=scenario_id)
    raw_gateway = dataset["gateway_records"]
    raw_bank = dataset["bank_records"]
    raw_erp = dataset["erp_records"]

    # 2. Normalize through dynamic column pipeline
    normalized_gateway = column_detector.normalize_records(raw_gateway, source_label="gateway")
    normalized_bank = column_detector.normalize_records(raw_bank, source_label="bank_statement")
    normalized_erp = column_detector.normalize_records(raw_erp, source_label="erp_ledger")

    # 3. Execute 3-way reconciliation engine
    run_id = f"demo_run_{dataset['scenario_id']:02d}_{uuid4().hex[:8]}"
    recon_output = reconciliation_engine.reconcile_sources(
        gateway_records=normalized_gateway,
        bank_records=normalized_bank,
        erp_records=normalized_erp,
    )

    # 4. Sync records into ingestion & quarantine services if available in state
    try:
        if hasattr(request.app.state, "ingestion_service") and request.app.state.ingestion_service:
            ing_svc = request.app.state.ingestion_service
            ing_svc.records[run_id] = normalized_gateway
            ing_svc.quarantine_records = dataset["quarantine_records"]
    except Exception:
        pass

    response_payload = {
        "run_id": run_id,
        "is_demo": True,
        "scenario_id": dataset["scenario_id"],
        "scenario_name": dataset["scenario_name"],
        "sector": dataset["sector"],
        "primary_bank": dataset["primary_bank"],
        "erp_system": dataset["erp_system"],
        "description": dataset["description"],
        "channel_counts": dataset["record_counts"],
        "summary": recon_output["summary"],
        "results": recon_output["results"],
        "matches": recon_output.get("matches", []),
        "exceptions": recon_output["exceptions"] + dataset.get("quarantine_records", []),
        "column_mappings": {
            "gateway": column_detector.detect_mapping(raw_gateway),
            "bank": column_detector.detect_mapping(raw_bank),
            "erp": column_detector.detect_mapping(raw_erp),
        },
    }

    _RUN_STORE[run_id] = response_payload
    _save_run_to_db(response_payload)
    return response_payload


@router.get("/reconcile/{run_id}")
async def get_reconciliation_run(run_id: str):
    """Retrieve historical reconciliation run result by run_id."""
    if run_id in _RUN_STORE:
        return _RUN_STORE[run_id]

    try:
        with SessionLocal() as db:
            run = db.query(ReconciliationRunModel).filter_by(run_id=run_id).first()
            if run:
                return {
                    "run_id": run.run_id,
                    "summary": json.loads(run.summary_json) if run.summary_json else {},
                    "results": json.loads(run.results_json) if run.results_json else [],
                    "created_at": run.created_at.isoformat() if run.created_at else None,
                }
    except Exception:
        pass

    raise HTTPException(status_code=404, detail=f"Reconciliation run '{run_id}' not found.")
