import os
from ai.loaders.pdf_loader import PDFLoader
from ai.loaders.docx_loader import DOCXLoader
from ai.loaders.txt_loader import TXTLoader

class DocumentLoader:
    def load(self, file_path):
        ext = os.path.splitext(file_path)[1].lower()

        if ext == ".pdf":
            return PDFLoader().load(file_path)

        if ext == ".docx":
            return DOCXLoader().load(file_path)

        if ext == ".txt":
            return TXTLoader().load(file_path)

        raise ValueError("Unsupported file type")
