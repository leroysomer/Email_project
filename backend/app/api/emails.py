from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.academic import Academic
from app.models.email_campaign import EmailCampaign, EmailStatus
from app.models.user_profile import UserProfile
from app.schemas.email import EmailGenerate, EmailSend, EmailCampaignResponse
from app.services.email_generator import generate_personalized_email
from app.services.email_sender import send_email

router = APIRouter()

@router.post("/generate")
def generate_email(
    email_data: EmailGenerate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a personalized email for an academic.
    """
    # Get academic
    academic = db.query(Academic).filter(Academic.id == email_data.academic_id).first()
    if not academic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Academic not found"
        )
    
    # Get user profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile or not profile.email_template:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User profile or email template not found"
        )
    
    # Generate personalized email
    generated_email = generate_personalized_email(
        user_template=profile.email_template,
        user_interests=profile.interests_json or "",
        academic_name=academic.name,
        academic_research_interests=academic.research_interests or "",
        academic_bio=academic.bio
    )
    
    # Create or update email campaign
    campaign = db.query(EmailCampaign).filter(
        EmailCampaign.user_id == current_user.id,
        EmailCampaign.academic_id == email_data.academic_id
    ).first()
    
    if not campaign:
        campaign = EmailCampaign(
            user_id=current_user.id,
            academic_id=email_data.academic_id,
            status=EmailStatus.DRAFT,
            generated_email=generated_email
        )
        db.add(campaign)
    else:
        campaign.generated_email = generated_email
        campaign.status = EmailStatus.DRAFT
    
    db.commit()
    db.refresh(campaign)
    
    return {
        "campaign_id": campaign.id,
        "generated_email": generated_email,
        "academic_name": academic.name,
        "academic_email": academic.email
    }

@router.post("/send")
def send_generated_email(
    send_data: EmailSend,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a generated email via the specified email service.
    """
    # Get campaign
    campaign = db.query(EmailCampaign).filter(
        EmailCampaign.id == send_data.campaign_id,
        EmailCampaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email campaign not found"
        )
    
    if not campaign.generated_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No generated email found. Please generate the email first."
        )
    
    if not campaign.academic.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Academic email not available"
        )
    
    # Send email
    # Note: In production, access_token should come from user's stored OAuth tokens
    subject = f"Inquiry about Research Opportunities - {campaign.academic.name}"
    
    success = False
    if send_data.email_service == "smtp":
        success = send_email(
            to_email=campaign.academic.email,
            subject=subject,
            body=campaign.generated_email,
            email_service="smtp"
        )
    else:
        # For Gmail/Outlook, access_token should be retrieved from user's stored tokens
        # This is a placeholder - implement OAuth token storage
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"{send_data.email_service} integration requires OAuth setup"
        )
    
    if success:
        campaign.status = EmailStatus.SENT
        campaign.sent_at = datetime.utcnow()
        db.commit()
        return {"message": "Email sent successfully", "campaign_id": campaign.id}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send email"
        )

@router.get("/campaigns", response_model=List[EmailCampaignResponse])
def get_email_campaigns(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all email campaigns for the current user.
    """
    campaigns = db.query(EmailCampaign).filter(
        EmailCampaign.user_id == current_user.id
    ).all()
    
    response = []
    for campaign in campaigns:
        response.append(EmailCampaignResponse(
            id=campaign.id,
            user_id=campaign.user_id,
            academic_id=campaign.academic_id,
            academic_name=campaign.academic.name,
            status=campaign.status,
            generated_email=campaign.generated_email,
            created_at=campaign.created_at.isoformat() if campaign.created_at else "",
            sent_at=campaign.sent_at.isoformat() if campaign.sent_at else None
        ))
    
    return response

@router.patch("/campaigns/{campaign_id}/status")
def update_email_status(
    campaign_id: int,
    status: EmailStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the status of an email campaign.
    """
    campaign = db.query(EmailCampaign).filter(
        EmailCampaign.id == campaign_id,
        EmailCampaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email campaign not found"
        )
    
    campaign.status = status
    db.commit()
    
    return {"message": "Status updated successfully", "status": status.value}
