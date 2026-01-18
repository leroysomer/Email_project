from pydantic import BaseModel
from typing import Optional

class ProfileCreate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    school: Optional[str] = None
    classes: Optional[str] = None
    interests: Optional[str] = None
    email_template: Optional[str] = None
    email_subject: Optional[str] = None

class ProfileResponse(BaseModel):
    user_id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    school: Optional[str] = None
    classes: Optional[str] = None
    resume_path: Optional[str] = None
    interests_json: Optional[str] = None
    email_template: Optional[str] = None
    email_subject: Optional[str] = None
    
    class Config:
        from_attributes = True
