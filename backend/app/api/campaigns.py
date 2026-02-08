
import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.academic import Academic
from app.models.academic_selection import AcademicSelection
from app.models.campaign import Campaign, CampaignAcademic
from app.models.user import User
from app.schemas.academic import AcademicResponse

router = APIRouter()

@router.get("")
def get_campaigns(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all campaigns (searches) for the user"""
    campaigns = db.query(Campaign).filter(
        Campaign.user_id == current_user.id
    ).order_by(Campaign.created_at.desc()).all()

    response = []
    for campaign in campaigns:
        # Count academics in campaign
        academic_count = db.query(CampaignAcademic).filter(
            CampaignAcademic.campaign_id == campaign.id
        ).count()

        response.append({
            "id": campaign.id,
            "name": campaign.name,
            "universities": json.loads(campaign.universities),
            "research_domain": campaign.research_domain,
            "created_at": campaign.created_at.isoformat(),
            "academics_count": academic_count
        })

    return response

@router.get("/{campaign_id}/academics", response_model=list[AcademicResponse])
def get_campaign_academics(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all academics in a specific campaign"""
    # Check campaign belongs to user
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id
    ).first()

    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )

    # Get academics for this campaign
    campaign_academics = db.query(CampaignAcademic).filter(
        CampaignAcademic.campaign_id == campaign_id
    ).all()

    response = []
    for ca in campaign_academics:
        academic = ca.academic
        response.append(AcademicResponse(
            id=academic.id,
            name=academic.name,
            email=academic.email,
            university_id=academic.university_id,
            university_name=academic.university.name if academic.university else None,
            research_interests=academic.research_interests,
            bio=academic.bio,
            profile_url=academic.profile_url
        ))

    return response

@router.post("/academics/{academic_id}/add-to-targets")
def add_to_targets(
    academic_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add an academic to user's targets (for following dashboard)"""
    # Check if academic exists
    academic = db.query(Academic).filter(Academic.id == academic_id).first()
    if not academic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Academic not found"
        )

    # Check if already selected
    existing = db.query(AcademicSelection).filter(
        AcademicSelection.user_id == current_user.id,
        AcademicSelection.academic_id == academic_id
    ).first()

    if existing:
        return {"message": "Academic already in targets", "selected": True}

    # Add to targets
    selection = AcademicSelection(
        user_id=current_user.id,
        academic_id=academic_id
    )
    db.add(selection)
    db.commit()

    return {"message": "Academic added to targets", "selected": True}

@router.delete("/academics/{academic_id}/remove-from-targets")
def remove_from_targets(
    academic_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove an academic from user's targets"""
    selection = db.query(AcademicSelection).filter(
        AcademicSelection.user_id == current_user.id,
        AcademicSelection.academic_id == academic_id
    ).first()

    if not selection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Academic not in targets"
        )

    db.delete(selection)
    db.commit()

    return {"message": "Academic removed from targets", "selected": False}

@router.get("/academics/{academic_id}/is-targeted")
def check_if_targeted(
    academic_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if an academic is in user's targets"""
    selection = db.query(AcademicSelection).filter(
        AcademicSelection.user_id == current_user.id,
        AcademicSelection.academic_id == academic_id
    ).first()

    return {"selected": selection is not None}

@router.get("/targets", response_model=list[AcademicResponse])
def get_all_targets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all academics that user has targeted"""
    selections = db.query(AcademicSelection).filter(
        AcademicSelection.user_id == current_user.id
    ).all()

    response = []
    for selection in selections:
        academic = selection.academic
        response.append(AcademicResponse(
            id=academic.id,
            name=academic.name,
            email=academic.email,
            university_id=academic.university_id,
            university_name=academic.university.name if academic.university else None,
            research_interests=academic.research_interests,
            bio=academic.bio,
            profile_url=academic.profile_url
        ))

    return response
