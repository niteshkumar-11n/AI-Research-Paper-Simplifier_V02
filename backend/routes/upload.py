from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from utils.jwt_handler import get_current_user
from services.document_service import extract_text_from_file
from database import history_collection
from datetime import datetime, timezone

router = APIRouter()

ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}


@router.post("/upload/analyze")
async def analyze_file(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    """Upload a document and run AI-powered analysis."""
    # Validate file type by extension
    file_ext = ""
    if file.filename and "." in file.filename:
        file_ext = file.filename.rsplit(".", 1)[-1].lower()

    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload PDF, DOCX, or TXT files.",
        )

    # Read file content
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    # Extract text from document
    try:
        raw_text = extract_text_from_file(content, file_ext)
    except Exception as e:
        raise HTTPException(
            status_code=422, detail=f"Failed to parse document: {str(e)}"
        )

    if not raw_text or not raw_text.strip():
        raise HTTPException(
            status_code=422, detail="Could not extract any text from the file"
        )

    # Run AI analysis via LangGraph agent
    try:
        from agents.analysis_agent import run_analysis
        result = await run_analysis(raw_text, file.filename, file_ext)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"AI analysis failed: {str(e)}"
        )

    # Save analysis to MongoDB
    history_doc = {
        "user_id": user_id,
        "title": file.filename.rsplit(".", 1)[0] if "." in file.filename else file.filename,
        "file_name": file.filename,
        "file_type": file_ext,
        "overview": result["overview"],
        "methodology": result["methodology"],
        "key_points": result["key_points"],
        "summary": result["summary"],
        "graph_data": result["graph_data"],
        "created_at": datetime.now(timezone.utc),
    }

    inserted = await history_collection.insert_one(history_doc)

    # Return the saved document
    history_doc["id"] = str(inserted.inserted_id)
    del history_doc["_id"]
    history_doc["created_at"] = history_doc["created_at"].isoformat()

    return history_doc
