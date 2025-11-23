# app/core/logger.py
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from app.core.config import settings

# Create logs directory
LOG_DIR = Path("storage") / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE = LOG_DIR / "backend.log"

def get_logger(name: str = "backend"):
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger

    # Use LOG_LEVEL from settings, default to INFO
    log_level = getattr(settings, "LOG_LEVEL", "INFO")
    level = getattr(logging, log_level.upper(), logging.INFO)

    logger.setLevel(level)

    # Console handler
    ch = logging.StreamHandler()
    ch.setLevel(level)
    ch_formatter = logging.Formatter("[%(levelname)s] %(asctime)s - %(name)s - %(message)s")
    ch.setFormatter(ch_formatter)

    # Rotating file handler
    try:
        fh = RotatingFileHandler(str(LOG_FILE), maxBytes=5 * 1024 * 1024, backupCount=5)
        fh.setLevel(logging.DEBUG)
        fh_formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
        fh.setFormatter(fh_formatter)
        logger.addHandler(fh)
    except Exception:
        # If file logging fails, continue with console only
        pass

    logger.addHandler(ch)

    # avoid duplicate logs in uvicorn when imported multiple times
    logger.propagate = False
    return logger

logger = get_logger()
