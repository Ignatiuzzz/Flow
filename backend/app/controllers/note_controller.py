from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.database import get_database
from app.models.note_model import NoteModel
from app.models.highlight_model import HighlightModel
from app.models.enums import HighlightType
from app.schemas.note_schema import (
    NoteCreate,
    NoteFromHighlightCreate,
    NoteUpdate,
)
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

    if note_data.hallazgoId:
        finding = await db["findings"].find_one({"_id": note_data.hallazgoId})

        if not finding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hallazgo no encontrado"
            )

    if note_data.documentoId:
        document = await db["documents"].find_one({"_id": note_data.documentoId})

        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Documento no encontrado"
            )

    if note_data.subrayadoId:
        highlight = await db["highlights"].find_one({"_id": note_data.subrayadoId})

        if not highlight:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subrayado no encontrado"
            )

    note = NoteModel(**note_data.model_dump())
    result = await db[COLLECTION].insert_one(note.model_dump(by_alias=True))

    if note_data.subrayadoId:
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
            "$push": {
                "notas": result.inserted_id
            },
            "$set": {
                "fechaActualizacion": datetime.now(timezone.utc)
            }
        }
    )

    created_note = await db[COLLECTION].find_one({"_id": result.inserted_id})

    return serialize_document(created_note)


async def create_note_from_highlight(data: NoteFromHighlightCreate):
    db = get_database()

    project = await db["projects"].find_one({"_id": data.proyectoId})

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    document = await db["documents"].find_one({"_id": data.documentoId})

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )

    if data.hallazgoId:
        finding = await db["findings"].find_one({"_id": data.hallazgoId})

        if not finding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hallazgo no encontrado"
            )

    highlight = HighlightModel(
        proyectoId=data.proyectoId,
        documentoId=data.documentoId,
        textoSubrayado=data.textoSubrayado,
        subtitulo=data.subtitulo,
        observacion=data.observacion,
        tipo=HighlightType.NOTA,
        esNota=True,
        hallazgoId=data.hallazgoId,
        evidenciaId=None,
        notaId=None,
        coordenadas=data.coordenadas,
    )

    highlight_result = await db["highlights"].insert_one(
        highlight.model_dump(by_alias=True)
    )

    highlight_id = highlight_result.inserted_id

    note = NoteModel(
        proyectoId=data.proyectoId,
        hallazgoId=data.hallazgoId,
        documentoId=data.documentoId,
        subrayadoId=highlight_id,
        subtitulo=data.subtitulo,
        texto=data.textoSubrayado,
    )

    note_result = await db[COLLECTION].insert_one(
        note.model_dump(by_alias=True)
    )

    note_id = note_result.inserted_id

    await db["highlights"].update_one(
        {"_id": highlight_id},
        {
            "$set": {
                "notaId": note_id,
                "fechaActualizacion": datetime.now(timezone.utc)
            }
        }
    )

    await db["projects"].update_one(
        {"_id": data.proyectoId},
        {
            "$push": {
                "notas": note_id
            },
            "$set": {
                "fechaActualizacion": datetime.now(timezone.utc)
            }
        }
    )

    if data.hallazgoId:
        await db["findings"].update_one(
            {"_id": data.hallazgoId},
            {
                "$push": {
                    "subrayados": highlight_id
                },
                "$set": {
                    "fechaActualizacion": datetime.now(timezone.utc)
                }
            }
        )

    created_note = await db[COLLECTION].find_one({"_id": note_id})
    created_highlight = await db["highlights"].find_one({"_id": highlight_id})

    return {
        "message": "Nota creada desde subrayado correctamente",
        "nota": serialize_document(created_note),
        "subrayado": serialize_document(created_highlight),
    }


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


async def get_notes_by_finding(finding_id: str):
    db = get_database()

    cursor = db[COLLECTION].find(
        {"hallazgoId": to_object_id(finding_id)}
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

    note_object_id = to_object_id(note_id)

    existing_note = await db[COLLECTION].find_one({"_id": note_object_id})

    if not existing_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota no encontrada"
        )

    update_data = note_data.model_dump(exclude_unset=True)

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

    if update_data.get("documentoId"):
        document = await db["documents"].find_one({"_id": update_data["documentoId"]})

        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Documento no encontrado"
            )

    if update_data.get("subrayadoId"):
        highlight = await db["highlights"].find_one({"_id": update_data["subrayadoId"]})

        if not highlight:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subrayado no encontrado"
            )

    update_data["fechaActualizacion"] = datetime.now(timezone.utc)

    await db[COLLECTION].update_one(
        {"_id": note_object_id},
        {
            "$set": update_data
        }
    )

    updated_note = await db[COLLECTION].find_one({"_id": note_object_id})

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
        {
            "$pull": {
                "notas": note_object_id
            },
            "$set": {
                "fechaActualizacion": datetime.now(timezone.utc)
            }
        }
    )

    if note.get("subrayadoId"):
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