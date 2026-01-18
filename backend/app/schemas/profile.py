from pydantic import BaseModel
from typing import Optional

class ProfileCreate(BaseModel):
    interests: Optional[str] = None
    email_template: Optional[str] = None

class ProfileResponse(BaseModel):
    user_id: int
    resume_path: Optional[str] = None
    interests_json: Optional[str] = None
    email_template: Optional[str] = None
    
    class Config:
        from_attributes = True
