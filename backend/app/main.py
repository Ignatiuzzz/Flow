from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import close_mongo_connection, connect_to_mongo
from app.routes import (
    document_routes,
    evidence_routes,
    finding_routes,
    health_routes,
    highlight_routes,
    matrix_routes,
    note_routes,
    project_routes,
)


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

app.include_router(
    project_routes.router,
    prefix=settings.API_PREFIX
)

app.include_router(
    document_routes.router,
    prefix=settings.API_PREFIX
)

app.include_router(
    highlight_routes.router,
    prefix=settings.API_PREFIX
)

app.include_router(
    finding_routes.router,
    prefix=settings.API_PREFIX
)

app.include_router(
    evidence_routes.router,
    prefix=settings.API_PREFIX
)

app.include_router(
    note_routes.router,
    prefix=settings.API_PREFIX
)

app.include_router(
    matrix_routes.router,
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