from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.academic import Academic
from app.models.university import University
from app.schemas.academic import AcademicSearch, AcademicResponse
from app.services.academic_search import search_google_scholar

router = APIRouter()

@router.post("/academics", response_model=List[AcademicResponse])
def search_academics(
    search_params: AcademicSearch,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search for academics based on universities and research domain.
    Results are stored in the database for the user.
    """
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
                Academic.name == result['name'],
                Academic.university_id == university.id
            ).first()
            
            if not existing:
                academic = Academic(
                    name=result['name'],
                    email=result.get('email'),
                    university_id=university.id,
                    research_interests=result.get('research_interests'),
                    bio=result.get('bio'),
                    profile_url=result.get('profile_url')
                )
                db.add(academic)
                db.commit()
                db.refresh(academic)
                all_academics.append(academic)
            else:
                all_academics.append(existing)
    
    # Return as response models
    response = []
    for academic in all_academics:
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

@router.get("/academics", response_model=List[AcademicResponse])
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
            email=academic.email,
            university_id=academic.university_id,
            university_name=academic.university.name if academic.university else None,
            research_interests=academic.research_interests,
            bio=academic.bio,
            profile_url=academic.profile_url
        ))
    
    return response
