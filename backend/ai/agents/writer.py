# ai/agents/writer_agent.py
def write_content(slide_title: str, key_points: list):
    """
    Converts outline + research points into bullet content.
    """
    bullets = [f"- {point}" for point in key_points]
    return {
        "title": slide_title,
        "content": "\n".join(bullets)
    }
