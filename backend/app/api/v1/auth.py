from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from typing import Optional

from backend.app.core.database import get_db
from backend.app.core.security import verify_password, generate_session_token
from backend.app.core.config import settings
from backend.app.models.user import User, UserSession
from backend.app.schemas.auth import LoginRequest, LoginResponse, OfficerProfile
from backend.app.services.audit import record_audit_event

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.badge_number == req.badge_number).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid officer badge number or security credentials",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Officer clearance revoked or suspended",
        )

    # Create session token
    token = generate_session_token()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    session = UserSession(
        token=token,
        user_id=user.id,
        expires_at=expires_at,
    )
    db.add(session)
    db.commit()

    # Log to audit trail
    record_audit_event(
        db=db,
        officer_id=user.badge_number,
        officer_name=user.full_name,
        action="OFFICER_LOGIN_AUTHENTICATED",
        entity_type="USER_SESSION",
        entity_id=session.id,
        details=f"Secure session opened for {user.full_name} ({user.rank})",
    )

    officer = OfficerProfile(
        id=user.id,
        badge_number=user.badge_number,
        username=user.username,
        full_name=user.full_name,
        rank=user.rank,
        cell=user.cell,
        role=user.role,
    )
    return LoginResponse(access_token=token, officer=officer)


@router.get("/me", response_model=OfficerProfile)
def get_current_officer(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        # Default mock officer for demo convenience
        demo_user = db.query(User).filter(User.badge_number == "CC-8421").first()
        if demo_user:
            return OfficerProfile(
                id=demo_user.id,
                badge_number=demo_user.badge_number,
                username=demo_user.username,
                full_name=demo_user.full_name,
                rank=demo_user.rank,
                cell=demo_user.cell,
                role=demo_user.role,
            )
        raise HTTPException(status_code=401, detail="Missing authorization header")

    token = authorization.split(" ")[1]
    session = db.query(UserSession).filter(UserSession.token == token, UserSession.is_revoked == False).first()
    if not session or session.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired or invalid")

    user = session.user
    return OfficerProfile(
        id=user.id,
        badge_number=user.badge_number,
        username=user.username,
        full_name=user.full_name,
        rank=user.rank,
        cell=user.cell,
        role=user.role,
    )
