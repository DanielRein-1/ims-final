from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# 1. Helper Schemas for Names
class PartRef(BaseModel):
    name: str
    category: str 
    class Config:
        from_attributes = True

class SupplierRef(BaseModel):
    name: str
    class Config:
        from_attributes = True

# --- FIXED: Added amount_paid so FastAPI accepts the frontend data ---
class POCreate(BaseModel):
    supplier_id: int
    part_id: int
    quantity: int
    amount_paid: float = 0.0  # Defaults to 0 if not provided

# --- FIXED: Added financial fields so the frontend can read them ---
class POResponse(BaseModel):
    id: int
    supplier_id: int
    part_id: int
    quantity: int
    
    received_quantity: Optional[int] = None
    received_at: Optional[datetime] = None

    unit_cost: float          # Added for UI/Invoice access
    total_cost: float         # Changed to float for currency accuracy
    amount_paid: float        # Added so the frontend can see payments
    status: str
    created_at: datetime

    part: Optional[PartRef] = None
    supplier: Optional[SupplierRef] = None

    class Config:
        from_attributes = True