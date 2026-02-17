from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from src.models.db import get_db
from src.models.order_model import Order
from src.models.part_model import Part
from src.schemas.order_schema import OrderCreate, OrderResponse
from src.auth.role_guard import get_current_user_role

router = APIRouter(prefix="/api/orders", tags=["Orders"])

# FIXED: .desc() puts the Newest (Latest) sales at the top
@router.get("/", response_model=List[OrderResponse])
def get_all_orders(db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    return db.query(Order).options(joinedload(Order.part)).order_by(Order.created_at.desc()).all()

@router.post("/", response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    part = db.query(Part).filter(Part.id == order.part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    
    if part.quantity < order.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    total_price = part.price * order.quantity
    part.quantity -= order.quantity
    
    new_order = Order(
        user_id=1, 
        part_id=order.part_id,
        quantity=order.quantity,
        total_price=total_price
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order
