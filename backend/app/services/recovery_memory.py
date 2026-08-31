"""
Certus AI Finance Controller — Adaptive Recovery Memory

Tracks outcomes of recovery actions to learn which strategies work best
for each type of exception. Uses windowed, recency-weighted success rates
to adapt strategy selection over time.

Design:
  - Each strategy's effectiveness is tracked per exception type (reason_code).
  - A sliding window of the last N outcomes is used (default: 50).
  - Recency-weighted: more recent outcomes have higher influence.
  - The memory is deterministic and auditable — no LLM involvement.
  - Thread-safe for concurrent access.

Inspired by Sentinel's adaptive memory system, but adapted for
reconciliation exception recovery (not payment retry).
"""

import logging
import threading
from collections import defaultdict
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field

from app.services.compliance_engine import RecoveryAction

logger = logging.getLogger(__name__)

# Default sliding window size
DEFAULT_WINDOW_SIZE = 50

# Recency decay factor — more recent events get higher weight
RECENCY_DECAY = 0.95  # Each position back multiplied by this factor


@dataclass
class RecoveryOutcome:
    """A single recorded recovery action outcome."""
    record_id: str
    reason_code: str
    action: RecoveryAction
    success: bool
    amount_recovered_paisa: int = 0
    time_to_resolve_ms: int = 0
    timestamp: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class StrategyStats:
    """Aggregated statistics for a strategy applied to a specific exception type."""
    action: str
    reason_code: str
    total_attempts: int = 0
    successes: int = 0
    failures: int = 0
    weighted_success_rate: float = 0.0
    avg_recovery_amount_paisa: float = 0.0
    avg_resolution_time_ms: float = 0.0
    last_used: str = ""


