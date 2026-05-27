from fastapi import APIRouter
from fastapi.responses import FileResponse

from app.controllers.evidence_controller import (
    create_evidence,
    delete_evidence,
    export_evidence_pdf,
    export_evidence_word,
    get_evidence_by_id,
    get_evidences_by_finding,
    get_evidences_by_project,
    relate_evidence_from_highlight,
    update_evidence,
)
from app.schemas.evidence_schema import (
    EvidenceCreate,
    EvidenceFromHighlightCreate,
    EvidenceUpdate,
)


router = APIRouter(
    prefix="/evidences",
    tags=["Evidences"]
)


@router.post("/")
async def create_evidence_route(evidence_data: EvidenceCreate):
    return await create_evidence(evidence_data)


@router.post("/from-highlight")
async def relate_evidence_from_highlight_route(data: EvidenceFromHighlightCreate):
    return await relate_evidence_from_highlight(data)


@router.get("/project/{project_id}")
async def get_evidences_by_project_route(project_id: str):
    return await get_evidences_by_project(project_id)


@router.get("/finding/{finding_id}")
async def get_evidences_by_finding_route(finding_id: str):
    return await get_evidences_by_finding(finding_id)


@router.get("/{evidence_id}")
async def get_evidence_by_id_route(evidence_id: str):
    return await get_evidence_by_id(evidence_id)


@router.put("/{evidence_id}")
async def update_evidence_route(evidence_id: str, evidence_data: EvidenceUpdate):
    return await update_evidence(evidence_id, evidence_data)


@router.delete("/{evidence_id}")
async def delete_evidence_route(evidence_id: str):
    return await delete_evidence(evidence_id)


@router.get("/{evidence_id}/export-pdf")
async def export_evidence_pdf_route(evidence_id: str):
    result = await export_evidence_pdf(evidence_id)

    return FileResponse(
        path=result["filePath"],
        filename=result["filePath"].split("/")[-1],
        media_type="application/pdf"
    )


@router.get("/{evidence_id}/export-word")
async def export_evidence_word_route(evidence_id: str):
    result = await export_evidence_word(evidence_id)

    return FileResponse(
        path=result["filePath"],
        filename=result["filePath"].split("/")[-1],
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )