from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from backend.app.core.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    badge_number = Column(String(32), unique=True, index=True, nullable=False)
    username = Column(String(64), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    full_name = Column(String(128), nullable=False)
    rank = Column(String(64), default="Investigating Officer")
    cell = Column(String(64), default="Cyber Crime Cell")
    role = Column(String(32), default="INVESTIGATOR")  # INVESTIGATOR, SUPERVISOR, ADMIN, READONLY
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    token = Column(String(128), unique=True, index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    ip_address = Column(String(64), default="127.0.0.1")
    user_agent = Column(String(256), default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False)

    user = relationship("User", back_populates="sessions")
