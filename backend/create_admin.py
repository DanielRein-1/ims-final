from src.models.db import SessionLocal
from src.models.user_model import User
from src.services.auth_service import AuthService

db = SessionLocal()
try:
    if not db.query(User).filter(User.username == "admin").first():
        hashed = AuthService.get_password_hash("admin123")
        admin = User(username="admin", password_hash=hashed, role="ADMIN")
        db.add(admin)
        db.commit()
        print("SUCCESS: Admin user created (Pass: admin123)")
    else:
        print("INFO: Admin already exists")
except Exception as e:
    print(f"ERROR: {e}")
finally:
    db.close()
