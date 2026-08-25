"""
Certus AI Finance Controller — Core Domain Exceptions

Standardized exception hierarchy for reconciliation invariant failures,
rate-card mismatches, banking checksum errors, and security policy enforcement.
"""

from typing import Optional, Any, Dict


class CertusBaseException(Exception):
    """Base class for all domain-specific exceptions in the Certus system."""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class ReconciliationInvariantViolation(CertusBaseException):
    """Raised when double-entry ledger balance or amount conservation is violated."""
    def __init__(self, message: str, record_id: Optional[str] = None, variance_paisa: Optional[int] = None):
        super().__init__(message, details={"record_id": record_id, "variance_paisa": variance_paisa})
        self.record_id = record_id
        self.variance_paisa = variance_paisa


class RateCardVarianceExceeded(CertusBaseException):
    """Raised when actual gateway fee exceeds contracted MDR rate card beyond tolerance."""
    def __init__(self, message: str, expected_fee: float, actual_fee: float, delta: float):
        super().__init__(message, details={"expected_fee": expected_fee, "actual_fee": actual_fee, "delta": delta})
        self.expected_fee = expected_fee
        self.actual_fee = actual_fee
        self.delta = delta


class MissingBankingChecksumError(CertusBaseException):
    """Raised when a bank UTR reference is missing or fails 16/22-digit alphanumeric structure."""
    def __init__(self, message: str, transaction_id: Optional[str] = None, raw_utr: Optional[str] = None):
        super().__init__(message, details={"transaction_id": transaction_id, "raw_utr": raw_utr})
        self.transaction_id = transaction_id
        self.raw_utr = raw_utr


class SecurityPolicyViolation(CertusBaseException):
    """Raised when an unauthorized write or ledger mutation attempt is intercepted."""
    def __init__(self, message: str, violation_code: str = "SEC-GATE-FAIL-CLOSED", context: Optional[Dict[str, Any]] = None):
        super().__init__(message, details={"violation_code": violation_code, "context": context or {}})
        self.violation_code = violation_code


class RecordNotFoundError(CertusBaseException):
    """Raised when a transaction or quarantine batch ID cannot be located in SQLite WAL."""
    def __init__(self, message: str, record_id: str):
        super().__init__(message, details={"record_id": record_id})
        self.record_id = record_id
