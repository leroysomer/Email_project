from app.schemas.academic import AcademicResponse, AcademicSearch
from app.schemas.auth import Token, UserCreate, UserLogin
from app.schemas.email import EmailCampaignResponse, EmailGenerate, EmailSend
from app.schemas.profile import ProfileCreate, ProfileResponse

__all__ = [
    "AcademicResponse",
    "AcademicSearch",
    "EmailCampaignResponse",
    "EmailGenerate",
    "EmailSend",
    "ProfileCreate",
    "ProfileResponse",
    "Token",
    "UserCreate",
    "UserLogin"
]
