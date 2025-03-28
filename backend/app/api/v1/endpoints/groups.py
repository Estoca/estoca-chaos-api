from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.dependencies import get_current_user, get_db
from app.models.group import Group
from app.models.user import User
from app.schemas.group import GroupCreate, GroupUpdate, GroupResponse

router = APIRouter()


@router.get("/", response_model=List[GroupResponse])
async def read_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    groups = db.query(Group).filter(Group.created_by_id == str(current_user.id)).all()
    return groups


@router.post("/", response_model=GroupResponse)
async def create_group(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    group_in: GroupCreate,
) -> Any:
    group = Group(
        name=group_in.name,
        description=group_in.description,
        created_by_id=str(current_user.id),
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@router.get("/{group_id}", response_model=GroupResponse)
async def read_group(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    group_id: str,
) -> Any:
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.created_by_id == str(current_user.id),
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group


@router.put("/{group_id}", response_model=GroupResponse)
async def update_group(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    group_id: str,
    group_in: GroupUpdate,
) -> Any:
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.created_by_id == str(current_user.id),
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    for field, value in group_in.dict(exclude_unset=True).items():
        setattr(group, field, value)
    
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@router.delete("/{group_id}")
async def delete_group(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    group_id: str,
) -> Any:
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.created_by_id == str(current_user.id),
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    db.delete(group)
    db.commit()
    return {"status": "success"} 