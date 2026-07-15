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
    await _seed_demo_user()


async def _create_indexes() -> None:
    db = get_db()
    # Users
    await db.users.create_index("email", unique=True)
    # Documents
    await db.documents.create_index("user_id")
    await db.documents.create_index([("user_id", 1), ("created_at", -1)])
    await db.documents.create_index("status")
    # Chunks — document_id index for fast per-document lookup
    await db.chunks.create_index("document_id")
    # Quiz attempts
    await db.quiz_attempts.create_index([("user_id", 1), ("document_id", 1)])
    await db.quiz_attempts.create_index([("user_id", 1), ("document_id", 1), ("topic", 1)])
    logger.info("MongoDB indexes ensured")


# Public demo account — surfaced on the landing page so anyone can try the app.
DEMO_EMAIL = "random@gmail.com"
DEMO_PASSWORD = "12345678"
DEMO_NAME = "Demo User"


async def _seed_demo_user() -> None:
    """Ensure the public demo account always exists with the advertised password.

    Runs on every startup so the demo credentials keep working even if the
    database is fresh, was reset, or the demo password hash drifted.
    """
    # Imported here to avoid a circular import (auth.utils imports get_db).
    from app.auth.utils import hash_password
    from datetime import datetime, timezone
    import uuid

    db = get_db()
    hashed = hash_password(DEMO_PASSWORD)
    existing = await db.users.find_one({"email": DEMO_EMAIL})
    if existing:
        # Reset the password hash so the advertised credentials always work.
        await db.users.update_one(
            {"_id": existing["_id"]},
            {"$set": {"hashed_password": hashed, "name": DEMO_NAME}},
        )
        logger.info("Demo user password reset")
    else:
        await db.users.insert_one({
            "_id": str(uuid.uuid4()),
            "email": DEMO_EMAIL,
            "name": DEMO_NAME,
            "hashed_password": hashed,
            "created_at": datetime.now(timezone.utc),
        })
        logger.info("Demo user seeded")


async def close_db() -> None:
    global _client
    if _client:
        _client.close()
        _client = None


def get_db() -> AsyncIOMotorDatabase:
    if _client is None:
        raise RuntimeError("Database not connected")
    return _client[settings.mongodb_db_name]
