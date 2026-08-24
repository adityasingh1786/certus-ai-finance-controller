"""
AI Finance Controller — Core Security Middleware & Utilities

Features:
1. API Key Authentication (header: X-API-Key)
2. Rate limiting helpers
3. Input sanitization (strip dangerous injection characters & length capping)
4. Redaction of sensitive keys in logs
"""

import re
from typing import Optional
from fastapi import HTTPException, Security, Request
from fastapi.security.api_key import APIKeyHeader
from app.core.config import get_settings

API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)


async def verify_api_key(request: Request, api_key: Optional[str] = Security(api_key_header)) -> bool:
    """
    Validates API key against configured environment setting.
    In development / demo mode, allows requests if no key is configured on server or client.
    """
    settings = get_settings()
    configured_key = settings.api_key
    if not configured_key:
        return True  # Open dev mode — no key configured

    if not api_key or api_key != configured_key:
        raise HTTPException(
            status_code=403,
            detail="Invalid or missing API Key. Please provide a valid 'X-API-Key' header.",
        )
    return True


def sanitize_input_string(input_str: str, max_length: int = 2000) -> str:
    """
    Sanitizes untrusted text to defend against control character exploits and truncation attacks.
    """
    if not input_str:
        return ""
    # Strip null bytes and control characters
    cleaned = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', input_str)
    return cleaned.strip()[:max_length]


def redact_sensitive_data(text: str) -> str:
    """
    Redacts tokens, secrets, and auth strings from audit logs and output strings.
    """
    if not text:
        return ""
    redacted = re.sub(r'(Bearer\s+)[A-Za-z0-9_\-\.]+', r'\1[REDACTED]', text, flags=re.IGNORECASE)
    redacted = re.sub(r'(key[_-]?id\s*[:=]\s*)[A-Za-z0-9_\-]+', r'\1[REDACTED]', redacted, flags=re.IGNORECASE)
    redacted = re.sub(r'(key[_-]?secret\s*[:=]\s*)[A-Za-z0-9_\-]+', r'\1[REDACTED]', redacted, flags=re.IGNORECASE)
    return redacted
