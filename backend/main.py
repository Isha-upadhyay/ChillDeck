# backend/main.py

import os, sys
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Routers
from app.api.slides import router as slides_router
from app.api.upload import router as upload_router
from app.api.user import router as user_router
from app.api.image import router as image_router
from app.api.folders import router as folders_router
from app.api.templates import router as templates_router



# Core
from app.core.config import settings
from app.core.logger import logger
from app.core.exceptions import register_exception_handlers

# DB
from app.db.session import create_db_and_tables


def create_application() -> FastAPI:
    """
    Fully configured FastAPI application.
    This function makes the app modular & testable (industry standard).
    """
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="AI Powered Slide Generator API",
    )

    # -----------------------
    # CORS Configuration
    # -----------------------
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # -----------------------
    # Register Routers
    # -----------------------
    app.include_router(user_router, prefix="/api/users", tags=["users"])
    app.include_router(upload_router, prefix="/api/upload", tags=["upload"])
    app.include_router(slides_router, prefix="/api/slides", tags=["slides"])
    app.include_router(image_router, prefix="/api/image", tags=["image"])
    app.include_router(folders_router, prefix="/api/folders")
    app.include_router(templates_router)


    # -----------------------
    # Exception Handlers
    # -----------------------
    register_exception_handlers(app)

    # -----------------------
    # Health Check
    # -----------------------
    @app.get("/health", tags=["system"])
    def health_check():
        return {"status": "OK", "app": settings.APP_NAME}

    @app.get("/", tags=["system"])
    def root():
        return {"status": "AI Slide Generator Backend running!"}

    return app


app = create_application()


# -----------------------
# Startup Events
# -----------------------
@app.on_event("startup")
def on_startup():
    logger.info("Application Starting Up...")
    create_db_and_tables()
    logger.info("DB Ready, AI Slide Generator Online!")


@app.on_event("shutdown")
def on_shutdown():
    logger.info("Application Shutting Down...")


# -----------------------------------------------------
# DEPLOY MODE: This block MUST be at the BOTTOM
# -----------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",                           # Required for Render / Railway
        port=int(os.getenv("PORT", 8000)),        # Render gives dynamic port
        reload=True                               # Works locally; ignored in production
    )
