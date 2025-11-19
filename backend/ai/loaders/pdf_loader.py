# ai/loaders/pdf_loader.py
from PyPDF2 import PdfReader

def load_pdf(file_path: str) -> str:
    text = ""
    reader = PdfReader(file_path)
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text
