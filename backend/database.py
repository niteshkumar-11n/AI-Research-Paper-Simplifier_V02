from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

client = AsyncIOMotorClient(settings.MONGO_URI, tls=True, tlsAllowInvalidCertificates=True)
db = client.insightdocs

users_collection = db.users
history_collection = db.history
