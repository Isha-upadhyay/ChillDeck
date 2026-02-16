from ai.utils.agents_utils import BaseAgent # baseagent - common ai agent  which call llm internally and set krta hai system and give .run() method
import json # convert ai output to json
import re # reqular expression to extract json fro messy ai output

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

class PlannerAgent(BaseAgent): # baseagent se inherit kr rha hai - llm support and run() method ko
    def __init__(self):
        super().__init__(PLANNER_SYSTEM_PROMPT) #call constructore and system ptompt ste

    # ------------------------------------
    #  JSON CLEANER
    # ------------------------------------
    def _extract_json(self, text: str):
        """Extract JSON even from messy LLM output."""
        try:
            return json.loads(text)
        except:
            pass

        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            try:
                return json.loads(match.group(0))
            except:
                pass

        return {"slides": []}

    # ------------------------------------
    #  TOPIC-BASED OUTLINE
    # ------------------------------------
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

    # ------------------------------------
    #  DOCUMENT-BASED OUTLINE
    # ------------------------------------
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

    # ------------------------------------
    #  UNIVERSAL OUTLINE METHOD (REQUIRED BY ORCHESTRATOR)
    # ------------------------------------
    def create_outline(
    self,
    topic: str = None,
    document_text: str = None,
    detail: str = "medium",
    num_slides: int = 2,
):
     if document_text:
        return self.plan_from_document(
            context=document_text,
            detail=detail,
            num_slides=num_slides
        )

     return self.plan(
        topic=topic,
        detail=detail,
        num_slides=num_slides
    )
