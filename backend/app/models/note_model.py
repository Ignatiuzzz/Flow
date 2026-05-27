from datetime import datetime
from typing import Optional

from pydantic import Field

from app.models.base_model import MongoBaseModel, PyObjectId, current_datetime


class NoteModel(MongoBaseModel):
    proyectoId: PyObjectId
    documentoId: PyObjectId
    subrayadoId: PyObjectId

    texto: str

    subtitulo: Optional[str] = None
    observacion: Optional[str] = None

    fechaCreacion: datetime = Field(default_factory=current_datetime)
    fechaActualizacion: datetime = Field(default_factory=current_datetime)