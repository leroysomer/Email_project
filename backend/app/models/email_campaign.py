import enum

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class EmailStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    NO_RESPONSE = "no_response"
    RECEIVED = "received"

class EmailCampaign(Base):
    __tablename__ = "email_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    academic_id = Column(Integer, ForeignKey("academics.id"), nullable=False)
    status = Column(SQLEnum(EmailStatus), default=EmailStatus.DRAFT, nullable=False)
    generated_email = Column(String, nullable=True)  # Store the generated email content
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sent_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="email_campaigns")
    academic = relationship("Academic", back_populates="email_campaigns")