class RecoveryMemory:
    """
    Adaptive, windowed memory for recovery strategy effectiveness.

    Tracks which recovery actions work best for each type of quarantine
    exception. The data is used to rank strategy proposals from the AI
    agent, but the final selection always goes through the deterministic
    compliance gate.
    """

    def __init__(self, window_size: int = DEFAULT_WINDOW_SIZE):
        self._window_size = window_size
        self._outcomes: Dict[str, List[RecoveryOutcome]] = defaultdict(list)
        self._lock = threading.Lock()

    def record_outcome(self, outcome: RecoveryOutcome) -> None:
        """
        Record a recovery action outcome.
        Maintains a sliding window of the last N outcomes per reason_code.
        """
        if not outcome.timestamp:
            outcome.timestamp = datetime.now(timezone.utc).isoformat()

        key = outcome.reason_code
        with self._lock:
            self._outcomes[key].append(outcome)
            # Trim to window size
            if len(self._outcomes[key]) > self._window_size:
                self._outcomes[key] = self._outcomes[key][-self._window_size:]

        logger.info(
            f"Recovery memory recorded: {outcome.action.value} on {outcome.reason_code} "
            f"→ {'SUCCESS' if outcome.success else 'FAILURE'} "
            f"(₹{outcome.amount_recovered_paisa / 100:.2f} recovered)"
        )

    def get_strategy_ranking(
        self, reason_code: str
    ) -> List[StrategyStats]:
        """
        Get strategies ranked by weighted success rate for a given exception type.
        Returns a list of StrategyStats sorted by weighted_success_rate descending.
        """
        with self._lock:
            outcomes = self._outcomes.get(reason_code, [])

        if not outcomes:
            return self._get_default_ranking(reason_code)

        # Group outcomes by action
        action_outcomes: Dict[str, List[RecoveryOutcome]] = defaultdict(list)
        for outcome in outcomes:
            action_outcomes[outcome.action.value].append(outcome)

        stats_list: List[StrategyStats] = []
        for action_name, action_outcomes_list in action_outcomes.items():
            stats = self._compute_weighted_stats(action_name, reason_code, action_outcomes_list)
            stats_list.append(stats)

        # Sort by weighted success rate descending
        stats_list.sort(key=lambda s: s.weighted_success_rate, reverse=True)
        return stats_list

    def get_best_strategy(
        self, reason_code: str
    ) -> Optional[RecoveryAction]:
        """
        Get the single best strategy for a given exception type based on
        historical outcomes. Returns None if no history available.
        """
        ranking = self.get_strategy_ranking(reason_code)
        if not ranking:
            return None

        best = ranking[0]
        if best.weighted_success_rate <= 0:
            return None

        try:
            return RecoveryAction(best.action)
        except ValueError:
            return None

    def get_full_memory_snapshot(self) -> Dict[str, Any]:
        """
        Export the entire memory state for audit/inspection.
        """
        with self._lock:
            snapshot = {}
            for reason_code, outcomes in self._outcomes.items():
                snapshot[reason_code] = {
                    "total_outcomes": len(outcomes),
                    "strategies": {},
                }
                # Group by action
                action_groups: Dict[str, List[RecoveryOutcome]] = defaultdict(list)
                for o in outcomes:
                    action_groups[o.action.value].append(o)

                for action_name, action_list in action_groups.items():
                    stats = self._compute_weighted_stats(action_name, reason_code, action_list)
                    snapshot[reason_code]["strategies"][action_name] = {
                        "total_attempts": stats.total_attempts,
                        "successes": stats.successes,
                        "failures": stats.failures,
                        "weighted_success_rate": round(stats.weighted_success_rate, 4),
                        "avg_recovery_amount": f"₹{stats.avg_recovery_amount_paisa / 100:.2f}",
                        "avg_resolution_time_ms": round(stats.avg_resolution_time_ms, 0),
                        "last_used": stats.last_used,
                    }

            return {
                "window_size": self._window_size,
                "reason_codes_tracked": len(snapshot),
                "total_outcomes": sum(
                    len(outcomes) for outcomes in self._outcomes.values()
                ),
                "memory": snapshot,
            }

    def _compute_weighted_stats(
        self,
        action_name: str,
        reason_code: str,
        outcomes: List[RecoveryOutcome],
    ) -> StrategyStats:
        """
        Compute recency-weighted statistics for a set of outcomes.
        More recent outcomes are weighted more heavily.
        """
        if not outcomes:
            return StrategyStats(action=action_name, reason_code=reason_code)

        total = len(outcomes)
        successes = sum(1 for o in outcomes if o.success)
        failures = total - successes

        # Recency-weighted success rate
        # Most recent outcome has weight 1.0, each prior decays by RECENCY_DECAY
        weighted_success_sum = 0.0
        weight_sum = 0.0
        for i, outcome in enumerate(reversed(outcomes)):
            weight = RECENCY_DECAY ** i
            weighted_success_sum += weight * (1.0 if outcome.success else 0.0)
            weight_sum += weight

        weighted_success_rate = weighted_success_sum / weight_sum if weight_sum > 0 else 0.0

        # Average recovery amount (only from successful outcomes)
        successful_amounts = [o.amount_recovered_paisa for o in outcomes if o.success and o.amount_recovered_paisa > 0]
        avg_amount = sum(successful_amounts) / len(successful_amounts) if successful_amounts else 0.0

        # Average resolution time
        resolution_times = [o.time_to_resolve_ms for o in outcomes if o.time_to_resolve_ms > 0]
        avg_time = sum(resolution_times) / len(resolution_times) if resolution_times else 0.0

        return StrategyStats(
            action=action_name,
            reason_code=reason_code,
            total_attempts=total,
            successes=successes,
            failures=failures,
            weighted_success_rate=weighted_success_rate,
            avg_recovery_amount_paisa=avg_amount,
            avg_resolution_time_ms=avg_time,
            last_used=outcomes[-1].timestamp if outcomes else "",
        )

    def _get_default_ranking(self, reason_code: str) -> List[StrategyStats]:
        """
        Return default strategy ranking when no history exists.
        Based on domain knowledge of Indian payment settlement patterns.
        """
        defaults: Dict[str, List[Tuple[str, float]]] = {
            "AMOUNT_MISMATCH": [
                ("RAISE_GATEWAY_DISPUTE", 0.70),
                ("ESCALATE_TO_TREASURY", 0.50),
                ("WRITE_OFF_VARIANCE", 0.30),
            ],
            "MISSING_FIELD": [
                ("REQUEST_BANK_RECONCILIATION", 0.65),
                ("WAIT_SETTLEMENT_WINDOW", 0.50),
                ("ESCALATE_TO_TREASURY", 0.40),
            ],
            "DUPLICATE_ID": [
                ("AUTO_RETRY_MATCH", 0.60),
                ("ESCALATE_TO_TREASURY", 0.40),
                ("STOP", 0.20),
            ],
            "LOW_CONFIDENCE": [
                ("AUTO_RETRY_MATCH", 0.55),
                ("ESCALATE_TO_TREASURY", 0.50),
                ("WAIT_SETTLEMENT_WINDOW", 0.40),
            ],
            "REFERENCE_MISMATCH": [
                ("REQUEST_BANK_RECONCILIATION", 0.65),
                ("RAISE_GATEWAY_DISPUTE", 0.50),
                ("ESCALATE_TO_TREASURY", 0.40),
            ],
        }

        default_list = defaults.get(reason_code, [
            ("ESCALATE_TO_TREASURY", 0.50),
            ("RAISE_GATEWAY_DISPUTE", 0.40),
            ("WAIT_SETTLEMENT_WINDOW", 0.30),
        ])

        return [
            StrategyStats(
                action=action,
                reason_code=reason_code,
                weighted_success_rate=rate,
            )
            for action, rate in default_list
        ]

    def reset(self) -> None:
        """Reset all memory (for testing)."""
        with self._lock:
            self._outcomes.clear()


# Module-level singleton
recovery_memory = RecoveryMemory()
