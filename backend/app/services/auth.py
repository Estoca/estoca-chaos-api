from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, email: str, name: str) -> User:
    db_user = User(email=email, name=name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user 