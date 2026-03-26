from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from src.models.db import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, ForeignKey("parts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    
    # Capture prices at moment of sale for Profit/Loss tracking
    unit_buying_price = Column(Float, nullable=False) 
    unit_selling_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False) 
    
    status = Column(String, default="Completed")
    created_at = Column(DateTime, default=datetime.utcnow)

    part = relationship("Part")
    user = relationship("User")
