"""
Unit tests for Prometheus metrics text exposition endpoint.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import create_app
from app.api.v1.metrics import (
    record_reconciliation_telemetry,
    generate_prometheus_exposition,
    _metric_state,
)
from app.services.circuit_breaker import circuit_breaker_manager


@pytest.fixture
def client():
    app = create_app()
    return TestClient(app)


class TestPrometheusMetrics:
    """Test suite verifying Prometheus text exposition format and live telemetry."""

    def test_metrics_endpoint_returns_200_text_plain(self, client):
        res = client.get("/metrics")
        assert res.status_code == 200
        assert "text/plain" in res.headers["content-type"]

    def test_metrics_contains_standard_prometheus_headers(self, client):
        res = client.get("/metrics")
        body = res.text

        assert "# HELP certus_reconciliation_runs_total" in body
        assert "# TYPE certus_reconciliation_runs_total counter" in body
        assert "# HELP certus_reconciled_records_total" in body
        assert "# HELP certus_discrepancy_amount_paisa_total" in body
        assert "# HELP certus_amount_recovered_paisa_total" in body
        assert "# HELP certus_circuit_breaker_tripped_total" in body

    def test_telemetry_recording_updates_prometheus_metrics(self, client):
        # Update metrics with a simulated reconciliation run
        record_reconciliation_telemetry(
            matched_count=850,
            quarantined_count=100,
            partial_count=50,
            discrepancy_paisa=21750,
            recovered_paisa=19500,
            compliance_checks=12,
            duration_seconds=0.118,
        )

        res = client.get("/metrics")
        body = res.text

        assert 'certus_reconciled_records_total{status="MATCHED"}' in body
        assert 'certus_reconciled_records_total{status="QUARANTINED"}' in body
        assert "certus_discrepancy_amount_paisa_total" in body
        assert "certus_amount_recovered_paisa_total" in body
        assert "certus_reconciliation_duration_seconds_last 0.1180" in body

    def test_circuit_breaker_state_reflected_in_metrics(self, client):
        # Trip a circuit breaker and verify it appears in /metrics
        circuit_breaker_manager.trip("groq", reason="Simulated 429")
        
        res = client.get("/metrics")
        body = res.text

        assert 'certus_circuit_breaker_tripped_total{provider="groq"}' in body
        assert 'certus_circuit_breaker_state{provider="groq",state="OPEN"} 1' in body

        # Reset after test
        circuit_breaker_manager.reset_all()

    def test_metrics_endpoint_accessible_at_api_v1_prefix(self, client):
        res = client.get("/api/v1/metrics")
        assert res.status_code == 200
        assert "text/plain" in res.headers["content-type"]
        assert "certus_reconciliation_runs_total" in res.text
