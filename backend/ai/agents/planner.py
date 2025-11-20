from ai.utils.agent_utils import BaseAgent

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

    def plan(self, topic: str):
        return self.run(topic)
