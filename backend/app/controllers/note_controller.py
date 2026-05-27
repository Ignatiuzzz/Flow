from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.database import get_database
from app.models.note_model import NoteModel
from app.schemas.note_schema import NoteCreate, NoteUpdate
from app.utils.mongo import serialize_document, serialize_documents, to_object_id


COLLECTION = "notes"


async def create_note(note_data: NoteCreate):
    db = get_database()

    project = await db["projects"].find_one({"_id": note_data.proyectoId})

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    document = await db["documents"].find_one({"_id": note_data.documentoId})

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )

    highlight = await db["highlights"].find_one({"_id": note_data.subrayadoId})

    if not highlight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subrayado no encontrado"
        )

    note = NoteModel(**note_data.model_dump())
    result = await db[COLLECTION].insert_one(note.model_dump(by_alias=True))

    await db["highlights"].update_one(
        {"_id": note_data.subrayadoId},
        {
            "$set": {
                "notaId": result.inserted_id,
                "esNota": True,
                "fechaActualizacion": datetime.now(timezone.utc)
            }
        }
    )

    await db["projects"].update_one(
        {"_id": note_data.proyectoId},
        {
            "$push": {"notas": result.inserted_id},
            "$set": {"fechaActualizacion": datetime.now(timezone.utc)}
        }
    )

    created_note = await db[COLLECTION].find_one({"_id": result.inserted_id})

    return serialize_document(created_note)


async def get_notes_by_project(project_id: str):
    db = get_database()

    cursor = db[COLLECTION].find(
        {"proyectoId": to_object_id(project_id)}
    ).sort("fechaCreacion", -1)

    notes = await cursor.to_list(length=None)

    return serialize_documents(notes)


async def get_notes_by_document(document_id: str):
    db = get_database()

    cursor = db[COLLECTION].find(
        {"documentoId": to_object_id(document_id)}
    ).sort("fechaCreacion", -1)

    notes = await cursor.to_list(length=None)

    return serialize_documents(notes)


async def get_note_by_id(note_id: str):
    db = get_database()

    note = await db[COLLECTION].find_one({"_id": to_object_id(note_id)})

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota no encontrada"
        )

    return serialize_document(note)


async def update_note(note_id: str, note_data: NoteUpdate):
    db = get_database()

    update_data = note_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se enviaron datos para actualizar"
        )

    update_data["fechaActualizacion"] = datetime.now(timezone.utc)

    result = await db[COLLECTION].update_one(
        {"_id": to_object_id(note_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota no encontrada"
        )

    updated_note = await db[COLLECTION].find_one({"_id": to_object_id(note_id)})

    return serialize_document(updated_note)


async def delete_note(note_id: str):
    db = get_database()

    note_object_id = to_object_id(note_id)

    note = await db[COLLECTION].find_one({"_id": note_object_id})

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota no encontrada"
        )

    await db[COLLECTION].delete_one({"_id": note_object_id})

    await db["projects"].update_one(
        {"_id": note["proyectoId"]},
        {"$pull": {"notas": note_object_id}}
    )

    await db["highlights"].update_one(
        {"_id": note["subrayadoId"]},
        {
            "$set": {
                "notaId": None,
                "esNota": False,
                "fechaActualizacion": datetime.now(timezone.utc)
            }
        }
    )

    return {
        "message": "Nota eliminada correctamente"
    }