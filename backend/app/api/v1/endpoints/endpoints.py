from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.repositories.endpoint import EndpointRepository
from app.schemas.endpoint import Endpoint, EndpointCreate, EndpointUpdate

router = APIRouter()

@router.get("/", response_model=List[Endpoint])
async def list_endpoints(
    group_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all endpoints for a group."""
    repo = EndpointRepository(db)
    endpoints = await repo.get_by_group_id(group_id)
    return endpoints

@router.post("/", response_model=Endpoint)
async def create_endpoint(
    group_id: UUID,
    endpoint_data: EndpointCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new endpoint in a group."""
    repo = EndpointRepository(db)
    endpoint = await repo.create(endpoint_data, current_user.id)
    return endpoint

@router.get("/{endpoint_id}", response_model=Endpoint)
async def get_endpoint(
    group_id: UUID,
    endpoint_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific endpoint."""
    repo = EndpointRepository(db)
    endpoint = await repo.get_by_id(endpoint_id)
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    if endpoint.group_id != group_id:
        raise HTTPException(status_code=404, detail="Endpoint not found in this group")
    return endpoint

@router.put("/{endpoint_id}", response_model=Endpoint)
async def update_endpoint(
    group_id: UUID,
    endpoint_id: UUID,
    endpoint_data: EndpointUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an endpoint."""
    repo = EndpointRepository(db)
    endpoint = await repo.get_by_id(endpoint_id)
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    if endpoint.group_id != group_id:
        raise HTTPException(status_code=404, detail="Endpoint not found in this group")
    updated_endpoint = await repo.update(endpoint_id, endpoint_data)
    if not updated_endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    return updated_endpoint

@router.delete("/{endpoint_id}")
async def delete_endpoint(
    group_id: UUID,
    endpoint_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an endpoint."""
    repo = EndpointRepository(db)
    endpoint = await repo.get_by_id(endpoint_id)
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    if endpoint.group_id != group_id:
        raise HTTPException(status_code=404, detail="Endpoint not found in this group")
    success = await repo.delete(endpoint_id)
    if not success:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    return {"message": "Endpoint deleted successfully"} 