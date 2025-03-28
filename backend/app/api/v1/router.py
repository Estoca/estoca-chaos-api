from fastapi import APIRouter

from app.api.v1.endpoints import auth, groups, endpoints

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(groups.router, prefix="/groups", tags=["groups"])
api_router.include_router(endpoints.router, prefix="/endpoints", tags=["endpoints"]) 