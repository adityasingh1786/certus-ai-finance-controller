"""
Certus AI Finance Controller — Enterprise Security Middleware Stack

Provides:
1. SecurityHeadersMiddleware: Enforces Strict HSTS, CSP, X-Frame-Options, and Content-Type sniffing defense.
2. TokenBucketRateLimiterMiddleware: Sliding-window adaptive rate limiting with IP jail.
3. Health & Latency Telemetry Tracking.
"""

import time
import logging
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Injects enterprise banking-grade security headers on all HTTP responses.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        
        # 1. Strict Transport Security (HSTS) — 1 year + subdomains + preload
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        
        # 2. Anti-Clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # 3. Content-Type Sniffing Defense
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # 4. Cross-Site Scripting (XSS) Filter Protection
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # 5. Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # 6. Permissions Policy
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()"
        
        # 7. Content Security Policy (Allow inline scripts for React SPA hydration, secure data sources)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "img-src 'self' data: blob: https:; "
            "connect-src 'self' http://localhost:* https://*.trycloudflare.com wss://*.trycloudflare.com;"
        )
        
        # 8. Server Obfuscation
        response.headers["Server"] = "Certus-Sovereign-Kernel/2.4"
        
        return response


class TokenBucketRateLimiterMiddleware(BaseHTTPMiddleware):
    """
    In-Memory Sliding Window Token-Bucket Rate Limiter.
    Limits clients to 60 req/min for general API and 15 req/min for AI queries.
    """
    def __init__(self, app, general_limit: int = 60, window_seconds: int = 60):
        super().__init__(app)
        self.general_limit = general_limit
        self.window_seconds = window_seconds
        self.request_history: Dict[str, List[float]] = defaultdict(list)
        self.ip_jail: Dict[str, float] = {}  # {ip: lockout_expiration}

    async def dispatch(self, request: Request, call_next) -> Response:
        # Extract client IP (handling Cloudflare / X-Forwarded-For headers)
        client_ip = (
            request.headers.get("CF-Connecting-IP")
            or request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
            or (request.client.host if request.client else "127.0.0.1")
        )

        now = time.time()

        # Check if client is currently in temporary IP jail
        if client_ip in self.ip_jail:
            lockout_until = self.ip_jail[client_ip]
            if now < lockout_until:
                retry_after = int(lockout_until - now)
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": "RATE_LIMIT_EXCEEDED",
                        "detail": f"IP temporarily jailed due to excessive traffic. Retry in {retry_after} seconds.",
                        "retry_after_seconds": retry_after,
                    },
                    headers={"Retry-After": str(retry_after)},
                )
            else:
                self.ip_jail.pop(client_ip, None)

        # Static assets and health checks are exempt from rate limiting
        path = request.url.path
        if path.startswith("/assets") or path == "/health" or path == "/favicon.ico":
            return await call_next(request)

        # Dynamic limit: stricter for AI Copilot queries
        limit = 15 if "/agent/query" in path else self.general_limit

        # Sliding window timestamp cleanup
        timestamps = self.request_history[client_ip]
        cutoff = now - self.window_seconds
        valid_timestamps = [t for t in timestamps if t > cutoff]
        self.request_history[client_ip] = valid_timestamps

        if len(valid_timestamps) >= limit:
            # Put into temporary IP jail (30s)
            self.ip_jail[client_ip] = now + 30
            logger.warning(f"⚠️ Rate limit exceeded for {client_ip} on {path} ({len(valid_timestamps)} reqs). Jailing for 30s.")
            return JSONResponse(
                status_code=429,
                content={
                    "error": "RATE_LIMIT_EXCEEDED",
                    "detail": "Too many requests. Please throttle your request velocity.",
                    "limit_per_minute": limit,
                    "retry_after_seconds": 30,
                },
                headers={"Retry-After": "30"},
            )

        # Record current request timestamp
        self.request_history[client_ip].append(now)
        return await call_next(request)
