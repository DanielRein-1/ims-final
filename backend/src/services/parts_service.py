# overwrite backend/src/services/parts_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
from src.models.part_model import Part
from src.schemas.part_schema import PartCreate

class PartsService:
    @staticmethod
    def create_part(db: Session, part: PartCreate):
        new_part = Part(
            name=part.name,
            sku=part.sku,
            category=part.category,
            price=part.price,
            quantity=part.quantity,
            low_stock_threshold=part.low_stock_threshold
        )
        db.add(new_part)
        db.commit()
        db.refresh(new_part)
        return new_part

    @staticmethod
    def get_all_parts(db: Session):
        # Sort by ID so the table doesn't jump around
        return db.query(Part).order_by(Part.id).all()

    # --- NEW UPDATE METHOD ---
    @staticmethod
    def update_part(db: Session, part_id: int, part_data: PartCreate):
        part = db.query(Part).filter(Part.id == part_id).first()
        if not part:
            raise HTTPException(status_code=404, detail="Part not found")
        
        part.name = part_data.name
        part.sku = part_data.sku
        part.price = part_data.price
        part.quantity = part_data.quantity
        
        db.commit()
        db.refresh(part)
        return part

    @staticmethod
    def delete_part(db: Session, part_id: int):
        part = db.query(Part).filter(Part.id == part_id).first()
        if not part:
            raise HTTPException(status_code=404, detail="Part not found")
        db.delete(part)
        db.commit()
        return True