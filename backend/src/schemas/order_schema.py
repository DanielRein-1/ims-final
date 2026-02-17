from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# 1. Mini Schema for the Part Name
class PartRef(BaseModel):
    name: str
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    part_id: int
    quantity: int

class OrderResponse(BaseModel):
    id: int
    part_id: int
    quantity: int
    total_price: int
    created_at: datetime
    
    # 2. Embed the Part Name here
    part: Optional[PartRef] = None 

    class Config:
        from_attributes = True
