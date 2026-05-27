from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.base_model import MongoBaseModel, PyObjectId, current_datetime
from app.models.enums import HighlightType


class HighlightCoordinates(BaseModel):
    pagina: Optional[int] = None

    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None


class HighlightModel(MongoBaseModel):
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

    coordenadas: Optional[HighlightCoordinates] = None

    fechaCreacion: datetime = Field(default_factory=current_datetime)
    fechaActualizacion: datetime = Field(default_factory=current_datetime)