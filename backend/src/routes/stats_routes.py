from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.models.db import get_db
from src.models.part_model import Part
from src.models.order_model import Order
from src.auth.role_guard import get_current_user_role
from datetime import datetime

router = APIRouter(prefix="/api/stats", tags=["Stats"])

@router.get("/")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Basic Counts
    total_parts = db.query(func.count(Part.id)).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    
    # 2. Inventory Value
    total_value = db.query(func.sum(Part.price * Part.quantity)).scalar() or 0
    
    # 3. Total Revenue
    total_revenue = db.query(func.sum(Order.total_price)).scalar() or 0
    
    # 4. Low Stock
    low_stock_count = db.query(func.count(Part.id)).filter(Part.quantity < 5).scalar() or 0

    # 5. Monthly Sales (PostgreSQL Syntax - The Fix)
    sales_data = db.query(
        func.to_char(Order.created_at, 'Month'),
        func.sum(Order.total_price)
    ).group_by(func.to_char(Order.created_at, 'Month')).all()

    # Format data for frontend
    months = []
    sales = []
    
    if sales_data:
        for month, total in sales_data:
            months.append(month.strip()) 
            sales.append(total)

    return {
        "total_parts": total_parts,
        "total_orders": total_orders,
        "total_value": total_value,
        "total_revenue": total_revenue, 
        "low_stock_count": low_stock_count,
        "chart_data": {
            "months": months,
            "sales": sales
        }
    }
