from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.app.models.audit import AuditLogRecord
from backend.app.core.security import compute_audit_hash

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"


def record_audit_event(
    db: Session,
    officer_id: str,
    officer_name: str,
    action: str,
    entity_type: str,
    entity_id: str,
    ip_address: str = "127.0.0.1",
    details: str = "",
) -> AuditLogRecord:
    # Get last entry for hash chaining
    last_record = db.query(AuditLogRecord).order_by(AuditLogRecord.timestamp.desc()).first()
    prev_hash = last_record.sha256_hash if last_record else GENESIS_HASH

    now = datetime.now(timezone.utc)
    now_str = now.strftime("%Y-%m-%dT%H:%M:%SZ")

    current_hash = compute_audit_hash(
        prev_hash=prev_hash,
        timestamp=now_str,
        officer_id=officer_id,
        action=action,
        entity_id=entity_id,
        details=details,
    )

    log_entry = AuditLogRecord(
        timestamp=now,
        prev_hash=prev_hash,
        sha256_hash=current_hash,
        officer_id=officer_id,
        officer_name=officer_name,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        ip_address=ip_address,
        details=details,
    )

    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry


def verify_audit_chain(db: Session) -> dict:
    records = db.query(AuditLogRecord).order_by(AuditLogRecord.timestamp.asc()).all()
    if not records:
        return {
            "status": "INTACT",
            "total_records_verified": 0,
            "last_block_hash": GENESIS_HASH,
            "merkle_valid": True,
        }

    prev_hash = GENESIS_HASH
    for r in records:
        expected = compute_audit_hash(
            prev_hash=prev_hash,
            timestamp=r.timestamp.strftime("%Y-%m-%dT%H:%M:%SZ"),
            officer_id=r.officer_id,
            action=r.action,
            entity_id=r.entity_id,
            details=r.details,
        )
        if r.sha256_hash != expected:
            return {
                "status": "TAMPERED",
                "total_records_verified": len(records),
                "last_block_hash": r.sha256_hash,
                "merkle_valid": False,
                "tampered_at_id": r.id,
            }
        prev_hash = r.sha256_hash

    return {
        "status": "INTACT",
        "total_records_verified": len(records),
        "last_block_hash": records[-1].sha256_hash,
        "merkle_valid": True,
    }
