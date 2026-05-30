"""
Security: rate limiting (IP + per-account), account lockout, security headers.
No extra dependencies required.
"""
from __future__ import annotations

import time
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from threading import Lock
from typing import Callable

from fastapi import Request, Response, HTTPException, status, Depends
from starlette.middleware.base import BaseHTTPMiddleware

from app.database import get_db


# ── In-memory rate limiter (IP-based, resets on restart) ─────────────────────

class _RateLimiter:
    def __init__(self) -> None:
        self._store: dict[str, list[float]] = defaultdict(list)
        self._lock = Lock()

    def is_allowed(self, key: str, max_calls: int, window: int) -> bool:
        now = time.monotonic()
        cutoff = now - window
        with self._lock:
            calls = [t for t in self._store[key] if t > cutoff]
            if len(calls) >= max_calls:
                return False
            calls.append(now)
            self._store[key] = calls
        return True

    def check(self, key: str, max_calls: int, window: int, detail: str = "") -> None:
        if not self.is_allowed(key, max_calls, window):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=detail or f"Too many requests. Try again in {window} seconds.",
                headers={"Retry-After": str(window)},
            )


_limiter = _RateLimiter()


def auth_rate_limit(request: Request) -> None:
    """5 attempts per minute per IP for auth endpoints."""
    ip = request.client.host if request.client else "unknown"
    _limiter.check(
        f"auth:{ip}", max_calls=5, window=60,
        detail="Too many login attempts. Wait 60 seconds and try again."
    )


def upload_rate_limit(request: Request) -> None:
    """20 uploads per hour per IP."""
    ip = request.client.host if request.client else "unknown"
    _limiter.check(f"upload:{ip}", max_calls=20, window=3600)


def chat_rate_limit(request: Request) -> None:
    """60 chat requests per minute per IP."""
    ip = request.client.host if request.client else "unknown"
    _limiter.check(f"chat:{ip}", max_calls=60, window=60)


# ── Per-account lockout (MongoDB-backed, survives restarts) ───────────────────

MAX_FAILED_ATTEMPTS = 10       # lock after 10 wrong passwords
LOCKOUT_DURATION_MINUTES = 30  # locked for 30 minutes


async def record_failed_login(email: str) -> None:
    """Increment failed login counter for an email. Persists in MongoDB."""
    db = get_db()
    now = datetime.now(timezone.utc)
    await db.login_attempts.update_one(
        {"email": email},
        {
            "$inc": {"failed_count": 1},
            "$set": {"last_failed_at": now},
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
    )


async def reset_failed_login(email: str) -> None:
    """Clear failed login counter on successful login."""
    db = get_db()
    await db.login_attempts.delete_one({"email": email})


async def check_account_lockout(email: str) -> None:
    """
    Raise 429 if account is locked out due to too many failed attempts.
    Call this BEFORE verifying the password.
    """
    db = get_db()
    record = await db.login_attempts.find_one({"email": email})
    if not record:
        return

    failed: int = record.get("failed_count", 0)
    if failed < MAX_FAILED_ATTEMPTS:
        return

    last_failed: datetime = record.get("last_failed_at", datetime.now(timezone.utc))
    if last_failed.tzinfo is None:
        last_failed = last_failed.replace(tzinfo=timezone.utc)

    unlock_at = last_failed + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
    if datetime.now(timezone.utc) < unlock_at:
        remaining = int((unlock_at - datetime.now(timezone.utc)).total_seconds() // 60) + 1
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Account temporarily locked after {MAX_FAILED_ATTEMPTS} failed attempts. "
                f"Try again in {remaining} minute(s)."
            ),
            headers={"Retry-After": str(remaining * 60)},
        )
    else:
        # Lockout expired — reset counter
        await reset_failed_login(email)


# ── Security headers middleware ───────────────────────────────────────────────

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        for k, v in SECURITY_HEADERS.items():
            response.headers[k] = v
        return response
