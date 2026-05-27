from fastapi import APIRouter

from app.controllers.highlight_controller import (
    create_highlight,
    delete_highlight,
    get_highlight_by_id,
    get_highlight_relations,
    get_highlights_by_document,
    get_highlights_by_project,
    update_highlight,
)
from app.schemas.highlight_schema import HighlightCreate, HighlightUpdate


router = APIRouter(
    prefix="/highlights",
    tags=["Highlights"]
)


@router.post("/")
async def create_highlight_route(highlight_data: HighlightCreate):
    return await create_highlight(highlight_data)


@router.get("/document/{document_id}")
async def get_highlights_by_document_route(document_id: str):
    return await get_highlights_by_document(document_id)


@router.get("/project/{project_id}")
async def get_highlights_by_project_route(project_id: str):
    return await get_highlights_by_project(project_id)


@router.get("/{highlight_id}/relations")
async def get_highlight_relations_route(highlight_id: str):
    return await get_highlight_relations(highlight_id)


@router.get("/{highlight_id}")
async def get_highlight_by_id_route(highlight_id: str):
    return await get_highlight_by_id(highlight_id)


@router.put("/{highlight_id}")
async def update_highlight_route(
    highlight_id: str,
    highlight_data: HighlightUpdate
):
    return await update_highlight(highlight_id, highlight_data)


@router.delete("/{highlight_id}")
async def delete_highlight_route(highlight_id: str):
    return await delete_highlight(highlight_id)