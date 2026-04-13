# app/db/models.py
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy import Column, Text
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


class PresentationTable(SQLModel, table=True):
    __tablename__ = "presentations"

    id: str = Field(default_factory=lambda: uuid.uuid4().hex, primary_key=True, index=True)
    user_id: Optional[str] = Field(default=None, index=True)
    topic: str = Field(default="Untitled")
    theme: str = Field(default="corporate")
    slides_data: Dict[str, Any] = Field(
        sa_column=Column(JSON, nullable=False, default=[])
    )
    version: int = Field(default=1)
    is_deleted: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PresentationVersionTable(SQLModel, table=True):
    __tablename__ = "presentation_versions"

    id: str = Field(default_factory=lambda: uuid.uuid4().hex, primary_key=True, index=True)
    presentation_id: str = Field(index=True)
    version_number: int = Field(default=1)
    slides_data: Dict[str, Any] = Field(
        sa_column=Column(JSON, nullable=False, default=[])
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ChatMessageTable(SQLModel, table=True):
    __tablename__ = "chat_messages"

    id: str = Field(default_factory=lambda: uuid.uuid4().hex, primary_key=True, index=True)
    presentation_id: str = Field(index=True)
    slide_index: int = Field(default=0)
    role: str = Field(default="user")  # user | assistant
    content: str = Field(sa_column=Column(Text, nullable=False))
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TemplateTable(SQLModel, table=True):
    __tablename__ = "templates"

    id: str = Field(
        default_factory=lambda: uuid.uuid4().hex,
        primary_key=True,
        index=True
    )

    title: str = Field(nullable=False, index=True)
    category: str = Field(index=True)
    description: Optional[str] = None

    structure: Dict[str, Any] = Field(
        sa_column=Column(JSON, nullable=False)
    )

    thumbnail_url: Optional[str] = None

    is_public: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
