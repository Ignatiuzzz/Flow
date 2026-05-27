from datetime import datetime
from typing import List, Optional

from pydantic import Field

from app.models.base_model import MongoBaseModel, PyObjectId, current_datetime
from app.models.enums import RiskLevel


class FindingModel(MongoBaseModel):
    proyectoId: PyObjectId

    nombre: str
    codigo: str

    descripcion: Optional[str] = None

    criterio: Optional[str] = None
    objetivo: Optional[str] = None
    causa: Optional[str] = None
    efecto: Optional[str] = None
    conclusion: Optional[str] = None

    impacto: int = 1
    urgencia: int = 1
    riesgo: int = 1

    nivel: RiskLevel = RiskLevel.MUY_BAJO
    justificacionRiesgo: Optional[str] = None

    recomendaciones: Optional[str] = None

    subrayados: List[PyObjectId] = Field(default_factory=list)
    evidencias: List[PyObjectId] = Field(default_factory=list)

    fechaCreacion: datetime = Field(default_factory=current_datetime)
    fechaActualizacion: datetime = Field(default_factory=current_datetime)