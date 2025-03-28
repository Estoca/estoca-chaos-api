from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID


class GroupBase(BaseModel):
    name: str = Field(..., description="Name of the group")
    description: Optional[str] = Field(None, description="Description of the group")


class GroupCreate(GroupBase):
    pass


class GroupUpdate(GroupBase):
    name: Optional[str] = None
    description: Optional[str] = None


class GroupResponse(GroupBase):
    id: UUID
    created_by_id: UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    created_at_epoch: int

    class Config:
        from_attributes = True 