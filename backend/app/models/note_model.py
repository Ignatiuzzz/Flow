from datetime import datetime
from typing import Optional

from pydantic import Field

from app.models.base_model import MongoBaseModel, PyObjectId, current_datetime


class NoteModel(MongoBaseModel):
    proyectoId: PyObjectId

    hallazgoId: Optional[PyObjectId] = None
    documentoId: Optional[PyObjectId] = None
    subrayadoId: Optional[PyObjectId] = None

    subtitulo: Optional[str] = None
    texto: str

    fechaCreacion: datetime = Field(default_factory=current_datetime)
    fechaActualizacion: datetime = Field(default_factory=current_datetime)