from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str
    jwt_secret: str = "change-me-in-production-use-a-long-random-string"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440
    chroma_path: str = "./chroma_db"
    database_url: str = "sqlite:///./rag_chatbot.db"
    pdf_dir: str = "./data/pdfs"

    class Config:
        env_file = ".env"


settings = Settings()
