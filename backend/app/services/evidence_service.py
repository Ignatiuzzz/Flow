from typing import Optional

from bson import ObjectId

from app.models.evidence_model import EvidenceModel


def build_initial_evidence_from_finding(
    proyecto_id: ObjectId,
    hallazgo_id: ObjectId,
    finding_name: str,
    finding_code: str,
    criterio: Optional[str] = None,
    objetivo: Optional[str] = None,
) -> EvidenceModel:
    return EvidenceModel(
        proyectoId=proyecto_id,
        hallazgoId=hallazgo_id,
        nombre=f"Evidencia de {finding_name}",
        codigo=f"E-{finding_code}",
        criterio=criterio,
        objetivo=objetivo,
        descripcionEvidencia=None,
        documentoId=None,
        documentoNombre=None,
        subtitulo=None,
        subrayados=[]
    )


def complete_evidence_data_from_finding(
    evidence_data: dict,
    finding: dict
) -> dict:
    if not evidence_data.get("criterio"):
        evidence_data["criterio"] = finding.get("criterio")

    if not evidence_data.get("objetivo"):
        evidence_data["objetivo"] = finding.get("objetivo")

    return evidence_data