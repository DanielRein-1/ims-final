from sqlalchemy.orm import Session
from fastapi import HTTPException
from src.models.order_model import Order
from src.models.part_model import Part
from src.schemas.order_schema import OrderCreate

class OrdersService:
    @staticmethod
    def create_order(db: Session, order_data: OrderCreate, user_id: int):
        # 1. Find the Part
        part = db.query(Part).filter(Part.id == order_data.part_id).first()
        if not part:
            raise HTTPException(status_code=404, detail="Part not found")

        # 2. Check Stock Availability
        if part.quantity < order_data.quantity:
            raise HTTPException(status_code=400, detail="Not enough stock available")

        # 3. Calculate Total Price (Simple multiplication)
        total_cost = part.price * order_data.quantity

        # 4. Create the Order Record
        new_order = Order(
            part_id=order_data.part_id,
            user_id=user_id,
            quantity=order_data.quantity,
            total_price=total_cost,
            status="Completed"
        )

        # 5. DEDUCT STOCK (The Magic Step)
        part.quantity -= order_data.quantity

        # 6. Save everything
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        return new_order

    @staticmethod
    def get_all_orders(db: Session):
        return db.query(Order).all()
