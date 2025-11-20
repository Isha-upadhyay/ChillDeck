# app/core/logger.py
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from app.core.config import settings

LOG_DIR = Path(settings.STORAGE_DIR) / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE = LOG_DIR / "backend.log"

def get_logger(name: str = "backend"):
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger

    logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)

    # Console handler
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    ch_formatter = logging.Formatter("[%(levelname)s] %(asctime)s - %(name)s - %(message)s")
    ch.setFormatter(ch_formatter)

    # Rotating file handler
    fh = RotatingFileHandler(str(LOG_FILE), maxBytes=5 * 1024 * 1024, backupCount=5)
    fh.setLevel(logging.DEBUG)
    fh_formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    fh.setFormatter(fh_formatter)

    logger.addHandler(ch)
    logger.addHandler(fh)

    # avoid duplicate logs in uvicorn when imported multiple times
    logger.propagate = False
    return logger

logger = get_logger()
