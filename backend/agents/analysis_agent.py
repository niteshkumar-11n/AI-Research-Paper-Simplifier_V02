import json
import re
import asyncio
import logging
from typing import TypedDict, List, Dict, Any
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langgraph.graph import StateGraph, END
from config import settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# State schema for the LangGraph workflow
# ---------------------------------------------------------------------------
class AnalysisState(TypedDict):
    raw_text: str
    file_name: str
    file_type: str
    cleaned_text: str
    chunks: List[str]
    overview: List[str]
    methodology: List[str]
    key_points: List[str]
    summary: str
    graph_data: Dict[str, Any]
    error: str


# ---------------------------------------------------------------------------
# LLM Initialization: Ollama (primary) + Gemini (fallback)
# ---------------------------------------------------------------------------
def check_ollama_status() -> bool:
    """Check if Ollama is running locally on port 11434 with a short timeout."""
    import urllib.request
    try:
        with urllib.request.urlopen("http://localhost:11434", timeout=0.5) as response:
            return response.status == 200
    except Exception:
        return False

def local_model():
    if os.getenv("VERCEL") or not check_ollama_status():
        return None
    try:
        from langchain_ollama import ChatOllama
    except ImportError:
        logger.info("Install langchain-ollama to use the local model.")
        return None
    return ChatOllama(model="qwen2.5-coder:7b", temperature=0.3, num_predict=4096)


primary_llm = local_model()

def _invoke_with_fallback(chain_prompt, variables: dict) -> str:
    """Try Ollama first if available, fall back to Gemini on failure or if Ollama is offline."""
    if primary_llm is not None:
        # Try primary (Ollama)
        try:
            logger.info("Invoking primary LLM (Ollama qwen2.5-coder:7b)...")
            chain = chain_prompt | primary_llm
            response = chain.invoke(variables)
            logger.info("Primary LLM succeeded.")
            return response.content
        except Exception as e:
            logger.warning(f"Primary LLM failed: {e}. Falling back to Gemini...")

    # Fallback/Direct (Gemini)
    try:
        logger.info("Invoking Gemini LLM...")
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is missing")
        gemini = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.3,
            max_output_tokens=4096,
        )
        chain = chain_prompt | gemini
        response = chain.invoke(variables)
        logger.info("Gemini LLM succeeded.")
        return response.content
    except Exception as e:
        logger.error(f"Gemini LLM failed: {e}")
        raise RuntimeError("The analysis provider is unavailable.") from e


# ---------------------------------------------------------------------------
# Node 1: Clean the extracted text
# ---------------------------------------------------------------------------
def clean_text_node(state: AnalysisState) -> dict:
    text = state["raw_text"]
    # Collapse excessive whitespace
    text = re.sub(r"\s+", " ", text)
    # Remove non-printable chars but keep punctuation
    text = re.sub(r"[^\w\s.,;:!?\-'\"()\[\]{}@#$%&*/+=$]", "", text)
    return {"cleaned_text": text.strip()}


# ---------------------------------------------------------------------------
# Node 2: Chunk text into manageable pieces
# ---------------------------------------------------------------------------
def chunk_text_node(state: AnalysisState) -> dict:
    text = state["cleaned_text"]
    chunk_size = 3000
    overlap = 200
    chunks = []
    for i in range(0, len(text), chunk_size - overlap):
        chunk = text[i : i + chunk_size]
        if chunk.strip():
            chunks.append(chunk)
    # Limit chunks to stay within context window
    return {"chunks": chunks[:10]}


# ---------------------------------------------------------------------------
# Node 3: Analyze content with LLM (Ollama → Gemini fallback)
# ---------------------------------------------------------------------------
ANALYSIS_PROMPT = PromptTemplate.from_template(
    """You are an expert document analyst. Analyze the following document content and provide a structured analysis.

IMPORTANT RULES:
- Base your analysis ONLY on the provided content
- Do NOT hallucinate or add information not present in the document
- Each section must have minimum 2-3 bullet points
- Use clear, professional language

DOCUMENT CONTENT:
{text}

You MUST respond with ONLY valid JSON in this exact format (no markdown fences, no extra text):
{{
    "overview": ["bullet point 1", "bullet point 2", "bullet point 3"],
    "methodology": ["bullet point 1", "bullet point 2", "bullet point 3"],
    "key_points": ["bullet point 1", "bullet point 2", "bullet point 3"],
    "summary": "A comprehensive 3-5 sentence summary of the document"
}}"""
)


