from sqlalchemy.orm import Session
from fastapi import HTTPException
from src.models.supplier_model import Supplier
from src.schemas.supplier_schema import SupplierCreate

class SuppliersService:
    @staticmethod
    def create_supplier(db: Session, supplier: SupplierCreate):
        new_supplier = Supplier(
            name=supplier.name,
            contact_person=supplier.contact_person,
            email=supplier.email,
            phone=supplier.phone,
            address=supplier.address
        )
        db.add(new_supplier)
        db.commit()
        db.refresh(new_supplier)
        return new_supplier

    @staticmethod
    def get_all_suppliers(db: Session):
        return db.query(Supplier).order_by(Supplier.id).all()

    # --- NEW UPDATE LOGIC ---
    @staticmethod
    def update_supplier(db: Session, supplier_id: int, data: SupplierCreate):
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")
        
        supplier.name = data.name
        supplier.contact_person = data.contact_person
        supplier.email = data.email
        supplier.phone = data.phone
        # supplier.address = data.address # Optional if you add address field later
        
        db.commit()
        db.refresh(supplier)
        return supplier
    
    @staticmethod
    def delete_supplier(db: Session, supplier_id: int):
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")
        db.delete(supplier)
        db.commit()
        return True
