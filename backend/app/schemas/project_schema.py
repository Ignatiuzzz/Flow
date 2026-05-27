from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.base_model import PyObjectId
from app.models.enums import ProjectStatus


class ProjectCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=150)
    descripcion: Optional[str] = None


class ProjectUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=1, max_length=150)
    descripcion: Optional[str] = None
    estado: Optional[ProjectStatus] = None


class ProjectResponse(BaseModel):
    id: PyObjectId
    nombre: str
    descripcion: Optional[str] = None
    estado: ProjectStatus

    documentos: List[PyObjectId] = Field(default_factory=list)
    hallazgos: List[PyObjectId] = Field(default_factory=list)
    evidencias: List[PyObjectId] = Field(default_factory=list)
    notas: List[PyObjectId] = Field(default_factory=list)

    fechaCreacion: datetime
    fechaActualizacion: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            PyObjectId: str
        }