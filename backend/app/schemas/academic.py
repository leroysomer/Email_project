
from pydantic import BaseModel


class AcademicSearch(BaseModel):
    universities: list[str]
    research_domain: str

class AcademicCreate(BaseModel):
    name: str
    title: str | None = None
    email: str | None = None
    university_name: str | None = None
    research_interests: str | None = None
    theme: str | None = None
    description: str | None = None
    bio: str | None = None
    profile_url: str | None = None
    website: str | None = None

class AcademicResponse(BaseModel):
    id: int
    name: str
    title: str | None = None
    email: str | None = None
    university_id: int | None = None
    university_name: str | None = None
    research_interests: str | None = None
    theme: str | None = None
    description: str | None = None
    bio: str | None = None
    profile_url: str | None = None
    website: str | None = None

    class Config:
        from_attributes = True
