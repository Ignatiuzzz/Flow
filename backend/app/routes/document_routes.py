from pathlib import Path

from fastapi import APIRouter, File, UploadFile, BackgroundTasks
from fastapi.responses import FileResponse

from app.controllers.document_controller import (
    create_document,
    delete_document,
    get_document_by_id,
    get_documents_by_project,
    reindex_project_documents,
    update_document,
)
from app.schemas.document_schema import DocumentCreate, DocumentUpdate
from app.services.file_service import delete_file_by_path, save_document_file


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


@router.post("/upload/{project_id}")
async def upload_document_route(project_id: str, background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    file_data = await save_document_file(file, project_id)

    document_data = DocumentCreate(
        proyectoId=project_id,
        **file_data
    )

    return await create_document(document_data, background_tasks)


@router.post("/")
async def create_document_route(document_data: DocumentCreate, background_tasks: BackgroundTasks):
    return await create_document(document_data, background_tasks)


@router.get("/project/{project_id}")
async def get_documents_by_project_route(project_id: str):
    return await get_documents_by_project(project_id)


@router.get("/{document_id}")
async def get_document_by_id_route(document_id: str):
    return await get_document_by_id(document_id)


@router.get("/{document_id}/file")
async def get_document_file_route(document_id: str):
    document = await get_document_by_id(document_id)

    file_path = document.get("rutaArchivo")

    return FileResponse(
        path=file_path,
        filename=document.get("nombreOriginal"),
        media_type="application/octet-stream"
    )


@router.put("/{document_id}")
async def update_document_route(document_id: str, document_data: DocumentUpdate):
    return await update_document(document_id, document_data)


@router.delete("/{document_id}")
async def delete_document_route(document_id: str):
    document = await get_document_by_id(document_id)
    file_path = document.get("rutaArchivo")

    response = await delete_document(document_id)

    if file_path and Path(file_path).exists():
        delete_file_by_path(file_path)

    return response


@router.post("/reindex/{project_id}")
async def reindex_documents_route(project_id: str, background_tasks: BackgroundTasks):
    """Re-indexa en ChromaDB todos los documentos del proyecto que aún no estén indexados."""
    return await reindex_project_documents(project_id, background_tasks)