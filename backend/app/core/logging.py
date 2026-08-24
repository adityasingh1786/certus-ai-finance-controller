import logging
import json
import re
from datetime import datetime, timezone
from typing import Any, Dict

# Regex patterns for redacting sensitive financial & secret tokens
REDACTION_PATTERNS = [
    (re.compile(r'(?i)(api[_-]?key|secret|token|password|bearer\s+)["\':=\s]+([^\s"\'&,]+)'), r'\1="[REDACTED]"'),
    (re.compile(r'\b(?:\d{4}[-\s]?){3}\d{4}\b'), '[REDACTED_CARD]'),
    (re.compile(r'\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b', re.IGNORECASE), '[REDACTED_EMAIL]'),
    (re.compile(r'\b(?:UTRIBK|UTR\d{10,16})\b'), lambda m: m.group(0)[:4] + '****' + m.group(0)[-4:]),
]


class SecretRedactingFormatter(logging.Formatter):
    """
    Formatter that outputs structured JSON and automatically redacts
    API keys, passwords, bearer tokens, card numbers, and PII.
    """

    def format(self, record: logging.LogRecord) -> str:
        msg = record.getMessage()

        # Apply redactions to message text
        for pattern, replacement in REDACTION_PATTERNS:
            if callable(replacement):
                msg = pattern.sub(replacement, msg)
            else:
                msg = pattern.sub(replacement, msg)

        log_payload: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": msg,
            "module": record.module,
            "line": record.lineno,
        }

        if record.exc_info:
            log_payload["exception"] = self.formatException(record.exc_info)

        if hasattr(record, "extra_data") and isinstance(record.extra_data, dict):
            log_payload["context"] = record.extra_data

        return json.dumps(log_payload)


def setup_logger(name: str = "ai_finance_controller") -> logging.Logger:
    """Configures and returns a structured, secret-redacting logger."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(SecretRedactingFormatter())
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger


logger = setup_logger()
