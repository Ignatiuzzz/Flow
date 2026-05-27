from fastapi import APIRouter

from app.controllers.highlight_controller import (
    create_highlight,
    delete_highlight,
    get_highlights_by_document,
    get_highlights_by_finding,
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


@router.get("/project/{project_id}")
async def get_highlights_by_project_route(project_id: str):
    return await get_highlights_by_project(project_id)


@router.get("/document/{document_id}")
async def get_highlights_by_document_route(document_id: str):
    return await get_highlights_by_document(document_id)


@router.get("/finding/{finding_id}")
async def get_highlights_by_finding_route(finding_id: str):
    return await get_highlights_by_finding(finding_id)


@router.put("/{highlight_id}")
async def update_highlight_route(highlight_id: str, highlight_data: HighlightUpdate):
    return await update_highlight(highlight_id, highlight_data)


@router.delete("/{highlight_id}")
async def delete_highlight_route(highlight_id: str):
    return await delete_highlight(highlight_id)