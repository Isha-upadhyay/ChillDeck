import requests
import os
import logging

# -----------------------------
# Config / API Setup
# -----------------------------
HF_API_KEY = os.getenv("HF_API_KEY")  # Set in .env
HF_MODEL = "TheBloke/LLaMA-2-7B-Chat-GGML"  # Free instruction-following model

HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}

logging.basicConfig(level=logging.INFO)

# -----------------------------
# Helper: Call HuggingFace API
# -----------------------------
def hf_generate(prompt: str, max_length: int = 150):
    """
    Calls HuggingFace Inference API for text generation
    Returns generated text
    """
    API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"
    payload = {"inputs": prompt, "parameters": {"max_new_tokens": max_length}}

    try:
        response = requests.post(API_URL, headers=HEADERS, json=payload, timeout=30)
        response.raise_for_status()
        generated_text = response.json()[0].get('generated_text', "")
        return generated_text
    except Exception as e:
        logging.error(f"HuggingFace API error: {e}")
        return ""

# -----------------------------
# Writer Agent
# -----------------------------
def generate_slide_content(slide_title: str, research_points: list = [], max_bullets: int = 3):
    """
    Generates dynamic bullet points for a slide using AI
    Args:
        slide_title: str - Slide title
        research_points: list - Additional research / stats
        max_bullets: int - Max bullet points to generate
    Returns:
        list of strings: bullet points
    """

    # Combine research points into prompt
    research_text = ""
    if research_points:
        research_text = "Include these points/facts in your bullets:\n" + "\n".join(research_points)

    prompt = f"""
    You are a professional presentation content writer.
    Generate {max_bullets} concise, professional, research-backed bullet points for a slide.
    Slide Title: "{slide_title}"
    {research_text}
    Output ONLY bullet points. Numbered or dash format is fine.
    """

    logging.info(f"Generating content for slide: {slide_title}")

    # Call HuggingFace API
    ai_response = hf_generate(prompt, max_length=200)

    # Parse AI response into list of bullets
    bullets = []
    for line in ai_response.split("\n"):
        line = line.strip()
        if not line:
            continue
        # Remove numbering / dashes
        if line[0].isdigit() or line.startswith("-") or line[0] == "*":
            line = line.lstrip("-*1234567890. ").strip()
        bullets.append(line)
        if len(bullets) >= max_bullets:
            break

    # Fallback if API fails
    if not bullets:
        bullets = [f"{slide_title} point {i+1}" for i in range(max_bullets)]
        logging.warning(f"API failed, using fallback bullets for slide: {slide_title}")

    return bullets

# -----------------------------
# Example Usage / Test
# -----------------------------
if __name__ == "__main__":
    slide_title = "Impact of AI on Education"
    research_points = [
        "AI adoption increased by 60% in schools in 2024",
        "E-learning platforms saw 200% growth during pandemic",
        "AI helps personalize student learning experience"
    ]

    bullets = generate_slide_content(slide_title, research_points, max_bullets=4)
    print(f"Slide: {slide_title}")
    for b in bullets:
        print("-", b)
