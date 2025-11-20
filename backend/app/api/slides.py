# from fastapi import APIRouter
# from ai.agents.quality import generate_slides

# router = APIRouter()

# @router.post("/generate")
# def generate(data: dict):
#     topic = data.get("topic")
#     result = generate_slides(topic)
#     return result


# app/api/slides.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag_services import RAGService
from ai.agents.writer import WriterAgent  # your already-made writer agent
from ai.agents.planner import PlannerAgent

router = APIRouter()
rag_service = RAGService()
planner = PlannerAgent()
writer = WriterAgent()

class SlideRequest(BaseModel):
    topic: str = None
    document_id: str = None   # optional: if user uploaded and wants to base on doc
    detail: str = "medium"
    style: str = "corporate"
    num_slides: int = 10

@router.post("/generate")
def generate_slides(payload: SlideRequest):
    # Decide: document-based or topic-based
    if payload.document_id:
        # retrieve relevant chunks from RAG
        hits = rag_service.query_document(payload.document_id, payload.topic or "", top_k=8)
        # make a combined context string
        combined_context = "\n\n".join([h["text"] for h in hits])
        # use planner to create outline from doc-based context
        outline_json = planner.plan_from_document(context=combined_context, detail=payload.detail, num_slides=payload.num_slides)
    else:
        outline_json = planner.plan(topic=payload.topic or "Untitled", detail=payload.detail, num_slides=payload.num_slides)

    # researcher: for each outline item, call RAG globally to enrich
    enriched_sections = []
    for slide in outline_json.get("slides", []):
        q = slide.get("title") or slide.get("heading") or payload.topic
        hits = rag_service.query_global(q, top_k=5)
        context_text = "\n\n".join([h["text"] for h in hits])
        enriched_sections.append({"outline": slide, "context": context_text})

    # writer: produce final slide contents using writer agent
    final_slides = []
    for sec in enriched_sections:
        content = writer.write(sec["outline"], sec["context"])  # implement writer.write to accept context
        final_slides.append(content)

    return {"topic": payload.topic, "slides": final_slides}
