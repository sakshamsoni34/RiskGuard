from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.core.config import settings
from backend.app.core.database import engine, Base
import backend.app.models  # Ensures all models are imported before creating tables
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.transactions import router as transactions_router
from backend.app.api.v1.cases import router as cases_router
from backend.app.api.v1.audit import router as audit_router
from backend.app.api.v1.reports import router as reports_router
from backend.app.api.v1.models import router as models_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="RiskGuard Investigator Core Backend & Audit Engine for Authorized Cyber Crime Cells",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health & Root
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "HEALTHY",
        "service": "riskguard-investigator-backend",
        "version": settings.VERSION,
        "environment": settings.APP_ENV,
        "database": "connected",
    }


# Include V1 Routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(transactions_router, prefix=settings.API_V1_PREFIX)
app.include_router(cases_router, prefix=settings.API_V1_PREFIX)
app.include_router(audit_router, prefix=settings.API_V1_PREFIX)
app.include_router(reports_router, prefix=settings.API_V1_PREFIX)
app.include_router(models_router, prefix=settings.API_V1_PREFIX)
