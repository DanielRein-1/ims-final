from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from src.models.db import Base

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    part_id = Column(Integer, ForeignKey("parts.id"), nullable=False)
    
    quantity = Column(Integer, nullable=False)
    received_quantity = Column(Integer, nullable=True)
    
    # Financials for Invoicing
    unit_cost = Column(Float, default=0.0)  # Price per unit from supplier
    total_cost = Column(Float, default=0.0) # quantity * unit_cost
    amount_paid = Column(Float, default=0.0) # Cash already given to supplier
    
    status = Column(String, default="Pending") 
    created_at = Column(DateTime, default=datetime.utcnow)
    received_at = Column(DateTime, nullable=True)

    supplier = relationship("Supplier")
    part = relationship("Part")