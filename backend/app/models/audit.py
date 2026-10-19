from sqlalchemy import Column, String, DateTime, Text, Integer
from datetime import datetime, timezone
import uuid
from backend.app.core.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class AuditLogRecord(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    sequence_id = Column(Integer, primary_key=False, autoincrement=True, unique=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    prev_hash = Column(String(64), nullable=False)
    sha256_hash = Column(String(64), nullable=False, unique=True, index=True)
    officer_id = Column(String(32), nullable=False, index=True)
    officer_name = Column(String(128), nullable=False)
    action = Column(String(64), nullable=False, index=True)
    entity_type = Column(String(32), nullable=False)  # TRANSACTION, CASE, MODEL, REPORT, USER_SESSION
    entity_id = Column(String(64), nullable=False)
    ip_address = Column(String(64), default="127.0.0.1")
    details = Column(Text, default="")
