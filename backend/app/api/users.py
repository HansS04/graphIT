from fastapi import APIRouter, Depends, HTTPException, status
from .. import models, schemas
from ..core.dependencies import get_current_user

router = APIRouter()

@router.get("/me", response_model=schemas.UserInDB)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.get("/admin/panel")
def admin_panel(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return {"message": f"Admin: {current_user.email}"}