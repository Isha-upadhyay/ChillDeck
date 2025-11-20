# app/services/export_service.py

from pathlib import Path
from typing import Optional
from pptx import Presentation
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import shutil
import uuid


class ExportService:
    """
    Handles exporting slides into different formats:
    - PDF
    - PPTX
    - Image format (PNG/JPG)
    """

    def __init__(self, export_dir: str = "exports"):
        self.export_dir = Path(export_dir)
        self.export_dir.mkdir(exist_ok=True)

    def _generate_file_path(self, suffix: str):
        filename = f"{uuid.uuid4()}.{suffix}"
        return self.export_dir / filename

    # --------------------------
    # EXPORT: PDF
    # --------------------------
    def export_pdf(self, slide_images: list[str]) -> str:
        """Export multiple slide PNG/JPG images into a single PDF."""

        pdf_path = self._generate_file_path("pdf")
        c = canvas.Canvas(str(pdf_path), pagesize=letter)

        for img_path in slide_images:
            c.drawImage(img_path, 20, 50, width=570, height=480)
            c.showPage()

        c.save()
        return str(pdf_path)

    # --------------------------
    # EXPORT: PPTX
    # --------------------------
    def export_pptx(self, slide_images: list[str]) -> str:
        """Export slide images into a PPTX file."""

        pptx_path = self._generate_file_path("pptx")
        prs = Presentation()

        for img_path in slide_images:
            slide = prs.slides.add_slide(prs.slide_layouts[6])
            slide.shapes.add_picture(img_path, 0, 0, width=prs.slide_width)

        prs.save(str(pptx_path))
        return str(pptx_path)

    # --------------------------
    # EXPORT: IMAGE COPY
    # --------------------------
    def export_images(self, slide_images: list[str]) -> list[str]:
        """Return new copied images (create unique export copies)."""

        exported = []

        for img in slide_images:
            new_path = self._generate_file_path("png")
            shutil.copy(img, new_path)
            exported.append(str(new_path))

        return exported
