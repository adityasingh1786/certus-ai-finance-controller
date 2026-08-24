"""
AI Finance Controller — FastAPI Application Entry Point

Auto-generates interactive Swagger docs at /docs for free.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.api.v1 import settlements, cash_position, agent, quarantine, audit, reconcile
from app.services.ingestion_service import IngestionService
from app.services.cash_position_service import CashPositionService
from app.services.reconciliation_service import MultiSourceReconciliationEngine
from app.agent.orchestrator import AgentOrchestrator
from app.db.session import init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# Core Service Singletons
ingestion_service = IngestionService()
cash_position_service = CashPositionService(ingestion_service=ingestion_service)
reconciliation_engine = MultiSourceReconciliationEngine()
agent_orchestrator = AgentOrchestrator(ingestion_service=ingestion_service, cash_service=cash_position_service)
ingestion_service.agent_orchestrator = agent_orchestrator


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logger.info(f"🚀 Starting {settings.app_title} v{settings.app_version}")
    logger.info(f"   Environment: {settings.app_env}")
    logger.info(f"   Confidence threshold: {settings.confidence_threshold}")

    try:
        init_db()
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.warning(f"Database init warning: {e}")

    yield

    logger.info("Shutting down AI Finance Controller")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_title,
        description=settings.app_description,
        version=settings.app_version,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/api/v1/openapi.json",
    )

    # Initialize app state directly for test & runtime availability
    app.state.ingestion_service = ingestion_service
    app.state.cash_position_service = cash_position_service
    app.state.reconciliation_engine = reconciliation_engine
    app.state.agent_orchestrator = agent_orchestrator

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(settlements.router, prefix="/api/v1/settlements", tags=["Settlements & Ingestion"])
    app.include_router(reconcile.router, prefix="/api/v1", tags=["Multi-Source Reconciliation"])
    app.include_router(cash_position.router, prefix="/api/v1/cash-position", tags=["Cash Position"])
    app.include_router(agent.router, prefix="/api/v1/agent", tags=["Agent Query"])
    app.include_router(quarantine.router, prefix="/api/v1", tags=["Quarantine"])
    app.include_router(audit.router, prefix="/api/v1/audit-log", tags=["Audit Log"])

    @app.get("/", tags=["Health"])
    async def root():
        return {
            "service": settings.app_title,
            "version": settings.app_version,
            "status": "operational",
            "docs": "/docs",
        }

    @app.get("/health", tags=["Health"])
    async def health():
        return {"status": "healthy", "version": settings.app_version}

    return app


app = create_app()
