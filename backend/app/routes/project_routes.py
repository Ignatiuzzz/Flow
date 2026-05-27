from fastapi import APIRouter

from app.controllers.project_controller import (
    create_project,
    delete_project,
    get_project_by_id,
    get_projects,
    update_project,
)
from app.schemas.project_schema import ProjectCreate, ProjectUpdate


router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


@router.post("/")
async def create_project_route(project_data: ProjectCreate):
    return await create_project(project_data)


@router.get("/")
async def get_projects_route():
    return await get_projects()


@router.get("/{project_id}")
async def get_project_by_id_route(project_id: str):
    return await get_project_by_id(project_id)


@router.put("/{project_id}")
async def update_project_route(project_id: str, project_data: ProjectUpdate):
    return await update_project(project_id, project_data)


@router.delete("/{project_id}")
async def delete_project_route(project_id: str):
    return await delete_project(project_id)