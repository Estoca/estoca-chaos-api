from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
import requests

from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.services.auth import create_access_token, get_user_by_email, create_user

router = APIRouter()


@router.post("/google")
async def google_auth(
    db: AsyncSession = Depends(get_db),
    authorization: str = Header(...)
) -> Any:
    # Remove 'Bearer ' prefix if present
    token = authorization.replace('Bearer ', '')
    
    # Validate the Google token by calling Google's userinfo endpoint
    try:
        response = requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {token}'}
        )
        response.raise_for_status()
        user_info = response.json()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to validate Google token"
        )
    
    # Get or create user
    user = await get_user_by_email(db, email=user_info['email'])
    if not user:
        user = await create_user(
            db,
            email=user_info['email'],
            name=user_info.get('name', user_info['email'].split("@")[0])
        )
    
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