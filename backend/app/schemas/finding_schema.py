from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.base_model import PyObjectId
from app.models.enums import RiskLevel


class FindingCreate(BaseModel):
    proyectoId: PyObjectId

    nombre: str = Field(..., min_length=1, max_length=150)
    codigo: str = Field(..., min_length=1, max_length=50)

    descripcion: Optional[str] = None

    criterio: Optional[str] = None
    objetivo: Optional[str] = None
    causa: Optional[str] = None
    efecto: Optional[str] = None
    conclusion: Optional[str] = None

    impacto: int = Field(default=1, ge=1)
    urgencia: int = Field(default=1, ge=1)

    justificacionRiesgo: Optional[str] = None
    recomendaciones: Optional[str] = None

    subrayados: List[PyObjectId] = Field(default_factory=list)


class FindingUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=1, max_length=150)
    codigo: Optional[str] = Field(default=None, min_length=1, max_length=50)

    descripcion: Optional[str] = None

    criterio: Optional[str] = None
    objetivo: Optional[str] = None
    causa: Optional[str] = None
    efecto: Optional[str] = None
    conclusion: Optional[str] = None

    impacto: Optional[int] = Field(default=None, ge=1)
    urgencia: Optional[int] = Field(default=None, ge=1)

    justificacionRiesgo: Optional[str] = None
    recomendaciones: Optional[str] = None

    subrayados: Optional[List[PyObjectId]] = None
    evidencias: Optional[List[PyObjectId]] = None


class FindingResponse(BaseModel):
    id: PyObjectId
    proyectoId: PyObjectId

    nombre: str
    codigo: str

    descripcion: Optional[str] = None

    criterio: Optional[str] = None
    objetivo: Optional[str] = None
    causa: Optional[str] = None
    efecto: Optional[str] = None
    conclusion: Optional[str] = None

    impacto: int
    urgencia: int
    riesgo: int
    nivel: RiskLevel

    justificacionRiesgo: Optional[str] = None
    recomendaciones: Optional[str] = None

    subrayados: List[PyObjectId] = Field(default_factory=list)
    evidencias: List[PyObjectId] = Field(default_factory=list)

    fechaCreacion: datetime
    fechaActualizacion: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            PyObjectId: str
        }