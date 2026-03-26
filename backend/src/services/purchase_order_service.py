from sqlalchemy.orm import Session
from fastapi import HTTPException
from src.models.purchase_order_model import PurchaseOrder
from src.models.part_model import Part
from src.schemas.purchase_order_schema import POCreate
from datetime import datetime

class POService:
    @staticmethod
    def create_po(db: Session, po_data: POCreate):
        part = db.query(Part).filter(Part.id == po_data.part_id).first()
        if not part:
            raise HTTPException(status_code=404, detail="Part not found")

        # Enterprise Financial Tracking
        unit_cp = part.buying_price 
        total_po_cost = unit_cp * po_data.quantity
        paid = getattr(po_data, 'amount_paid', 0.0)

        new_po = PurchaseOrder(
            supplier_id=po_data.supplier_id,
            part_id=po_data.part_id,
            quantity=po_data.quantity,
            unit_cost=unit_cp,          
            total_cost=total_po_cost,   
            amount_paid=paid,           
            status="Pending"
        )
        db.add(new_po)
        db.commit()
        db.refresh(new_po)
        return new_po

    @staticmethod
    def receive_po(db: Session, po_id: int, actual_qty: int):
        po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
        if not po:
            raise HTTPException(status_code=404, detail="PO not found")
        
        # Cast to string to satisfy strict type checking
        if str(po.status) == "Received":
            raise HTTPException(status_code=400, detail="PO already received")

        part = db.query(Part).filter(Part.id == po.part_id).first()
        
        # FIXED: Ensure the part actually exists before updating quantity
        if not part:
            raise HTTPException(status_code=404, detail="Part not found in database")
        
        # Update stock and mark PO as received
        # Adding # type: ignore tells Pyright that SQLAlchemy handles this assignment safely
        part.quantity = int(part.quantity) + actual_qty  # type: ignore
        po.received_quantity = actual_qty  # type: ignore
        po.received_at = datetime.utcnow()  # type: ignore
        po.status = "Received"  # type: ignore

        db.commit()
        db.refresh(po)
        return po

    @staticmethod
    def get_all_pos(db: Session):
        return db.query(PurchaseOrder).order_by(PurchaseOrder.created_at.desc()).all()