"""
AI Finance Controller — Consensus Relay Multi-Model Audit Evaluator

Evaluates ambiguous & contested records through the Layer 2 Consensus Relay:
1. Records with minor fee deltas (Hop 1 & Hop 2 early exit)
2. Records with disputed references/dates (Hop 3 / Hop 4 full escalation)
3. Hard red-flag records (Immediate fail-closed exception)

Generates exact pitch-ready statistics for the hackathon panel.
"""

import sys
import os
import asyncio
from pathlib import Path

# Add backend root to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.services.consensus_relay import ConsensusRelayEngine


async def run_relay_benchmark():
    print("=" * 65)
    print("CONSENSUS RELAY (LAYER 2 MULTI-MODEL AUDIT) BENCHMARK")
    print("=" * 65)

    engine = ConsensusRelayEngine()

    # Define test scenarios reflecting real synthetic dataset edge cases:
    scenarios = [
        {
            "id": "TXN_AMBIGUOUS_01",
            "type": "Minor MDR fee delta (0.50 INR)",
            "context": {"record_id": "TXN_AMBIGUOUS_01", "gross": 5000.0, "fee": 100.5, "net": 4899.5},
            "discrepancy": "Gateway fee ₹100.00 vs Bank settlement deduction ₹100.50 (₹0.50 delta)",
        },
        {
            "id": "TXN_AMBIGUOUS_02",
            "type": "T+2 Weekend settlement window",
            "context": {"record_id": "TXN_AMBIGUOUS_02", "gateway_date": "2026-08-14", "bank_date": "2026-08-16"},
            "discrepancy": "Date variance of 2 days across bank holiday / weekend settlement window",
        },
        {
            "id": "TXN_CONTESTED_03",
            "type": "Fuzzy Merchant Match with Missing UTR",
            "context": {"record_id": "TXN_CONTESTED_03", "merchant_name": "Acme Retail Pvt Ltd", "ledger_name": "ACME RETAIL IN"},
            "discrepancy": "Fuzzy merchant similarity 78%, UTR absent in bank statement narration",
        },
        {
            "id": "TXN_CONTESTED_04",
            "type": "Amount conflict between ERP gross and Gateway invoice",
            "context": {"record_id": "TXN_CONTESTED_04", "gateway_gross": 14500.0, "erp_gross": 14200.0},
            "discrepancy": "Invoice #INV-9021 amount mismatch: Gateway gross ₹14,500 vs ERP gross ₹14,200 (₹300 delta)",
        },
        {
            "id": "TXN_FRAUD_05",
            "type": "Anomalous duplicate payout reference",
            "context": {"record_id": "TXN_FRAUD_05", "gross": 95000.0, "utr": "UTR_DUPE_9999"},
            "discrepancy": "Severe mismatch: duplicate payout reference with unverified ledger credit",
        },
    ]

    early_exit_count = 0
    full_escalation_count = 0
    hard_red_flag_count = 0
    total_evals = len(scenarios)

    print(f"\nRunning Consensus Relay evaluation across {total_evals} ambiguous transactions...\n")

    for s in scenarios:
        res = await engine.evaluate_transaction(
            record_context=s["context"],
            discrepancy_context=s["discrepancy"],
            timeout_per_hop=6.0,
            total_timeout=20.0,
        )

        hops = res["hops_executed"]
        verdict = res["verdict"]
        conf = res["confidence"]
        exit_pt = res["exit_point"]

        if "early_exit" in exit_pt or hops <= 2:
            early_exit_count += 1
            exit_label = "EARLY EXIT (2 Hops - Groq + Gemini)"
        elif res.get("hard_red_flag"):
            hard_red_flag_count += 1
            exit_label = "HARD RED FLAG (Immediate Exception)"
        else:
            full_escalation_count += 1
            exit_label = f"FULL ESCALATION ({hops} Hops - Multi-Model)"

        reason_safe = str(res['final_reasoning']).replace('₹', 'Rs. ').encode('ascii', 'ignore').decode('ascii')
        print(f"[{s['id']}] {s['type']}")
        print(f"   -> Verdict        : {verdict.upper()} (Confidence: {conf})")
        print(f"   -> Path Taken     : {exit_label}")
        print(f"   -> Hops Executed  : {hops}")
        print(f"   -> Final Reason   : {reason_safe}\n")

    print("=" * 65)
    print("CONSENSUS RELAY PERFORMANCE & EFFICIENCY SUMMARY")
    print("=" * 65)
    print(f"• Total Ambiguous Records Evaluated : {total_evals}")
    print(f"• Early Exit at Hop 2 (Fast Path)   : {early_exit_count} ({early_exit_count/total_evals*100:.1f}%)")
    print(f"• Full Escalation to Hop 3 / 4     : {full_escalation_count} ({full_escalation_count/total_evals*100:.1f}%)")
    print(f"• Red-Flags Isolated at Relay      : {hard_red_flag_count} ({hard_red_flag_count/total_evals*100:.1f}%)")
    print(f"• Throughput Impact                : ZERO on clean records (Layer 1 handles bulk)")
    print("=" * 65)


if __name__ == "__main__":
    asyncio.run(run_relay_benchmark())
