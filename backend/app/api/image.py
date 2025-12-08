from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import requests
import os
import base64
import time

router = APIRouter()

HF_API_KEY = os.getenv("HF_API_KEY")
MODEL_ID = "stabilityai/stable-diffusion-xl-base-1.0"
HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{MODEL_ID}"

# ------------------------------
# SIMPLE IN-MEMORY IMAGE STORAGE
# ------------------------------
IMAGES_DB = {}  
"""
IMAGES_DB = {
   "id1234": { 
       "id": "id1234",
       "url": "data:image/png;base64,...",
       "prompt": "sunset mountain",
       "created_at": 123456789
   }
}
"""

class ImageGenRequest(BaseModel):
    prompt: str
    model: Optional[str] = None

# -----------------------
# GENERATE & SAVE IMAGE
# -----------------------
@router.post("/generate")
def generate_image(payload: ImageGenRequest):
    key = HF_API_KEY or os.getenv("HUGGINGFACEHUB_API_TOKEN")
    if not key:
        raise HTTPException(status_code=500, detail="No Hugging Face API key configured")

    url = HF_API_URL if not payload.model else f"https://router.huggingface.co/hf-inference/models/{payload.model}"

    headers = {
        "Authorization": f"Bearer {key}",
        "Accept": "image/png"
    }

    req = {
        "inputs": payload.prompt,
        "options": {"wait_for_model": True}
    }

    resp = requests.post(url, headers=headers, json=req)

    if resp.status_code != 200:
        raise HTTPException(status_code=500, detail=f"HF API error: {resp.text}")

    # Convert to base64
    img_b64 = base64.b64encode(resp.content).decode()
    final_url = f"data:image/png;base64,{img_b64}"

    # SAVE IMAGE AUTOMATICALLY
    img_id = str(int(time.time() * 1000))
    IMAGES_DB[img_id] = {
        "id": img_id,
        "url": final_url,
        "prompt": payload.prompt,
        "created_at": img_id,
    }

    return {
        "id": img_id,
        "url": final_url,
        "prompt": payload.prompt,
        "created_at": img_id,
    }

# -----------------------
# FETCH ALL IMAGES
# -----------------------
@router.get("/all")
def get_all_images():
    return list(IMAGES_DB.values())

# -----------------------
# DELETE AN IMAGE
# -----------------------
@router.delete("/{image_id}")
def delete_image(image_id: str):
    if image_id not in IMAGES_DB:
        raise HTTPException(status_code=404, detail="Image not found")
    del IMAGES_DB[image_id]
    return {"success": True}
