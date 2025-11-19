# backend/app/services/slide_service.py
from ai.agents import (
    planning_agent,
    research_agent,
    content_writer_agent,
    quality_agent,
    design_agent,
    image_agent
)
def generate_slides(topic: str, num_slides: int = 10, theme: str = "Modern"):
    slides = []
    outline = planning_agent.plan_slides(topic, num_slides)
    
    for slide_title in outline:
        research = research_agent.research_topic(slide_title)
        content = content_writer_agent.write_content(slide_title, research)
        content = quality_agent.improve_quality(content)
        content = design_agent.apply_theme(content, theme)
        content["image"] = image_agent.generate_image(slide_title)
        slides.append(content)
    
    return slides
