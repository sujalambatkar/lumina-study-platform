from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str
    mongodb_uri: str
    mongodb_db_name: str = "lumina"
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    frontend_url: str = "http://localhost:3000"
    chroma_persist_dir: str = "./chroma_store"
    debug: bool = False

    @property
    def allowed_origins(self) -> list[str]:
        origins = [self.frontend_url, "http://localhost:3000"]
        return list(set(origins))

    class Config:
        env_file = ".env"


settings = Settings()
