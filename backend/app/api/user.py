# app/api/user.py
from fastapi import APIRouter, HTTPException, Depends, status
from app.models.user import UserCreate, UserOut, UserUpdate
from app.services.user_service import UserService
from app.core.security import create_access_token, get_current_user, decode_access_token
from app.core.logger import logger
from pydantic import BaseModel

router = APIRouter()
user_svc = UserService()

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate):
    try:
        user = user_svc.create_user(payload)
        return user
    except ValueError as e:
        logger.warning("Signup failed: %s", e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.exception("Signup error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Signup failed")

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    user = user_svc.authenticate_user(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=user.id)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
def me(current=Depends(get_current_user)):
    # get_current_user returns TokenData (with sub)
    user_id = current.sub
    user = user_svc.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.get("/", response_model=list[UserOut])
def list_users(limit: int = 50, offset: int = 0, current=Depends(get_current_user)):
    # optionally require admin; for now any authenticated user can list
    users = user_svc.list_users(limit=limit, offset=offset)
    return users

@router.patch("/{user_id}", response_model=UserOut)
def update_user(user_id: str, payload: UserUpdate, current=Depends(get_current_user)):
    updated = user_svc.update_user(user_id, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return updated
