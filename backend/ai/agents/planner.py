from ai.utils.agents_utils import BaseAgent

PLANNER_SYSTEM_PROMPT = """
You are a Planning Agent for an AI Slide Generator.
Your job is to:
- Understand topic or document summary
- Break it into structured slide outline
- Decide number of slides (6 to 20)
- Return pure JSON in this structure:

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

    def plan(self, topic: str, detail: str = "medium", num_slides: int = 10):
        prompt = f"Topic: {topic}\nDetail Level: {detail}\nNumber of slides: {num_slides}\nCreate a slide outline."
        result = self.run(prompt)
        # Parse JSON response
        import json
        try:
            return json.loads(result)
        except (json.JSONDecodeError, ValueError, TypeError):
            return {"slides": []}
    
    def create_outline(self, topic: str, detail: str = "medium"):
        """Alias for plan method for orchestrator compatibility"""
        return self.plan(topic, detail)
    
    def plan_from_document(self, context: str, detail: str = "medium", num_slides: int = 10):
        prompt = f"Document Context:\n{context}\n\nDetail Level: {detail}\nNumber of slides: {num_slides}\nCreate a slide outline from this document."
        result = self.run(prompt)
        import json
        try:
            return json.loads(result)
        except (json.JSONDecodeError, ValueError, TypeError):
            return {"slides": []}
