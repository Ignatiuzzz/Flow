from fastapi import APIRouter

from app.controllers.ai_controller import (
    suggest_evidence,
    suggest_finding,
    suggest_improve_text,
)
from app.schemas.ai_schema import (
    AIImproveTextRequest,
    AISuggestEvidenceRequest,
    AISuggestFindingRequest,
)


router = APIRouter(
    prefix="/ai",
    tags=["AI Assistant"]
)


@router.post("/suggest-finding")
async def suggest_finding_route(request: AISuggestFindingRequest):
    return await suggest_finding(request)


@router.post("/suggest-evidence")
async def suggest_evidence_route(request: AISuggestEvidenceRequest):
    return await suggest_evidence(request)


@router.post("/improve-text")
async def improve_text_route(request: AIImproveTextRequest):
    return await suggest_improve_text(request)
