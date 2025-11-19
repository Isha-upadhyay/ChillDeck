# backend/routers/slides.py
from fastapi import APIRouter
from pydantic import BaseModel
from backend.agents.planner import generate_outline

router = APIRouter()

class TopicRequest(BaseModel):
    topic: str
    detail: str = "medium"
    theme: str = "corporate"

@router.post("/generate-outline")
def generate(req: TopicRequest):
    return {"outline": generate_outline(req.topic, req.detail)}
