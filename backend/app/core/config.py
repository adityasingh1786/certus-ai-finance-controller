"""
AI Finance Controller — Application Configuration

Loads all environment variables. Never hardcodes secrets.
"""

import os
from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    app_env: str = "development"
    app_secret_key: str = "change-this-to-a-random-secret"
    app_title: str = "AI Finance Controller"
    app_version: str = "1.0.0"
    app_description: str = (
        "An AI agent that ingests messy settlement data, reconciles it, "
        "and answers cash-position questions — never silently trusting a bad number."
    )

    # CORS
    cors_origins: str = "http://localhost:3000"

    # Supabase / Database
    supabase_url: Optional[str] = None
    supabase_anon_key: Optional[str] = None
    supabase_service_role_key: Optional[str] = None
    database_url: str = "sqlite:///./ai_finance_controller.db"

    # API Key Authentication (optional — leave empty for open dev mode)
    api_key: Optional[str] = None

    # Razorpay
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None

    # LLM API Keys
    groq_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None

    # AI Config
    confidence_threshold: float = 0.75
    max_retries_llm: int = 3
    llm_timeout_seconds: int = 30

    # Vector Store
    chroma_persist_dir: str = "./chroma_data"

    # Rate Limiting
    rate_limit_agent_rpm: int = 30  # requests per minute for /agent/query
    rate_limit_ingest_rpm: int = 10  # requests per minute for /settlements/ingest

    # File Upload
    max_upload_size_mb: int = 10
    allowed_file_types: List[str] = ["text/csv", "application/pdf", "text/plain"]

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
