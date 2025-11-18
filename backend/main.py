# backend/main.py
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="AI Slide Gen - Backend")

class TopicRequest(BaseModel):
    topic: str
    detail: str = "medium"  # optional: minimal/medium/detailed
    theme: str = "corporate"

@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-slide-gen-backend"}

@app.post("/generate-outline")
async def generate_outline(req: TopicRequest):
    topic = req.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic required")

    # If OPENAI_API_KEY present, you can call OpenAI; otherwise return mock
    if OPENAI_API_KEY:
        import openai
        openai.api_key = OPENAI_API_KEY
        prompt = f"Create a slide outline (5-8 slides) for the topic: {topic}. Return JSON array of slides with 'title' and 3 bullet points each."
        try:
            res = openai.ChatCompletion.create(
                model="gpt-4o-mini", # change if not available
                messages=[{"role":"user","content":prompt}],
                max_tokens=500,
            )
            text = res.choices[0].message['content']
            # Try to parse JSON from the model; if fails, return as text fallback
            import json
            try:
                data = json.loads(text)
                return {"source":"openai","outline":data}
            except Exception:
                return {"source":"openai_text","text": text}
        except Exception as e:
            return {"error":"OpenAI call failed", "detail": str(e)}
    else:
        # MOCK response when no API key
        mock = [
            {"title":"Introduction to " + topic, "points":["Definition","Why it matters","Key use-cases"]},
            {"title":"History & Background", "points":["Origins","Key milestones","Current state"]},
            {"title":"Core Concepts", "points":["Concept A","Concept B","Concept C"]},
            {"title":"Applications", "points":["App 1","App 2","App 3"]},
            {"title":"Challenges & Risks", "points":["Challenge 1","Challenge 2","Mitigations"]},
            {"title":"Conclusion", "points":["Summary","Future directions","References"]}
        ]
        return {"source":"mock","outline": mock}
