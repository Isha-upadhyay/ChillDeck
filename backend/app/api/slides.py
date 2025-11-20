# # backend/app/api/slides.py
# from fastapi import APIRouter, Query
# from app.services.slide_service import generate_slides


# router = APIRouter()

# @router.get("/generate")
# def generate(topic: str = Query(..., description="Topic for slide generation"),
#              num_slides: int = Query(10, description="Number of slides"),
#              theme: str = Query("Modern", description="Slide theme")):
#     slides = generate_slides(topic, num_slides, theme)
#     return {"slides": slides}


from fastapi import APIRouter
from ai.agents.quality import generate_slides

router = APIRouter()

@router.post("/generate")
def generate(data: dict):
    topic = data.get("topic")
    result = generate_slides(topic)
    return result
