# def generate_outline(topic: str, detail: str = "medium"):
#     """
#     Returns dynamic slide outline based on topic.
#     Each slide = title + points (placeholders)
#     """
#     slides = []
    
#     # Decide number of slides based on detail
#     num_slides = {"minimal":3, "medium":5, "detailed":8}.get(detail,5)
    
#     # Slide 1: Introduction
#     slides.append({"title": f"Introduction to {topic}", 
#                    "points":["Definition", "Importance", "Key facts"]})
    
#     # Middle slides: Concepts / Details
#     for i in range(2, num_slides):
#         slides.append({"title": f"{topic} Concept {i-1}", 
#                        "points":[f"Point {i}-1", f"Point {i}-2", f"Point {i}-3"]})
    
#     # Last slide: Summary
#     slides.append({"title":"Summary", "points":["Key takeaways","Next steps"]})
    
#     return slides





import requests
import os

HF_API_KEY = os.getenv("HF_API_KEY")
HF_MODEL = "TheBloke/LLaMA-2-7B-Chat-GGML"  # HuggingFace free model

def hf_generate(prompt: str, max_length: int = 200):
    """
    Calls HuggingFace Inference API for text generation
    """
    API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    payload = {"inputs": prompt, "parameters":{"max_new_tokens":max_length}}
    response = requests.post(API_URL, headers=headers, json=payload)
    if response.status_code == 200:
        return response.json()[0]['generated_text']
    else:
        print("HF API Error:", response.text)
        return ""

def generate_outline(topic: str, detail: str = "medium"):
    """
    Returns dynamic slide outline for a given topic
    """
    # Decide number of slides based on detail level
    num_slides = {"minimal": 3, "medium": 5, "detailed": 8}.get(detail, 5)
    
    # Prepare prompt for AI
    prompt = f"""
    Generate {num_slides} slide titles for a presentation on "{topic}".
    Output only titles as a numbered list, concise and professional style.
    """
    
    response = hf_generate(prompt)
    
    # Parse numbered list into Python list
    slides = []
    for line in response.split("\n"):
        line = line.strip()
        if line and (line[0].isdigit() or "-" in line):
            # Remove numbering
            title = line.split(".")[-1].strip() if "." in line else line
            slides.append({"title": title, "points":[]})  # points will be filled later
        if len(slides) >= num_slides:
            break
            
    # Fallback if API fails
    if not slides:
        slides = [{"title": f"Slide {i+1}", "points":[]} for i in range(num_slides)]
    
    return slides

