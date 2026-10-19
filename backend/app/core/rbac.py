from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional

from backend.app.core.database import get_db
from backend.app.models.user import User, UserSession


class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(
        self,
        authorization: Optional[str] = Header(None),
        db: Session = Depends(get_db),
    ) -> User:
        if not authorization or not authorization.startswith("Bearer "):
            # For local demo convenience, fall back to default demo investigator
            user = db.query(User).filter(User.badge_number == "CC-8421").first()
            if user and (user.role in self.allowed_roles or "INVESTIGATOR" in self.allowed_roles):
                return user
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication credentials were not provided",
            )

        token = authorization.split(" ")[1]
        session = db.query(UserSession).filter(
            UserSession.token == token,
            UserSession.is_revoked == False,
        ).first()

        if not session or session.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session has expired. Re-authentication required.",
            )

        user = session.user
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Officer account disabled or suspended",
            )

        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Required role in {self.allowed_roles}, current: {user.role}",
            )

        return user


require_investigator = RoleChecker(["INVESTIGATOR", "SUPERVISOR", "ADMIN"])
require_supervisor = RoleChecker(["SUPERVISOR", "ADMIN"])
require_admin = RoleChecker(["ADMIN"])
