from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from src.models.db import get_db
from src.models.user_model import User
from src.schemas.user_schema import UserCreate, UserResponse
from src.utils.security import get_password_hash
from src.auth.role_guard import get_current_user_role

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    if role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(User).all()

@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    if role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    existing = db.query(User).filter(User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username taken")
    
    hashed_pwd = get_password_hash(user.password)
    new_user = User(username=user.username, password_hash=hashed_pwd, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# --- FIXED: Matches the Frontend Button ---
@router.post("/{user_id}/reset")
def reset_password(user_id: int, db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    if role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Reset to default password '123456'
    default_password = "123456"
    user.password_hash = get_password_hash(default_password)
    db.commit()
    
    return {"message": f"Password reset to '{default_password}'"}
# ------------------------------------------

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    if role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}
