from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.core.database import get_db
from backend.app.models.audit import AuditLogRecord
from backend.app.schemas.audit import AuditLogOut, AuditVerifyResponse
from backend.app.services.audit import verify_audit_chain

router = APIRouter(prefix="/audit", tags=["Audit Trail"])


@router.get("/logs", response_model=List[AuditLogOut])
def get_audit_logs(
    action: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    officer_id: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    query = db.query(AuditLogRecord)
    if action and action != "ALL":
        query = query.filter(AuditLogRecord.action == action)
    if entity_type and entity_type != "ALL":
        query = query.filter(AuditLogRecord.entity_type == entity_type)
    if officer_id and officer_id != "ALL":
        query = query.filter(AuditLogRecord.officer_id == officer_id)

    records = query.order_by(AuditLogRecord.timestamp.desc()).limit(limit).all()
    return [
        AuditLogOut(
            id=r.id,
            timestamp=r.timestamp.isoformat(),
            officerId=r.officer_id,
            officerName=r.officer_name,
            action=r.action,
            entityType=r.entity_type,
            entityId=r.entity_id,
            ipAddress=r.ip_address,
            sha256Hash=r.sha256_hash,
            details=r.details,
        )
        for r in records
    ]


@router.api_route("/verify", methods=["GET", "POST"], response_model=AuditVerifyResponse)
def verify_integrity(db: Session = Depends(get_db)):
    result = verify_audit_chain(db)
    return AuditVerifyResponse(
        status=result["status"],
        total_records_verified=result["total_records_verified"],
        last_block_hash=result["last_block_hash"],
        merkle_valid=result["merkle_valid"],
    )

