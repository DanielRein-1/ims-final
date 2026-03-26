# overwrite backend/src/schemas/order_schema.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PartRef(BaseModel):
    name: str
    category: str 
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    part_id: int
    quantity: int

class OrderResponse(BaseModel):
    id: int
    part_id: int
    quantity: int
    
    # --- ADDED FINANCIAL FIELDS ---
    unit_buying_price: float 
    unit_selling_price: float 
    total_price: float 
    # ------------------------------
    
    created_at: datetime
    part: Optional[PartRef] = None 

    class Config:
        from_attributes = True