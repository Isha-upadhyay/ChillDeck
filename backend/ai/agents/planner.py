# ai/agents/planning_agent.py
def plan_slides(topic: str, num_slides: int = 10):
    """
    Generates a slide outline based on topic.
    Returns a list of slide titles.
    """
    return [f"Slide {i+1} - {topic}" for i in range(num_slides)]
