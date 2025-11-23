from ai.utils.agents_utils import BaseAgent
import json
import re

PLANNER_SYSTEM_PROMPT = """
You are a Planning Agent for an AI Slide Generator.
Your job:
- Understand the topic or document context
- Break it into a structured outline
- Return slides (6 to 20)
- Return ONLY valid JSON. No explanations.

JSON FORMAT:
{
  "slides": [
      {
        "id": 1,
        "title": "Slide Title",
        "points": [
            "Point 1",
            "Point 2"
        ]
      }
  ]
}
"""

class PlannerAgent(BaseAgent):
    def __init__(self):
        super().__init__(PLANNER_SYSTEM_PROMPT)

    def _extract_json(self, text: str):
        """
        Extract JSON from messy LLM output using regex.
        Works even if model returns code blocks or extra text.
        """
        try:
            return json.loads(text)          # direct JSON
        except:
            pass

        # Extract JSON using regex
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            try:
                return json.loads(match.group(0))
            except:
                pass

        return {"slides": []}

    def plan(self, topic: str, detail: str = "medium", num_slides: int = 10):
        prompt = f"""
Topic: {topic}
Detail Level: {detail}
Number of slides: {num_slides}
Create a structured outline.
Return ONLY JSON.
"""
        raw = self.run(prompt)
        return self._extract_json(raw)

    def plan_from_document(self, context: str, detail: str = "medium", num_slides: int = 10):
        prompt = f"""
Document Context:
{context}

Detail Level: {detail}
Number of slides: {num_slides}
Create a structured outline.
Return ONLY JSON.
"""
        raw = self.run(prompt)
        return self._extract_json(raw)
