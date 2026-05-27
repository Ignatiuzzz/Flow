from fastapi import APIRouter
from fastapi.responses import FileResponse

from app.controllers.matrix_controller import (
    export_project_matrix_excel,
    get_project_matrix,
)


router = APIRouter(
    prefix="/matrix",
    tags=["Matrix"]
)


@router.get("/project/{project_id}")
async def get_project_matrix_route(project_id: str):
    return await get_project_matrix(project_id)


@router.get("/project/{project_id}/export-excel")
async def export_project_matrix_excel_route(project_id: str):
    result = await export_project_matrix_excel(project_id)

    return FileResponse(
        path=result["filePath"],
        filename=result["filePath"].split("/")[-1],
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )