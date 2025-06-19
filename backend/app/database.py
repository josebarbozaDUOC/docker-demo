# backend/app/database.py
# https://docs.sqlalchemy.org/en/20/orm/quickstart.html
# https://docs.sqlalchemy.org/en/20/dialects/sqlite.html

from sqlalchemy import create_engine, Column, Integer, String, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from .config import get_settings

settings = get_settings()

# Crear conexión a la base de datos
engine = create_engine(
    settings.database_url, 
    connect_args={"check_same_thread": False}  # Necesario para SQLite
)

# Crear factory de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base para los modelos
Base = declarative_base()

# Modelo de la tabla sticky_notes
class DBStickyNote(Base):
    __tablename__ = "sticky_notes"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    color = Column(String, default="yellow")
    position = Column(JSON, default={"x": 0, "y": 0})
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, nullable=True)

# Crear las tablas
Base.metadata.create_all(bind=engine)

# Dependency para obtener sesión de DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()