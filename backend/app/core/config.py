
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    OPENAI_API_KEY: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    GMAIL_CLIENT_ID: str = ""
    GMAIL_CLIENT_SECRET: str = ""
    OUTLOOK_CLIENT_ID: str = ""
    OUTLOOK_CLIENT_SECRET: str = ""

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    UPLOAD_DIR: str = "uploads"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
