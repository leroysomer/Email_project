from pydantic import BaseModel
from typing import Optional, List

class AcademicSearch(BaseModel):
    universities: List[str]
    research_domain: str

class AcademicResponse(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    university_id: Optional[int] = None
    university_name: Optional[str] = None
    research_interests: Optional[str] = None
    bio: Optional[str] = None
    profile_url: Optional[str] = None
    
    class Config:
        from_attributes = True
