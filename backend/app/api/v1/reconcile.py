"""
AI Finance Controller — 3-File Drop-and-Go Reconciliation Endpoint

Supports:
1. POST /api/v1/reconcile — Accepts 3 multipart CSV files (gateway, bank, ERP)
2. POST /api/v1/reconcile/demo — Instant 1-click execution using standardized enterprise datasets (DS-01..DS-20)
3. GET  /api/v1/reconcile/{run_id} — Fetch past reconciliation run summary
4. GET  /api/v1/reconcile/scenarios — Fetch catalog of 20 standardized scenarios
"""

import csv
import io
import json
from decimal import Decimal
from pathlib import Path
from uuid import uuid4
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, UploadFile, File, HTTPException, Request, Query
from pydantic import BaseModel

from app.services.column_detector import column_detector
from app.services.reconciliation_service import MultiSourceReconciliationEngine
from app.services.dataset_registry import (
    SCENARIO_CATALOG,
    generate_vast_4_channel_dataset,
    get_scenario_manifest,
)
from app.services.operational_state_service import state_manager
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
                match_rate=Decimal(str(summary.get("match_rate", 0.0)).replace("%", "")),
                avg_confidence=Decimal(str(summary.get("confidence_score", 0.95))),
                results_json=json.dumps(payload.get("results", [])),
                summary_json=json.dumps(summary),
            )
            db.add(run)
            db.commit()
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Failed to persist reconciliation run to DB: {e}")


@router.get("/reconcile/scenarios")
async def get_scenario_catalog():
    """Returns the catalog of 20 standardized enterprise financial scenarios (DS-01 to DS-20)."""
    return {"total_scenarios": len(SCENARIO_CATALOG), "scenarios": SCENARIO_CATALOG}


import random


@router.post("/reconcile/demo")
async def reconcile_demo_dataset(
    request: Request,
    scenario_id: Optional[int] = Query(None, description="Standardized Scenario ID (1..20). If omitted, picks a random new scenario."),
):
    """
    1-Click Demo Endpoint:
    Atomically switches the central state machine to Dataset {scenario_id} (Code: {01..20})
    and returns the fully synchronized multi-stream state.
    """
    if scenario_id and 1 <= scenario_id <= 20:
        target_id = scenario_id
    else:
        current_active = getattr(state_manager, "_active_scenario_id", 1)
        available = [i for i in range(1, 21) if i != current_active]
        target_id = random.choice(available) if available else random.randint(1, 20)

    response_payload = state_manager.set_active_scenario(target_id)
    response_payload["is_demo"] = True

    _RUN_STORE[response_payload["run_id"]] = response_payload
    _save_run_to_db(response_payload)
    return response_payload


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
    try:
        gw_bytes = await gateway_file.read()
        bank_bytes = await bank_file.read()
        erp_bytes = await erp_file.read()

        def parse_csv(b):
            try:
                text = b.decode("utf-8-sig")
            except UnicodeDecodeError:
                text = b.decode("latin-1", errors="replace")
            return [row for row in csv.DictReader(io.StringIO(text)) if any(row.values())]

        raw_gateway = parse_csv(gw_bytes)
        raw_bank = parse_csv(bank_bytes)
        raw_erp = parse_csv(erp_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read CSV upload: {str(e)}")

    if not raw_gateway or not raw_bank or not raw_erp:
        raise HTTPException(status_code=422, detail="One or more uploaded CSV files are empty.")

    normalized_gateway = column_detector.normalize_records(raw_gateway, source_label="gateway")
    normalized_bank = column_detector.normalize_records(raw_bank, source_label="bank_statement")
    normalized_erp = column_detector.normalize_records(raw_erp, source_label="erp_ledger")

    run_id = f"RUN-UPLOAD-{uuid4().hex[:8]}"
    recon_output = reconciliation_engine.reconcile_sources(
        gateway_records=normalized_gateway,
        bank_records=normalized_bank,
        erp_records=normalized_erp,
    )

    response_payload = {
        "run_id": run_id,
        "is_demo": False,
        "summary": recon_output["summary"],
        "results": recon_output["results"],
        "matches": recon_output.get("matches", []),
        "exceptions": recon_output.get("exceptions", []),
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
