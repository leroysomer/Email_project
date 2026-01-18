from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Academic(Base):
    __tablename__ = "academics"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=True)
    research_interests = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    profile_url = Column(String, nullable=True)
    
    # Relationships
    university = relationship("University", back_populates="academics")
    email_campaigns = relationship("EmailCampaign", back_populates="academic")
