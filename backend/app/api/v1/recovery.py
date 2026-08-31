"""
Certus AI Finance Controller — Revenue Recovery & Baseline API Routes

POST /api/v1/recovery/run           — Run full recovery pipeline on quarantine records
GET  /api/v1/recovery/cases         — List all recovery cases
GET  /api/v1/recovery/stats         — Recovery statistics + memory snapshot
GET  /api/v1/recovery/memory        — Adaptive memory state
POST /api/v1/recovery/compliance    — Run compliance check on a proposed action
POST /api/v1/baseline/compare       — Run baseline vs AI comparison
GET  /api/v1/baseline/run           — Run baseline reconciliation only
GET  /api/v1/compliance/summary     — Compliance engine summary
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from app.services.revenue_recovery_engine import RevenueRecoveryEngine
from app.services.compliance_engine import ComplianceEngine, RecoveryAction
from app.services.recovery_memory import recovery_memory
from app.services.baseline_reconciler import BaselineReconciler, run_comparison
from app.services.operational_state_service import state_manager

router = APIRouter()

# Singletons
_compliance_engine = ComplianceEngine()
_recovery_engine = RevenueRecoveryEngine(
    compliance_engine=_compliance_engine,
    memory=recovery_memory,
)
_baseline_reconciler = BaselineReconciler()


# ============================================================
# RECOVERY PIPELINE ENDPOINTS
# ============================================================

@router.post("/recovery/run")
async def run_recovery_pipeline(request: Request):
    """
    Run the full autonomous recovery pipeline on all unresolved
    quarantine records. Processes: Detection → Diagnosis → Strategy
    → Compliance Gate → Execution → Memory Update.
    """
    # Get quarantine records from the state manager
    snapshot = state_manager.get_quarantine_snapshot()
    quarantine_records = snapshot.get("records", [])

    if not quarantine_records:
        return {
            "status": "NO_RECORDS",
            "message": "No quarantine records to process. Run a reconciliation first.",
            "total_detected": 0,
        }

    # Run the recovery pipeline
    results = _recovery_engine.process_quarantine_batch(quarantine_records)
    return results


@router.get("/recovery/cases")
async def list_recovery_cases(request: Request, status: Optional[str] = None):
    """List all recovery cases — active and completed."""
    active = _recovery_engine.get_active_cases()
    completed = _recovery_engine.get_completed_cases()

    all_cases = active + completed
    if status:
        all_cases = [c for c in all_cases if c.get("status") == status.upper()]

    return {
        "total": len(all_cases),
        "active": len(active),
        "completed": len(completed),
        "cases": all_cases,
    }


@router.get("/recovery/stats")
async def get_recovery_stats(request: Request):
    """
    Aggregate recovery statistics including:
    - Total cases processed, recovered, escalated, stopped
    - Total amount at risk vs recovered
    - Recovery rate
    - Adaptive memory snapshot
    - Compliance violation count (always 0 — gate blocks all)
    """
    return _recovery_engine.get_recovery_stats()


@router.get("/recovery/memory")
async def get_recovery_memory(request: Request):
    """
    Inspect the adaptive recovery memory state.
    Shows strategy effectiveness per exception type.
    """
    return recovery_memory.get_full_memory_snapshot()


class ComplianceCheckRequest(BaseModel):
    action: str = Field(..., description="Recovery action to verify")
    record_id: str = Field(..., description="Quarantine record ID")


@router.post("/recovery/compliance-check")
async def check_compliance(request: Request, body: ComplianceCheckRequest):
    """
    Run a compliance check on a proposed recovery action
    WITHOUT executing it. Useful for preview/dry-run.
    """
    try:
        action = RecoveryAction(body.action)
    except ValueError:
        valid_actions = [a.value for a in RecoveryAction]
        raise HTTPException(
            status_code=400,
            detail=f"Invalid action '{body.action}'. Valid actions: {valid_actions}",
        )

    # Find the record
    snapshot = state_manager.get_quarantine_snapshot()
    record = None
    for rec in snapshot.get("records", []):
        if rec.get("record_id") == body.record_id or rec.get("transaction_id") == body.record_id:
            record = rec
            break

    if not record:
        raise HTTPException(status_code=404, detail=f"Record {body.record_id} not found")

    result = _compliance_engine.verify_recovery_action(
        action=action,
        record=record,
        attempt_count=0,
    )

    return {
        "action": action.value,
        "record_id": body.record_id,
        "approved": result.approved,
        "checks": [
            {
                "rule_id": r.rule_id,
                "status": r.status.value,
                "category": r.category.value,
                "citation": r.regulatory_citation,
                "detail": r.reason_detail,
                "recommended_action": r.recommended_action,
            }
            for r in result.results
        ],
        "idempotency_key": result.idempotency_key,
    }


@router.get("/compliance/summary")
async def compliance_summary(request: Request):
    """
    Get the compliance engine summary — regulatory frameworks,
    total actions processed, compliance rate.
    """
    return _compliance_engine.get_compliance_summary()


# ============================================================
# BASELINE COMPARISON ENDPOINTS
# ============================================================

@router.get("/baseline/run")
async def run_baseline(request: Request):
    """
    Run the naive baseline reconciler on the current dataset.
    Returns metrics for comparison with the full Certus engine.
    """
    # Get records from state manager
    payload = state_manager.get_full_reconciliation_payload()
    results = payload.get("results", [])

    if not results:
        return {
            "status": "NO_DATA",
            "message": "No reconciliation data available. Run a reconciliation first.",
        }

    # Split records by source type for baseline processing
    gateway_records = []
    bank_records = []
    erp_records = []

    for rec in results:
        source = rec.get("source", "")
        if source in ("razorpay_gateway", "gateway"):
            gateway_records.append(rec)
        elif source in ("bank_statement", "bank"):
            bank_records.append(rec)
        elif source in ("erp_ledger", "erp"):
            erp_records.append(rec)
        else:
            # Default: treat as gateway record
            gateway_records.append(rec)

    # If we don't have clear source separation, use all records
    # and let the baseline do its best
    if not bank_records:
        bank_records = results  # Baseline will match against itself

    baseline_results = _baseline_reconciler.reconcile(
        gateway_records=gateway_records or results,
        bank_records=bank_records,
        erp_records=erp_records or None,
    )

    return baseline_results


@router.post("/baseline/compare")
async def compare_baseline_vs_certus(request: Request):
    """
    Run a full side-by-side comparison between:
    1. Naive Baseline (exact-match only, no AI)
    2. Certus AI-Enhanced (fuzzy matching, weighted scoring, compliance gate)

    Proves that the AI adds measurable value.
    """
    # Get current reconciliation results (Certus engine)
    payload = state_manager.get_full_reconciliation_payload()
    results = payload.get("results", [])

    if not results:
        return {
            "status": "NO_DATA",
            "message": "No reconciliation data available. Run a reconciliation first.",
        }

    # Extract Certus summary metrics
    certus_summary = {
        "match_rate": payload.get("metrics", {}).get("match_rate", 0),
        "matched": payload.get("metrics", {}).get("matched", 0),
        "exceptions": payload.get("metrics", {}).get("quarantined", 0),
        "processing_time_ms": payload.get("metrics", {}).get("processing_time_ms", 0),
        "throughput_records_per_second": payload.get("metrics", {}).get("throughput_ops_per_sec", 0),
        "avg_confidence": payload.get("metrics", {}).get("avg_confidence", 0),
    }

    # Split records by source
    gateway_records = []
    bank_records = []
    erp_records = []
    for rec in results:
        source = rec.get("source", "")
        if source in ("razorpay_gateway", "gateway"):
            gateway_records.append(rec)
        elif source in ("bank_statement", "bank"):
            bank_records.append(rec)
        elif source in ("erp_ledger", "erp"):
            erp_records.append(rec)
        else:
            gateway_records.append(rec)

    if not bank_records:
        bank_records = results

    # Run comparison
    comparison = run_comparison(
        gateway_records=gateway_records or results,
        bank_records=bank_records,
        erp_records=erp_records or None,
        certus_results=certus_summary,
    )

    return comparison
