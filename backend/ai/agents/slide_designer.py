from ai.utils.agent_utils import BaseAgent

DESIGN_SYSTEM_PROMPT = """
You are Slide Design Agent.
Tasks:
- Apply theme: modern | dark | corporate | cute | tech
- Add icons
- Add image prompts
Return JSON:

{
  "slides": [
     {
       "id": 1,
       "heading": "",
       "bullets": [],
       "design": {
           "icon": "",
           "layout": "left-image" | "top-title" | "centered",
           "image_prompt": "AI generated prompt"
       }
     }
  ]
}
"""

class DesignerAgent(BaseAgent):
    def __init__(self):
        super().__init__(DESIGN_SYSTEM_PROMPT)

    def design(self, slides_json):
        return self.run(slides_json)
