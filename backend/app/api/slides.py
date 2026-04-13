# app/api/slides.py

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from pathlib import Path
import json
import uuid
from datetime import datetime

# Orchestrator (FULL MULTI-AGENT PIPELINE)
from ai.agents.orchestrator import SlideOrchestrator

# Export Service
from app.services.export_service import ExportService

# DB
from app.db.session import get_session
from app.db.models import PresentationTable, PresentationVersionTable
from sqlmodel import select

router = APIRouter()

# Initialize Orchestrator + Export Service
orchestrator = SlideOrchestrator()
export_service = ExportService()


# -------------------------------------------------------
# Request Models
# -------------------------------------------------------

class SlideRequest(BaseModel):
    topic: Optional[str] = None
    document_id: Optional[str] = None
    detail: str = "medium"
    style: str = "corporate"
    num_slides: int = 2


class ExportRequest(BaseModel):
    slides: List[Dict[str, Any]]
    topic: str
    format: str  # pptx | pdf | md | json


class UpdatePresentationRequest(BaseModel):
    slides: List[Dict[str, Any]]
    title: Optional[str] = None
    theme: Optional[str] = None


class UpdateSlideRequest(BaseModel):
    title: str
    bullets: List[str]
    notes: str = ""
    design: Dict[str, Any] = {}


# -------------------------------------------------------
# 0) GET ALL PRESENTATIONS
# -------------------------------------------------------

