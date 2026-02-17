from sqlalchemy.orm import Session
from sqlalchemy import func
from src.models.part_model import Part
from src.models.supplier_model import Supplier
from src.models.order_model import Order

class StatsService:
    @staticmethod
    def get_dashboard_stats(db: Session):
        # 1. Total Parts Count
        total_parts = db.query(func.count(Part.id)).scalar() or 0

        # 2. Total Inventory Value (Price * Quantity for all items)
        # We use COALESCE to handle cases where the table is empty (returns 0 instead of None)
        total_value = db.query(func.sum(Part.price * Part.quantity)).scalar() or 0

        # 3. Low Stock Items (Threshold < 5)
        low_stock_count = db.query(func.count(Part.id)).filter(Part.quantity < 5).scalar() or 0

        # 4. Total Suppliers
        total_suppliers = db.query(func.count(Supplier.id)).scalar() or 0

        # 5. Total Orders
        total_orders = db.query(func.count(Order.id)).scalar() or 0

        return {
            "total_parts": total_parts,
            "total_value": total_value,
            "low_stock_count": low_stock_count,
            "total_suppliers": total_suppliers,
            "total_orders": total_orders
        }
