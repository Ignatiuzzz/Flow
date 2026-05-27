from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.database import get_database
from app.models.highlight_model import HighlightModel
from app.schemas.highlight_schema import HighlightCreate, HighlightUpdate
from app.utils.mongo import serialize_document, serialize_documents, to_object_id


COLLECTION = "highlights"


async def create_highlight(highlight_data: HighlightCreate):
    db = get_database()

    project = await db["projects"].find_one({"_id": highlight_data.proyectoId})

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    document = await db["documents"].find_one({"_id": highlight_data.documentoId})

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )

    if highlight_data.hallazgoId:
        finding = await db["findings"].find_one({"_id": highlight_data.hallazgoId})

        if not finding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hallazgo no encontrado"
            )

    if highlight_data.evidenciaId:
        evidence = await db["evidences"].find_one({"_id": highlight_data.evidenciaId})

        if not evidence:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evidencia no encontrada"
            )

    if highlight_data.notaId:
        note = await db["notes"].find_one({"_id": highlight_data.notaId})

        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Nota no encontrada"
            )

    highlight = HighlightModel(**highlight_data.model_dump())

    result = await db[COLLECTION].insert_one(
        highlight.model_dump(by_alias=True)
    )

    created_highlight = await db[COLLECTION].find_one({"_id": result.inserted_id})

    return serialize_document(created_highlight)


async def get_highlights_by_document(document_id: str):
    db = get_database()

    document_object_id = to_object_id(document_id)

    document = await db["documents"].find_one({"_id": document_object_id})

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )

    cursor = db[COLLECTION].find(
        {"documentoId": document_object_id}
    ).sort("fechaCreacion", 1)

    highlights = await cursor.to_list(length=None)

    return serialize_documents(highlights)


async def get_highlights_by_project(project_id: str):
    db = get_database()

    project_object_id = to_object_id(project_id)

    project = await db["projects"].find_one({"_id": project_object_id})

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    cursor = db[COLLECTION].find(
        {"proyectoId": project_object_id}
    ).sort("fechaCreacion", -1)

    highlights = await cursor.to_list(length=None)

    return serialize_documents(highlights)


async def get_highlight_by_id(highlight_id: str):
    db = get_database()

    highlight = await db[COLLECTION].find_one({"_id": to_object_id(highlight_id)})

    if not highlight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subrayado no encontrado"
        )

    return serialize_document(highlight)


async def get_highlight_relations(highlight_id: str):
    db = get_database()

    highlight = await db[COLLECTION].find_one({"_id": to_object_id(highlight_id)})

    if not highlight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subrayado no encontrado"
        )

    finding = None
    evidence = None
    note = None
    document = None

    if highlight.get("documentoId"):
        document = await db["documents"].find_one({"_id": highlight["documentoId"]})

    if highlight.get("hallazgoId"):
        finding = await db["findings"].find_one({"_id": highlight["hallazgoId"]})

    if highlight.get("evidenciaId"):
        evidence = await db["evidences"].find_one({"_id": highlight["evidenciaId"]})

    if highlight.get("notaId"):
        note = await db["notes"].find_one({"_id": highlight["notaId"]})

    return {
        "subrayado": serialize_document(highlight),
        "documento": serialize_document(document) if document else None,
        "hallazgo": serialize_document(finding) if finding else None,
        "evidencia": serialize_document(evidence) if evidence else None,
        "nota": serialize_document(note) if note else None,
    }


async def update_highlight(highlight_id: str, highlight_data: HighlightUpdate):
    db = get_database()

    highlight_object_id = to_object_id(highlight_id)

    existing_highlight = await db[COLLECTION].find_one({"_id": highlight_object_id})

    if not existing_highlight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subrayado no encontrado"
        )

    update_data = highlight_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se enviaron datos para actualizar"
        )

    if update_data.get("hallazgoId"):
        finding = await db["findings"].find_one({"_id": update_data["hallazgoId"]})

        if not finding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hallazgo no encontrado"
            )

    if update_data.get("evidenciaId"):
        evidence = await db["evidences"].find_one({"_id": update_data["evidenciaId"]})

        if not evidence:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evidencia no encontrada"
            )

    if update_data.get("notaId"):
        note = await db["notes"].find_one({"_id": update_data["notaId"]})

        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Nota no encontrada"
            )

    update_data["fechaActualizacion"] = datetime.now(timezone.utc)

    await db[COLLECTION].update_one(
        {"_id": highlight_object_id},
        {
            "$set": update_data
        }
    )

    updated_highlight = await db[COLLECTION].find_one({"_id": highlight_object_id})

    return serialize_document(updated_highlight)


async def delete_highlight(highlight_id: str):
    db = get_database()

    highlight_object_id = to_object_id(highlight_id)

    highlight = await db[COLLECTION].find_one({"_id": highlight_object_id})

    if not highlight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subrayado no encontrado"
        )

    await db[COLLECTION].delete_one({"_id": highlight_object_id})

    if highlight.get("hallazgoId"):
        await db["findings"].update_one(
            {"_id": highlight["hallazgoId"]},
            {
                "$pull": {
                    "subrayados": highlight_object_id
                },
                "$set": {
                    "fechaActualizacion": datetime.now(timezone.utc)
                }
            }
        )

    if highlight.get("evidenciaId"):
        await db["evidences"].update_one(
            {"_id": highlight["evidenciaId"]},
            {
                "$pull": {
                    "subrayados": highlight_object_id
                },
                "$set": {
                    "fechaActualizacion": datetime.now(timezone.utc)
                }
            }
        )

    if highlight.get("notaId"):
        await db["notes"].update_one(
            {"_id": highlight["notaId"]},
            {
                "$set": {
                    "subrayadoId": None,
                    "fechaActualizacion": datetime.now(timezone.utc)
                }
            }
        )

    return {
        "message": "Subrayado eliminado correctamente"
    }