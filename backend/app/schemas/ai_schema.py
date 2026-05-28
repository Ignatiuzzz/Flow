from typing import Dict, List, Optional

from pydantic import BaseModel

from app.models.base_model import PyObjectId


class AISuggestFindingRequest(BaseModel):
    proyectoId: PyObjectId

    nombre: Optional[str] = None
    codigo: Optional[str] = None
    descripcion: Optional[str] = None
    textoSubrayado: Optional[str] = None

    camposExistentes: Dict[str, str] = {}


class AISuggestEvidenceRequest(BaseModel):
    proyectoId: PyObjectId
    hallazgoId: Optional[PyObjectId] = None

    nombre: Optional[str] = None
    descripcionEvidencia: Optional[str] = None

    camposExistentes: Dict[str, str] = {}


class AISuggestFromHighlightRequest(BaseModel):
    textoSubrayado: str
    tipo: str
    proyectoId: Optional[PyObjectId] = None


class AIImproveTextRequest(BaseModel):
    texto: str
    nombreCampo: str
    contexto: Optional[str] = None


class AISuggestionResponse(BaseModel):
    sugerencias: Dict[str, str]
    mensaje: Optional[str] = None
