from groq import Groq
import os

class GroqLLM:
    def __init__(self, model="llama-3.1-8b-instant"):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = model

    def generate(self, prompt: str, temperature=0.2):
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
        )
        # FIX: new response format
        return response.choices[0].message.content
