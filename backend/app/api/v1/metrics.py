"""
Prometheus Metrics Text Exposition Endpoint for Certus AI Finance Controller.
Exposes standard Prometheus metrics (Counters, Gauges, Histograms) for Grafana/Datadog scrapers.
"""

import time
from typing import Dict, Any
from fastapi import APIRouter, Response
from app.services.circuit_breaker import circuit_breaker_manager

router = APIRouter(tags=["Observability"])

# In-memory Prometheus metric accumulators
_metric_state: Dict[str, Any] = {
    "reconciled_matched": 0,
    "reconciled_quarantined": 0,
    "reconciled_partial": 0,
    "discrepancy_amount_paisa": 0,
    "amount_recovered_paisa": 0,
    "compliance_evaluations": 0,
    "compliance_blocked": 0,
    "reconciliation_runs": 0,
    "last_run_duration_seconds": 0.0,
    "total_run_duration_seconds": 0.0,
}


def record_reconciliation_telemetry(
    matched_count: int,
    quarantined_count: int,
    partial_count: int,
    discrepancy_paisa: int,
    recovered_paisa: int,
    compliance_checks: int,
    duration_seconds: float,
) -> None:
    """Updates telemetry metrics from a real reconciliation run."""
    _metric_state["reconciled_matched"] += matched_count
    _metric_state["reconciled_quarantined"] += quarantined_count
    _metric_state["reconciled_partial"] += partial_count
    _metric_state["discrepancy_amount_paisa"] += discrepancy_paisa
    _metric_state["amount_recovered_paisa"] += recovered_paisa
    _metric_state["compliance_evaluations"] += compliance_checks
    _metric_state["reconciliation_runs"] += 1
    _metric_state["last_run_duration_seconds"] = duration_seconds
    _metric_state["total_run_duration_seconds"] += duration_seconds


def generate_prometheus_exposition() -> str:
    """Formats in-memory state into official Prometheus text exposition format."""
    lines = [
        "# HELP certus_reconciliation_runs_total Total number of completed reconciliation runs.",
        "# TYPE certus_reconciliation_runs_total counter",
        f"certus_reconciliation_runs_total {_metric_state['reconciliation_runs']}",
        "",
        "# HELP certus_reconciled_records_total Total transactions processed categorized by reconciliation status.",
        "# TYPE certus_reconciled_records_total counter",
        f'certus_reconciled_records_total{{status="MATCHED"}} {_metric_state["reconciled_matched"]}',
        f'certus_reconciled_records_total{{status="QUARANTINED"}} {_metric_state["reconciled_quarantined"]}',
        f'certus_reconciled_records_total{{status="PARTIAL_MATCH"}} {_metric_state["reconciled_partial"]}',
        "",
        "# HELP certus_discrepancy_amount_paisa_total Total variance detected in integer paise.",
        "# TYPE certus_discrepancy_amount_paisa_total counter",
        f"certus_discrepancy_amount_paisa_total {_metric_state['discrepancy_amount_paisa']}",
        "",
        "# HELP certus_amount_recovered_paisa_total Total revenue recovered via autonomous pipeline in integer paise.",
        "# TYPE certus_amount_recovered_paisa_total counter",
        f"certus_amount_recovered_paisa_total {_metric_state['amount_recovered_paisa']}",
        "",
        "# HELP certus_compliance_evaluations_total Total regulatory compliance rules evaluated.",
        "# TYPE certus_compliance_evaluations_total counter",
        f"certus_compliance_evaluations_total {_metric_state['compliance_evaluations']}",
        "",
        "# HELP certus_reconciliation_duration_seconds_last Duration of the last reconciliation run in seconds.",
        "# TYPE certus_reconciliation_duration_seconds_last gauge",
        f"certus_reconciliation_duration_seconds_last {_metric_state['last_run_duration_seconds']:.4f}",
        "",
        "# HELP certus_circuit_breaker_tripped_total Total number of times LLM provider circuit breakers have tripped.",
        "# TYPE certus_circuit_breaker_tripped_total counter",
    ]

    # Pull live circuit breaker metrics
    cb_metrics = circuit_breaker_manager.get_metrics()
    for provider, data in cb_metrics.items():
        trips = data.get("total_trips", 0)
        state = data.get("state", "CLOSED")
        lines.append(f'certus_circuit_breaker_tripped_total{{provider="{provider}"}} {trips}')
        lines.append(f'certus_circuit_breaker_state{{provider="{provider}",state="{state}"}} 1')

    lines.append("")
    return "\n".join(lines)


@router.get(
    "/metrics",
    summary="Prometheus Metrics Exposition",
    response_class=Response,
)
def get_prometheus_metrics():
    """
    Returns Prometheus metrics in standard text exposition format (version 0.0.4).
    Scraped by Prometheus, Grafana Agent, or Datadog.
    """
    body = generate_prometheus_exposition()
    return Response(
        content=body,
        media_type="text/plain; version=0.0.4; charset=utf-8",
    )
