from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.base_model import PyObjectId


class NoteCreate(BaseModel):
    proyectoId: PyObjectId

    hallazgoId: Optional[PyObjectId] = None
    documentoId: Optional[PyObjectId] = None
    subrayadoId: Optional[PyObjectId] = None

    subtitulo: Optional[str] = None
    texto: str = Field(..., min_length=1)


class NoteUpdate(BaseModel):
    hallazgoId: Optional[PyObjectId] = None
    documentoId: Optional[PyObjectId] = None
    subrayadoId: Optional[PyObjectId] = None

    subtitulo: Optional[str] = None
    texto: Optional[str] = Field(default=None, min_length=1)


class NoteResponse(BaseModel):
    id: PyObjectId

    proyectoId: PyObjectId

    hallazgoId: Optional[PyObjectId] = None
    documentoId: Optional[PyObjectId] = None
    subrayadoId: Optional[PyObjectId] = None

    subtitulo: Optional[str] = None
    texto: str

    fechaCreacion: datetime
    fechaActualizacion: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            PyObjectId: str
        }