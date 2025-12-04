
# # app/api/slides.py
# from fastapi import APIRouter, HTTPException
# from fastapi.responses import FileResponse
# from pydantic import BaseModel
# from typing import List, Dict, Any
# from app.services.rag_services import RAGService
# from app.services.export_service import ExportService
# from ai.agents.writer import WriterAgent  # your already-made writer agent
# from ai.agents.planner import PlannerAgent
# from pathlib import Path

# router = APIRouter()
# rag_service = RAGService()
# planner = PlannerAgent()
# writer = WriterAgent()
# export_service = ExportService()

# class SlideRequest(BaseModel):
#     topic: str = None
#     document_id: str = None   # optional: if user uploaded and wants to base on doc
#     detail: str = "medium"
#     style: str = "corporate"
#     num_slides: int = 10

# @router.post("/generate")
# def generate_slides(payload: SlideRequest):
#     # Decide: document-based or topic-based
#     if payload.document_id:
#         # retrieve relevant chunks from RAG
#         hits = rag_service.query_document(payload.document_id, payload.topic or "", top_k=8)
#         # make a combined context string
#         combined_context = "\n\n".join([h["text"] for h in hits])
#         # use planner to create outline from doc-based context
#         outline_json = planner.plan_from_document(context=combined_context, detail=payload.detail, num_slides=payload.num_slides)
#     else:
#         outline_json = planner.plan(topic=payload.topic or "Untitled", detail=payload.detail, num_slides=payload.num_slides)

#     # researcher: for each outline item, call RAG globally to enrich
#     enriched_sections = []
#     for slide in outline_json.get("slides", []):
#         q = slide.get("title") or slide.get("heading") or payload.topic
#         hits = rag_service.query_global(q, top_k=5)
#         context_text = "\n\n".join([h["text"] for h in hits])
#         enriched_sections.append({"outline": slide, "context": context_text})

#     # writer: produce final slide contents using writer agent
#     final_slides = []
#     for idx, sec in enumerate(enriched_sections, start=1):
#         content = writer.write(sec["outline"], sec["context"])
#         # Ensure each slide has unique ID and proper structure
#         if isinstance(content, dict):
#             # Ensure ID is unique
#             content["id"] = content.get("id", idx)
#             # Normalize field names
#             if "heading" in content and "title" not in content:
#                 content["title"] = content["heading"]
#             elif "title" not in content:
#                 content["title"] = sec["outline"].get("title", f"Slide {idx}")
#             # Ensure bullets exist
#             if "bullets" not in content:
#                 content["bullets"] = content.get("points", [])
#             # Ensure notes exist
#             if "notes" not in content:
#                 content["notes"] = ""
#         else:
#             # Fallback if content is not a dict
#             content = {
#                 "id": idx,
#                 "title": sec["outline"].get("title", f"Slide {idx}"),
#                 "bullets": sec["outline"].get("points", []),
#                 "notes": ""
#             }
#         final_slides.append(content)

#     return {"topic": payload.topic, "slides": final_slides}


# class ExportRequest(BaseModel):
#     slides: List[Dict[str, Any]]
#     topic: str
#     format: str  # "pptx", "pdf", "md", "json"


# @router.post("/export")
# def export_slides(payload: ExportRequest):
#     """Export slides to various formats"""
#     try:
#         if payload.format == "pptx":
#             file_path = export_service.export_pptx(payload.slides, payload.topic)
#         elif payload.format == "pdf":
#             file_path = export_service.export_pdf(payload.slides, payload.topic)
#         elif payload.format == "md":
#             file_path = export_service.export_markdown(payload.slides, payload.topic)
#         elif payload.format == "json":
#             file_path = export_service.export_json(payload.slides, payload.topic)
#         else:
#             raise HTTPException(status_code=400, detail=f"Unsupported format: {payload.format}")
        
#         return FileResponse(
#             path=file_path,
#             filename=Path(file_path).name,
#             media_type="application/octet-stream"
#         )
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


