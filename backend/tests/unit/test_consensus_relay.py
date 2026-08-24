"""
Unit Tests for Layer 2 Consensus Relay Engine

Validates:
1. Early exit when Hop 1 (Groq) and Hop 2 (Gemini) agree with high confidence (>= 0.75).
2. Escalation to Hop 3 (OpenAI) and Hop 4 (Claude) when prior hops disagree.
3. Hard red flag from ANY hop immediately forces exception routing (0.0 confidence).
4. Missing API key disables only that specific hop and does not crash the pipeline.
5. Full relay timeout fails closed gracefully without hanging the batch.
"""

import pytest
import asyncio
from unittest.mock import patch, AsyncMock, MagicMock
from app.services.consensus_relay import ConsensusRelayEngine, HARD_RED_FLAGS


@pytest.fixture
def relay_engine():
    engine = ConsensusRelayEngine()
    return engine


class TestConsensusRelay:
    """Test suite for the serial multi-model consensus relay."""

    @pytest.mark.asyncio
    async def test_early_exit_hop2_when_strong_consensus(self, relay_engine):
        """Hop 1 and Hop 2 both agree on 'match' with confidence >= 0.75 -> Early exit after 2 hops."""
        mock_hop1 = '{"verdict": "match", "confidence": 0.95, "reason": "Exact UTR match in bank statement", "red_flag": false}'
        mock_hop2 = '{"verdict": "match", "confidence": 0.90, "reason": "Concur with UTR match. Amounts align.", "red_flag": false}'

        with patch.object(relay_engine, "_call_provider", side_effect=[mock_hop1, mock_hop2]) as mock_call:
            # Enable groq and gemini
            relay_engine._disabled_providers = set()
            relay_engine._groq_client = MagicMock()
            relay_engine._gemini_client = MagicMock()

            res = await relay_engine.evaluate_transaction(
                record_context={"record_id": "TXN_001", "amount": 5000},
                discrepancy_context="Minor ₹0.50 delta in MDR fee",
            )

            assert res["verdict"] == "match"
            assert res["confidence"] >= 0.75
            assert res["hops_executed"] == 2
            assert "early_exit_hop2" in res["exit_point"]
            assert len(res["trail"]) == 2
            assert res["trail"][0]["provider"] == "groq"
            assert res["trail"][1]["provider"] == "gemini"
            # OpenAI and Claude should NOT have been called
            assert mock_call.call_count == 2

    @pytest.mark.asyncio
    async def test_escalation_to_hop3_and_hop4_on_disagreement(self, relay_engine):
        """Hop 1 says 'match', Hop 2 dissents with 'no-match' -> Escalates to Hop 3 and Hop 4."""
        mock_hop1 = '{"verdict": "match", "confidence": 0.85, "reason": "Appears to match", "red_flag": false}'
        mock_hop2 = '{"verdict": "no-match", "confidence": 0.80, "reason": "Dissent: Date mismatch T+5", "red_flag": false}'
        mock_hop3 = '{"verdict": "no-match", "confidence": 0.82, "reason": "Invoice number differs", "red_flag": false}'
        mock_hop4 = '{"verdict": "no-match", "confidence": 0.90, "reason": "Adversarial check confirms invoice mismatch", "red_flag": false}'

        with patch.object(relay_engine, "_call_provider", side_effect=[mock_hop1, mock_hop2, mock_hop3, mock_hop4]) as mock_call:
            relay_engine._disabled_providers = set()
            relay_engine._groq_client = MagicMock()
            relay_engine._gemini_client = MagicMock()
            relay_engine._openai_client = MagicMock()
            relay_engine._anthropic_client = MagicMock()

            res = await relay_engine.evaluate_transaction(
                record_context={"record_id": "TXN_CONTESTED_99", "amount": 12000},
                discrepancy_context="Date discrepancy and ambiguous invoice reference",
            )

            assert res["verdict"] == "no-match"
            assert res["hops_executed"] >= 3
            assert len(res["trail"]) >= 3
            # Checked that majority ruled no-match
            assert res["confidence"] == 0.0 # Fails double-lock gate

    @pytest.mark.asyncio
    async def test_hard_red_flag_forces_exception_routing(self, relay_engine):
        """Even if other hops vote 'match', a hard red flag forces 0.0 confidence."""
        mock_hop1 = '{"verdict": "match", "confidence": 0.95, "reason": "Looks good", "red_flag": false}'
        mock_hop2 = '{"verdict": "no-match", "confidence": 0.99, "reason": "Severe mismatch: likely fraudulent phantom transaction", "red_flag": true}'

        with patch.object(relay_engine, "_call_provider", side_effect=[mock_hop1, mock_hop2]):
            relay_engine._disabled_providers = set()
            relay_engine._groq_client = MagicMock()
            relay_engine._gemini_client = MagicMock()

            res = await relay_engine.evaluate_transaction(
                record_context={"record_id": "TXN_FRAUD_01", "amount": 999999},
                discrepancy_context="Unverified payout with fabricated UTR",
            )

            assert res["verdict"] == "no-match"
            assert res["confidence"] == 0.0
            assert res["hard_red_flag"] is True
            assert "red_flag" in res["exit_point"]

    @pytest.mark.asyncio
    async def test_missing_api_key_disables_hop_gracefully(self, relay_engine):
        """If OpenAI is disabled, Hop 3 is skipped and pipeline continues without crashing."""
        relay_engine._disabled_providers = {"openai"}
        relay_engine._groq_client = MagicMock()
        relay_engine._gemini_client = MagicMock()
        relay_engine._openai_client = None
        relay_engine._anthropic_client = MagicMock()

        mock_hop1 = '{"verdict": "match", "confidence": 0.60, "reason": "Borderline", "red_flag": false}'
        mock_hop2 = '{"verdict": "no-match", "confidence": 0.70, "reason": "Dissent", "red_flag": false}'
        mock_hop4 = '{"verdict": "no-match", "confidence": 0.85, "reason": "Adversarial check: amounts conflict", "red_flag": false}'

        with patch.object(relay_engine, "_call_provider", side_effect=[mock_hop1, mock_hop2, mock_hop4]):
            res = await relay_engine.evaluate_transaction(
                record_context={"record_id": "TXN_SKIP_01"},
                discrepancy_context="Test missing key",
            )

            # OpenAI hop was skipped
            providers_in_trail = [t["provider"] for t in res["trail"]]
            assert "openai" not in providers_in_trail
            assert "groq" in providers_in_trail
            assert "gemini" in providers_in_trail
            assert res["verdict"] == "no-match"

    @pytest.mark.asyncio
    async def test_relay_timeout_fails_closed(self, relay_engine):
        """If relay exceeds total timeout budget, it returns fail-closed verdict without crashing."""
        async def slow_call(provider, prompt):
            await asyncio.sleep(5.0)
            return "{}"

        with patch.object(relay_engine, "_call_provider", side_effect=slow_call):
            relay_engine._disabled_providers = set()
            relay_engine._groq_client = MagicMock()

            res = await relay_engine.evaluate_transaction(
                record_context={"record_id": "TXN_TIMEOUT_01"},
                discrepancy_context="Test timeout handling",
                timeout_per_hop=0.1,
                total_timeout=0.2,
            )

            assert res["verdict"] == "no-match"
            assert res["confidence"] is None or res["confidence"] == 0.0
            assert "timeout" in res["exit_point"]
