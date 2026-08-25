from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas, auth
from app.database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


@router.patch("/me", response_model=schemas.UserOut)
def update_profile(
    profile_in: schemas.UserUpdateProfile,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name
    if profile_in.focus_span_minutes is not None:
        current_user.focus_span_minutes = profile_in.focus_span_minutes
    if profile_in.preferred_content_style is not None:
        current_user.preferred_content_style = profile_in.preferred_content_style
    if profile_in.difficulty_level is not None:
        current_user.difficulty_level = profile_in.difficulty_level
    if profile_in.reminders_enabled is not None:
        current_user.reminders_enabled = profile_in.reminders_enabled

    db.commit()
    db.refresh(current_user)
    return current_user
