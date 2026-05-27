from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.base_model import PyObjectId
from app.models.enums import HighlightType


class HighlightRectSchema(BaseModel):
    x: float
    y: float
    width: float
    height: float


class HighlightPageCoordinatesSchema(BaseModel):
    pagina: int
    rects: List[HighlightRectSchema] = Field(default_factory=list)


class HighlightCoordinatesSchema(BaseModel):
    paginas: List[HighlightPageCoordinatesSchema] = Field(default_factory=list)


class HighlightCreate(BaseModel):
    proyectoId: PyObjectId
    documentoId: PyObjectId

    textoSubrayado: str = Field(..., min_length=1)

    subtitulo: Optional[str] = None
    observacion: Optional[str] = None

    tipo: HighlightType

    esNota: bool = False

    hallazgoId: Optional[PyObjectId] = None
    evidenciaId: Optional[PyObjectId] = None
    notaId: Optional[PyObjectId] = None

    coordenadas: Optional[HighlightCoordinatesSchema] = None


class HighlightUpdate(BaseModel):
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

    esNota: bool = False

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