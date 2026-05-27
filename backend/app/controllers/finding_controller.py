from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.database import get_database
from app.models.finding_model import FindingModel
from app.services.finding_service import (
    get_evidence_sync_fields,
    prepare_finding_data,
    prepare_finding_update_data,
    should_sync_evidence_fields,
)
from app.services.pdf_service import generate_finding_pdf
from app.services.word_service import generate_finding_word
from app.utils.mongo import serialize_document, serialize_documents, to_object_id
from app.models.evidence_model import EvidenceModel
from app.models.highlight_model import HighlightModel
from app.models.enums import HighlightType
from app.schemas.finding_schema import FindingCreate, FindingUpdate, FindingFromHighlightCreate
from app.services.evidence_service import build_initial_evidence_from_finding


COLLECTION = "findings"


async def create_finding(finding_data: FindingCreate):
    db = get_database()

    project = await db["projects"].find_one({"_id": finding_data.proyectoId})

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    finding_dict = prepare_finding_data(finding_data.model_dump())

    finding = FindingModel(**finding_dict)

    finding_result = await db[COLLECTION].insert_one(
        finding.model_dump(by_alias=True)
    )

    finding_id = finding_result.inserted_id

    await db["projects"].update_one(
        {"_id": finding_data.proyectoId},
        {
            "$push": {
                "hallazgos": finding_id
            },
            "$set": {
                "fechaActualizacion": datetime.now(timezone.utc)
            }
        }
    )

    created_finding = await db[COLLECTION].find_one({"_id": finding_id})

    return serialize_document(created_finding)

async def create_finding_from_highlight(finding_data: FindingFromHighlightCreate):
    db = get_database()

    project = await db["projects"].find_one({"_id": finding_data.proyectoId})

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    document = await db["documents"].find_one({"_id": finding_data.documentoId})

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )

    finding_dict = {
        "proyectoId": finding_data.proyectoId,
        "nombre": finding_data.nombre,
        "codigo": finding_data.codigo,
        "descripcion": finding_data.descripcion or finding_data.textoSubrayado,
        "criterio": finding_data.criterio,
        "objetivo": finding_data.objetivo,
        "causa": finding_data.causa,
        "efecto": finding_data.efecto,
        "conclusion": finding_data.conclusion,
        "impacto": finding_data.impacto,
        "urgencia": finding_data.urgencia,
        "justificacionRiesgo": finding_data.justificacionRiesgo,
        "recomendaciones": finding_data.recomendaciones,
        "subrayados": [],
        "evidencias": [],
    }

    finding_dict = prepare_finding_data(finding_dict)

    finding = FindingModel(**finding_dict)

    finding_result = await db[COLLECTION].insert_one(
        finding.model_dump(by_alias=True)
    )

    finding_id = finding_result.inserted_id

    evidence = build_initial_evidence_from_finding(
        proyecto_id=finding_data.proyectoId,
        hallazgo_id=finding_id,
        finding_name=finding_data.nombre,
        finding_code=finding_data.codigo,
        criterio=finding_data.criterio,
        objetivo=finding_data.objetivo,
    )

    evidence.documentoId = finding_data.documentoId
    evidence.documentoNombre = document.get("nombreOriginal")
    evidence.subtitulo = finding_data.subtitulo
    evidence.descripcionEvidencia = finding_data.textoSubrayado

    evidence_result = await db["evidences"].insert_one(
        evidence.model_dump(by_alias=True)
    )

    evidence_id = evidence_result.inserted_id

    highlight = HighlightModel(
        proyectoId=finding_data.proyectoId,
        documentoId=finding_data.documentoId,
        textoSubrayado=finding_data.textoSubrayado,
        subtitulo=finding_data.subtitulo,
        observacion=finding_data.observacion,
        tipo=HighlightType.HALLAZGO,
        esNota=False,
        hallazgoId=finding_id,
        evidenciaId=evidence_id,
        notaId=None,
        coordenadas=finding_data.coordenadas,
    )

    highlight_result = await db["highlights"].insert_one(
        highlight.model_dump(by_alias=True)
    )

    highlight_id = highlight_result.inserted_id

    await db[COLLECTION].update_one(
        {"_id": finding_id},
        {
            "$push": {
                "subrayados": highlight_id,
                "evidencias": evidence_id
            },
            "$set": {
                "fechaActualizacion": datetime.now(timezone.utc)
            }
        }
    )

    await db["evidences"].update_one(
        {"_id": evidence_id},
        {
            "$push": {
                "subrayados": highlight_id
            },
            "$set": {
                "fechaActualizacion": datetime.now(timezone.utc)
            }
        }
    )

    await db["projects"].update_one(
        {"_id": finding_data.proyectoId},
        {
            "$push": {
                "hallazgos": finding_id,
                "evidencias": evidence_id
            },
            "$set": {
                "fechaActualizacion": datetime.now(timezone.utc)
            }
        }
    )

    created_finding = await db[COLLECTION].find_one({"_id": finding_id})
    created_evidence = await db["evidences"].find_one({"_id": evidence_id})
    created_highlight = await db["highlights"].find_one({"_id": highlight_id})

    return {
        "message": "Hallazgo creado desde subrayado correctamente",
        "hallazgo": serialize_document(created_finding),
        "evidencia": serialize_document(created_evidence),
        "subrayado": serialize_document(created_highlight),
    }


