# overwrite backend/src/schemas/purchase_order_schema.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# 1. Helper Schemas for Names
class PartRef(BaseModel):
    name: str
    # --- ESSENTIAL ADDITION: Expose category to frontend ---
    category: str 
    # -------------------------------------------------------
    class Config:
        from_attributes = True

class SupplierRef(BaseModel):
    name: str
    class Config:
        from_attributes = True

class POCreate(BaseModel):
    supplier_id: int
    part_id: int
    quantity: int

class POResponse(BaseModel):
    id: int
    supplier_id: int
    part_id: int
    quantity: int
    
    received_quantity: Optional[int] = None
    received_at: Optional[datetime] = None

    total_cost: int
    status: str
    created_at: datetime

    part: Optional[PartRef] = None
    supplier: Optional[SupplierRef] = None

    class Config:
        from_attributes = True