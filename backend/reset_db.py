from src.models.db import engine, Base, SessionLocal
from src.models.user_model import User
from src.models.part_model import Part
from src.models.supplier_model import Supplier
from src.models.order_model import Order
from src.models.purchase_order_model import PurchaseOrder
from passlib.context import CryptContext
import random
from datetime import datetime, timedelta, timezone
from faker import Faker 

fake = Faker()

def reset():
    print("--- STARTING FULL SYSTEM RESET & SEEDING ---")
    print("1. Dropping and Recreating Tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
    
    print("2. Creating Users (admin/admin123, staff/staff123)...")
    admin = User(username='admin', password_hash=pwd_context.hash('admin123'), role='ADMIN')
    staff = User(username='staff', password_hash=pwd_context.hash('staff123'), role='STAFF')
    db.add(admin)
    db.add(staff)
    db.commit()
    # Refresh to grab their newly assigned Database IDs
    db.refresh(admin)
    db.refresh(staff)
    
    print("3. Seeding Suppliers...")
    suppliers = [
        Supplier(name="Nairobi Auto Spares", email="sales@nairobi-auto.co.ke", phone="0722123456"),
        Supplier(name="Mombasa Imports Ltd", email="info@mombasa-imports.com", phone="0733987654"),
        Supplier(name="Kisumu Parts Hub", email="orders@kisumuhub.com", phone="0711555666")
    ]
    db.add_all(suppliers)
    db.commit()

    print("4. Seeding Inventory Parts (High initial stock)...")
    parts = [
        Part(name="Brake Pad (Front)", sku="BP-TY-001", category="Toyota", price=3500, quantity=100),
        Part(name="Oil Filter", sku="OF-NS-002", category="Nissan", price=800, quantity=150),
        Part(name="Headlight Assembly", sku="HL-MB-003", category="Mercedes", price=12000, quantity=50),
        Part(name="Spark Plug (Set)", sku="SP-AD-004", category="Audi", price=2000, quantity=200),
        Part(name="Shock Absorber", sku="SA-VL-005", category="Volvo", price=8500, quantity=60),
        Part(name="Air Filter", sku="AF-TY-006", category="Toyota", price=1200, quantity=120),
        Part(name="Wiper Blades", sku="WB-UN-007", category="Universal", price=1500, quantity=80),
        Part(name="Battery (70Ah)", sku="BT-UN-008", category="Universal", price=10500, quantity=40)
    ]
    db.add_all(parts)
    db.commit()

    db_parts = db.query(Part).all()

    print("5. Generating 60 Historical Sales Records (Last 60 days)...")
    orders = []
    
    print("5. Generating 300 Historical Sales Records (Spanning back to 2025)...")
    orders = []
    
    for _ in range(300):
        part = random.choice(db_parts)
        
        current_qty: int = part.quantity  # type: ignore
        current_price: int = part.price   # type: ignore
        
        max_qty = min(current_qty, 5) 
        if max_qty < 1: 
            max_qty = 1
        
        qty = random.randint(1, max_qty)
        total = current_price * qty
        
        # Go back 400 days (covers all of 2025 up to today)
        random_days = random.randint(0, 400)
        sale_date = datetime.now(timezone.utc) - timedelta(days=random_days)
        
        order = Order(
            part_id=part.id,
            user_id=random.choice([admin.id, staff.id]), # ESSENTIAL: Ties the sale to an employee
            quantity=qty,
            total_price=total,
            created_at=sale_date
        )
        orders.append(order)
        part.quantity = current_qty - qty  # type: ignore

    db.add_all(orders)
    db.commit()
    
    low_stock = db.query(Part).filter(Part.quantity < 5).count()

    db.close()
    print(f"--- SUCCESS! Seeded {len(parts)} parts and {len(orders)} sales. ---")
    print(f"--- Current Low Stock Items: {low_stock} ---")

if __name__ == "__main__":
    reset()