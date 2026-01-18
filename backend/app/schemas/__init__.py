from app.schemas.auth import Token, UserCreate, UserLogin
from app.schemas.profile import ProfileCreate, ProfileResponse
from app.schemas.academic import AcademicResponse, AcademicSearch
from app.schemas.email import EmailGenerate, EmailSend, EmailCampaignResponse

__all__ = [
    "Token", "UserCreate", "UserLogin",
    "ProfileCreate", "ProfileResponse",
    "AcademicResponse", "AcademicSearch",
    "EmailGenerate", "EmailSend", "EmailCampaignResponse"
]
