# app/api/chat.py - AI Chat per Slide

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.db.session import get_session
from app.db.models import ChatMessageTable, PresentationTable
from sqlmodel import select

router = APIRouter()


class ChatRequest(BaseModel):
    presentation_id: str
    slide_index: int
    message: str


class ChatResponse(BaseModel):
    role: str
    content: str
    created_at: str


@router.post("/send")
def send_chat_message(payload: ChatRequest):
    """Send a message to the AI assistant for a specific slide."""
    with get_session() as session:
        presentation = session.get(PresentationTable, payload.presentation_id)
        if not presentation:
            raise HTTPException(404, "Presentation not found")

        user_msg = ChatMessageTable(
            presentation_id=payload.presentation_id,
            slide_index=payload.slide_index,
            role="user",
            content=payload.message,
        )
        session.add(user_msg)

        slides = presentation.slides_data
        slide_context = ""
        if isinstance(slides, list) and payload.slide_index < len(slides):
            slide = slides[payload.slide_index]
            bullets = slide.get("bullets", [])
            slide_context = "Slide title: " + slide.get("title", "") + "\nBullets: " + ", ".join(bullets)

        ai_content = _generate_ai_response(payload.message, slide_context)

        ai_msg = ChatMessageTable(
            presentation_id=payload.presentation_id,
            slide_index=payload.slide_index,
            role="assistant",
            content=ai_content,
        )
        session.add(ai_msg)
        session.commit()

    return {
        "role": "assistant",
        "content": ai_content,
        "created_at": datetime.utcnow().isoformat(),
    }


@router.get("/history/{presentation_id}/{slide_index}")
def get_chat_history(presentation_id: str, slide_index: int):
    """Get chat history for a specific slide."""
    with get_session() as session:
        stmt = (
            select(ChatMessageTable)
            .where(ChatMessageTable.presentation_id == presentation_id)
            .where(ChatMessageTable.slide_index == slide_index)
            .order_by(ChatMessageTable.created_at.asc())
        )
        messages = session.exec(stmt).all()
        return [
            {
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ]


def _generate_ai_response(user_message, slide_context):
    """Generate AI response using the orchestrator LLM if available."""
    try:
        from ai.agents.orchestrator import SlideOrchestrator
        orch = SlideOrchestrator()
        if hasattr(orch, "llm") and orch.llm:
            prompt = (
                "You are a helpful presentation assistant. "
                "The user is asking about a slide.\n\n"
                "Slide Context:\n" + slide_context + "\n\n"
                "User Message: " + user_message + "\n\n"
                "Provide a helpful, concise response to improve their presentation slide."
            )
            response = orch.llm.invoke(prompt)
            if hasattr(response, "content"):
                return response.content
            return str(response)
    except Exception:
        pass

    msg_lower = user_message.lower()
    if "concise" in msg_lower or "shorter" in msg_lower:
        return "Try reducing each bullet to 6-8 words max. Remove filler words. Focus on the key action or insight."
    elif "statistics" in msg_lower or "data" in msg_lower or "numbers" in msg_lower:
        return "Add specific metrics: percentages, dollar amounts, or timeframes for more impact."
    elif "image" in msg_lower or "visual" in msg_lower:
        return "Consider adding a relevant image or icon for each key point using the image generation feature."
    elif "layout" in msg_lower or "design" in msg_lower:
        return "Try switching to a two-column layout for comparison, or use a stats layout for data-heavy slides."
    else:
        return (
            "Here are some suggestions for this slide:\n"
            "1. Keep bullets to 3-5 per slide for clarity\n"
            "2. Use action verbs to start each bullet\n"
            "3. Add a relevant visual or chart to support key points\n"
            "4. Consider if this content should be split across multiple slides"
        )
