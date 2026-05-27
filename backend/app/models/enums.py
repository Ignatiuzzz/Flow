from enum import Enum


class ProjectStatus(str, Enum):
    ACTIVO = "activo"
    FINALIZADO = "finalizado"
    ARCHIVADO = "archivado"


class DocumentType(str, Enum):
    PDF = "pdf"
    DOCX = "docx"


class HighlightType(str, Enum):
    HALLAZGO = "hallazgo"
    EVIDENCIA = "evidencia"
    NOTA = "nota"


class RiskLevel(str, Enum):
    MUY_BAJO = "Muy Bajo"
    BAJO = "Bajo"
    MEDIO = "Medio"
    ALTO = "Alto"
    EXTREMO = "Extremo"