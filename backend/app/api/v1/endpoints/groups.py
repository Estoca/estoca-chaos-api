from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_current_user, get_db
from app.models.group import Group
from app.models.user import User
from app.schemas.group import GroupCreate, GroupUpdate, GroupResponse
from app.api.v1.endpoints import endpoints

router = APIRouter()

# Include endpoints router
router.include_router(
    endpoints.router,
    prefix="/{group_id}/endpoints",
    tags=["endpoints"]
)


@router.get("", response_model=List[GroupResponse])
async def read_groups(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(select(Group))
    return list(result.scalars().all())


@router.post("/", response_model=GroupResponse)
async def create_group(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    group_in: GroupCreate,
) -> Any:
    # Check if a group with the same name already exists
    result = await db.execute(
        select(Group).where(Group.name == group_in.name)
    )
    existing_group = result.scalar_one_or_none()
    if existing_group:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A group with this name already exists"
        )

    group = Group(
        name=group_in.name,
        description=group_in.description,
        created_by_id=str(current_user.id),
    )
    db.add(group)
    await db.commit()
    await db.refresh(group)
    return group


@router.get("/{group_id}", response_model=GroupResponse)
async def read_group(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    group_id: str,
) -> Any:
    result = await db.execute(
        select(Group).where(
            Group.id == group_id
        )
    )
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group


@router.put("/{group_id}", response_model=GroupResponse)
async def update_group(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    group_id: str,
    group_in: GroupUpdate,
) -> Any:
    result = await db.execute(
        select(Group).where(
            Group.id == group_id
        )
    )
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    for field, value in group_in.dict(exclude_unset=True).items():
        setattr(group, field, value)
    
    db.add(group)
    await db.commit()
    await db.refresh(group)
    return group


@router.delete("/{group_id}")
async def delete_group(
    *,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    group_id: str,
) -> Any:
    result = await db.execute(
        select(Group).where(
            Group.id == group_id
        )
    )
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    await db.delete(group)
    await db.commit()
    return {"status": "success"} 