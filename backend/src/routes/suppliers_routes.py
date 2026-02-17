from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from src.models.db import get_db
from src.services.suppliers_service import SuppliersService
from src.schemas.supplier_schema import SupplierCreate, SupplierResponse
from src.auth.role_guard import get_current_user_role

router = APIRouter(prefix="/api/suppliers", tags=["Suppliers"])

@router.get("/", response_model=List[SupplierResponse])
def list_suppliers(db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    return SuppliersService.get_all_suppliers(db)

@router.post("/", response_model=SupplierResponse)
def add_supplier(supplier: SupplierCreate, db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    if role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    return SuppliersService.create_supplier(db, supplier)

# --- NEW EDIT ROUTE ---
@router.put("/{supplier_id}", response_model=SupplierResponse)
def update_supplier(supplier_id: int, supplier: SupplierCreate, db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    if role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    return SuppliersService.update_supplier(db, supplier_id, supplier)

@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    if role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    SuppliersService.delete_supplier(db, supplier_id)
    return {"message": "Supplier deleted"}
