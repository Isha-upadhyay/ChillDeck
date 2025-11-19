# backend/app/core/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ALLOWED_FILE_TYPES = ["pdf", "docx", "txt"]

settings = Settings()
