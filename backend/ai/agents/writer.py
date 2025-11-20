from utils.agents_utils import BaseAgent

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

    def write(self, enriched_outline):
        return self.run(enriched_outline)
