import certifi
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings
import logging

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None


async def connect_db() -> None:
    global _client
    _client = AsyncIOMotorClient(
        settings.mongodb_uri,
        serverSelectionTimeoutMS=10000,
        connectTimeoutMS=10000,
        tlsCAFile=certifi.where(),
    )
    # Verify connection
    await _client.admin.command("ping")
    logger.info("MongoDB connected")
    await _create_indexes()


async def _create_indexes() -> None:
    db = get_db()
    # Users
    await db.users.create_index("email", unique=True)
    # Documents
    await db.documents.create_index("user_id")
    await db.documents.create_index([("user_id", 1), ("created_at", -1)])
    await db.documents.create_index("status")
    # Quiz attempts
    await db.quiz_attempts.create_index([("user_id", 1), ("document_id", 1)])
    await db.quiz_attempts.create_index([("user_id", 1), ("document_id", 1), ("topic", 1)])
    logger.info("MongoDB indexes ensured")


async def close_db() -> None:
    global _client
    if _client:
        _client.close()
        _client = None


def get_db() -> AsyncIOMotorDatabase:
    if _client is None:
        raise RuntimeError("Database not connected")
    return _client[settings.mongodb_db_name]
