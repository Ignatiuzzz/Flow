import json
import logging
from typing import Dict, List, Optional

from google import genai

from app.config import get_settings


logger = logging.getLogger(__name__)


def _get_client() -> genai.Client:
    settings = get_settings()

    if not settings.GEMINI_API_KEY:
        raise ValueError(
            "GEMINI_API_KEY no está configurada. "
            "Obtén una key gratuita en https://aistudio.google.com/"
        )

    return genai.Client(api_key=settings.GEMINI_API_KEY)


def _get_model() -> str:
    return get_settings().GEMINI_MODEL


SYSTEM_PROMPT = """Eres un asistente experto en auditoría gubernamental y control interno.
Tu rol es ayudar a los auditores a completar fichas de trabajo de auditoría.

Reglas importantes:
- Responde SIEMPRE en español.
- Usa terminología técnica de auditoría (criterio, condición, causa, efecto, hallazgo, evidencia, etc.).
- Sé conciso pero profesional. Cada campo debe tener entre 1 y 3 oraciones.
- Basa tus sugerencias en el contexto proporcionado (nombre del hallazgo, descripción, texto subrayado, etc.).
- NO inventes datos específicos (montos, fechas, nombres de personas). Usa marcadores como "[especificar]" donde sea necesario.
- Responde ÚNICAMENTE con un JSON válido sin bloques de código ni texto adicional.
"""


def _build_finding_prompt(
    context: dict,
    existing_fields: dict,
    project_context: Optional[dict] = None,
    existing_findings: Optional[List[dict]] = None,
) -> str:
    prompt_parts = []

    prompt_parts.append("Necesito sugerencias para completar una ficha de hallazgo de auditoría.")

    if project_context:
        prompt_parts.append(
            f"\n## Contexto del Proyecto\n"
            f"- Nombre: {project_context.get('nombre', 'N/A')}\n"
            f"- Descripción: {project_context.get('descripcion', 'N/A')}"
        )

    if existing_findings and len(existing_findings) > 0:
        findings_summary = []
        for f in existing_findings[:5]:
            findings_summary.append(
                f"  - {f.get('codigo', '?')}: {f.get('nombre', '?')}"
            )
        prompt_parts.append(
            f"\n## Hallazgos existentes en el proyecto (para mantener consistencia)\n"
            + "\n".join(findings_summary)
        )

    prompt_parts.append("\n## Datos del hallazgo actual")

    if context.get("nombre"):
        prompt_parts.append(f"- Nombre: {context['nombre']}")
    if context.get("codigo"):
        prompt_parts.append(f"- Código: {context['codigo']}")
    if context.get("descripcion"):
        prompt_parts.append(f"- Descripción: {context['descripcion']}")
    if context.get("textoSubrayado"):
        prompt_parts.append(f"- Texto subrayado del documento: {context['textoSubrayado']}")

    if existing_fields:
        prompt_parts.append("\n## Campos que ya están completados (NO sugieras estos)")
        for field, value in existing_fields.items():
            if value:
                prompt_parts.append(f"- {field}: {value}")

    campos_a_sugerir = []
    all_fields = ["criterio", "objetivo", "causa", "efecto", "conclusion", "recomendaciones", "justificacionRiesgo"]

    for campo in all_fields:
        if campo not in existing_fields or not existing_fields.get(campo):
            campos_a_sugerir.append(campo)

    if not campos_a_sugerir:
        campos_a_sugerir = all_fields

    prompt_parts.append(
        f"\n## Instrucciones\n"
        f"Genera sugerencias para los siguientes campos: {', '.join(campos_a_sugerir)}\n\n"
        f"Descripción de cada campo:\n"
        f"- criterio: La norma, ley, reglamento o estándar que se debería cumplir.\n"
        f"- objetivo: El objetivo de auditoría relacionado con este hallazgo.\n"
        f"- causa: La razón o motivo por la cual ocurrió la situación encontrada.\n"
        f"- efecto: La consecuencia o impacto de la situación encontrada.\n"
        f"- conclusion: El resumen del hallazgo y su significancia.\n"
        f"- recomendaciones: Las acciones correctivas que se sugieren.\n"
        f"- justificacionRiesgo: La justificación del nivel de riesgo asignado.\n\n"
        f"Responde con un JSON con las claves siendo los nombres de los campos y los valores siendo las sugerencias.\n"
        f'Ejemplo: {{"criterio": "...", "causa": "...", "efecto": "..."}}'
    )

    return "\n".join(prompt_parts)


