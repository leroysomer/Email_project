from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/connect")
def connect_email_service(
    service: str,  # "gmail" or "outlook"
    current_user: User = Depends(get_current_user)
):
    """
    Initiate OAuth flow for email service connection.
    This is a placeholder - full OAuth implementation would require:
    1. Redirect URLs
    2. State management
    3. Token storage
    """
    if service not in ["gmail", "outlook"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid service. Use 'gmail' or 'outlook'"
        )
    
    # Placeholder: Return OAuth URL
    # In production, generate proper OAuth URLs based on service
    return {
        "message": f"{service} OAuth integration",
        "oauth_url": f"/api/integrations/{service}/oauth",
        "status": "pending_implementation"
    }

@router.get("/status")
def get_integration_status(
    current_user: User = Depends(get_current_user)
):
    """
    Get status of email service integrations.
    """
    return {
        "gmail": {"connected": False},
        "outlook": {"connected": False},
        "smtp": {"available": True}
    }
