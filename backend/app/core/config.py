# # app/core/config.py
# from pydantic_settings import BaseSettings
# from pydantic import AnyHttpUrl
# from typing import List, Optional
# import os


# class Settings(BaseSettings):
#     # App Info
#     APP_NAME: str = "AI Slide Generator"
#     DEBUG: bool = False
#     HOST: str = "0.0.0.0"
#     PORT: int = 8000

#     # Storage Paths
#     BASE_DIR: str = os.path.abspath("./storage")
#     STORAGE_DIR: str = f"{BASE_DIR}"
#     UPLOAD_DIR: str = f"{BASE_DIR}/uploads"
#     EXPORT_DIR: str = f"{BASE_DIR}/exports"
#     CHROMA_DB_DIR: str = f"{BASE_DIR}/chroma_db"

#     # API Keys (Optional)
#     GROQ_API_KEY: Optional[str] = None
#     TAVILY_API_KEY: Optional[str] = None
#     HF_API_KEY: Optional[str] = None

#     # JWT Auth Config
#     JWT_SECRET_KEY: str = "change-in-prod"
#     JWT_ALGORITHM: str = "HS256"
#     JWT_EXP_MINUTES: int = 60 * 24  # 24 hrs

#     # CORS Allowed Origins
#     CORS_ORIGINS: List[AnyHttpUrl] = []

#     class Config:
#         env_file = ".env"
#         env_file_encoding = "utf-8"


# settings = Settings()


# app/core/config.py
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl
from typing import List, Optional


class Settings(BaseSettings):
    #########################################
    # APP CONFIG
    #########################################
    APP_NAME: str = "AI Slide Generator"
    APP_ENV: str = "development"
    APP_VERSION: str = "1.0.0"

    BASE_URL: str = "http://localhost:8000"
    API_PREFIX: str = "/api"

    #########################################
    # CORS
    #########################################
    ALLOWED_ORIGINS: List[str] = ["*"]

    #########################################
    # LOGGING
    #########################################
    LOG_LEVEL: str = "INFO"

    #########################################
    # LLM PROVIDERS
    #########################################
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL_TEXT: str = "mixtral-8x7b"
    GROQ_MODEL_VISION: str = "llama-3.2-90b-vision"

    TAVILY_API_KEY: Optional[str] = None

    #########################################
    # EMBEDDINGS / VECTORSTORE
    #########################################
    EMBEDDINGS_MODEL: str = "sentence-transformers/all-mpnet-base-v2"
    CHROMA_DB_DIR: str = "./vector_store"
    CHROMA_COLLECTION: str = "documents"

    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 100

    #########################################
    # FILE UPLOADS
    #########################################
    UPLOAD_DIR: str = "./uploads"
    ALLOWED_FILE_TYPES: str = "pdf,docx,txt"

    #########################################
    # EXPORT SERVICE
    #########################################
    EXPORT_DIR: str = "./exports"
    EXPORT_DEFAULT_THEME: str = "sleek-modern"

    #########################################
    # SECURITY
    #########################################
    PASSWORD_SALT: str = "extra_secure_salt"

    #########################################
    # AGENTS
    #########################################
    DEFAULT_AGENT_TEMPERATURE: float = 0.4
    DEFAULT_AGENT_TOP_K: int = 5

    ORCHESTRATOR_MODEL: str = "mixtral-8x7b"
    PLANNER_MODEL: str = "mixtral-8x7b"
    RESEARCH_SEARCH_TOP_K: int = 5
    WRITER_MODEL: str = "mixtral-8x7b"
    WRITER_TONE: str = "professional"
    SLIDE_DESIGN_STYLE: str = "corporate-modern"

    #########################################
    # IMAGES
    #########################################
    GENERATED_IMAGES_DIR: str = "./generated_images"
    IMAGE_STYLE: str = "flat-illustration"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

