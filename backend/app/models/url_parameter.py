from uuid import UUID
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class UrlParameter(Base):
    __tablename__ = "url_parameters"

    name = Column(String, nullable=False)
    value = Column(String, nullable=False)
    required = Column(Boolean, nullable=False, default=False)
    default_response = Column(JSON, nullable=True)
    default_status_code = Column(Integer, nullable=False, default=400)
    endpoint_id = Column(PostgresUUID(as_uuid=True), ForeignKey("endpoints.id"), nullable=False)

    # Relationships
    endpoint = relationship("Endpoint", back_populates="url_parameters")

    def __repr__(self) -> str:
        return f"<UrlParameter {self.name}>" 