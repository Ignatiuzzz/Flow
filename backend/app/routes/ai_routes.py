from fastapi import APIRouter

from app.controllers.ai_controller import (
    suggest_evidence,
    suggest_finding,
    suggest_from_highlight,
    suggest_improve_text,
)
from app.schemas.ai_schema import (
    AIImproveTextRequest,
    AISuggestEvidenceRequest,
    AISuggestFindingRequest,
    AISuggestFromHighlightRequest,
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


@router.post("/suggest-from-highlight")
async def suggest_from_highlight_route(request: AISuggestFromHighlightRequest):
    return await suggest_from_highlight(request)


@router.post("/improve-text")
async def improve_text_route(request: AIImproveTextRequest):
    return await suggest_improve_text(request)
