from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ServerSelectionTimeoutError

from app.config import get_settings


settings = get_settings()

client: AsyncIOMotorClient | None = None
database: AsyncIOMotorDatabase | None = None


async def connect_to_mongo() -> None:
    global client, database

    try:
        client = AsyncIOMotorClient(
            settings.MONGO_URI,
            serverSelectionTimeoutMS=5000
        )

        await client.admin.command("ping")

        database = client[settings.MONGO_DB_NAME]

        print(f"Conectado a MongoDB: {settings.MONGO_DB_NAME}")

    except ServerSelectionTimeoutError as error:
        print("No se pudo conectar a MongoDB")
        print(error)
        raise error


async def close_mongo_connection() -> None:
    global client

    if client is not None:
        client.close()
        print("Conexión con MongoDB cerrada")


def get_database() -> AsyncIOMotorDatabase:
    if database is None:
        raise RuntimeError("La base de datos no está conectada")

    return database