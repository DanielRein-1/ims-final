from sqlalchemy import Column, Integer, String
from src.models.db import Base

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    contact_person = Column(String)
    email = Column(String, unique=True)
    phone = Column(String)
    address = Column(String)
