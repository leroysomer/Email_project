from pydantic import BaseModel
from typing import Optional
from app.models.email_campaign import EmailStatus

class EmailGenerate(BaseModel):
    academic_id: int

class EmailSend(BaseModel):
    campaign_id: int
    email_service: str  # "gmail", "outlook", or "smtp"

class EmailCampaignResponse(BaseModel):
    id: int
    user_id: int
    academic_id: int
    academic_name: str
    status: EmailStatus
    generated_email: Optional[str] = None
    created_at: str
    sent_at: Optional[str] = None
    
    class Config:
        from_attributes = True
