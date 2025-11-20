# app/core/config.py
from pydantic import BaseSettings, AnyHttpUrl
from typing import List, Optional

class Settings(BaseSettings):
    # App
    APP_NAME: str = "AI Slide Generator"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Persistence
    STORAGE_DIR: str = "./storage"
    UPLOAD_DIR: str = "./storage/uploads"
    EXPORT_DIR: str = "./storage/exports"
    CHROMA_DB_DIR: str = "./storage/chroma_db"

    # LLM / Third-party (keys optional)
    GROQ_API_KEY: Optional[str] = None
    TAVILY_API_KEY: Optional[str] = None
    HF_API_KEY: Optional[str] = None

    # Security / Auth
    JWT_SECRET_KEY: str = "replace-me-with-a-secure-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 60 * 24  # 1 day

    # CORS (optional)
    CORS_ORIGINS: List[AnyHttpUrl] = []

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