# class UpdateSlideRequest(BaseModel):
#     title: str
#     bullets: List[str]
#     notes: str = ""
#     design: Dict[str, Any] = {}


# @router.put("/{slide_id}")
# def update_slide(slide_id: str, payload: UpdateSlideRequest):
#     """Update a single slide"""
#     # For now, just return the updated slide data
#     # In a real app, you'd save this to a database
#     return {
#         "id": slide_id,
#         "title": payload.title,
#         "bullets": payload.bullets,
#         "notes": payload.notes,
#         "design": payload.design
#     }


# @router.get("/{slide_id}")
# def get_slide(slide_id: str):
#     """Get a single slide by ID"""
#     # For now, return a placeholder
#     # In a real app, you'd fetch from database
#     raise HTTPException(status_code=404, detail="Slide not found. This endpoint requires database storage.")




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

PRESENTATIONS = {}

# -------------------------------------------------------
# REQUEST MODELS
# -------------------------------------------------------

class SlideRequest(BaseModel):
    topic: str = None
    document_id: str = None       # optional → for document-based slides
    detail: str = "medium"
    style: str = "corporate"
    num_slides: int = 2


class ExportRequest(BaseModel):
    slides: List[Dict[str, Any]]
    topic: str
    format: str  # pptx | pdf | md | json


# -------------------------------------------------------
# 1) GENERATE SLIDES (FULL MULTI-AGENT PIPELINE)
# -------------------------------------------------------

@router.post("/generate")
def generate_slides(payload: SlideRequest):
    try:
        # Run multi-agent orchestrator
        result = orchestrator.generate_presentation(
            topic=payload.topic,
            document_id=payload.document_id,
            detail=payload.detail,
            style=payload.style,
        )

        # Unique ID for presentation
        from time import time
        presentation_id = str(int(time() * 1000))

        # 🔥 SAVE GENERATED SLIDES
        PRESENTATIONS[presentation_id] = result["slides"]

        print("\n\nSAVED PRESENTATIONS NOW:", PRESENTATIONS.keys(), "\n\n")

        # Return response
        return {
            "presentation_id": presentation_id,
            "topic": payload.topic,
            "slides": result["slides"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Slide generation failed: {str(e)}")


# -------------------------------------------------------
# 2) EXPORT SLIDES TO PPTX, PDF, MARKDOWN, JSON
# -------------------------------------------------------

@router.post("/export")
def export_slides(payload: ExportRequest):
    """
    Export slides to file formats.
    """

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
            raise HTTPException(status_code=400, detail=f"Unsupported export format: {payload.format}")

        return FileResponse(
            path=file_path,
            filename=Path(file_path).name,
            media_type="application/octet-stream"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


# -------------------------------------------------------
# 3) UPDATE SLIDE (Optional - Future DB support)
# -------------------------------------------------------

class UpdateSlideRequest(BaseModel):
    title: str
    bullets: List[str]
    notes: str = ""
    design: Dict[str, Any] = {}


@router.put("/{slide_id}")
def update_slide(slide_id: str, payload: UpdateSlideRequest):
    """
    Update a single slide (currently not stored in DB).
    """

    return {
        "id": slide_id,
        "title": payload.title,
        "bullets": payload.bullets,
        "notes": payload.notes,
        "design": payload.design
    }

# -------------------------------------------------------
# 3) GET FULL PRESENTATION (ALL SLIDES)
# -------------------------------------------------------

@router.get("/presentation/{presentation_id}")
def get_presentation(presentation_id: str):
    if presentation_id not in PRESENTATIONS:
        raise HTTPException(status_code=404, detail="Presentation not found")

    return {
        "presentation_id": presentation_id,
        "slides": PRESENTATIONS[presentation_id]
    }


# -------------------------------------------------------
# 4) GET SLIDE BY ID (Optional - Placeholder)
# -------------------------------------------------------

@router.get("/{slide_id}")
def get_slide(slide_id: str):
    """
    Get a single slide by ID (not implemented because slides are not stored yet).
    """
    raise HTTPException(status_code=404, detail="Slide not found (DB not implemented yet).")


