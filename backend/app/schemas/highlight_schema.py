from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.base_model import PyObjectId
from app.models.enums import HighlightType


class HighlightCoordinatesSchema(BaseModel):
    pagina: Optional[int] = None

    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None


class HighlightCreate(BaseModel):
    proyectoId: PyObjectId
    documentoId: PyObjectId

    textoSubrayado: str
    subtitulo: Optional[str] = None
    observacion: Optional[str] = None

    tipo: HighlightType
    esNota: bool = False

    hallazgoId: Optional[PyObjectId] = None
    evidenciaId: Optional[PyObjectId] = None
    notaId: Optional[PyObjectId] = None

    coordenadas: Optional[HighlightCoordinatesSchema] = None


class HighlightUpdate(BaseModel):
    textoSubrayado: Optional[str] = None
    subtitulo: Optional[str] = None
    observacion: Optional[str] = None

    tipo: Optional[HighlightType] = None
    esNota: Optional[bool] = None

    hallazgoId: Optional[PyObjectId] = None
    evidenciaId: Optional[PyObjectId] = None
    notaId: Optional[PyObjectId] = None

    coordenadas: Optional[HighlightCoordinatesSchema] = None


class HighlightResponse(BaseModel):
    id: PyObjectId

    proyectoId: PyObjectId
    documentoId: PyObjectId

    textoSubrayado: str
    subtitulo: Optional[str] = None
    observacion: Optional[str] = None

    tipo: HighlightType
    esNota: bool

    hallazgoId: Optional[PyObjectId] = None
    evidenciaId: Optional[PyObjectId] = None
    notaId: Optional[PyObjectId] = None

    coordenadas: Optional[HighlightCoordinatesSchema] = None

    fechaCreacion: datetime
    fechaActualizacion: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            PyObjectId: str
        }