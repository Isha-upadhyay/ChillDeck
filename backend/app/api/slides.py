# app/api/slides.py

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any
from pathlib import Path

# Orchestrator (FULL MULTI-AGENT PIPELINE)
from ai.agents.orchestrator import SlideOrchestrator

# Export Service
from app.services.export_service import ExportService

router = APIRouter()

# Initialize Orchestrator + Export Service
orchestrator = SlideOrchestrator()
export_service = ExportService()

# In-memory DB (temporary)
PRESENTATIONS = {}

# -------------------------------------------------------
# Request Models
# -------------------------------------------------------

class SlideRequest(BaseModel):
    topic: str = None
    document_id: str = None
    detail: str = "medium"
    style: str = "corporate"
    num_slides: int = 2


class ExportRequest(BaseModel):
    slides: List[Dict[str, Any]]
    topic: str
    format: str  # pptx | pdf | md | json


class UpdatePresentationRequest(BaseModel):
    slides: List[Dict[str, Any]]
    title: str | None = None
    theme: str | None = None


class UpdateSlideRequest(BaseModel):
    title: str
    bullets: List[str]
    notes: str = ""
    design: Dict[str, Any] = {}


# -------------------------------------------------------
# 0) GET ALL PRESENTATIONS (IMPORTANT: MUST BE FIRST)
# -------------------------------------------------------

@router.get("/all")
def get_all_presentations():
    return [
        {
            "presentation_id": pid,
            "title": PRESENTATIONS[pid][0].get("title", f"Presentation {pid}"),
            "num_slides": len(PRESENTATIONS[pid]),
            "edited_at": pid,
        }
        for pid in PRESENTATIONS
    ]


# -------------------------------------------------------
# 1) GENERATE SLIDES
# -------------------------------------------------------

@router.post("/generate")
def generate_slides(payload: SlideRequest):
    try:
        result = orchestrator.generate_presentation(
            topic=payload.topic,
            document_id=payload.document_id,
            detail=payload.detail,
            style=payload.style,
        )

        from time import time
        presentation_id = str(int(time() * 1000))

        # Save slides
        PRESENTATIONS[presentation_id] = result["slides"]

        print("\nSAVED PRESENTATIONS NOW:", PRESENTATIONS.keys(), "\n")

        return {
            "presentation_id": presentation_id,
            "topic": payload.topic,
            "slides": result["slides"],
        }

    except Exception as e:
        raise HTTPException(500, f"Slide generation failed: {str(e)}")


# -------------------------------------------------------
# 2) EXPORT SLIDES
# -------------------------------------------------------

@router.post("/export")
def export_slides(payload: ExportRequest):

    try:
        if payload.format == "pptx":
            file_path = export_service.export_pptx(payload.slides, payload.topic)

        elif payload.format == "pdf":
            file_path = export_service.export_pdf(payload.slides, payload.topic)

        elif payload.format == "md":
            file_path = export_service.export_markdown(payload.slides, payload.topic)

        elif payload.format == "json":
            file_path = export_service.export_json(payload.slides, payload.topic)

        else:
            raise HTTPException(400, f"Unsupported export format: {payload.format}")

        return FileResponse(
            path=file_path,
            filename=Path(file_path).name,
            media_type="application/octet-stream",
        )

    except Exception as e:
        raise HTTPException(500, f"Export failed: {str(e)}")


# -------------------------------------------------------
# 3) UPDATE FULL PRESENTATION (SAVE ALL)
# -------------------------------------------------------

@router.put("/presentation/{presentation_id}")
def update_presentation(presentation_id: str, payload: UpdatePresentationRequest):

    if presentation_id not in PRESENTATIONS:
        raise HTTPException(404, "Presentation not found")

    PRESENTATIONS[presentation_id] = payload.slides

    print("UPDATED PRESENTATION:", presentation_id)

    return {"success": True, "presentation_id": presentation_id}


# -------------------------------------------------------
# 4) GET FULL PRESENTATION (EDITOR PAGE)
# -------------------------------------------------------

@router.get("/presentation/{presentation_id}")
def get_presentation(presentation_id: str):
    if presentation_id not in PRESENTATIONS:
        raise HTTPException(404, "Presentation not found")

    return {
        "presentation_id": presentation_id,
        "slides": PRESENTATIONS[presentation_id],
    }


# -------------------------------------------------------
# 5) UPDATE SINGLE SLIDE
# -------------------------------------------------------

@router.put("/{slide_id}")
def update_slide(slide_id: str, payload: UpdateSlideRequest):
    return {
        "id": slide_id,
        "title": payload.title,
        "bullets": payload.bullets,
        "notes": payload.notes,
        "design": payload.design,
    }


# -------------------------------------------------------
# 6) GET SINGLE SLIDE (KEEP LAST)
# -------------------------------------------------------

@router.get("/{slide_id}")
def get_slide(slide_id: str):
    raise HTTPException(404, "Slide not found (DB not implemented yet).")



# DELETE Presentation
@router.delete("/presentation/{presentation_id}")
def delete_presentation(presentation_id: str):
    if presentation_id not in PRESENTATIONS:
        raise HTTPException(404, "Presentation not found")

    # remove from "DB"
    del PRESENTATIONS[presentation_id]
    return {"success": True}

