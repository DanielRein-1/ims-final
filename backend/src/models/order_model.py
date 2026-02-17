from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from src.models.db import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, ForeignKey("parts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Integer, nullable=False) # Storing in cents/shillings
    status = Column(String, default="Completed")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships (Allows us to get the Part name easily)
    part = relationship("Part")
    user = relationship("User")
