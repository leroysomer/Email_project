from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.core.database import Base


class AcademicSelection(Base):
    """Track which academics a user has selected for their campaign"""
    __tablename__ = "academic_selections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    academic_id = Column(Integer, ForeignKey("academics.id"), nullable=False)
    selected_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")
    academic = relationship("Academic")
