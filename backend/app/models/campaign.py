from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Campaign(Base):
    """A research campaign/search run by the user"""
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)  # User-defined or auto-generated name
    universities = Column(Text, nullable=False)  # JSON string of universities searched
    research_domain = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")
    academic_results = relationship("CampaignAcademic", back_populates="campaign")

class CampaignAcademic(Base):
    """Link between campaigns and the academics found in them"""
    __tablename__ = "campaign_academics"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    academic_id = Column(Integer, ForeignKey("academics.id"), nullable=False)

    # Relationships
    campaign = relationship("Campaign", back_populates="academic_results")
    academic = relationship("Academic")
