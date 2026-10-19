from pydantic import BaseModel
from typing import Optional


class ReportCreate(BaseModel):
    case_id: str
    title: str
    primary_typology: Optional[str] = "Account Takeover / Mule Exfiltration"


class ReportOut(BaseModel):
    id: str
    reportNumber: str
    caseId: str
    generatedBy: str
    generatedAt: str
    title: str
    totalTransactions: int
    totalDisputedAmount: float
    primaryTypology: str
    sha256VerificationHash: str
    status: str
    filePath: Optional[str] = None
