"""
Unit tests for Circuit Breaker and multi-model consensus resilience.
"""

import time
import pytest
from app.services.circuit_breaker import (
    CircuitBreakerManager,
    CircuitState,
    ProviderCircuit,
)


class TestCircuitBreaker:
    """Test suite verifying 3-state machine and auto-trip conditions."""

    def test_initial_state_closed(self):
        cb = CircuitBreakerManager(failure_threshold=3, cooldown_seconds=10.0)
        assert cb.get_state("groq") == CircuitState.CLOSED
        assert cb.can_execute("groq") is True

    def test_trips_after_consecutive_failures(self):
        cb = CircuitBreakerManager(failure_threshold=3, cooldown_seconds=10.0)
        cb.record_failure("openai", Exception("Connection reset"))
        assert cb.get_state("openai") == CircuitState.CLOSED
        assert cb.can_execute("openai") is True

        cb.record_failure("openai", Exception("Timeout error"))
        assert cb.get_state("openai") == CircuitState.CLOSED

        cb.record_failure("openai", Exception("Connection refused"))
        # 3rd failure reaches threshold -> Trips to OPEN
        assert cb.get_state("openai") == CircuitState.OPEN
        assert cb.can_execute("openai") is False

    def test_immediate_trip_on_429_rate_limit(self):
        cb = CircuitBreakerManager(failure_threshold=5, cooldown_seconds=30.0)
        cb.record_failure("gemini", Exception("429 Too Many Requests: Rate limit exceeded"))
        # Should trip immediately on 429 without waiting for 5 failures
        assert cb.get_state("gemini") == CircuitState.OPEN
        assert cb.can_execute("gemini") is False

    def test_immediate_trip_on_503_service_unavailable(self):
        cb = CircuitBreakerManager(failure_threshold=5, cooldown_seconds=30.0)
        cb.record_failure("claude", Exception("503 Service Unavailable: No capacity available"))
        assert cb.get_state("claude") == CircuitState.OPEN
        assert cb.can_execute("claude") is False

    def test_cooldown_transitions_to_half_open_canary(self):
        # Cooldown of 0.1s for fast unit testing
        cb = CircuitBreakerManager(failure_threshold=2, cooldown_seconds=0.1)
        cb.record_failure("groq", Exception("429 Rate Limit"))
        assert cb.get_state("groq") == CircuitState.OPEN
        assert cb.can_execute("groq") is False

        # Wait for cooldown to expire
        time.sleep(0.15)
        # Next can_execute check should transition to HALF_OPEN
        assert cb.can_execute("groq") is True
        assert cb.get_state("groq") == CircuitState.HALF_OPEN

    def test_half_open_canary_success_heals_to_closed(self):
        cb = CircuitBreakerManager(failure_threshold=2, cooldown_seconds=0.05)
        cb.trip("openai", reason="Test trip")
        assert cb.get_state("openai") == CircuitState.OPEN

        time.sleep(0.08)
        assert cb.can_execute("openai") is True
        assert cb.get_state("openai") == CircuitState.HALF_OPEN

        # Canary probe succeeds
        cb.record_success("openai")
        assert cb.get_state("openai") == CircuitState.CLOSED
        assert cb.can_execute("openai") is True

    def test_half_open_canary_failure_re_trips_to_open(self):
        cb = CircuitBreakerManager(failure_threshold=2, cooldown_seconds=0.05)
        cb.trip("claude", reason="Test trip")

        time.sleep(0.08)
        assert cb.can_execute("claude") is True
        assert cb.get_state("claude") == CircuitState.HALF_OPEN

        # Canary probe fails
        cb.record_failure("claude", Exception("Still down"))
        assert cb.get_state("claude") == CircuitState.OPEN
        assert cb.can_execute("claude") is False

    def test_metrics_reporting(self):
        cb = CircuitBreakerManager(failure_threshold=2, cooldown_seconds=10.0)
        cb.record_success("groq")
        cb.record_failure("openai", Exception("429 rate limit"))
        metrics = cb.get_metrics()

        assert "groq" in metrics
        assert metrics["groq"]["state"] == "CLOSED"
        assert metrics["groq"]["success_count"] == 1

        assert "openai" in metrics
        assert metrics["openai"]["state"] == "OPEN"
        assert metrics["openai"]["total_trips"] == 1

    def test_reset_all(self):
        cb = CircuitBreakerManager(failure_threshold=2, cooldown_seconds=10.0)
        cb.trip("groq")
        cb.trip("openai")
        assert cb.get_state("groq") == CircuitState.OPEN
        assert cb.get_state("openai") == CircuitState.OPEN

        cb.reset_all()
        assert cb.get_state("groq") == CircuitState.CLOSED
        assert cb.get_state("openai") == CircuitState.CLOSED
