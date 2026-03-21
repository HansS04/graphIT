from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..core.dependencies import get_db, get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.Preset)
def create_preset(preset: schemas.PresetCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_preset = models.DashboardPreset(name=preset.name, layout=preset.layout, user_id=current_user.id)
    db.add(db_preset)
    db.commit()
    db.refresh(db_preset)
    return db_preset

@router.put("/{preset_id}", response_model=schemas.Preset)
def update_preset(preset_id: int, preset: schemas.PresetCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_preset = db.query(models.DashboardPreset).filter(models.DashboardPreset.id == preset_id, models.DashboardPreset.user_id == current_user.id).first()
    if not db_preset:
        raise HTTPException(status_code=404, detail="Not found")
    db_preset.name = preset.name
    db_preset.layout = preset.layout
    db.commit()
    db.refresh(db_preset)
    return db_preset

@router.get("/", response_model=List[schemas.Preset])
def get_presets(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.DashboardPreset).filter(models.DashboardPreset.user_id == current_user.id).all()

@router.delete("/{preset_id}")
def delete_preset(preset_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    preset = db.query(models.DashboardPreset).filter(models.DashboardPreset.id == preset_id, models.DashboardPreset.user_id == current_user.id).first()
    if not preset:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(preset)
    db.commit()
    return {"message": "Deleted"}