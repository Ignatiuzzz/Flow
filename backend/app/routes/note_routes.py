from fastapi import APIRouter

from app.controllers.note_controller import (
    create_note,
    delete_note,
    get_note_by_id,
    get_notes_by_document,
    get_notes_by_project,
    update_note,
)
from app.schemas.note_schema import NoteCreate, NoteUpdate


router = APIRouter(
    prefix="/notes",
    tags=["Notes"]
)


@router.post("/")
async def create_note_route(note_data: NoteCreate):
    return await create_note(note_data)


@router.get("/project/{project_id}")
async def get_notes_by_project_route(project_id: str):
    return await get_notes_by_project(project_id)


@router.get("/document/{document_id}")
async def get_notes_by_document_route(document_id: str):
    return await get_notes_by_document(document_id)


@router.get("/{note_id}")
async def get_note_by_id_route(note_id: str):
    return await get_note_by_id(note_id)


@router.put("/{note_id}")
async def update_note_route(note_id: str, note_data: NoteUpdate):
    return await update_note(note_id, note_data)


@router.delete("/{note_id}")
async def delete_note_route(note_id: str):
    return await delete_note(note_id)