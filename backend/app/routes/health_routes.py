from fastapi import APIRouter

from app.database import get_database


router = APIRouter(
    prefix="/health",
    tags=["Health"]
)


@router.get("/")
async def health_check():
    return {
        "status": "ok",
        "message": "Backend funcionando correctamente"
    }


@router.get("/db")
async def database_health_check():
    db = get_database()

    await db.command("ping")

    return {
        "status": "ok",
        "message": "Conexión con MongoDB funcionando correctamente"
    }