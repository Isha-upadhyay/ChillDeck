from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel, Field

from app.db.session import get_session
from app.db.models import TemplateTable

router = APIRouter(prefix="/api/templates", tags=["Templates"])



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

    class Config:
        from_attributes = True




# # Create Template 
# @router.post(
#     "/",
#     response_model=TemplateOut,
#     status_code=status.HTTP_201_CREATED
# )
# def create_template(
#     payload: TemplateCreate,
#     session: Session = Depends(get_session)
# ):
#     template = TemplateTable(
#         title=payload.title,
#         category=payload.category,
#         description=payload.description,
#         structure=payload.structure,
#         thumbnail_url=payload.thumbnail_url,
#         is_public=True,
#     )

#     session.add(template)
#     session.commit()
#     session.refresh(template)

#     return template


@router.post("/", response_model=TemplateOut)
def create_template(
    payload: TemplateCreate,
    session: Session = Depends(get_session)
):
    template = TemplateTable(**payload.model_dump())
    session.add(template)
    session.commit()
    session.refresh(template)
    return template



# # get all templates
# @router.get("/", response_model=List[TemplateOut])
# def get_templates(
#     category: Optional[str] = Query(None),
#     limit: int = Query(20, ge=1, le=100),
#     offset: int = Query(0, ge=0),
#     session: Session = Depends(get_session)
# ):
#     query = select(TemplateTable).where(TemplateTable.is_public == True)

#     if category:
#         query = query.where(TemplateTable.category == category)

#     query = query.order_by(TemplateTable.created_at.desc())
#     query = query.offset(offset).limit(limit)

#     return session.exec(query).all()



@router.get("/", response_model=List[TemplateOut])
def get_templates(
    category: str | None = None,
    limit: int = 20,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    stmt = select(TemplateTable).where(TemplateTable.is_public == True)

    if category:
        stmt = stmt.where(TemplateTable.category == category)

    stmt = stmt.offset(offset).limit(limit)

    return session.exec(stmt).all()


    


# # get template by id
# @router.get("/{template_id}", response_model=TemplateOut)
# def get_template(
#     template_id: str,
#     session: Session = Depends(get_session)
# ):
#     template = session.get(TemplateTable, template_id)

#     if not template or not template.is_public:
#         raise HTTPException(status_code=404, detail="Template not found")

#     return template



@router.get("/{template_id}", response_model=TemplateOut)
def get_template_by_id(
    template_id: str,
    session: Session = Depends(get_session)
):
    template = session.get(TemplateTable, template_id)

    if not template or not template.is_public:
        raise HTTPException(404, "Template not found")

    return template

