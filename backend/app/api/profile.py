import os

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.profile import ProfileResponse

router = APIRouter()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_profile(
    resume: UploadFile | None = File(None),
    first_name: str | None = Form(None),
    last_name: str | None = Form(None),
    school: str | None = Form(None),
    classes: str | None = Form(None),
    interests: str | None = Form(None),
    email_template: str | None = Form(None),
    email_subject: str | None = Form(None),
    email_service: str | None = Form(None),
    academic_email: str | None = Form(None),
    imap_host: str | None = Form(None),
    imap_port: str | None = Form(None),
    smtp_host: str | None = Form(None),
    smtp_port: str | None = Form(None),
    email_password: str | None = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get or create user profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    # Save resume if provided
    if resume:
        # Save file
        file_path = os.path.join(settings.UPLOAD_DIR, f"{current_user.id}_{resume.filename}")
        with open(file_path, "wb") as buffer:
            content = await resume.read()
            buffer.write(content)
        profile.resume_path = file_path

    # Update personal information
    if first_name is not None:
        profile.first_name = first_name
    if last_name is not None:
        profile.last_name = last_name
    if school is not None:
        profile.school = school
    if classes is not None:
        profile.classes = classes

    # Update research interests
    if interests is not None:
        profile.interests_json = interests

    # Update email configuration
    if email_template is not None:
        profile.email_template = email_template
    if email_subject is not None:
        profile.email_subject = email_subject

    # Email service configuration
    if email_service is not None:
        profile.email_service = email_service
    if academic_email is not None:
        profile.academic_email = academic_email
    if imap_host is not None:
        profile.imap_host = imap_host
    if imap_port is not None:
        profile.imap_port = imap_port
    if smtp_host is not None:
        profile.smtp_host = smtp_host
    if smtp_port is not None:
        profile.smtp_port = smtp_port
    if email_password is not None:
        # TODO: Encrypt password before storing
        profile.email_password = email_password

    db.commit()
    db.refresh(profile)

    return {"message": "Profile updated successfully"}

@router.get("", response_model=ProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return profile
