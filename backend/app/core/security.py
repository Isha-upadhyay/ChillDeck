# app/core/security.py
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.core.logger import logger
from pydantic import BaseModel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
auth_scheme = HTTPBearer()

class TokenData(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

# ---------- password helpers ----------
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# ---------- jwt helpers ----------
def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.JWT_EXPIRATION_MINUTES))
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return TokenData(sub=payload.get("sub"), exp=payload.get("exp"))
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.PyJWTError:
        logger.exception("Token decode failed")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid authentication credentials")

# ---------- FastAPI dependency ----------
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)) -> TokenData:
    token = credentials.credentials
    data = decode_access_token(token)
    if not data or not data.sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return data
