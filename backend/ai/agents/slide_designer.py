from ai.utils.agents_utils import BaseAgent

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
        """Apply design to slides"""
        result = self.run(slides_json)
        import json
        try:
            return json.loads(result)
        except (json.JSONDecodeError, ValueError, TypeError):
            return {"design": {"layout": "centered", "icon": "", "image_prompt": ""}}
    
    def apply_design(self, content: dict, style: str = "corporate"):
        """Apply design theme to slide content (for orchestrator)"""
        prompt = f"Slide Content: {content}\nStyle: {style}\n\nApply design theme and return design object."
        result = self.run(prompt)
        import json
        try:
            parsed = json.loads(result)
            if isinstance(parsed, dict) and "design" in parsed:
                return parsed["design"]
            return parsed
        except (json.JSONDecodeError, ValueError, TypeError):
            return {"layout": "centered", "icon": "", "image_prompt": ""}
    
    def generate_image_prompt(self, content: dict):
        """Generate image prompt from slide content"""
        title = content.get("title", "")
        bullets = content.get("bullets", [])
        prompt_text = f"Create a professional, clean illustration for a slide titled '{title}' with key points: {', '.join(bullets[:3])}. Style: modern, minimal, presentation-friendly."
        return prompt_text
