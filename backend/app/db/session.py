# app/db/session.py
from sqlmodel import SQLModel, create_engine, Session
from pathlib import Path
from app.core.config import settings
from app.core.logger import logger

DB_FILE = Path("storage") / "app.db"
DB_FILE.parent.mkdir(parents=True, exist_ok=True)
SQLITE_URL = f"sqlite:///{DB_FILE}"

# echo=True during dev can be helpful; disable in prod.
engine = create_engine(SQLITE_URL, echo=False, connect_args={"check_same_thread": False})

def create_db_and_tables():
    """
    Call this on app startup to ensure tables exist.
    """
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("Database & tables created/verified.")
    except Exception as e:
        logger.exception("Failed to create DB tables: %s", e)
        raise

def get_session() -> Session:
    return Session(engine)
