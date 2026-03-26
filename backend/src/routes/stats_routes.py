from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.models.db import get_db
from src.models.part_model import Part
from src.models.order_model import Order
from src.auth.role_guard import get_current_user_role
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/api/stats", tags=["Stats"])

@router.get("/")
def get_dashboard_stats(time_filter: str = "2026", db: Session = Depends(get_db)):
    # 1. Base queries for dynamic metrics
    orders_query = db.query(func.count(Order.id))
    revenue_query = db.query(func.sum(Order.total_price))
    
    # --- NEW: GROSS PROFIT QUERY ---
    profit_query = db.query(func.sum((Order.unit_selling_price - Order.unit_buying_price) * Order.quantity))
    
    sales_query = db.query(
        func.to_char(Order.created_at, 'Month'),
        func.sum(Order.total_price)
    )

    now = datetime.now(timezone.utc)

    # 2. Apply the dynamic Time Filter
    if time_filter == "week":
        filter_cond = Order.created_at >= now - timedelta(days=7)
        orders_query = orders_query.filter(filter_cond)
        revenue_query = revenue_query.filter(filter_cond)
        profit_query = profit_query.filter(filter_cond) # Applied to profit
        sales_query = sales_query.filter(filter_cond)
    elif time_filter == "month":
        filter_cond = Order.created_at >= now - timedelta(days=30)
        orders_query = orders_query.filter(filter_cond)
        revenue_query = revenue_query.filter(filter_cond)
        profit_query = profit_query.filter(filter_cond) # Applied to profit
        sales_query = sales_query.filter(filter_cond)
    elif time_filter in ["2025", "2026"]:
        filter_cond = func.to_char(Order.created_at, 'YYYY') == time_filter
        orders_query = orders_query.filter(filter_cond)
        revenue_query = revenue_query.filter(filter_cond)
        profit_query = profit_query.filter(filter_cond) # Applied to profit
        sales_query = sales_query.filter(filter_cond)

    # Execute the dynamic queries
    total_orders = orders_query.scalar() or 0
    total_revenue = revenue_query.scalar() or 0
    gross_profit = profit_query.scalar() or 0 # Calculate profit
    
    sales_data = sales_query.group_by(func.to_char(Order.created_at, 'Month')).all()

    # 3. Static Metrics (Inventory values and low stock)
    total_parts = db.query(func.count(Part.id)).scalar() or 0
    total_value = db.query(func.sum(Part.price * Part.quantity)).scalar() or 0
    low_stock_count = db.query(func.count(Part.id)).filter(Part.quantity < 5).scalar() or 0

    # 4. Format data for the frontend chart
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
        "gross_profit": gross_profit, # NEW: Return profit to the frontend
        "low_stock_count": low_stock_count,
        "chart_data": { "months": months, "sales": sales }
    }

@router.get("/top-movers")
def get_top_movers(time_filter: str = "all", limit: str = "5", db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    query = db.query(
        Part.name,
        Part.category,
        func.sum(Order.quantity).label('total_sold'),
        func.sum(Order.total_price).label('total_revenue')
    ).join(Order, Part.id == Order.part_id)
    
    # 1. Apply Time Filters
    now = datetime.now(timezone.utc)
    if time_filter == "week":
        query = query.filter(Order.created_at >= now - timedelta(days=7))
    elif time_filter == "month":
        query = query.filter(Order.created_at >= now - timedelta(days=30))
    elif time_filter in ["2025", "2026"]:
        query = query.filter(func.to_char(Order.created_at, 'YYYY') == time_filter)
        
    # 2. ALWAYS order by the highest volume sold (Leaderboard style)
    query = query.group_by(Part.id).order_by(func.sum(Order.quantity).desc())
    
    # 3. Apply the dynamic Limit
    if limit != "all":
        query = query.limit(int(limit))
     
    results = query.all()
     
    return [
        {
            "name": row[0],
            "make": row[1] or "Universal",
            "total_sold": row[2] or 0,
            "total_revenue": row[3] or 0
        }
        for row in results
    ]