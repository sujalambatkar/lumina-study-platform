import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import connect_db, close_db
from app.documents.ingestion import get_chroma_client
from app.security import SecurityHeadersMiddleware
from app.auth.router import router as auth_router
from app.documents.router import router as documents_router
from app.agent.router import router as agent_router
from app.quiz.router import router as quiz_router
from app.concepts.router import router as concepts_router
from app.tracker.router import router as tracker_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Starting Lumina API...")
    await connect_db()
    # Models load lazily on first use to stay within 512MB limit
    logger.info("Startup complete")
    yield
    await close_db()
    logger.info("Shutdown complete")


app = FastAPI(
    title="Lumina API",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url=None,
    lifespan=lifespan,
)

# ── Middleware (order matters — first added = outermost) ──────────────────────

app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_origin_regex=r"https://.*\.(vercel\.app|onrender\.com)",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    max_age=600,
)

# ── Global exception handler ──────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled error on %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again."},
    )

# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(agent_router)
app.include_router(quiz_router)
app.include_router(concepts_router)
app.include_router(tracker_router)


@app.get("/health", include_in_schema=False)
async def health() -> dict:
    return {"status": "ok"}