async def get_findings_by_project(project_id: str):
    db = get_database()

    cursor = db[COLLECTION].find(
        {"proyectoId": to_object_id(project_id)}
    ).sort("fechaCreacion", -1)

    findings = await cursor.to_list(length=None)

    return serialize_documents(findings)


async def get_finding_by_id(finding_id: str):
    db = get_database()

    finding = await db[COLLECTION].find_one({"_id": to_object_id(finding_id)})

    if not finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hallazgo no encontrado"
        )

    return serialize_document(finding)


async def update_finding(finding_id: str, finding_data: FindingUpdate):
    db = get_database()

    finding_object_id = to_object_id(finding_id)

    existing_finding = await db[COLLECTION].find_one({"_id": finding_object_id})

    if not existing_finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hallazgo no encontrado"
        )

    update_data = finding_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se enviaron datos para actualizar"
        )

    update_data = prepare_finding_update_data(update_data, existing_finding)
    update_data["fechaActualizacion"] = datetime.now(timezone.utc)

    await db[COLLECTION].update_one(
        {"_id": finding_object_id},
        {
            "$set": update_data
        }
    )

    if should_sync_evidence_fields(update_data):
        evidence_update = get_evidence_sync_fields(update_data)

        if evidence_update:
            await db["evidences"].update_many(
                {"hallazgoId": finding_object_id},
                {
                    "$set": {
                        **evidence_update,
                        "fechaActualizacion": datetime.now(timezone.utc)
                    }
                }
            )

    updated_finding = await db[COLLECTION].find_one({"_id": finding_object_id})

    return serialize_document(updated_finding)


async def delete_finding(finding_id: str):
    db = get_database()

    finding_object_id = to_object_id(finding_id)

    finding = await db[COLLECTION].find_one({"_id": finding_object_id})

    if not finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hallazgo no encontrado"
        )

    await db[COLLECTION].delete_one({"_id": finding_object_id})

    await db["projects"].update_one(
        {"_id": finding["proyectoId"]},
        {
            "$pull": {
                "hallazgos": finding_object_id
            },
            "$set": {
                "fechaActualizacion": datetime.now(timezone.utc)
            }
        }
    )

    return {
        "message": "Hallazgo eliminado correctamente"
    }


async def get_finding_related_documents(finding_id: str):
    db = get_database()

    finding_object_id = to_object_id(finding_id)

    finding = await db[COLLECTION].find_one({"_id": finding_object_id})

    if not finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hallazgo no encontrado"
        )

    highlights_cursor = db["highlights"].find(
        {"hallazgoId": finding_object_id}
    ).sort("fechaCreacion", -1)

    highlights = await highlights_cursor.to_list(length=None)

    related_items = []

    for highlight in highlights:
        document = await db["documents"].find_one(
            {"_id": highlight["documentoId"]}
        )

        related_items.append({
            "documento": serialize_document(document),
            "subrayado": serialize_document(highlight)
        })

    return {
        "hallazgoId": finding_id,
        "documentosRelacionados": related_items
    }


async def export_finding_pdf(finding_id: str):
    db = get_database()

    finding = await db[COLLECTION].find_one({"_id": to_object_id(finding_id)})

    if not finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hallazgo no encontrado"
        )

    file_path = generate_finding_pdf(finding)

    return {
        "message": "Ficha de hallazgo generada en PDF",
        "filePath": file_path
    }


async def export_finding_word(finding_id: str):
    db = get_database()

    finding = await db[COLLECTION].find_one({"_id": to_object_id(finding_id)})

    if not finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hallazgo no encontrado"
        )

    file_path = generate_finding_word(finding)

    return {
        "message": "Ficha de hallazgo generada en Word",
        "filePath": file_path
    }