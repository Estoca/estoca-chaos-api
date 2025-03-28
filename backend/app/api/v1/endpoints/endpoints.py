from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.dependencies import get_current_user, get_db
from app.models.endpoint import Endpoint
from app.models.group import Group
from app.models.user import User
from app.schemas.endpoint import EndpointCreate, EndpointUpdate, EndpointResponse

router = APIRouter()


@router.get("/group/{group_id}", response_model=List[EndpointResponse])
async def read_endpoints(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    group_id: str,
) -> Any:
    # Verify group exists and belongs to user
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.created_by_id == str(current_user.id),
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    endpoints = db.query(Endpoint).filter(Endpoint.group_id == group_id).all()
    return endpoints


@router.post("/group/{group_id}", response_model=EndpointResponse)
async def create_endpoint(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    group_id: str,
    endpoint_in: EndpointCreate,
) -> Any:
    # Verify group exists and belongs to user
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.created_by_id == str(current_user.id),
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    endpoint = Endpoint(
        **endpoint_in.dict(),
        group_id=group_id,
        created_by_id=str(current_user.id),
    )
    db.add(endpoint)
    db.commit()
    db.refresh(endpoint)
    return endpoint


@router.get("/group/{group_id}/{endpoint_id}", response_model=EndpointResponse)
async def read_endpoint(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    group_id: str,
    endpoint_id: str,
) -> Any:
    # Verify group exists and belongs to user
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.created_by_id == str(current_user.id),
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    endpoint = db.query(Endpoint).filter(
        Endpoint.id == endpoint_id,
        Endpoint.group_id == group_id,
    ).first()
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    
    return endpoint


@router.put("/group/{group_id}/{endpoint_id}", response_model=EndpointResponse)
async def update_endpoint(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    group_id: str,
    endpoint_id: str,
    endpoint_in: EndpointUpdate,
) -> Any:
    # Verify group exists and belongs to user
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.created_by_id == str(current_user.id),
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    endpoint = db.query(Endpoint).filter(
        Endpoint.id == endpoint_id,
        Endpoint.group_id == group_id,
    ).first()
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    
    for field, value in endpoint_in.dict(exclude_unset=True).items():
        setattr(endpoint, field, value)
    
    db.add(endpoint)
    db.commit()
    db.refresh(endpoint)
    return endpoint


@router.delete("/group/{group_id}/{endpoint_id}")
async def delete_endpoint(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    group_id: str,
    endpoint_id: str,
) -> Any:
    # Verify group exists and belongs to user
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.created_by_id == str(current_user.id),
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    endpoint = db.query(Endpoint).filter(
        Endpoint.id == endpoint_id,
        Endpoint.group_id == group_id,
    ).first()
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    
    db.delete(endpoint)
    db.commit()
    return {"status": "success"} 