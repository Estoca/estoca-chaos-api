from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Endpoint(Base):
    __tablename__ = "endpoints"

    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    path = Column(String, nullable=False)
    method = Column(String, nullable=False)
    max_wait_time = Column(Integer, nullable=False, default=0)
    chaos_mode = Column(Boolean, nullable=False, default=True)
    response_schema = Column(JSON, nullable=True)
    response_status_code = Column(Integer, nullable=False, default=200)
    response_body = Column(String, nullable=True)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id"), nullable=False)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)

    # Relationships
    group = relationship("Group", back_populates="endpoints")
    headers = relationship("Header", back_populates="endpoint", cascade="all, delete-orphan")
    url_parameters = relationship("UrlParameter", back_populates="endpoint", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Endpoint {self.name}>" 