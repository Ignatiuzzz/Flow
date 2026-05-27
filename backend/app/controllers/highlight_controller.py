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

    highlight = HighlightModel(**highlight_data.model_dump())
    result = await db[COLLECTION].insert_one(highlight.model_dump(by_alias=True))

    created_highlight = await db[COLLECTION].find_one({"_id": result.inserted_id})

    return serialize_document(created_highlight)


async def get_highlights_by_project(project_id: str):
    db = get_database()

    cursor = db[COLLECTION].find(
        {"proyectoId": to_object_id(project_id)}
    ).sort("fechaCreacion", -1)

    highlights = await cursor.to_list(length=None)

    return serialize_documents(highlights)


async def get_highlights_by_document(document_id: str):
    db = get_database()

    cursor = db[COLLECTION].find(
        {"documentoId": to_object_id(document_id)}
    ).sort("fechaCreacion", -1)

    highlights = await cursor.to_list(length=None)

    return serialize_documents(highlights)


async def get_highlights_by_finding(finding_id: str):
    db = get_database()

    cursor = db[COLLECTION].find(
        {"hallazgoId": to_object_id(finding_id)}
    ).sort("fechaCreacion", -1)

    highlights = await cursor.to_list(length=None)

    return serialize_documents(highlights)


async def update_highlight(highlight_id: str, highlight_data: HighlightUpdate):
    db = get_database()

    update_data = highlight_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se enviaron datos para actualizar"
        )

    update_data["fechaActualizacion"] = datetime.now(timezone.utc)

    result = await db[COLLECTION].update_one(
        {"_id": to_object_id(highlight_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subrayado no encontrado"
        )

    updated_highlight = await db[COLLECTION].find_one({"_id": to_object_id(highlight_id)})

    return serialize_document(updated_highlight)


async def delete_highlight(highlight_id: str):
    db = get_database()

    highlight_object_id = to_object_id(highlight_id)

    result = await db[COLLECTION].delete_one({"_id": highlight_object_id})

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subrayado no encontrado"
        )

    return {
        "message": "Subrayado eliminado correctamente"
    }