from datetime import datetime
from pathlib import Path
from typing import Optional

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)
from reportlab.lib import colors


PDF_EXPORT_DIR = Path("app/uploads/exports/pdf")


def ensure_pdf_directory() -> None:
    PDF_EXPORT_DIR.mkdir(parents=True, exist_ok=True)


def safe_text(value: Optional[object]) -> str:
    if value is None:
        return ""

    return str(value)


def build_pdf_filename(prefix: str, code: str) -> str:
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    clean_code = code.replace("/", "-").replace("\\", "-").replace(" ", "_")

    return f"{prefix}_{clean_code}_{timestamp}.pdf"


def create_basic_pdf(
    filename: str,
    title: str,
    rows: list[list[str]]
) -> str:
    ensure_pdf_directory()

    file_path = PDF_EXPORT_DIR / filename

    document = SimpleDocTemplate(
        str(file_path),
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph(title, styles["Title"]))
    elements.append(Spacer(1, 16))

    table_data = [["Campo", "Detalle"]]

    for row in rows:
        table_data.append([
            Paragraph(safe_text(row[0]), styles["BodyText"]),
            Paragraph(safe_text(row[1]), styles["BodyText"]),
        ])

    table = Table(table_data, colWidths=[150, 330])

    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))

    elements.append(table)

    document.build(elements)

    return str(file_path).replace("\\", "/")


def generate_finding_pdf(finding: dict) -> str:
    filename = build_pdf_filename(
        prefix="ficha_hallazgo",
        code=safe_text(finding.get("codigo", "sin_codigo"))
    )

    rows = [
        ["Código", finding.get("codigo")],
        ["Nombre", finding.get("nombre")],
        ["Descripción", finding.get("descripcion")],
        ["Criterio", finding.get("criterio")],
        ["Objetivo", finding.get("objetivo")],
        ["Causa", finding.get("causa")],
        ["Efecto", finding.get("efecto")],
        ["Conclusión", finding.get("conclusion")],
        ["Impacto", finding.get("impacto")],
        ["Urgencia", finding.get("urgencia")],
        ["Riesgo", finding.get("riesgo")],
        ["Nivel", finding.get("nivel")],
        ["Justificación del Riesgo", finding.get("justificacionRiesgo")],
        ["Recomendaciones", finding.get("recomendaciones")],
    ]

    return create_basic_pdf(
        filename=filename,
        title="Ficha de Hallazgo",
        rows=rows
    )


def generate_evidence_pdf(evidence: dict) -> str:
    filename = build_pdf_filename(
        prefix="ficha_evidencia",
        code=safe_text(evidence.get("codigo", "sin_codigo"))
    )

    rows = [
        ["Código", evidence.get("codigo")],
        ["Nombre", evidence.get("nombre")],
        ["Criterio", evidence.get("criterio")],
        ["Objetivo", evidence.get("objetivo")],
        ["Descripción de Evidencia", evidence.get("descripcionEvidencia")],
        ["Documento", evidence.get("documentoNombre")],
        ["Subtítulo", evidence.get("subtitulo")],
        ["Hallazgo Relacionado", evidence.get("hallazgoId")],
    ]

    return create_basic_pdf(
        filename=filename,
        title="Ficha de Evidencia",
        rows=rows
    )