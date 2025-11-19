# ai/agents/design_agent.py
def apply_theme(slide_content: dict, theme: str = "Modern"):
    """
    Adds layout & theme info to slide.
    """
    slide_content["theme"] = theme
    return slide_content
