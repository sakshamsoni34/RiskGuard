from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from backend.app.core.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class CaseRecord(Base):
    __tablename__ = "cases"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    case_number = Column(String(32), unique=True, index=True, nullable=False)
    title = Column(String(256), nullable=False)
    status = Column(String(32), default="NEW", index=True)  # NEW, UNDER_INVESTIGATION, ESCALATED, CLOSED
    priority = Column(String(32), default="P2_HIGH", index=True)  # P1_CRITICAL, P2_HIGH, P3_MEDIUM, P4_LOW
    assigned_to = Column(String(128), default="Insp. Vikram Sharma")
    target_mule_account = Column(String(128), nullable=True)
    suspect_entity = Column(String(128), nullable=True)
    total_amount_at_risk = Column(Float, default=0.0)
    summary = Column(Text, default="")
    tags_json = Column(Text, default="[]")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    notes = relationship("CaseNoteRecord", back_populates="case", cascade="all, delete-orphan")
    links = relationship("CaseTransactionLink", back_populates="case", cascade="all, delete-orphan")


class CaseTransactionLink(Base):
    __tablename__ = "case_transaction_links"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    case_id = Column(String(36), ForeignKey("cases.id"), index=True, nullable=False)
    transaction_id = Column(String(64), index=True, nullable=False)

    case = relationship("CaseRecord", back_populates="links")


class CaseNoteRecord(Base):
    __tablename__ = "case_notes"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    case_id = Column(String(36), ForeignKey("cases.id"), index=True, nullable=False)
    officer_badge = Column(String(32), nullable=False)
    officer_name = Column(String(128), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    text = Column(Text, nullable=False)

    case = relationship("CaseRecord", back_populates="notes")