def _build_evidence_prompt(
    context: dict,
    existing_fields: dict,
    finding_context: Optional[dict] = None,
    project_context: Optional[dict] = None,
) -> str:
    prompt_parts = []

    prompt_parts.append("Necesito sugerencias para completar una ficha de evidencia de auditoría.")

    if project_context:
        prompt_parts.append(
            f"\n## Contexto del Proyecto\n"
            f"- Nombre: {project_context.get('nombre', 'N/A')}"
        )

    if finding_context:
        prompt_parts.append(
            f"\n## Hallazgo relacionado\n"
            f"- Nombre: {finding_context.get('nombre', 'N/A')}\n"
            f"- Código: {finding_context.get('codigo', 'N/A')}\n"
            f"- Descripción: {finding_context.get('descripcion', 'N/A')}\n"
            f"- Criterio: {finding_context.get('criterio', 'N/A')}\n"
            f"- Objetivo: {finding_context.get('objetivo', 'N/A')}"
        )

    prompt_parts.append("\n## Datos de la evidencia actual")

    if context.get("nombre"):
        prompt_parts.append(f"- Nombre: {context['nombre']}")
    if context.get("descripcionEvidencia"):
        prompt_parts.append(f"- Descripción: {context['descripcionEvidencia']}")

    campos_a_sugerir = []
    all_fields = ["criterio", "objetivo", "descripcionEvidencia"]

    for campo in all_fields:
        if campo not in existing_fields or not existing_fields.get(campo):
            campos_a_sugerir.append(campo)

    if not campos_a_sugerir:
        campos_a_sugerir = all_fields

    prompt_parts.append(
        f"\n## Instrucciones\n"
        f"Genera sugerencias para los siguientes campos: {', '.join(campos_a_sugerir)}\n\n"
        f"Descripción de cada campo:\n"
        f"- criterio: La norma o estándar contra el cual se compara la evidencia.\n"
        f"- objetivo: El objetivo de auditoría que esta evidencia respalda.\n"
        f"- descripcionEvidencia: Descripción detallada de la evidencia recopilada.\n\n"
        f"Responde con un JSON con las claves siendo los nombres de los campos y los valores siendo las sugerencias.\n"
        f'Ejemplo: {{"criterio": "...", "objetivo": "...", "descripcionEvidencia": "..."}}'
    )

    return "\n".join(prompt_parts)


def _build_suggest_from_highlight_prompt(texto: str, tipo: str, project_context: Optional[dict] = None) -> str:
    prompt_parts = []

    if tipo == "hallazgo":
        prompt_parts.append("Necesito extraer la idea principal de un hallazgo a partir del siguiente texto subrayado en un documento de auditoría.")
    else:
        prompt_parts.append("Necesito extraer detalles para una evidencia a partir del siguiente texto subrayado en un documento de auditoría.")

    if project_context:
        prompt_parts.append(
            f"\n## Contexto del Proyecto\n"
            f"- Nombre: {project_context.get('nombre', 'N/A')}"
        )

    prompt_parts.append(f"\n## Texto Subrayado:\n\"{texto}\"")

    prompt_parts.append("\n## Instrucciones\n")
    
    if tipo == "hallazgo":
        prompt_parts.append(
            f"A partir de este texto, genera las siguientes sugerencias breves:\n"
            f"- nombre: Un título corto y descriptivo para el hallazgo (máximo 10 palabras).\n"
            f"- descripcion: Un resumen claro del problema o situación encontrada basada EXCLUSIVAMENTE en el texto (1 a 3 oraciones).\n"
            f"- observacion: Un breve comentario adicional de auditoría sobre el hallazgo.\n\n"
            f"Responde ÚNICAMENTE con un JSON con estas claves:\n"
            f'{{"nombre": "...", "descripcion": "...", "observacion": "..."}}'
        )
    else:
        prompt_parts.append(
            f"A partir de este texto, genera las siguientes sugerencias breves:\n"
            f"- subtitulo: Un posible título o categoría breve de donde proviene la evidencia (ej: 'Manual de Operaciones').\n"
            f"- observacion: Un comentario de qué evidencia potencial demuestra este texto.\n\n"
            f"Responde ÚNICAMENTE con un JSON con estas claves:\n"
            f'{{"subtitulo": "...", "observacion": "..."}}'
        )

    return "\n".join(prompt_parts)


