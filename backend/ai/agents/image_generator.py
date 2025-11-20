import requests
import os
import base64

HF_API_KEY = os.getenv("HF_API_KEY")  # free key from huggingface

class ImageAgent:
    def __init__(self):
        self.models = {
            "flux": "black-forest-labs/FLUX.1-schnell",
            "sdxl": "stabilityai/stable-diffusion-xl-base-1.0"
        }

    def generate_image(self, prompt, model="flux"):
        model_id = self.models.get(model, self.models["flux"])

        url = f"https://api-inference.huggingface.co/models/{model_id}"

        headers = {"Authorization": f"Bearer {HF_API_KEY}"}

        payload = {
            "inputs": prompt,
            "options": {"wait_for_model": True}
        }

        response = requests.post(url, headers=headers, json=payload)

        if response.status_code != 200:
            return {"error": response.text}

        # HF returns raw bytes of image
        image_bytes = response.content  
        base64_img = base64.b64encode(image_bytes).decode("utf-8")

        return {
            "image_base64": base64_img,
            "model": model_id
        }
