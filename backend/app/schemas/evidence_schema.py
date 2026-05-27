from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.base_model import PyObjectId


class EvidenceCreate(BaseModel):
    proyectoId: PyObjectId

    hallazgoId: Optional[PyObjectId] = None

    nombre: str = Field(..., min_length=1, max_length=150)
    codigo: str = Field(..., min_length=1, max_length=50)

    criterio: Optional[str] = None
    objetivo: Optional[str] = None

    descripcionEvidencia: Optional[str] = None

    documentoId: Optional[PyObjectId] = None
    documentoNombre: Optional[str] = None

    subtitulo: Optional[str] = None

    subrayados: List[PyObjectId] = Field(default_factory=list)


class EvidenceUpdate(BaseModel):
    hallazgoId: Optional[PyObjectId] = None

    nombre: Optional[str] = Field(default=None, min_length=1, max_length=150)
    codigo: Optional[str] = Field(default=None, min_length=1, max_length=50)

    criterio: Optional[str] = None
    objetivo: Optional[str] = None

    descripcionEvidencia: Optional[str] = None

    documentoId: Optional[PyObjectId] = None
    documentoNombre: Optional[str] = None

    subtitulo: Optional[str] = None

    subrayados: Optional[List[PyObjectId]] = None


class EvidenceResponse(BaseModel):
    id: PyObjectId
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

    fechaCreacion: datetime
    fechaActualizacion: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            PyObjectId: str
        }