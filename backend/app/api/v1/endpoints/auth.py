from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.api.v1.dependencies import get_db, get_current_user
from app.core.config import settings
from app.services.auth import create_access_token, get_user_by_email, create_user

router = APIRouter()


@router.post("/google")
async def google_auth(
    db: Session = Depends(get_db),
    authorization: str = Header(...)
) -> Any:
    # Remove 'Bearer ' prefix if present
    token = authorization.replace('Bearer ', '')
    
    # Here we would validate the Google token
    # For now, we'll just create a user if it doesn't exist
    user = get_user_by_email(db, email=token)
    if not user:
        user = create_user(db, email=token, name=token.split("@")[0])
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
        }
    }


@router.get("/me")
async def read_users_me(
    current_user: Any = Depends(get_current_user),
) -> Any:
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
    } 