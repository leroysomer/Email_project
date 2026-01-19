
from pydantic import BaseModel


class ProfileCreate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    school: str | None = None
    classes: str | None = None
    interests: str | None = None
    email_template: str | None = None
    email_subject: str | None = None
    email_service: str | None = None
    academic_email: str | None = None
    imap_host: str | None = None
    imap_port: str | None = None
    smtp_host: str | None = None
    smtp_port: str | None = None
    email_password: str | None = None

class ProfileResponse(BaseModel):
    user_id: int
    first_name: str | None = None
    last_name: str | None = None
    school: str | None = None
    classes: str | None = None
    resume_path: str | None = None
    interests_json: str | None = None
    email_template: str | None = None
    email_subject: str | None = None
    email_service: str | None = None
    academic_email: str | None = None
    imap_host: str | None = None
    imap_port: str | None = None
    smtp_host: str | None = None
    smtp_port: str | None = None

    class Config:
        from_attributes = True
