from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.db.base import Base


class User(Base):
    __tablename__ = "user"

    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    picture: Mapped[str] = mapped_column(String, nullable=True)

    # Relationships
    groups = relationship("Group", back_populates="created_by")

    def __repr__(self) -> str:
        return f"<User {self.email}>" 