"""
Certus AI Finance Controller — Dynamic Tiered MDR Rate-Card Classifier
Lead Architect: Aditya Singh

Enforces Indian banking interchange rate cards across payment instruments:
- UPI P2M: 0.00% interchange (Zero MDR)
- RuPay Debit Card: 0.00% (Zero MDR)
- Visa / Mastercard Debit: 0.90% + 18% GST (1.062% effective)
- Domestic Credit Card: 2.00% + 18% GST (2.360% effective)
- Corporate / Amex / Diners: 3.00% + 18% GST (3.540% effective)
- NetBanking / EMI: Flat fee or 1.50% + 18% GST
"""

from typing import Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)


class MDRRateCardClassifier:
    """
    Validates payment gateway fees against mode-specific Indian interchange schedules.
    """

    # Contracted statutory base fee schedules (BPS: basis points, 100 bps = 1.0%)
    RATE_CARD_BPS = {
        "UPI": {"base_bps": 0, "gst_percent": 18, "description": "NPCI Zero Interchange Mandate"},
        "RUPAY_DEBIT": {"base_bps": 0, "gst_percent": 18, "description": "RBI Zero MDR on RuPay"},
        "DEBIT_CARD": {"base_bps": 90, "gst_percent": 18, "description": "Standard Debit Card (0.90%)"},
        "CREDIT_CARD": {"base_bps": 200, "gst_percent": 18, "description": "Standard Domestic Credit Card (2.00%)"},
        "CORPORATE_CARD": {"base_bps": 300, "gst_percent": 18, "description": "Corporate & Amex Tier (3.00%)"},
        "INTERNATIONAL_CARD": {"base_bps": 350, "gst_percent": 18, "description": "Cross-Border International (3.50%)"},
        "NETBANKING": {"base_bps": 150, "gst_percent": 18, "description": "NetBanking Gateway Rail (1.50%)"},
    }

    @classmethod
    def evaluate_fee(
        cls,
        payment_method: str,
        gross_amount_paisa: int,
        actual_fee_deducted_paisa: int,
        tolerance_bps: int = 50,
    ) -> Dict[str, Any]:
        """
        Evaluates whether the gateway fee deducted on a transaction matches the contracted schedule.

        Returns:
            Dict with is_valid, expected_fee_paisa, fee_variance_paisa, anomaly_type, and reason.
        """
        method_key = payment_method.upper().strip() if payment_method else "CREDIT_CARD"

        # Match known category or fallback to standard credit card
        matched_key = "CREDIT_CARD"
        for k in cls.RATE_CARD_BPS.keys():
            if k in method_key:
                matched_key = k
                break

        schedule = cls.RATE_CARD_BPS[matched_key]
        base_bps = schedule["base_bps"]
        gst_percent = schedule["gst_percent"]

        # Expected Base Fee in paisa
        expected_base_fee_paisa = round((gross_amount_paisa * base_bps) / 10000)
        # Expected GST on Fee in paisa
        expected_gst_paisa = round((expected_base_fee_paisa * gst_percent) / 100)
        total_expected_fee_paisa = expected_base_fee_paisa + expected_gst_paisa

        # Variance
        fee_variance_paisa = actual_fee_deducted_paisa - total_expected_fee_paisa
        variance_bps = 0
        if gross_amount_paisa > 0:
            variance_bps = round((abs(fee_variance_paisa) / gross_amount_paisa) * 10000)

        # Check for zero-MDR violations (e.g. charging fee on UPI)
        if base_bps == 0 and actual_fee_deducted_paisa > 0:
            return {
                "is_valid": False,
                "anomaly_type": "ZERO_MDR_UPI_INCORRECTLY_CHARGED",
                "payment_method": matched_key,
                "expected_fee_paisa": 0,
                "actual_fee_paisa": actual_fee_deducted_paisa,
                "variance_paisa": actual_fee_deducted_paisa,
                "variance_bps": variance_bps,
                "reason": f"Unauthorized fee of ₹{actual_fee_deducted_paisa / 100:.2f} deducted on Zero-MDR {matched_key} transaction.",
                "action_required": "DEMAND_FEE_REVERSAL",
            }

        # Check for fee drift exceeding tolerance threshold
        if variance_bps > tolerance_bps:
            return {
                "is_valid": False,
                "anomaly_type": "MDR_RATE_DRIFT_EXCEEDED",
                "payment_method": matched_key,
                "expected_fee_paisa": total_expected_fee_paisa,
                "actual_fee_paisa": actual_fee_deducted_paisa,
                "variance_paisa": fee_variance_paisa,
                "variance_bps": variance_bps,
                "reason": f"Deducted fee rate exceeded contracted {base_bps / 100:.2f}% + 18% GST schedule by {variance_bps} bps (+₹{fee_variance_paisa / 100:.2f}).",
                "action_required": "DEMAND_FEE_REVERSAL",
            }

        return {
            "is_valid": True,
            "anomaly_type": "NONE",
            "payment_method": matched_key,
            "expected_fee_paisa": total_expected_fee_paisa,
            "actual_fee_paisa": actual_fee_deducted_paisa,
            "variance_paisa": 0,
            "variance_bps": 0,
            "reason": f"MDR Fee verified against {schedule['description']}.",
            "action_required": "CLEARED_TO_LEDGER",
        }
