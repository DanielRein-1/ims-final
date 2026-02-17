from pydantic import BaseModel, EmailStr
from typing import Optional

class SupplierCreate(BaseModel):
    name: str
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class SupplierResponse(SupplierCreate):
    id: int

    class Config:
        from_attributes = True