def _parse_json_response(text: str) -> dict:
    """Robustly parse JSON from LLM response, handling markdown fences."""
    # Strip markdown code fences if present
    fenced = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL)
    if fenced:
        text = fenced.group(1)
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to find any JSON object in the text
        json_match = re.search(r"\{.*\}", text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except json.JSONDecodeError:
                pass
        return None


def analyze_node(state: AnalysisState) -> dict:
    chunks = state["chunks"]
    combined = "\n".join(chunks[:5])

    try:
        response_text = _invoke_with_fallback(ANALYSIS_PROMPT, {"text": combined})
        data = _parse_json_response(response_text)
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        data = None

    if not isinstance(data, dict) or not isinstance(data.get("summary"), str) or not data["summary"].strip():
        # Preserve useful source text when a provider is unavailable. Label the
        # result so readers can distinguish an excerpt from an AI summary.
        excerpt = state["cleaned_text"][:1200].strip()
        return {
            "overview": [],
            "methodology": [],
            "key_points": [],
            "summary": "Source excerpt (AI analysis unavailable): " + excerpt,
            "error": "analysis_unavailable",
        }

    return {
        "overview": data.get("overview", [])[:5],
        "methodology": data.get("methodology", [])[:5],
        "key_points": data.get("key_points", [])[:5],
        "summary": data.get("summary", ""),
    }


# ---------------------------------------------------------------------------
# Node 4: Extract knowledge graph for visualization
# ---------------------------------------------------------------------------
GRAPH_PROMPT = PromptTemplate.from_template(
    """Analyze the following document text and extract a knowledge graph of key entities and their relationships.

DOCUMENT TEXT:
{text}

You MUST respond with ONLY valid JSON in this exact format (no markdown fences, no extra text):
{{
    "title": "Knowledge Graph title based on document content",
    "nodes": [
        {{"id": "1", "label": "Entity Name 1"}},
        {{"id": "2", "label": "Entity Name 2"}},
        {{"id": "3", "label": "Entity Name 3"}},
        {{"id": "4", "label": "Entity Name 4"}},
        {{"id": "5", "label": "Entity Name 5"}}
    ],
    "edges": [
        {{"source": "1", "target": "2", "label": "relationship"}},
        {{"source": "1", "target": "3", "label": "relationship"}},
        {{"source": "2", "target": "4", "label": "relationship"}}
    ],
    "description": "Brief description of what this knowledge graph represents"
}}

Rules:
- Extract real entities (people, places, concepts, organizations, technologies) from the document
- Edges must describe the relationship between two nodes
- Minimum 4 nodes, maximum 12 nodes
- Each edge must reference valid node IDs
- Node IDs must be unique strings
- Use concise labels (1-4 words for nodes, 1-3 words for edge labels)"""
)


def extract_stats_node(state: AnalysisState) -> dict:
    if state.get("error"):
        return {"graph_data": {}}
    chunks = state["chunks"]
    combined = "\n".join(chunks[:3])

    try:
        response_text = _invoke_with_fallback(GRAPH_PROMPT, {"text": combined})
        graph_data = _parse_json_response(response_text)
    except Exception as e:
        logger.error(f"Knowledge graph extraction failed: {e}")
        graph_data = None

    # Validate structure
    if graph_data and "nodes" in graph_data and "edges" in graph_data:
        # Ensure all edges reference valid node IDs
        node_ids = {n["id"] for n in graph_data["nodes"]}
        graph_data["edges"] = [
            e for e in graph_data["edges"]
            if e.get("source") in node_ids and e.get("target") in node_ids
        ]
    else:
        graph_data = {}

    return {"graph_data": graph_data}


# ---------------------------------------------------------------------------
# Build the LangGraph workflow
# ---------------------------------------------------------------------------
workflow = StateGraph(AnalysisState)

workflow.add_node("clean_text", clean_text_node)
workflow.add_node("chunk_text", chunk_text_node)
workflow.add_node("analyze", analyze_node)
workflow.add_node("extract_stats", extract_stats_node)

workflow.set_entry_point("clean_text")
workflow.add_edge("clean_text", "chunk_text")
workflow.add_edge("chunk_text", "analyze")
workflow.add_edge("analyze", "extract_stats")
workflow.add_edge("extract_stats", END)

analysis_app = workflow.compile()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
async def run_analysis(raw_text: str, file_name: str, file_type: str) -> dict:
    """Run the full LangGraph analysis pipeline on extracted document text."""
    initial_state = {
        "raw_text": raw_text,
        "file_name": file_name,
        "file_type": file_type,
        "cleaned_text": "",
        "chunks": [],
        "overview": [],
        "methodology": [],
        "key_points": [],
        "summary": "",
        "graph_data": {},
        "error": "",
    }

    # LangGraph invoke is synchronous – run in executor to keep FastAPI async
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(None, analysis_app.invoke, initial_state)

    return {
        "overview": result.get("overview", []),
        "methodology": result.get("methodology", []),
        "key_points": result.get("key_points", []),
        "summary": result.get("summary", ""),
        "graph_data": result.get("graph_data", {}),
    }
