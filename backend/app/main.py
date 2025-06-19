# backend/app/main.py
'''
Main (simple sin refactorizar) con modelos y rutas
'''
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from .database import get_db, DBStickyNote
from .config import get_settings

settings = get_settings()

# Inicializar FastAPI con configuración
app = FastAPI(title=settings.app_name)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic para API
class StickyNote(BaseModel):
    id: int
    content: str
    color: Literal["yellow", "pink", "blue", "green", "orange"] = "yellow"
    position: dict[str, float] = {"x": 0, "y": 0}
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True  # Permite convertir desde ORM

class StickyNoteCreate(BaseModel):
    content: str
    color: Literal["yellow", "pink", "blue", "green", "orange"] = "yellow"
    position: dict[str, float] = {"x": 0, "y": 0}

class StickyNoteUpdate(BaseModel):
    content: Optional[str] = None
    color: Optional[Literal["yellow", "pink", "blue", "green", "orange"]] = None
    position: Optional[dict[str, float]] = None

# Rutas
@app.get("/")
async def root():
    return {"message": settings.app_name, "version": "1.0"}

# Crear una nota nueva
@app.post("/notes", response_model=StickyNote)
async def create_note(note: StickyNoteCreate, db: Session = Depends(get_db)):
    db_note = DBStickyNote(
        content=note.content,
        color=note.color,
        position=note.position
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)  # Obtener el ID generado
    return db_note

# Obtener todas las notas
@app.get("/notes", response_model=list[StickyNote])
async def get_all_notes(db: Session = Depends(get_db)):
    notes = db.query(DBStickyNote).order_by(DBStickyNote.created_at.desc()).all()
    return notes

# Obtener una nota específica
@app.get("/notes/{note_id}", response_model=StickyNote)
async def get_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(DBStickyNote).filter(DBStickyNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

# Actualizar una nota
@app.put("/notes/{note_id}", response_model=StickyNote)
async def update_note(note_id: int, note_update: StickyNoteUpdate, db: Session = Depends(get_db)):
    note = db.query(DBStickyNote).filter(DBStickyNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Actualizar solo los campos proporcionados
    if note_update.content is not None:
        note.content = note_update.content  # type: ignore
    if note_update.color is not None:
        note.color = note_update.color  # type: ignore
    if note_update.position is not None:
        note.position = note_update.position  # type: ignore
    note.updated_at = datetime.now()  # type: ignore
    
    db.commit()
    db.refresh(note)
    return note

# Eliminar una nota
@app.delete("/notes/{note_id}")
async def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(DBStickyNote).filter(DBStickyNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(note)
    db.commit()
    return {"message": "Note deleted successfully"}

# Filtrar notas por color
@app.get("/notes/color/{color}", response_model=list[StickyNote])
async def get_notes_by_color(color: str, db: Session = Depends(get_db)):
    notes = db.query(DBStickyNote).filter(DBStickyNote.color == color).all()
    return notes