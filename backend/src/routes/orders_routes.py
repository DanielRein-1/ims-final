from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# Import your database session and models
from src.models.db import get_db
from src.models.order_model import Order
from src.models.part_model import Part

# Import your schemas and auth guard
from src.schemas.order_schema import OrderCreate, OrderResponse
from src.auth.role_guard import get_current_user_role

# Initialize the router
router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.post("/", response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    part = db.query(Part).filter(Part.id == order.part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    
    if part.quantity < order.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # --- PROFIT LOGIC INJECTION ---
    unit_cp = part.buying_price  # Cost Price
    unit_sp = part.price         # Selling Price
    total_revenue = unit_sp * order.quantity
    
    # Deduct stock
    part.quantity -= order.quantity
    
    # Create order history with financial records
    new_order = Order(
        user_id=1,                     # Assuming user_id 1 for now, or extract from token
        part_id=order.part_id,
        quantity=order.quantity,
        unit_buying_price=unit_cp,     # Save CP to history
        unit_selling_price=unit_sp,    # Save SP to history
        total_price=total_revenue      # Save Revenue
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("/", response_model=List[OrderResponse])
def list_orders(db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    # Retrieve all orders, sorted by newest first
    return db.query(Order).order_by(Order.created_at.desc()).all()
