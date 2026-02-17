import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

sys.path.append(os.getcwd())
from src.config.settings import settings
from src.utils.security import get_password_hash

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
session = SessionLocal()

def create_master_admin():
    try:
        print("Checking for existing admin...")
        # Check if admin exists first
        result = session.execute(text("SELECT id FROM users WHERE username = 'admin'"))
        user = result.fetchone()

        hashed_pwd = get_password_hash("admin123")

        if user:
            # OPTION A: UPDATE existing user (Bypasses Foreign Key Error)
            print("Admin found. Updating password hash...")
            session.execute(text("""
                UPDATE users 
                SET password_hash = :pwd, role = 'ADMIN' 
                WHERE username = 'admin';
            """), {"pwd": hashed_pwd})
        else:
            # OPTION B: INSERT new user
            print("Admin not found. Creating new...")
            session.execute(text("""
                INSERT INTO users (username, password_hash, role) 
                VALUES ('admin', :pwd, 'ADMIN');
            """), {"pwd": hashed_pwd})
            
        session.commit()
        print("✅ SUCCESS: Master Admin Synced: admin / admin123")
    except Exception as e:
        print(f"❌ Error: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    create_master_admin()
