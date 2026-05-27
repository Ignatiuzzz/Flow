from datetime import datetime
from typing import List, Optional

from pydantic import Field

from app.models.base_model import MongoBaseModel, PyObjectId, current_datetime


class EvidenceModel(MongoBaseModel):
    proyectoId: PyObjectId

    hallazgoId: Optional[PyObjectId] = None

    nombre: str
    codigo: str

    criterio: Optional[str] = None
    objetivo: Optional[str] = None

    descripcionEvidencia: Optional[str] = None

    documentoId: Optional[PyObjectId] = None
    documentoNombre: Optional[str] = None

    subtitulo: Optional[str] = None

    subrayados: List[PyObjectId] = Field(default_factory=list)

    fechaCreacion: datetime = Field(default_factory=current_datetime)
    fechaActualizacion: datetime = Field(default_factory=current_datetime)