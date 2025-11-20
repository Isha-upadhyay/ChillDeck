# app/services/file_service.py

import shutil
import uuid
from pathlib import Path
from fastapi import UploadFile
from ai.loaders.pdf_loader import PDFLoader
from ai.loaders.docx_loader import DocxLoader
from ai.loaders.txt_loader import TextLoader
from app.core.logger import logger


class FileService:
    """
    Handles uploads + document loading + safe storage
    """

    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(exist_ok=True)

    def _save_temp_file(self, file: UploadFile) -> Path:
        ext = Path(file.filename).suffix
        file_path = self.upload_dir / f"{uuid.uuid4()}{ext}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        logger.info(f"Uploaded file saved at: {file_path}")
        return file_path

    # --------------------------
    # LOAD DOCUMENT CONTENT
    # --------------------------
    def load_document(self, file: UploadFile) -> str:
        """Identifies file type and loads text via correct loader."""

        path = self._save_temp_file(file)
        ext = path.suffix.lower()

        if ext == ".pdf":
            return PDFLoader().load(path)
        elif ext == ".docx":
            return DocxLoader().load(path)
        elif ext in [".txt", ".md"]:
            return TextLoader().load(path)
        else:
            raise ValueError("Unsupported document type")

    def cleanup(self, path: Path):
        if path.exists():
            path.unlink()
