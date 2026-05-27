from fastapi import HTTPException, status

from app.database import get_database
from app.services.excel_service import generate_matrix_excel
from app.utils.mongo import serialize_documents, to_object_id


async def get_project_matrix(project_id: str):
    db = get_database()

    project = await db["projects"].find_one({"_id": to_object_id(project_id)})

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    cursor = db["findings"].find(
        {"proyectoId": to_object_id(project_id)}
    ).sort("codigo", 1)

    findings = await cursor.to_list(length=None)

    return {
        "projectId": project_id,
        "totalFilas": len(findings),
        "matriz": serialize_documents(findings)
    }


async def export_project_matrix_excel(project_id: str):
    db = get_database()

    project = await db["projects"].find_one({"_id": to_object_id(project_id)})

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    cursor = db["findings"].find(
        {"proyectoId": to_object_id(project_id)}
    ).sort("codigo", 1)

    findings = await cursor.to_list(length=None)

    file_path = generate_matrix_excel(
        project_id=project_id,
        findings=findings
    )

    return {
        "message": "Matriz generada en Excel",
        "filePath": file_path
    }