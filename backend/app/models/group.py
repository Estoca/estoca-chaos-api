from sqlalchemy import Column, String, ForeignKey, UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Group(Base):
    __tablename__ = "groups"

    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)

    # Relationships
    endpoints = relationship("Endpoint", back_populates="group", cascade="all, delete-orphan")
    created_by = relationship("User", back_populates="groups")

    def __repr__(self) -> str:
        return f"<Group {self.name}>" 