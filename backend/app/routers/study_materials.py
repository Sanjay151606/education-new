from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas, auth
from app.database import get_db
from app.services import ai_service

router = APIRouter(prefix="/api/materials", tags=["study_materials"])


@router.post("/", response_model=schemas.MaterialOut)
def create_material(
    material_in: schemas.MaterialCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    ai_result = ai_service.simplify_study_material(
        material_in.original_text,
        reading_level=current_user.difficulty_level,
    )

    material = models.StudyMaterial(
        user_id=current_user.id,
        title=material_in.title,
        original_text=material_in.original_text,
        subject=material_in.subject,
        simplified_text=ai_result.get("simplified_text"),
        summary_bullets=ai_result.get("summary_bullets", []),
        flashcards=ai_result.get("flashcards", []),
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


@router.get("/", response_model=List[schemas.MaterialOut])
def list_materials(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return db.query(models.StudyMaterial).filter(
        models.StudyMaterial.user_id == current_user.id
    ).all()
