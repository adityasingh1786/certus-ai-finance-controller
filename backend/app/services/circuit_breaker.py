"""
Circuit Breaker Pattern for Multi-Model Consensus Relay.
Enforces graceful degradation across LLM providers (Groq, Gemini, OpenAI, Claude).

States:
- CLOSED: Normal operation. Requests pass through.
- OPEN: Tripped after N consecutive failures or HTTP 429/503. Requests immediately bypass provider for cooldown duration.
- HALF_OPEN: Cooldown expired. Allows a single canary request to probe provider health.
"""

import time
import logging
from enum import Enum
from typing import Dict, Any, Optional

logger = logging.getLogger("certus.circuit_breaker")


class CircuitState(str, Enum):
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"


class ProviderCircuit:
    """State tracking for a single LLM provider."""
    def __init__(
        self,
        provider: str,
        failure_threshold: int = 3,
        cooldown_seconds: float = 60.0,
    ):
        self.provider = provider
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.tripped_at: Optional[float] = None
        self.total_trips = 0
        self.last_failure_reason: Optional[str] = None

    def can_execute(self) -> bool:
        """Determines if a request to this provider is permitted."""
        if self.state == CircuitState.CLOSED:
            return True

        if self.state == CircuitState.OPEN:
            now = time.time()
            if self.tripped_at and (now - self.tripped_at) >= self.cooldown_seconds:
                logger.info(
                    f"CircuitBreaker [{self.provider}]: Cooldown expired ({self.cooldown_seconds}s). "
                    f"Transitioning OPEN -> HALF_OPEN (probing canary)."
                )
                self.state = CircuitState.HALF_OPEN
                return True
            return False

        if self.state == CircuitState.HALF_OPEN:
            # In half-open, allow execution (canary probe)
            return True

        return False

    def record_success(self) -> None:
        """Records a successful response from the provider."""
        if self.state == CircuitState.HALF_OPEN:
            logger.info(
                f"CircuitBreaker [{self.provider}]: Canary probe succeeded. "
                f"Transitioning HALF_OPEN -> CLOSED (circuit healed)."
            )
            self.state = CircuitState.CLOSED
            self.failure_count = 0
            self.tripped_at = None
        elif self.state == CircuitState.CLOSED:
            self.failure_count = 0
        self.success_count += 1

    def record_failure(self, exception: Optional[Exception] = None) -> None:
        """Records a failure from the provider and auto-trips if threshold is breached."""
        self.failure_count += 1
        exc_str = str(exception) if exception else "unknown failure"
        self.last_failure_reason = exc_str

        # Check for immediate trip conditions (HTTP 429 Rate Limit / 503 Outage)
        is_rate_limit_or_outage = any(
            code in exc_str.lower()
            for code in ["429", "rate limit", "quota", "resource_exhausted", "503", "unavailable", "capacity"]
        )

        if self.state == CircuitState.HALF_OPEN:
            logger.warning(
                f"CircuitBreaker [{self.provider}]: Canary probe failed ({exc_str}). "
                f"Transitioning HALF_OPEN -> OPEN."
            )
            self.trip(reason=f"Canary failed: {exc_str}")
        elif is_rate_limit_or_outage or self.failure_count >= self.failure_threshold:
            reason = (
                f"Immediate 429/503 trigger: {exc_str}"
                if is_rate_limit_or_outage
                else f"Failure threshold reached ({self.failure_count}/{self.failure_threshold}): {exc_str}"
            )
            self.trip(reason=reason)
        else:
            logger.debug(
                f"CircuitBreaker [{self.provider}]: Recorded failure ({self.failure_count}/{self.failure_threshold})"
            )

    def trip(self, reason: str = "Threshold exceeded") -> None:
        """Forces the circuit into OPEN state."""
        self.state = CircuitState.OPEN
        self.tripped_at = time.time()
        self.total_trips += 1
        self.last_failure_reason = reason
        logger.warning(
            f"CircuitBreaker [{self.provider}]: Tripped to OPEN (Trip #{self.total_trips}). "
            f"Reason: {reason}. Cooldown: {self.cooldown_seconds}s."
        )

    def reset(self) -> None:
        """Resets the circuit to initial healthy state."""
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.tripped_at = None
        self.last_failure_reason = None


class CircuitBreakerManager:
    """Central registry managing provider circuits."""
    def __init__(
        self,
        failure_threshold: int = 3,
        cooldown_seconds: float = 60.0,
    ):
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self._circuits: Dict[str, ProviderCircuit] = {}

    def get_circuit(self, provider: str) -> ProviderCircuit:
        if provider not in self._circuits:
            self._circuits[provider] = ProviderCircuit(
                provider=provider,
                failure_threshold=self.failure_threshold,
                cooldown_seconds=self.cooldown_seconds,
            )
        return self._circuits[provider]

    def can_execute(self, provider: str) -> bool:
        return self.get_circuit(provider).can_execute()

    def record_success(self, provider: str) -> None:
        self.get_circuit(provider).record_success()

    def record_failure(self, provider: str, exception: Optional[Exception] = None) -> None:
        self.get_circuit(provider).record_failure(exception)

    def trip(self, provider: str, reason: str = "manual") -> None:
        self.get_circuit(provider).trip(reason)

    def get_state(self, provider: str) -> CircuitState:
        return self.get_circuit(provider).state

    def get_metrics(self) -> Dict[str, Any]:
        """Returns diagnostic metrics across all circuits."""
        return {
            provider: {
                "state": c.state.value,
                "failure_count": c.failure_count,
                "success_count": c.success_count,
                "total_trips": c.total_trips,
                "tripped_at": c.tripped_at,
                "last_failure_reason": c.last_failure_reason,
            }
            for provider, c in self._circuits.items()
        }

    def reset_all(self) -> None:
        for circuit in self._circuits.values():
            circuit.reset()


# Global singleton instance
circuit_breaker_manager = CircuitBreakerManager()
