from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from src.models.db import get_db
from src.services.purchase_order_service import POService
from src.schemas.purchase_order_schema import POCreate, POResponse
from src.auth.role_guard import get_current_user_role
from pydantic import BaseModel
from src.models.purchase_order_model import PurchaseOrder # Import Model for sorting

router = APIRouter(prefix="/api/purchase-orders", tags=["Purchase Orders"])

class ReceiveInput(BaseModel):
    actual_qty: int

@router.post("/", response_model=POResponse)
def create_po(po: POCreate, db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    return POService.create_po(db, po)

@router.post("/{po_id}/receive", response_model=POResponse)
def receive_po(po_id: int, data: ReceiveInput, db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    return POService.receive_po(db, po_id, data.actual_qty)

@router.get("/", response_model=List[POResponse])
def list_pos(db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    # FIXED: Sort by Newest First (created_at DESC)
    return db.query(PurchaseOrder).order_by(PurchaseOrder.created_at.desc()).all()
