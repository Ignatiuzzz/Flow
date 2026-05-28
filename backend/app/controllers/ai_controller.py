import logging

from fastapi import HTTPException, status

from app.database import get_database
from app.schemas.ai_schema import (
    AIImproveTextRequest,
    AISuggestEvidenceRequest,
    AISuggestFindingRequest,
    AISuggestFromHighlightRequest,
    AISuggestionResponse,
)
from app.services.ai_service import (
    improve_text as ai_improve_text,
    suggest_evidence_fields as ai_suggest_evidence,
    suggest_finding_fields as ai_suggest_finding,
    suggest_from_highlight as ai_suggest_from_highlight,
)
from app.utils.mongo import to_object_id


logger = logging.getLogger(__name__)


async def suggest_finding(request: AISuggestFindingRequest) -> AISuggestionResponse:
    db = get_database()

    project = await db["projects"].find_one(
        {"_id": request.proyectoId}
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    cursor = db["findings"].find(
        {"proyectoId": request.proyectoId}
    ).sort("fechaCreacion", -1).limit(10)

    existing_findings = await cursor.to_list(length=None)

    findings_context = []
    for f in existing_findings:
        findings_context.append({
            "codigo": f.get("codigo"),
            "nombre": f.get("nombre"),
            "descripcion": f.get("descripcion"),
            "criterio": f.get("criterio"),
        })

    context = {
        "nombre": request.nombre,
        "codigo": request.codigo,
        "descripcion": request.descripcion,
        "textoSubrayado": request.textoSubrayado,
    }

    project_context = {
        "nombre": project.get("nombre"),
        "descripcion": project.get("descripcion"),
    }

    try:
        suggestions = await ai_suggest_finding(
            context=context,
            existing_fields=request.camposExistentes,
            project_context=project_context,
            existing_findings=findings_context,
        )

        return AISuggestionResponse(
            sugerencias=suggestions,
            mensaje="Sugerencias generadas correctamente"
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error al generar sugerencias de hallazgo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al comunicarse con la IA: {str(e)}"
        )


async def suggest_evidence(request: AISuggestEvidenceRequest) -> AISuggestionResponse:
    db = get_database()

    project = await db["projects"].find_one(
        {"_id": request.proyectoId}
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    finding_context = None
    if request.hallazgoId:
        finding = await db["findings"].find_one(
            {"_id": request.hallazgoId}
        )
        if finding:
            finding_context = {
                "nombre": finding.get("nombre"),
                "codigo": finding.get("codigo"),
                "descripcion": finding.get("descripcion"),
                "criterio": finding.get("criterio"),
                "objetivo": finding.get("objetivo"),
            }

    context = {
        "nombre": request.nombre,
        "descripcionEvidencia": request.descripcionEvidencia,
    }

    project_context = {
        "nombre": project.get("nombre"),
        "descripcion": project.get("descripcion"),
    }

    try:
        suggestions = await ai_suggest_evidence(
            context=context,
            existing_fields=request.camposExistentes,
            finding_context=finding_context,
            project_context=project_context,
        )

        return AISuggestionResponse(
            sugerencias=suggestions,
            mensaje="Sugerencias generadas correctamente"
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error al generar sugerencias de evidencia: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al comunicarse con la IA: {str(e)}"
        )


async def suggest_from_highlight(request: AISuggestFromHighlightRequest) -> AISuggestionResponse:
    db = get_database()
    
    project_context = None
    if request.proyectoId:
        project = await db["projects"].find_one({"_id": request.proyectoId})
        if project:
            project_context = {
                "nombre": project.get("nombre"),
                "descripcion": project.get("descripcion")
            }
            
    try:
        suggestions = await ai_suggest_from_highlight(
            texto=request.textoSubrayado,
            tipo=request.tipo,
            project_context=project_context
        )
        
        return AISuggestionResponse(
            sugerencias=suggestions,
            mensaje="Sugerencias generadas correctamente"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error al generar sugerencias desde subrayado: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al comunicarse con la IA: {str(e)}"
        )


async def suggest_improve_text(request: AIImproveTextRequest) -> dict:
    try:
        result = await ai_improve_text(
            text=request.texto,
            field_name=request.nombreCampo,
            context=request.contexto,
        )

        return {
            "textoMejorado": result.get("textoMejorado", request.texto),
            "mensaje": "Texto mejorado correctamente"
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error al mejorar texto: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al comunicarse con la IA: {str(e)}"
        )
