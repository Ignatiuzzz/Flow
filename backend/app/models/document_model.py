from datetime import datetime
from typing import Optional

from pydantic import Field

from app.models.base_model import MongoBaseModel, PyObjectId, current_datetime
from app.models.enums import DocumentType


class DocumentModel(MongoBaseModel):
    proyectoId: PyObjectId

    nombreOriginal: str
    nombreArchivo: str

    tipoArchivo: DocumentType
    extension: str

    rutaArchivo: str
    tamanioBytes: Optional[int] = None

    fechaSubida: datetime = Field(default_factory=current_datetime)