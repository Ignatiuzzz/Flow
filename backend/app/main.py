from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import health_routes


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    health_routes.router,
    prefix=settings.API_PREFIX
)


@app.get("/")
async def root():
    return {
        "message": "API de Herramienta para Auditores",
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "docs": "/docs"
    }