from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer, Text
from datetime import datetime, timezone
import uuid
from backend.app.core.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class TransactionRecord(Base):
    __tablename__ = "transactions"

    id = Column(String(64), primary_key=True)  # e.g. TXN-1001
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    customer_id = Column(String(64), index=True, nullable=False)
    customer_name = Column(String(128), nullable=False)
    customer_email = Column(String(128), nullable=False)
    customer_phone = Column(String(32), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(8), default="INR")
    merchant = Column(String(128), nullable=False)
    merchant_category = Column(String(64), nullable=False)
    
    # Payment method
    payment_type = Column(String(32), default="upi")
    payment_brand = Column(String(32), nullable=True)
    
    # Device telemetry
    is_new_device = Column(Boolean, default=False)
    device_os = Column(String(64), default="Android")
    device_browser = Column(String(64), default="Chrome Mobile")
    device_fingerprint = Column(String(128), default="")
    
    # Location & Network
    ip_address = Column(String(64), default="127.0.0.1")
    city = Column(String(64), default="Mumbai")
    country = Column(String(64), default="India")
    is_vpn_or_proxy = Column(Boolean, default=False)
    distance_from_home_km = Column(Float, default=0.0)
    velocity_2min = Column(Integer, default=1)
    
    # ML & Rule Scoring
    risk_score = Column(Float, default=0.0, index=True)
    risk_level = Column(String(16), default="LOW", index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    decision = Column(String(16), default="APPROVED")  # APPROVED, OTP_REQUIRED, BLOCKED
    status = Column(String(32), default="PROCESSED")  # PROCESSED, REVIEWED, MANUALLY_OVERRIDDEN
    anomaly_score = Column(Float, default=0.0)
    
    rule_flags_json = Column(Text, default="[]")  # JSON string of rule flags
    shap_explanation_json = Column(Text, default="[]")  # JSON string of SHAP values
    
    is_synthetic = Column(Boolean, default=True)
