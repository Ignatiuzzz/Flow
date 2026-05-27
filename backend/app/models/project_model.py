from datetime import datetime
from typing import List, Optional

from pydantic import Field

from app.models.base_model import MongoBaseModel, PyObjectId, current_datetime
from app.models.enums import ProjectStatus


class ProjectModel(MongoBaseModel):
    nombre: str
    descripcion: Optional[str] = None

    estado: ProjectStatus = ProjectStatus.ACTIVO

    documentos: List[PyObjectId] = Field(default_factory=list)
    hallazgos: List[PyObjectId] = Field(default_factory=list)
    evidencias: List[PyObjectId] = Field(default_factory=list)
    notas: List[PyObjectId] = Field(default_factory=list)

    fechaCreacion: datetime = Field(default_factory=current_datetime)
    fechaActualizacion: datetime = Field(default_factory=current_datetime)