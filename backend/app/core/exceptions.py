# app/core/exceptions.py
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi import HTTPException
from starlette import status
from app.core.logger import logger

class AppException(Exception):
    def __init__(self, message: str, code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(message)
        self.message = message
        self.code = code

class FileProcessingError(AppException):
    pass

class SlideGenerationError(AppException):
    pass

# FastAPI exception handlers (call in main.py during app startup)
def register_exception_handlers(app):

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        logger.error(f"AppException: {exc.message}")
        return JSONResponse({"detail": exc.message}, status_code=exc.code)

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        logger.warning(f"HTTPException: {exc.detail}")
        return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception occurred")
        return JSONResponse({"detail": "Internal server error"}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
