import logging
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

logger = logging.getLogger(__name__)

_mongo_uri = settings.MONGO_URI or "mongodb://localhost:27017"

if not settings.MONGO_URI:
    logger.warning(
        "⚠️  MONGO_URI is empty — using dummy localhost connection. "
        "Database operations will fail until you set MONGO_URI in backend/.env"
    )

client = AsyncIOMotorClient(_mongo_uri, tls=True, tlsAllowInvalidCertificates=True)
db = client.insightdocs

users_collection = db.users
history_collection = db.history
