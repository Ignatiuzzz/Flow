from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.database import get_database
from app.models.project_model import ProjectModel
from app.schemas.project_schema import ProjectCreate, ProjectUpdate
from app.utils.mongo import serialize_document, serialize_documents, to_object_id


COLLECTION = "projects"


async def create_project(project_data: ProjectCreate):
    db = get_database()

    project = ProjectModel(**project_data.model_dump())
    result = await db[COLLECTION].insert_one(project.model_dump(by_alias=True))

    created_project = await db[COLLECTION].find_one({"_id": result.inserted_id})

    return serialize_document(created_project)


async def get_projects():
    db = get_database()

    cursor = db[COLLECTION].find().sort("fechaCreacion", -1)
    projects = await cursor.to_list(length=None)

    return serialize_documents(projects)


async def get_project_by_id(project_id: str):
    db = get_database()

    project = await db[COLLECTION].find_one({"_id": to_object_id(project_id)})

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    return serialize_document(project)


async def update_project(project_id: str, project_data: ProjectUpdate):
    db = get_database()

    update_data = project_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se enviaron datos para actualizar"
        )

    update_data["fechaActualizacion"] = datetime.now(timezone.utc)

    result = await db[COLLECTION].update_one(
        {"_id": to_object_id(project_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    updated_project = await db[COLLECTION].find_one({"_id": to_object_id(project_id)})

    return serialize_document(updated_project)


async def delete_project(project_id: str):
    db = get_database()

    result = await db[COLLECTION].delete_one({"_id": to_object_id(project_id)})

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )

    return {
        "message": "Proyecto eliminado correctamente"
    }