from agents.planner import generate_outline
from agents.research import research_slide
from agents.writer import generate_slide_content
from agents.quality import improve_slide
from agents.slide_designer import apply_theme
from agents.image_generator import generate_slide_image

def generate_full_slides(topic, detail="medium", theme="corporate"):
    slides = generate_outline(topic, detail)
    full_slides = []
    for s in slides:
        research_points = research_slide(s["title"])
        bullets = generate_slide_content(s["title"], research_points)
        s["points"] = bullets
        s = improve_slide(s)
        s = apply_theme(s, theme)
        s["image"] = generate_slide_image(s["title"])
        full_slides.append(s)
    return full_slides
