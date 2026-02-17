from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# 1. Helper Schemas for Names
class PartRef(BaseModel):
    name: str
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
    
    # --- NEW FIELDS WE MISSED ---
    received_quantity: Optional[int] = None
    received_at: Optional[datetime] = None
    # ----------------------------

    total_cost: int
    status: str
    created_at: datetime

    # Embedded Names
    part: Optional[PartRef] = None
    supplier: Optional[SupplierRef] = None

    class Config:
        from_attributes = True
