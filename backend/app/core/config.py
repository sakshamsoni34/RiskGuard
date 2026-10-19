import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "RiskGuard Investigator Backend"
    VERSION: str = "2.4.0"
    API_V1_PREFIX: str = "/api/v1"
    APP_ENV: str = "demo"
    SECRET_KEY: str = "riskguard-demo-secret-key-32-chars-long-min"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8  # 8 hour shift
    DATABASE_URL: str = "sqlite:///./riskguard_investigator.db"
    ML_SERVICE_URL: str = "http://localhost:8000"
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:9000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
