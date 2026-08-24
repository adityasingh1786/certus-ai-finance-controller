"""
AI Finance Controller — Database Session & Engine
Configures SQLAlchemy engine (SQLite local fallback or PostgreSQL / Supabase)
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.models.orm import Base
from app.core.config import get_settings

settings = get_settings()

DATABASE_URL = settings.database_url or "sqlite:///./finance_controller.db"

# SQLite requires check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    future=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initializes all tables defined in Base models."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI dependency for DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
