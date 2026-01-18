from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    resume_path = Column(String, nullable=True)
    interests_json = Column(Text, nullable=True)
    email_template = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="profile")
