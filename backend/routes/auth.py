from fastapi import APIRouter, HTTPException
import bcrypt
import logging
from models.user import UserSignup, UserLogin
from database import users_collection
from utils.jwt_handler import create_access_token
from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr

logger = logging.getLogger(__name__)

router = APIRouter()


class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


@router.post("/signup")
async def signup(user: UserSignup):
    """Register a new user account."""
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(user.password)
    user_doc = {
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed,
        "created_at": datetime.now(timezone.utc),
    }
    result = await users_collection.insert_one(user_doc)
    token = create_access_token({"sub": str(result.inserted_id)})

    return {
        "token": token,
        "user": {
            "id": str(result.inserted_id),
            "name": user.name,
            "email": user.email,
        },
    }


@router.post("/login")
async def login(user: UserLogin):
    """Authenticate user and return JWT token."""
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(db_user["_id"])})
    return {
        "token": token,
        "user": {
            "id": str(db_user["_id"]),
            "name": db_user["name"],
            "email": db_user["email"],
        },
    }


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    """Reset password for an existing user by email verification."""
    db_user = await users_collection.find_one({"email": req.email})
    if not db_user:
        raise HTTPException(status_code=404, detail="No account found with this email")

    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    new_hashed = hash_password(req.new_password)
    await users_collection.update_one(
        {"_id": db_user["_id"]},
        {"$set": {"hashed_password": new_hashed}},
    )

    return {"message": "Password reset successfully. You can now login with your new password."}
