# app/api/upload.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.rag_services import RAGService
from ai.loaders.pdf_loader import PDFLoader
from ai.loaders.docx_loader import DOCXLoader
from ai.loaders.txt_loader import TXTLoader
from app.core.logger import logger
import os
from pathlib import Path

router = APIRouter()
rag_service = RAGService()

UPLOAD_DIR = Path("storage/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# File size limits (in bytes)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_TEXT_LENGTH = 500000  # ~500K characters to prevent memory issues

def save_upload(file: UploadFile) -> str:
    dest = UPLOAD_DIR / file.filename
    with open(dest, "wb") as f:
        f.write(file.file.read())
    return str(dest)

@router.post("/upload")
def upload_file(file: UploadFile = File(...)):
    try:
        # File type validation
        ext = os.path.splitext(file.filename)[1].lower()
        supported = [".pdf", ".docx", ".txt"]
        if ext not in supported:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}. Supported: PDF, DOCX, TXT")

        # Read file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"File too large: {file_size / 1024 / 1024:.2f}MB. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
            )

        logger.info(f"Uploading file: {file.filename} ({file_size / 1024:.2f}KB)")

        path = save_upload(file)

        # choose loader
        if ext == ".pdf":
            loader = PDFLoader()
        elif ext == ".docx":
            loader = DOCXLoader()
        else:
            loader = TXTLoader()

        logger.info(f"Loading document: {path}")
        data = loader.load(path)
        
        # data expected to include 'raw_text'
        text = data.get("raw_text", "")
        if not text:
            raise HTTPException(status_code=400, detail="No text extracted from document")

        # Check text length and truncate if needed
        original_length = len(text)
        if len(text) > MAX_TEXT_LENGTH:
            logger.warning(f"Text too long ({len(text)} chars), truncating to {MAX_TEXT_LENGTH} chars")
            text = text[:MAX_TEXT_LENGTH]
            # Try to cut at sentence boundary
            last_period = text.rfind('.')
            if last_period > MAX_TEXT_LENGTH * 0.9:
                text = text[:last_period + 1]

        logger.info(f"Processing text: {len(text)} characters (original: {original_length})")
        
        result = rag_service.ingest_file_text(
            filename=file.filename, 
            text=text, 
            extra_meta={"source_path": path, "original_length": original_length}
        )
        
        logger.info(f"Successfully ingested document: {result.get('document_id')}")
        
        return {
            "status": "success",
            "ingest": result,
            "document_id": result.get("document_id"),
            "filename": file.filename,
            "text_length": len(text),
            "original_length": original_length
        }
    except HTTPException:
        raise
    except MemoryError as e:
        logger.error(f"Memory error processing file {file.filename}: {e}")
        raise HTTPException(
            status_code=413, 
            detail="File is too large to process. Please try a smaller file or split the document."
        )
    except Exception as e:
        logger.error(f"Error uploading file {file.filename}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing file: {str(e)}"
        )
