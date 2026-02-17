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

        total_cost = part.price * po_data.quantity

        new_po = PurchaseOrder(
            supplier_id=po_data.supplier_id,
            part_id=po_data.part_id,
            quantity=po_data.quantity,
            total_cost=total_cost,
            status="Pending"
        )
        db.add(new_po)
        db.commit()
        db.refresh(new_po)
        return new_po

    @staticmethod
    def receive_po(db: Session, po_id: int, actual_qty: int):
        # 1. Find PO
        po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
        if not po:
            raise HTTPException(status_code=404, detail="PO not found")
        
        if po.status == "Received":
            raise HTTPException(status_code=400, detail="PO already received")

        # 2. Find Part
        part = db.query(Part).filter(Part.id == po.part_id).first()
        
        # 3. Update Stock using ACTUAL quantity
        part.quantity += actual_qty
        
        # 4. Update PO Details
        po.received_quantity = actual_qty
        po.received_at = datetime.utcnow()
        po.status = "Received"

        db.commit()
        db.refresh(po)
        return po

    @staticmethod
    def get_all_pos(db: Session):
        return db.query(PurchaseOrder).all()
