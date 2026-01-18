from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Personal Information
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    school = Column(String, nullable=True)
    classes = Column(Text, nullable=True)  # Can store as JSON string
    resume_path = Column(String, nullable=True)
    
    # Research Interests
    interests_json = Column(Text, nullable=True)
    
    # Email Configuration
    email_template = Column(Text, nullable=True)
    email_subject = Column(String, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="profile")
