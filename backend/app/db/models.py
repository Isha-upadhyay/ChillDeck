# app/db/models.py
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import Column
from sqlalchemy.types import JSON
import uuid

class UserTable(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(default_factory=lambda: uuid.uuid4().hex, primary_key=True, index=True)
    email: str = Field(index=True, nullable=False, unique=True)
    full_name: Optional[str] = None
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)




class TemplateTable(SQLModel, table=True):
    __tablename__ = "templates"

    id: str = Field(
        default_factory=lambda: uuid.uuid4().hex,
        primary_key=True,
        index=True
    )

    title: str = Field(nullable=False)
    category: str = Field(index=True)   # marketing, pitch, project, etc
    description: Optional[str] = None

    # ✅ FIXED JSON FIELD
    structure: Dict[str, Any] = Field(
        sa_column=Column(JSON, nullable=False)
    )

    thumbnail_url: Optional[str] = None

    is_public: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)