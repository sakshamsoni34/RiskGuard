import hashlib
import hmac
import secrets
import bcrypt
from datetime import datetime, timezone, timedelta
from typing import Optional


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def generate_session_token() -> str:
    return secrets.token_urlsafe(32)


def compute_sha256(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def compute_audit_hash(
    prev_hash: str,
    timestamp: str,
    officer_id: str,
    action: str,
    entity_id: str,
    details: str,
) -> str:
    payload = f"{prev_hash}|{timestamp}|{officer_id}|{action}|{entity_id}|{details}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()