@router.get("/all")
def get_all_presentations():
    with get_session() as session:
        stmt = select(PresentationTable).where(
            PresentationTable.is_deleted == False
        ).order_by(PresentationTable.updated_at.desc())
        rows = session.exec(stmt).all()
        return [
            {
                "presentation_id": p.id,
                "title": p.topic,
                "num_slides": len(p.slides_data) if isinstance(p.slides_data, list) else 0,
                "edited_at": str(int(p.updated_at.timestamp() * 1000)),
                "theme": p.theme,
            }
            for p in rows
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

        with get_session() as session:
            presentation = PresentationTable(
                topic=payload.topic or "Untitled",
                theme=payload.style,
                slides_data=result["slides"],
            )
            session.add(presentation)
            session.commit()
            session.refresh(presentation)
            presentation_id = presentation.id

            version = PresentationVersionTable(
                presentation_id=presentation_id,
                version_number=1,
                slides_data=result["slides"],
            )
            session.add(version)
            session.commit()

        return {
            "presentation_id": presentation_id,
            "topic": payload.topic,
            "slides": result["slides"],
        }

    except Exception as e:
        raise HTTPException(500, f"Slide generation failed: {str(e)}")


# -------------------------------------------------------
# 1b) SSE STREAMING GENERATE
# -------------------------------------------------------

def _sse_event(step, message, progress, **extra):
    data = {"step": step, "message": message, "progress": progress}
    data.update(extra)
    return "data: " + json.dumps(data) + "\n\n"


@router.post("/generate/stream")
async def generate_slides_stream(payload: SlideRequest):
    import asyncio

    async def event_stream():
        try:
            yield _sse_event("planning", "Planning slide outline...", 10)
            await asyncio.sleep(0.1)

            result = orchestrator.generate_presentation(
                topic=payload.topic,
                document_id=payload.document_id,
                detail=payload.detail,
                style=payload.style,
            )

            total = len(result.get("slides", []))
            for i, slide in enumerate(result.get("slides", [])):
                progress = 20 + int((i / max(total, 1)) * 60)
                title = slide.get("title", "")
                msg = "Writing slide " + str(i + 1) + "/" + str(total) + ": " + title
                yield _sse_event("writing", msg, progress, slide_index=i)
                await asyncio.sleep(0.05)

            yield _sse_event("saving", "Saving presentation...", 90)
            await asyncio.sleep(0.1)

            with get_session() as session:
                presentation = PresentationTable(
                    topic=payload.topic or "Untitled",
                    theme=payload.style,
                    slides_data=result["slides"],
                )
                session.add(presentation)
                session.commit()
                session.refresh(presentation)
                presentation_id = presentation.id

                version = PresentationVersionTable(
                    presentation_id=presentation_id,
                    version_number=1,
                    slides_data=result["slides"],
                )
                session.add(version)
                session.commit()

            done_data = {
                "step": "done",
                "message": "Presentation ready!",
                "progress": 100,
                "presentation_id": presentation_id,
                "slides": result["slides"],
            }
            yield "data: " + json.dumps(done_data) + "\n\n"

        except Exception as e:
            err_data = {"step": "error", "message": str(e), "progress": 0}
            yield "data: " + json.dumps(err_data) + "\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


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
    with get_session() as session:
        presentation = session.get(PresentationTable, presentation_id)
        if not presentation or presentation.is_deleted:
            raise HTTPException(404, "Presentation not found")

        new_version_num = presentation.version + 1
        version = PresentationVersionTable(
            presentation_id=presentation_id,
            version_number=new_version_num,
            slides_data=payload.slides,
        )
        session.add(version)

        presentation.slides_data = payload.slides
        if payload.title:
            presentation.topic = payload.title
        if payload.theme:
            presentation.theme = payload.theme
        presentation.version = new_version_num
        presentation.updated_at = datetime.utcnow()

        session.add(presentation)
        session.commit()

    return {"success": True, "presentation_id": presentation_id, "version": new_version_num}


# -------------------------------------------------------
# 4) GET FULL PRESENTATION
# -------------------------------------------------------

@router.get("/presentation/{presentation_id}")
def get_presentation(presentation_id: str):
    with get_session() as session:
        presentation = session.get(PresentationTable, presentation_id)
        if not presentation or presentation.is_deleted:
            raise HTTPException(404, "Presentation not found")

        return {
            "presentation_id": presentation.id,
            "topic": presentation.topic,
            "theme": presentation.theme,
            "slides": presentation.slides_data,
            "version": presentation.version,
        }


# -------------------------------------------------------
# 5) VERSION HISTORY
# -------------------------------------------------------

@router.get("/presentation/{presentation_id}/versions")
def get_presentation_versions(presentation_id: str):
    with get_session() as session:
        stmt = select(PresentationVersionTable).where(
            PresentationVersionTable.presentation_id == presentation_id
        ).order_by(PresentationVersionTable.version_number.desc())
        versions = session.exec(stmt).all()
        return [
            {
                "id": v.id,
                "version_number": v.version_number,
                "created_at": v.created_at.isoformat(),
                "slide_count": len(v.slides_data) if isinstance(v.slides_data, list) else 0,
            }
            for v in versions
        ]


@router.post("/presentation/{presentation_id}/restore/{version_id}")
def restore_version(presentation_id: str, version_id: str):
    with get_session() as session:
        presentation = session.get(PresentationTable, presentation_id)
        if not presentation:
            raise HTTPException(404, "Presentation not found")

        version = session.get(PresentationVersionTable, version_id)
        if not version or version.presentation_id != presentation_id:
            raise HTTPException(404, "Version not found")

        presentation.slides_data = version.slides_data
        presentation.version = version.version_number
        presentation.updated_at = datetime.utcnow()
        session.add(presentation)
        session.commit()

    return {"success": True, "restored_version": version.version_number}


# -------------------------------------------------------
# 6) UPDATE SINGLE SLIDE
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
# 7) GET SINGLE SLIDE
# -------------------------------------------------------

@router.get("/{slide_id}")
def get_slide(slide_id: str):
    raise HTTPException(404, "Slide not found (use presentation endpoint).")


# -------------------------------------------------------
# 8) DELETE Presentation (soft delete)
# -------------------------------------------------------

@router.delete("/presentation/{presentation_id}")
def delete_presentation(presentation_id: str):
    with get_session() as session:
        presentation = session.get(PresentationTable, presentation_id)
        if not presentation:
            raise HTTPException(404, "Presentation not found")

        presentation.is_deleted = True
        presentation.updated_at = datetime.utcnow()
        session.add(presentation)
        session.commit()

    return {"success": True}
