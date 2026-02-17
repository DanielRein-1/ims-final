# overwrite backend/src/routes/parts_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from src.models.db import get_db
from src.services.parts_service import PartsService
from src.schemas.part_schema import PartCreate, PartResponse
from src.auth.role_guard import get_current_user_role

router = APIRouter(prefix="/api/parts", tags=["Parts"])

@router.get("/", response_model=List[PartResponse])
def list_parts(db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    return PartsService.get_all_parts(db)

@router.post("/", response_model=PartResponse)
def add_part(part: PartCreate, db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    if role != "ADMIN":
        raise HTTPException(status_code=403, detail="Only Admins can add parts")
    return PartsService.create_part(db, part)

# --- NEW PUT ROUTE FOR EDITING ---
@router.put("/{part_id}", response_model=PartResponse)
def update_part(part_id: int, part: PartCreate, db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    if role != "ADMIN":
        raise HTTPException(status_code=403, detail="Only Admins can edit parts")
    return PartsService.update_part(db, part_id, part)

# --- NEW DELETE ROUTE ---
@router.delete("/{part_id}")
def delete_part(part_id: int, db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    if role != "ADMIN":
        raise HTTPException(status_code=403, detail="Only Admins can delete parts")
    PartsService.delete_part(db, part_id)
    return {"message": "Part deleted"}