# # backend/main.py
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# from app.api import slides, upload

# app = FastAPI(title="AI Slide Generator", version="1.0.0")

# # CORS setup
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Include routers
# app.include_router(slides.router, prefix="/slides", tags=["slides"])
# app.include_router(upload.router, prefix="/upload", tags=["upload"])

# @app.get("/health")
# async def health_check():
#     return {"status": "OK"}




from fastapi import FastAPI
from app.api.slides import router as slides_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Slide Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(slides_router, prefix="/api/slides")

@app.get("/")
def root():
    return {"status": "Slide Generator Backend running!"}
