from pydantic import BaseModel
from typing import List


class AuditLogOut(BaseModel):
    id: str
    timestamp: str
    officerId: str
    officerName: str
    action: str
    entityType: str
    entityId: str
    ipAddress: str
    sha256Hash: str
    details: str


class AuditVerifyResponse(BaseModel):
    status: str  # "INTACT" | "TAMPERED"
    total_records_verified: int
    last_block_hash: str
    merkle_valid: bool
