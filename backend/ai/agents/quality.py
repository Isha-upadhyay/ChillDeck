from ai.utils.agent_utils import BaseAgent

QUALITY_SYSTEM_PROMPT = """
You are a Quality Agent.
Clean grammar, remove repetition, shorten bullets, improve clarity.

Return SAME JSON structure with improved content.
"""

class QualityAgent(BaseAgent):
    def __init__(self):
        super().__init__(QUALITY_SYSTEM_PROMPT)

    def improve(self, slides_json):
        return self.run(slides_json)
