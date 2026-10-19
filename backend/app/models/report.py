from sqlalchemy import Column, String, Float, DateTime, Integer, Text
from datetime import datetime, timezone
import uuid
from backend.app.core.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class ReportRecord(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    report_number = Column(String(32), unique=True, index=True, nullable=False)
    case_id = Column(String(36), index=True, nullable=False)
    generated_by = Column(String(128), nullable=False)
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    title = Column(String(256), nullable=False)
    total_transactions = Column(Integer, default=0)
    total_disputed_amount = Column(Float, default=0.0)
    primary_typology = Column(String(128), default="Unclassified Typology")
    sha256_verification_hash = Column(String(64), nullable=False)
    status = Column(String(32), default="DRAFT")  # DRAFT, SEALED, DISPATCHED_TO_LEGAL
    file_path = Column(String(256), nullable=True)