def _build_improve_prompt(text: str, field_name: str, context: Optional[str] = None) -> str:
    field_descriptions = {
        "criterio": "criterio de auditoría (norma, ley o estándar aplicable)",
        "objetivo": "objetivo de la auditoría",
        "causa": "causa raíz del hallazgo",
        "efecto": "efecto o consecuencia del hallazgo",
        "conclusion": "conclusión del hallazgo",
        "recomendaciones": "recomendaciones de mejora",
        "justificacionRiesgo": "justificación del nivel de riesgo",
        "descripcion": "descripción del hallazgo",
        "descripcionEvidencia": "descripción de la evidencia",
        "texto": "nota de auditoría",
    }

    field_desc = field_descriptions.get(field_name, field_name)

    prompt = (
        f"Mejora el siguiente texto que corresponde al campo '{field_desc}' "
        f"en una ficha de trabajo de auditoría.\n\n"
        f"Texto original:\n{text}\n\n"
    )

    if context:
        prompt += f"Contexto adicional:\n{context}\n\n"

    prompt += (
        "Instrucciones:\n"
        "- Mantén el significado original pero mejora la redacción profesional.\n"
        "- Usa terminología técnica de auditoría cuando sea apropiado.\n"
        "- Sé conciso pero claro.\n"
        "- NO inventes datos que no estén en el texto original.\n\n"
        'Responde ÚNICAMENTE con un JSON: {"textoMejorado": "..."}'
    )

    return prompt


def _parse_json_response(text: str) -> dict:
    cleaned = text.strip()

    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("{")
        end = cleaned.rfind("}") + 1
        if start != -1 and end > start:
            try:
                return json.loads(cleaned[start:end])
            except json.JSONDecodeError:
                pass

        logger.error(f"No se pudo parsear la respuesta de Gemini: {text[:200]}")
        return {}


async def suggest_finding_fields(
    context: dict,
    existing_fields: dict,
    project_context: Optional[dict] = None,
    existing_findings: Optional[List[dict]] = None,
) -> dict:
    client = _get_client()
    model = _get_model()

    prompt = _build_finding_prompt(
        context=context,
        existing_fields=existing_fields,
        project_context=project_context,
        existing_findings=existing_findings,
    )

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config={
            "system_instruction": SYSTEM_PROMPT,
            "temperature": 0.7,
            "max_output_tokens": 2048,
        },
    )

    return _parse_json_response(response.text)


async def suggest_evidence_fields(
    context: dict,
    existing_fields: dict,
    finding_context: Optional[dict] = None,
    project_context: Optional[dict] = None,
) -> dict:
    client = _get_client()
    model = _get_model()

    prompt = _build_evidence_prompt(
        context=context,
        existing_fields=existing_fields,
        finding_context=finding_context,
        project_context=project_context,
    )

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config={
            "system_instruction": SYSTEM_PROMPT,
            "temperature": 0.7,
            "max_output_tokens": 1024,
        },
    )

    return _parse_json_response(response.text)


async def suggest_from_highlight(
    texto: str,
    tipo: str,
    project_context: Optional[dict] = None
) -> dict:
    client = _get_client()
    model = _get_model()

    prompt = _build_suggest_from_highlight_prompt(texto, tipo, project_context)

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config={
            "system_instruction": SYSTEM_PROMPT,
            "temperature": 0.5,
            "max_output_tokens": 1024,
        },
    )

    return _parse_json_response(response.text)


async def improve_text(
    text: str,
    field_name: str,
    context: Optional[str] = None,
) -> dict:
    client = _get_client()
    model = _get_model()

    prompt = _build_improve_prompt(text, field_name, context)

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config={
            "system_instruction": SYSTEM_PROMPT,
            "temperature": 0.5,
            "max_output_tokens": 1024,
        },
    )

    result = _parse_json_response(response.text)

    return {"textoMejorado": result.get("textoMejorado", text)}
