import io
from PyPDF2 import PdfReader
from docx import Document


def extract_text_from_file(content: bytes, file_type: str) -> str:
    """Extract text from uploaded file based on type."""
    if file_type == "pdf":
        return _extract_pdf(content)
    elif file_type == "docx":
        return _extract_docx(content)
    elif file_type == "txt":
        return content.decode("utf-8", errors="ignore")
    raise ValueError(f"Unsupported file type: {file_type}")


def _extract_pdf(content: bytes) -> str:
    """Extract text from all pages of a PDF file."""
    reader = PdfReader(io.BytesIO(content))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
    return "\n\n".join(pages)


def _extract_docx(content: bytes) -> str:
    """Extract text from all paragraphs of a DOCX file."""
    doc = Document(io.BytesIO(content))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n\n".join(paragraphs)
