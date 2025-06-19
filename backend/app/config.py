# backend/app/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

# Clase de configuración de la aplicación
class Settings(BaseSettings):
    database_url: str = "sqlite:///./database/sticky_notes.db"
    app_name: str = "Sticky Notes API"
    debug: bool = True
    
    class Config:
        env_file = ".env"

# Decorador que cachea la función para no crear múltiples instancias de Settings
@lru_cache()
def get_settings():
    return Settings()