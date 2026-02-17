from sqlalchemy.orm import Session
from passlib.context import CryptContext
from fastapi import HTTPException, status
from src.models.user_model import User
from src.auth.jwt_handler import create_access_token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    @staticmethod
    def verify_password(plain, hashed):
        return pwd_context.verify(plain, hashed)

    @staticmethod
    def get_password_hash(password):
        return pwd_context.hash(password)

    @staticmethod
    def login(db: Session, login_data):
        # 1. Check if user exists
        user = db.query(User).filter(User.username == login_data.username).first()
        
        # 2. Verify password
        if not user or not AuthService.verify_password(login_data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Incorrect username or password")
        
        # 3. Generate Token
        token = create_access_token({"sub": user.username, "role": user.role})
        return {"access_token": token, "token_type": "bearer", "role": user.role, "username": user.username}
