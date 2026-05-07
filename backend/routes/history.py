from fastapi import APIRouter, Depends, HTTPException, Query
from utils.jwt_handler import get_current_user
from database import history_collection
from models.history import RenameRequest
from bson import ObjectId
from typing import Optional

router = APIRouter()


@router.get("/history")
async def get_history(
    search: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user),
):
    """Get all analysis history for the current user, optionally filtered by search."""
    query = {"user_id": user_id}
    if search:
        query["title"] = {"$regex": search, "$options": "i"}

    cursor = history_collection.find(query).sort("created_at", -1)
    items = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        doc["created_at"] = doc["created_at"].isoformat()
        items.append(doc)
    return items


@router.get("/history/{item_id}")
async def get_history_item(
    item_id: str,
    user_id: str = Depends(get_current_user),
):
    """Get a specific analysis result by ID."""
    try:
        oid = ObjectId(item_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid item ID")

    doc = await history_collection.find_one({"_id": oid, "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found")

    doc["id"] = str(doc["_id"])
    del doc["_id"]
    doc["created_at"] = doc["created_at"].isoformat()
    return doc


@router.put("/history/{item_id}/rename")
async def rename_history_item(
    item_id: str,
    req: RenameRequest,
    user_id: str = Depends(get_current_user),
):
    """Rename a history item."""
    try:
        oid = ObjectId(item_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid item ID")

    result = await history_collection.update_one(
        {"_id": oid, "user_id": user_id},
        {"$set": {"title": req.title}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Renamed successfully"}


@router.delete("/history/{item_id}")
async def delete_history_item(
    item_id: str,
    user_id: str = Depends(get_current_user),
):
    """Delete a history item."""
    try:
        oid = ObjectId(item_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid item ID")

    result = await history_collection.delete_one({"_id": oid, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Deleted successfully"}
