# app/api/upload.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.rag_service import RAGService
from ai.loaders.pdf_loader import PDFLoader
from ai.loaders.docx_loader import DOCXLoader
from ai.loaders.txt_loader import TXTLoader
import os
from pathlib import Path

router = APIRouter()
rag_service = RAGService()

UPLOAD_DIR = Path("storage/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def save_upload(file: UploadFile) -> str:
    dest = UPLOAD_DIR / file.filename
    with open(dest, "wb") as f:
        f.write(file.file.read())
    return str(dest)

@router.post("/upload")
def upload_file(file: UploadFile = File(...)):
    # simple validation
    ext = os.path.splitext(file.filename)[1].lower()
    supported = [".pdf", ".docx", ".txt"]
    if ext not in supported:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    path = save_upload(file)

    # choose loader
    if ext == ".pdf":
        loader = PDFLoader()
    elif ext == ".docx":
        loader = DOCXLoader()
    else:
        loader = TXTLoader()

    data = loader.load(path)
    # data expected to include 'raw_text'
    text = data.get("raw_text", "")
    if not text:
        raise HTTPException(status_code=400, detail="No text extracted from document")

    result = rag_service.ingest_file_text(filename=file.filename, text=text, extra_meta={"source_path": path})
    return {"status": "success", "ingest": result}
