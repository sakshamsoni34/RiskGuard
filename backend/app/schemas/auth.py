from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    badge_number: str
    password: str
    role: Optional[str] = "INVESTIGATOR"


class OfficerProfile(BaseModel):
    id: str
    badge_number: str
    username: str
    full_name: str
    rank: str
    cell: str
    role: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    officer: OfficerProfile
