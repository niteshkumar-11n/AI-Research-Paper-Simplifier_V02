import logging
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    MONGO_URI: str = ""
    JWT_SECRET: str = "dev-secret-change-me-in-production"
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()

# Warn about missing configuration
if not settings.MONGO_URI:
    logger.warning(
        "⚠️  MONGO_URI is not set! Database operations will fail. "
        "Add MONGO_URI to backend/.env (see .env.example)"
    )
if settings.JWT_SECRET == "dev-secret-change-me-in-production":
    logger.warning(
        "⚠️  JWT_SECRET is using the default dev value. "
        "Set a secure secret in backend/.env for production."
    )
if not settings.GEMINI_API_KEY:
    logger.warning(
        "⚠️  GEMINI_API_KEY is not set! AI analysis will fail. "
        "Add GEMINI_API_KEY to backend/.env (see .env.example)"
    )
