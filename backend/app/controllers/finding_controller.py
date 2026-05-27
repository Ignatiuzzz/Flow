from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.database import get_database
from app.models.evidence_model import EvidenceModel
from app.models.finding_model import FindingModel
from app.models.enums import RiskLevel
from app.schemas.finding_schema import FindingCreate, FindingUpdate
from app.utils.mongo import serialize_document, serialize_documents, to_object_id


COLLECTION = "findings"


def calculate_risk(impacto: int, urgencia: int) -> int:
    return impacto * urgencia


def calculate_risk_level(riesgo: int) -> RiskLevel:
    if riesgo <= 2:
        return RiskLevel.MUY_BAJO

    if 3 <= riesgo <= 4:
        return RiskLevel.BAJO

    if 5 <= riesgo <= 9:
        return RiskLevel.MEDIO

    if 9 < riesgo < 20:
        return RiskLevel.ALTO

    if riesgo >= 20:
        return RiskLevel.EXTREMO

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Valores errados para calcular el nivel de riesgo"
    )


async def create_finding(finding_data: FindingCreate):
    db = get_database()

    project = await db["projects"].find_one({"_id": finding_data.proyectoId})

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    riesgo = calculate_risk(finding_data.impacto, finding_data.urgencia)
    nivel = calculate_risk_level(riesgo)

    finding_dict = finding_data.model_dump()
    finding_dict["riesgo"] = riesgo
    finding_dict["nivel"] = nivel
    finding_dict["evidencias"] = []

    finding = FindingModel(**finding_dict)

    finding_result = await db[COLLECTION].insert_one(
        finding.model_dump(by_alias=True)
    )

    finding_id = finding_result.inserted_id

    evidence = EvidenceModel(
        proyectoId=finding_data.proyectoId,
        hallazgoId=finding_id,
        nombre=f"Evidencia de {finding_data.nombre}",
        codigo=f"E-{finding_data.codigo}",
        criterio=finding_data.criterio,
        objetivo=finding_data.objetivo,
        descripcionEvidencia=None,
        documentoId=None,
        documentoNombre=None,
        subtitulo=None,
        subrayados=[]
    )

    evidence_result = await db["evidences"].insert_one(
        evidence.model_dump(by_alias=True)
    )

    evidence_id = evidence_result.inserted_id

    await db[COLLECTION].update_one(
        {"_id": finding_id},
        {"$push": {"evidencias": evidence_id}}
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

    return serialize_document(created_finding)


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

    impacto = update_data.get("impacto", existing_finding["impacto"])
    urgencia = update_data.get("urgencia", existing_finding["urgencia"])

    riesgo = calculate_risk(impacto, urgencia)
    nivel = calculate_risk_level(riesgo)

    update_data["riesgo"] = riesgo
    update_data["nivel"] = nivel
    update_data["fechaActualizacion"] = datetime.now(timezone.utc)

    await db[COLLECTION].update_one(
        {"_id": finding_object_id},
        {"$set": update_data}
    )

    if "criterio" in update_data or "objetivo" in update_data:
        evidence_update = {}

        if "criterio" in update_data:
            evidence_update["criterio"] = update_data["criterio"]

        if "objetivo" in update_data:
            evidence_update["objetivo"] = update_data["objetivo"]

        await db["evidences"].update_many(
            {"hallazgoId": finding_object_id},
            {"$set": evidence_update}
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
        {"$pull": {"hallazgos": finding_object_id}}
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