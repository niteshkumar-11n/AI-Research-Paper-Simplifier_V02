from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Any


class AnalysisResult(BaseModel):
    id: str
    user_id: str
    title: str
    file_name: str
    file_type: str
    overview: List[str]
    methodology: List[str]
    key_points: List[str]
    summary: str
    graph_data: Dict[str, Any]
    created_at: datetime


class RenameRequest(BaseModel):
    title: str
