from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.database import get_database
from app.models.evidence_model import EvidenceModel
from app.schemas.evidence_schema import EvidenceCreate, EvidenceUpdate
from app.services.evidence_service import complete_evidence_data_from_finding
from app.services.pdf_service import generate_evidence_pdf
from app.services.word_service import generate_evidence_word
from app.utils.mongo import serialize_document, serialize_documents, to_object_id


COLLECTION = "evidences"


async def create_evidence(evidence_data: EvidenceCreate):
    db = get_database()

    project = await db["projects"].find_one({"_id": evidence_data.proyectoId})

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    evidence_dict = evidence_data.model_dump()

    if evidence_data.hallazgoId:
        finding = await db["findings"].find_one({"_id": evidence_data.hallazgoId})

        if not finding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hallazgo no encontrado"
            )

        evidence_dict = complete_evidence_data_from_finding(
            evidence_data=evidence_dict,
            finding=finding
        )

    evidence = EvidenceModel(**evidence_dict)

    result = await db[COLLECTION].insert_one(evidence.model_dump(by_alias=True))

    await db["projects"].update_one(
        {"_id": evidence_data.proyectoId},
        {
            "$push": {
                "evidencias": result.inserted_id
            },
            "$set": {
                "fechaActualizacion": datetime.now(timezone.utc)
            }
        }
    )

    if evidence_data.hallazgoId:
        await db["findings"].update_one(
            {"_id": evidence_data.hallazgoId},
            {
                "$push": {
                    "evidencias": result.inserted_id
                },
                "$set": {
                    "fechaActualizacion": datetime.now(timezone.utc)
                }
            }
        )

    created_evidence = await db[COLLECTION].find_one({"_id": result.inserted_id})

    return serialize_document(created_evidence)


async def get_evidences_by_project(project_id: str):
    db = get_database()

    cursor = db[COLLECTION].find(
        {"proyectoId": to_object_id(project_id)}
    ).sort("fechaCreacion", -1)

    evidences = await cursor.to_list(length=None)

    return serialize_documents(evidences)


async def get_evidences_by_finding(finding_id: str):
    db = get_database()

    cursor = db[COLLECTION].find(
        {"hallazgoId": to_object_id(finding_id)}
    ).sort("fechaCreacion", -1)

    evidences = await cursor.to_list(length=None)

    return serialize_documents(evidences)


async def get_evidence_by_id(evidence_id: str):
    db = get_database()

    evidence = await db[COLLECTION].find_one({"_id": to_object_id(evidence_id)})

    if not evidence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidencia no encontrada"
        )

    return serialize_document(evidence)


async def update_evidence(evidence_id: str, evidence_data: EvidenceUpdate):
    db = get_database()

    evidence_object_id = to_object_id(evidence_id)

    existing_evidence = await db[COLLECTION].find_one({"_id": evidence_object_id})

    if not existing_evidence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidencia no encontrada"
        )

    update_data = evidence_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se enviaron datos para actualizar"
        )

    update_data["fechaActualizacion"] = datetime.now(timezone.utc)

    await db[COLLECTION].update_one(
        {"_id": evidence_object_id},
        {
            "$set": update_data
        }
    )

    updated_evidence = await db[COLLECTION].find_one({"_id": evidence_object_id})

    return serialize_document(updated_evidence)


async def delete_evidence(evidence_id: str):
    db = get_database()

    evidence_object_id = to_object_id(evidence_id)

    evidence = await db[COLLECTION].find_one({"_id": evidence_object_id})

    if not evidence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidencia no encontrada"
        )

    await db[COLLECTION].delete_one({"_id": evidence_object_id})

    await db["projects"].update_one(
        {"_id": evidence["proyectoId"]},
        {
            "$pull": {
                "evidencias": evidence_object_id
            },
            "$set": {
                "fechaActualizacion": datetime.now(timezone.utc)
            }
        }
    )

    if evidence.get("hallazgoId"):
        await db["findings"].update_one(
            {"_id": evidence["hallazgoId"]},
            {
                "$pull": {
                    "evidencias": evidence_object_id
                },
                "$set": {
                    "fechaActualizacion": datetime.now(timezone.utc)
                }
            }
        )

    return {
        "message": "Evidencia eliminada correctamente"
    }


async def export_evidence_pdf(evidence_id: str):
    db = get_database()

    evidence = await db[COLLECTION].find_one({"_id": to_object_id(evidence_id)})

    if not evidence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidencia no encontrada"
        )

    file_path = generate_evidence_pdf(evidence)

    return {
        "message": "Ficha de evidencia generada en PDF",
        "filePath": file_path
    }


async def export_evidence_word(evidence_id: str):
    db = get_database()

    evidence = await db[COLLECTION].find_one({"_id": to_object_id(evidence_id)})

    if not evidence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evidencia no encontrada"
        )

    file_path = generate_evidence_word(evidence)

    return {
        "message": "Ficha de evidencia generada en Word",
        "filePath": file_path
    }