from pydantic import BaseModel
from typing import Optional

# What we need to create a part
class PartCreate(BaseModel):
    name: str
    sku: str
    category: str = "General"
    price: float
    quantity: int
    low_stock_threshold: int = 5

# What we send back to the frontend
class PartResponse(PartCreate):
    id: int
    
    class Config:
        from_attributes = True
