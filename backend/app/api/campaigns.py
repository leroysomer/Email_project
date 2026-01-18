from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.academic import Academic
from app.models.academic_selection import AcademicSelection
from app.schemas.academic import AcademicResponse

router = APIRouter()

@router.post("/academics/{academic_id}/select")
def add_to_campaign(
    academic_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add an academic to user's campaign list"""
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
        return {"message": "Academic already in campaign", "selected": True}
    
    # Add to selection
    selection = AcademicSelection(
        user_id=current_user.id,
        academic_id=academic_id
    )
    db.add(selection)
    db.commit()
    
    return {"message": "Academic added to campaign", "selected": True}

@router.delete("/academics/{academic_id}/select")
def remove_from_campaign(
    academic_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove an academic from user's campaign list"""
    selection = db.query(AcademicSelection).filter(
        AcademicSelection.user_id == current_user.id,
        AcademicSelection.academic_id == academic_id
    ).first()
    
    if not selection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Academic not in campaign"
        )
    
    db.delete(selection)
    db.commit()
    
    return {"message": "Academic removed from campaign", "selected": False}

@router.get("/academics/selected", response_model=List[AcademicResponse])
def get_selected_academics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all academics selected for user's campaign"""
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

@router.get("/academics/{academic_id}/is-selected")
def check_if_selected(
    academic_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if an academic is in user's campaign"""
    selection = db.query(AcademicSelection).filter(
        AcademicSelection.user_id == current_user.id,
        AcademicSelection.academic_id == academic_id
    ).first()
    
    return {"selected": selection is not None}
