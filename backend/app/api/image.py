from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import requests
import os

router = APIRouter()

# Model config
HF_API_KEY = os.getenv("HF_API_KEY")
MODEL_ID = "stabilityai/stable-diffusion-xl-base-1.0"
HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{MODEL_ID}"

class ImageGenRequest(BaseModel):
    prompt: str
    model: Optional[str] = None

@router.post("/generate")
def generate_image(payload: ImageGenRequest):
    key = HF_API_KEY or os.getenv("HUGGINGFACEHUB_API_TOKEN")
    if not key:
        raise HTTPException(status_code=500, detail="No Hugging Face API key configured in HF_API_KEY")
    url = HF_API_URL if not payload.model else f"https://router.huggingface.co/hf-inference/models/{payload.model}"
    headers = {"Authorization": f"Bearer {key}"}
    req = {
        "inputs": payload.prompt,
        "options": {"wait_for_model": True}
    }
    resp = requests.post(url, headers=headers, json=req)
    if resp.status_code != 200:
        raise HTTPException(status_code=500, detail=f"HF API error: {resp.text}")
    # Return image as base64
    import base64
    img_b64 = base64.b64encode(resp.content).decode()
    return {"image_base64": img_b64, "model": url}
