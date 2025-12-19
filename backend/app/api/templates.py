from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel

from app.db.session import get_session
from app.db.models import TemplateTable

router = APIRouter(prefix="/api/templates", tags=["templates"])


class TemplateCreate(BaseModel):
    title: str
    category: str
    description: str | None = None
    structure: dict
    thumbnail_url: str | None = None


class TemplateOut(BaseModel):
    id: str
    title: str
    category: str
    description: str | None
    thumbnail_url: str | None


# Create Template 
@router.post("/", response_model=TemplateOut)
def create_template(
    payload: TemplateCreate,
    session: Session = Depends(get_session)
):
    template = TemplateTable(
        title=payload.title,
        category=payload.category,
        description=payload.description,
        structure=payload.structure,
        thumbnail_url=payload.thumbnail_url,
    )

    session.add(template)
    session.commit()
    session.refresh(template)
    return template


# get all templates
@router.get("/", response_model=List[TemplateOut])
def get_templates(
    category: str | None = None,
    session: Session = Depends(get_session)
):
    query = select(TemplateTable).where(TemplateTable.is_public == True)

    if category:
        query = query.where(TemplateTable.category == category)

    return session.exec(query).all()


# Delete Template
@router.delete("/{template_id}")
def delete_template(
    template_id: str,
    session: Session = Depends(get_session)
):
    template = session.get(TemplateTable, template_id)

    if not template:
        raise HTTPException(404, "Template not found")

    session.delete(template)
    session.commit()
    return {"success": True}
