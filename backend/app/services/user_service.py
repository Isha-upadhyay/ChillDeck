# app/services/user_service.py
from typing import Optional, List
from app.db.session import get_session
from app.db.models import UserTable
from app.models.user import UserCreate, UserOut, UserUpdate
from app.core.security import hash_password, verify_password
from sqlmodel import select
from app.core.logger import logger

class UserService:
    def __init__(self):
        pass

    def create_user(self, user_in: UserCreate) -> UserOut:
        with get_session() as session:
            # check exists
            stmt = select(UserTable).where(UserTable.email == user_in.email)
            existing = session.exec(stmt).first()
            if existing:
                raise ValueError("User with this email already exists")

            hashed = hash_password(user_in.password)
            db_user = UserTable(
                email=user_in.email,
                full_name=user_in.full_name,
                hashed_password=hashed
            )
            session.add(db_user)
            session.commit()
            session.refresh(db_user)
            logger.info(f"Created user: {db_user.email}")
            return UserOut(id=db_user.id, email=db_user.email, full_name=db_user.full_name, is_active=db_user.is_active, created_at=db_user.created_at)

    def authenticate_user(self, email: str, password: str) -> Optional[UserOut]:
        with get_session() as session:
            stmt = select(UserTable).where(UserTable.email == email)
            db_user = session.exec(stmt).first()
            if not db_user:
                return None
            if not verify_password(password, db_user.hashed_password):
                return None
            return UserOut(id=db_user.id, email=db_user.email, full_name=db_user.full_name, is_active=db_user.is_active, created_at=db_user.created_at)

    def get_user_by_id(self, user_id: str) -> Optional[UserOut]:
        with get_session() as session:
            user = session.get(UserTable, user_id)
            if not user:
                return None
            return UserOut(id=user.id, email=user.email, full_name=user.full_name, is_active=user.is_active, created_at=user.created_at)

    def get_user_by_email(self, email: str) -> Optional[UserOut]:
        with get_session() as session:
            stmt = select(UserTable).where(UserTable.email == email)
            u = session.exec(stmt).first()
            if not u:
                return None
            return UserOut(id=u.id, email=u.email, full_name=u.full_name, is_active=u.is_active, created_at=u.created_at)

    def list_users(self, limit: int = 100, offset: int = 0) -> List[UserOut]:
        with get_session() as session:
            stmt = select(UserTable).offset(offset).limit(limit)
            rows = session.exec(stmt).all()
            return [UserOut(id=r.id, email=r.email, full_name=r.full_name, is_active=r.is_active, created_at=r.created_at) for r in rows]

    def update_user(self, user_id: str, updates: UserUpdate) -> Optional[UserOut]:
        with get_session() as session:
            user = session.get(UserTable, user_id)
            if not user:
                return None
            if updates.full_name is not None:
                user.full_name = updates.full_name
            if updates.is_active is not None:
                user.is_active = updates.is_active
            session.add(user)
            session.commit()
            session.refresh(user)
            return UserOut(id=user.id, email=user.email, full_name=user.full_name, is_active=user.is_active, created_at=user.created_at)
