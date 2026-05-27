from fastapi import APIRouter
from fastapi.responses import FileResponse

from app.controllers.finding_controller import (
    create_finding,
    delete_finding,
    export_finding_pdf,
    export_finding_word,
    get_finding_by_id,
    get_finding_related_documents,
    get_findings_by_project,
    update_finding,
)
from app.schemas.finding_schema import FindingCreate, FindingUpdate


router = APIRouter(
    prefix="/findings",
    tags=["Findings"]
)


@router.post("/")
async def create_finding_route(finding_data: FindingCreate):
    return await create_finding(finding_data)


@router.get("/project/{project_id}")
async def get_findings_by_project_route(project_id: str):
    return await get_findings_by_project(project_id)


@router.get("/{finding_id}")
async def get_finding_by_id_route(finding_id: str):
    return await get_finding_by_id(finding_id)


@router.get("/{finding_id}/related-documents")
async def get_finding_related_documents_route(finding_id: str):
    return await get_finding_related_documents(finding_id)


@router.put("/{finding_id}")
async def update_finding_route(finding_id: str, finding_data: FindingUpdate):
    return await update_finding(finding_id, finding_data)


@router.delete("/{finding_id}")
async def delete_finding_route(finding_id: str):
    return await delete_finding(finding_id)


@router.get("/{finding_id}/export-pdf")
async def export_finding_pdf_route(finding_id: str):
    result = await export_finding_pdf(finding_id)

    return FileResponse(
        path=result["filePath"],
        filename=result["filePath"].split("/")[-1],
        media_type="application/pdf"
    )


@router.get("/{finding_id}/export-word")
async def export_finding_word_route(finding_id: str):
    result = await export_finding_word(finding_id)

    return FileResponse(
        path=result["filePath"],
        filename=result["filePath"].split("/")[-1],
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )