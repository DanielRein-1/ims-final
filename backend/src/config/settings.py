import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "super-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    # RESTORED: Connecting to your real PostgreSQL database
    DATABASE_URL: str = "postgresql://spare_user:strongpassword@localhost:5432/spare_parts_db"

settings = Settings()
