from ai.utils.agents_utils import BaseAgent
import json
import re

WRITER_SYSTEM_PROMPT = """
You are a Slide Content Writing Agent.
You must combine outline + context to generate full slide content.

Return ONLY JSON in this format:
{
  "slide": {
     "id": 1,
     "heading": "Slide title",
     "bullets": ["point 1", "point 2"],
     "notes": "speaker notes"
  }
}
"""

class WriterAgent(BaseAgent):
    def __init__(self):
        super().__init__(WRITER_SYSTEM_PROMPT)

    def _extract_json(self, text: str):
        """Extract valid JSON from any LLM output."""
        # Direct load attempt
        try:
            return json.loads(text)
        except:
            pass

        # Try extracting JSON inside code block
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            try:
                return json.loads(match.group(0))
            except:
                pass

        # Last fallback
        return {
            "slide": {
                "id": 0,
                "heading": "",
                "bullets": [],
                "notes": ""
            }
        }

    def write(self, enriched_outline, context: str = None):
        """Write slide using outline + extra RAG context."""
        prompt = f"""
Outline JSON:
{enriched_outline}

Context:
{context or ""}

Write ONLY JSON for one slide.
"""

        raw = self.run(prompt)
        result = self._extract_json(raw)

        # Normalize output
        slide = result.get("slide") or result.get("slides", [{}])[0]

        return {
            "id": slide.get("id", 0),
            "heading": slide.get("title") or slide.get("heading") or "Untitled Slide",
            "bullets": slide.get("bullets", []),
            "notes": slide.get("notes", "")
        }

    def write_slide(self, title: str, research_data: dict):
        """Write slide from title + research data only."""
        prompt = f"""
Title: {title}
Research: {research_data}

Write ONLY JSON for one slide.
"""
        raw = self.run(prompt)
        result = self._extract_json(raw)

        slide = result.get("slide") or result.get("slides", [{}])[0]

        return {
            "title": slide.get("heading") or title,
            "bullets": slide.get("bullets", []),
            "notes": slide.get("notes", "")
        }
