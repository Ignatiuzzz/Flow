from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.base_model import PyObjectId


class NoteCreate(BaseModel):
    proyectoId: PyObjectId
    documentoId: PyObjectId
    subrayadoId: PyObjectId

    texto: str

    subtitulo: Optional[str] = None
    observacion: Optional[str] = None


class NoteUpdate(BaseModel):
    texto: Optional[str] = None

    subtitulo: Optional[str] = None
    observacion: Optional[str] = None


class NoteResponse(BaseModel):
    id: PyObjectId

    proyectoId: PyObjectId
    documentoId: PyObjectId
    subrayadoId: PyObjectId

    texto: str

    subtitulo: Optional[str] = None
    observacion: Optional[str] = None

    fechaCreacion: datetime
    fechaActualizacion: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            PyObjectId: str
        }