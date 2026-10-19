from pydantic import BaseModel
from typing import List, Optional


class CaseNoteCreate(BaseModel):
    text: str


class CaseNoteOut(BaseModel):
    id: str
    officerBadge: str
    officerName: str
    timestamp: str
    text: str


class CaseCreate(BaseModel):
    title: str
    priority: str = "P2_HIGH"  # P1_CRITICAL, P2_HIGH, P3_MEDIUM, P4_LOW
    target_mule_account: Optional[str] = None
    suspect_entity: Optional[str] = None
    transaction_ids: List[str] = []
    summary: Optional[str] = ""
    tags: List[str] = []


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None  # NEW, UNDER_INVESTIGATION, ESCALATED, CLOSED
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    summary: Optional[str] = None


class CaseOut(BaseModel):
    id: str
    caseNumber: str
    title: str
    status: str
    priority: str
    assignedTo: str
    targetMuleAccount: Optional[str] = None
    suspectEntity: Optional[str] = None
    totalAmountAtRisk: float
    transactionIds: List[str] = []
    createdAt: str
    updatedAt: str
    tags: List[str] = []
    notes: List[CaseNoteOut] = []
    summary: str
