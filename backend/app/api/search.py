
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
import json

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.academic import Academic
from app.models.university import University
from app.models.user import User
from app.models.campaign import Campaign, CampaignAcademic
from app.schemas.academic import AcademicResponse, AcademicSearch, AcademicCreate
from app.services.academic_search import search_google_scholar

router = APIRouter()

@router.post("/academics")
def search_academics(
    search_params: AcademicSearch,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search for academics based on universities and research domain.
    Creates a campaign to track this search.
    """
    # Create a campaign for this search
    campaign_name = f"{search_params.research_domain} - {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}"
    campaign = Campaign(
        user_id=current_user.id,
        name=campaign_name,
        universities=json.dumps(search_params.universities),
        research_domain=search_params.research_domain
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    
    all_academics = []
    
    for university_name in search_params.universities:
        # Get or create university
        university = db.query(University).filter(
            University.name.ilike(f"%{university_name}%")
        ).first()

        if not university:
            university = University(name=university_name)
            db.add(university)
            db.commit()
            db.refresh(university)

        # Search for academics
        search_results = search_google_scholar(university_name, search_params.research_domain)

        for result in search_results:
            # Check if academic already exists
            existing = db.query(Academic).filter(
                Academic.name == result["name"],
                Academic.university_id == university.id
            ).first()

            if not existing:
                academic = Academic(
                    name=result["name"],
                    email=result.get("email"),
                    university_id=university.id,
                    research_interests=result.get("research_interests"),
                    bio=result.get("bio"),
                    profile_url=result.get("profile_url")
                )
                db.add(academic)
                db.commit()
                db.refresh(academic)
            else:
                academic = existing
            
            # Link academic to campaign
            campaign_academic = CampaignAcademic(
                campaign_id=campaign.id,
                academic_id=academic.id
            )
            db.add(campaign_academic)
            all_academics.append(academic)
    
    db.commit()
    
    # Return campaign info
    return {
        "campaign_id": campaign.id,
        "campaign_name": campaign.name,
        "academics_found": len(all_academics),
        "message": f"Campaign created with {len(all_academics)} academics"
    }

@router.get("/academics", response_model=list[AcademicResponse])
def get_academics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all academics that have been searched for.
    """
    # Get all academics from database
    academics = db.query(Academic).all()

    response = []
    for academic in academics:
        response.append(AcademicResponse(
            id=academic.id,
            name=academic.name,
            title=academic.title,
            email=academic.email,
            university_id=academic.university_id,
            university_name=academic.university.name if academic.university else None,
            research_interests=academic.research_interests,
            theme=academic.theme,
            description=academic.description,
            bio=academic.bio,
            profile_url=academic.profile_url,
            website=academic.website
        ))

    return response

@router.post("/academics/manual", response_model=AcademicResponse)
def add_academic_manually(
    academic_data: AcademicCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually add an academic to the database"""
    # Get or create university
    university = None
    if academic_data.university_name:
        university = db.query(University).filter(
            University.name.ilike(f"%{academic_data.university_name}%")
        ).first()
        
        if not university:
            university = University(name=academic_data.university_name)
            db.add(university)
            db.commit()
            db.refresh(university)
    
    # Create academic
    academic = Academic(
        name=academic_data.name,
        title=academic_data.title,
        email=academic_data.email,
        university_id=university.id if university else None,
        research_interests=academic_data.research_interests,
        theme=academic_data.theme,
        description=academic_data.description,
        bio=academic_data.bio,
        profile_url=academic_data.profile_url,
        website=academic_data.website
    )
    db.add(academic)
    db.commit()
    db.refresh(academic)
    
    return AcademicResponse(
        id=academic.id,
        name=academic.name,
        title=academic.title,
        email=academic.email,
        university_id=academic.university_id,
        university_name=university.name if university else None,
        research_interests=academic.research_interests,
        theme=academic.theme,
        description=academic.description,
        bio=academic.bio,
        profile_url=academic.profile_url,
        website=academic.website
    )

@router.get("/academics/{academic_id}", response_model=AcademicResponse)
def get_academic(
    academic_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific academic"""
    academic = db.query(Academic).filter(Academic.id == academic_id).first()
    
    if not academic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Academic not found"
        )
    
    return AcademicResponse(
        id=academic.id,
        name=academic.name,
        title=academic.title,
        email=academic.email,
        university_id=academic.university_id,
        university_name=academic.university.name if academic.university else None,
        research_interests=academic.research_interests,
        theme=academic.theme,
        description=academic.description,
        bio=academic.bio,
        profile_url=academic.profile_url,
        website=academic.website
    )

@router.patch("/academics/{academic_id}", response_model=AcademicResponse)
def update_academic(
    academic_id: int,
    update_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an academic's information"""
    academic = db.query(Academic).filter(Academic.id == academic_id).first()
    
    if not academic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Academic not found"
        )
    
    # Update fields
    if 'title' in update_data:
        academic.title = update_data['title']
    if 'email' in update_data:
        academic.email = update_data['email']
    if 'theme' in update_data:
        academic.theme = update_data['theme']
    if 'research_interests' in update_data:
        academic.research_interests = update_data['research_interests']
    if 'description' in update_data:
        academic.description = update_data['description']
    if 'website' in update_data:
        academic.website = update_data['website']
    
    db.commit()
    db.refresh(academic)
    
    return AcademicResponse(
        id=academic.id,
        name=academic.name,
        title=academic.title,
        email=academic.email,
        university_id=academic.university_id,
        university_name=academic.university.name if academic.university else None,
        research_interests=academic.research_interests,
        theme=academic.theme,
        description=academic.description,
        bio=academic.bio,
        profile_url=academic.profile_url,
        website=academic.website
    )