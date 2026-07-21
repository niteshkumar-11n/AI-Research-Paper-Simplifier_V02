import sys
import os

# Ensure backend directory is in python module search path (critical for Vercel)
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routes import auth, upload, history
import logging

logger = logging.getLogger(__name__)

app = FastAPI(
    title="InsightDocs AI",
    description="AI-powered document analysis platform",
    version="1.0.0",
)

# Allow local dev origins + Vercel deployment origins
_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]
_prod_origin = os.environ.get("CORS_ORIGIN")
if _prod_origin:
    _origins.append(_prod_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(upload.router, prefix="/api", tags=["Upload & Analysis"])
app.include_router(history.router, prefix="/api", tags=["History"])


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch all unhandled exceptions and return a proper JSON response.
    This ensures CORS headers are always present even on server errors."""
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )


@app.get("/")
async def root():
    return {"message": "InsightDocs AI API is running"}

