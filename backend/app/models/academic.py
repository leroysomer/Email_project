from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Academic(Base):
    __tablename__ = "academics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    title = Column(String, nullable=True)  # Dr, Prof, etc.
    email = Column(String, nullable=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=True)
    research_interests = Column(Text, nullable=True)  # Short theme/keywords
    theme = Column(Text, nullable=True)  # Research theme
    description = Column(Text, nullable=True)  # Detailed description
    bio = Column(Text, nullable=True)
    profile_url = Column(String, nullable=True)
    website = Column(String, nullable=True)  # Personal/lab website

    # Relationships
    university = relationship("University", back_populates="academics")
    email_campaigns = relationship("EmailCampaign", back_populates="academic")
