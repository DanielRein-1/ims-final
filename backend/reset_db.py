from src.models.db import engine, Base, SessionLocal
from src.models.user_model import User
from src.models.part_model import Part
from src.models.supplier_model import Supplier
from src.models.purchase_order_model import PurchaseOrder
from src.models.order_model import Order
from passlib.context import CryptContext

def reset():
    print("1. Dropping all old tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("2. Creating new tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
    
    print("3. Creating Admin User...")
    admin = User(username='admin', password_hash=pwd_context.hash('admin123'), role='ADMIN')
    db.add(admin)
    
    print("4. Seeding Suppliers...")
    sup1 = Supplier(name="Nairobi Auto Spares", email="sales@nairobi-auto.co.ke", phone="0722000000", contact_person="John Kamau")
    sup2 = Supplier(name="Mombasa Imports Ltd", email="info@mombasa-imports.com", phone="0733000000", contact_person="Ali Hassan")
    db.add(sup1)
    db.add(sup2)
    
    print("5. Seeding Inventory Parts...")
    parts = [
        Part(name="Brake Pad (Front)", sku="BP-001", price=3500, quantity=5),   # Low stock example
        Part(name="Oil Filter", sku="OF-002", price=800, quantity=50),
        Part(name="Headlight Assembly", sku="HL-003", price=12000, quantity=2), # Very low stock
        Part(name="Spark Plug (Set of 4)", sku="SP-004", price=2000, quantity=20),
        Part(name="Shock Absorber (Rear)", sku="SA-005", price=8500, quantity=10)
    ]
    db.add_all(parts)
    
    db.commit()
    db.close()
    print("SUCCESS: Database reset and seeded with initial data.")

if __name__ == "__main__":
    reset()
