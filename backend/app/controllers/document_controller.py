from fastapi import HTTPException, status, BackgroundTasks

from app.database import get_database
from app.models.document_model import DocumentModel
from app.schemas.document_schema import DocumentCreate, DocumentUpdate
from app.utils.mongo import serialize_document, serialize_documents, to_object_id
from app.services.rag_service import index_document, delete_document_index


COLLECTION = "documents"


async def create_document(document_data: DocumentCreate, background_tasks: BackgroundTasks = None):
    db = get_database()

    project = await db["projects"].find_one({"_id": document_data.proyectoId})

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    document = DocumentModel(**document_data.model_dump())
    result = await db[COLLECTION].insert_one(document.model_dump(by_alias=True))

    await db["projects"].update_one(
        {"_id": document_data.proyectoId},
        {"$push": {"documentos": result.inserted_id}}
    )

    created_document = await db[COLLECTION].find_one({"_id": result.inserted_id})
    
    serialized_doc = serialize_document(created_document)
    
    if background_tasks and "rutaArchivo" in serialized_doc:
        background_tasks.add_task(
            index_document,
            file_path=serialized_doc["rutaArchivo"],
            project_id=serialized_doc["proyectoId"],
            document_id=serialized_doc["id"],
            document_name=serialized_doc["nombreOriginal"]
        )

    return serialized_doc


async def get_documents_by_project(project_id: str):
    db = get_database()

    cursor = db[COLLECTION].find(
        {"proyectoId": to_object_id(project_id)}
    ).sort("fechaSubida", -1)

    documents = await cursor.to_list(length=None)

    return serialize_documents(documents)


async def get_document_by_id(document_id: str):
    db = get_database()

    document = await db[COLLECTION].find_one({"_id": to_object_id(document_id)})

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )

    return serialize_document(document)


async def update_document(document_id: str, document_data: DocumentUpdate):
    db = get_database()

    update_data = document_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se enviaron datos para actualizar"
        )

    result = await db[COLLECTION].update_one(
        {"_id": to_object_id(document_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )

    updated_document = await db[COLLECTION].find_one({"_id": to_object_id(document_id)})

    return serialize_document(updated_document)


async def delete_document(document_id: str):
    db = get_database()

    document_object_id = to_object_id(document_id)

    document = await db[COLLECTION].find_one({"_id": document_object_id})

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )

    await db[COLLECTION].delete_one({"_id": document_object_id})

    await db["projects"].update_one(
        {"_id": document["proyectoId"]},
        {"$pull": {"documentos": document_object_id}}
    )
    delete_document_index(document_id)

    return {
        "message": "Documento eliminado correctamente"
    }