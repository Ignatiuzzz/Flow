from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.base_model import PyObjectId
from app.models.enums import DocumentType


class DocumentCreate(BaseModel):
    proyectoId: PyObjectId

    nombreOriginal: str
    nombreArchivo: str

    tipoArchivo: DocumentType
    extension: str

    rutaArchivo: str
    tamanioBytes: Optional[int] = None


class DocumentUpdate(BaseModel):
    nombreOriginal: Optional[str] = None
    nombreArchivo: Optional[str] = None

    tipoArchivo: Optional[DocumentType] = None
    extension: Optional[str] = None

    rutaArchivo: Optional[str] = None
    tamanioBytes: Optional[int] = None


class DocumentResponse(BaseModel):
    id: PyObjectId
    proyectoId: PyObjectId

    nombreOriginal: str
    nombreArchivo: str

    tipoArchivo: DocumentType
    extension: str

    rutaArchivo: str
    tamanioBytes: Optional[int] = None

    fechaSubida: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            PyObjectId: str
        }