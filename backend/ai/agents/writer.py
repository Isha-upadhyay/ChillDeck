from ai.utils.agents_utils import BaseAgent

WRITER_SYSTEM_PROMPT = """
You are a Slide Content Writing Agent.
Combine outline + research to generate clean slides.

RETURN JSON:
{
  "slides": [
      {
         "id": 1,
         "heading": "",
         "bullets": [],
         "notes": ""
      }
  ]
}
"""

class WriterAgent(BaseAgent):
    def __init__(self):
        super().__init__(WRITER_SYSTEM_PROMPT)

    def write(self, enriched_outline, context: str = None):
        """Write slide content from outline and optional context"""
        prompt = f"Outline: {enriched_outline}"
        if context:
            prompt += f"\n\nAdditional Context: {context}"
        result = self.run(prompt)
        import json
        try:
            parsed = json.loads(result)
            # If it's a list of slides, return first one; if single slide dict, return it
            if isinstance(parsed, dict) and "slides" in parsed:
                return parsed["slides"][0] if parsed["slides"] else {"title": "", "bullets": [], "notes": ""}
            elif isinstance(parsed, dict):
                return parsed
            else:
                return {"title": "", "bullets": [], "notes": ""}
        except (json.JSONDecodeError, ValueError, TypeError):
            return {"title": str(enriched_outline), "bullets": [], "notes": ""}
    
    def write_slide(self, title: str, research_data: dict):
        """Write a single slide from title and research data (for orchestrator)"""
        prompt = f"Title: {title}\nResearch Data: {research_data}\n\nCreate slide content with bullets and notes."
        result = self.run(prompt)
        import json
        try:
            parsed = json.loads(result)
            if isinstance(parsed, dict):
                return {
                    "title": parsed.get("title") or title,
                    "bullets": parsed.get("bullets", []),
                    "notes": parsed.get("notes", "")
                }
        except (json.JSONDecodeError, ValueError, TypeError):
            pass
        return {"title": title, "bullets": [], "notes": ""}
