from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from src.models.db import Base

class Part(Base):
    __tablename__ = "parts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    sku = Column(String, unique=True, index=True, nullable=False)  # Stock Keeping Unit (Barcode)
    category = Column(String, default="General")
    price = Column(Float, default=0.0)
    quantity = Column(Integer, default=0)
    low_stock_threshold = Column(Integer, default=5)
    supplier_id = Column(Integer, nullable=True) # We will link this later
