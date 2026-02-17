from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from src.models.db import Base

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    part_id = Column(Integer, ForeignKey("parts.id"), nullable=False)
    
    quantity = Column(Integer, nullable=False)        # Requested Qty
    received_quantity = Column(Integer, nullable=True) # Actual Received Qty
    
    total_cost = Column(Integer, default=0)
    status = Column(String, default="Pending") 
    
    created_at = Column(DateTime, default=datetime.utcnow) # Requested Date
    received_at = Column(DateTime, nullable=True)          # Received Date

    # Relationships
    supplier = relationship("Supplier")
    part = relationship("Part")
