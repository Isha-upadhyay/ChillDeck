# app/db/models.py
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
import uuid

class UserTable(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(default_factory=lambda: uuid.uuid4().hex, primary_key=True, index=True)
    email: str = Field(index=True, nullable=False, unique=True)
    full_name: Optional[str] = None
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
