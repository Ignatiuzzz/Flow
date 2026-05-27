from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.config import get_settings
from app.models.enums import DocumentType


settings = get_settings()

BASE_UPLOAD_DIR = Path("app/uploads/documents")

ALLOWED_EXTENSIONS = {
    ".pdf": DocumentType.PDF,
    ".docx": DocumentType.DOCX,
}

MAX_FILE_SIZE_MB = 15
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


def ensure_upload_directory() -> None:
    BASE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


def validate_document_file(file: UploadFile) -> DocumentType:
    extension = get_file_extension(file.filename)

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato no permitido. Solo se aceptan archivos PDF o DOCX"
        )

    return ALLOWED_EXTENSIONS[extension]


async def save_document_file(file: UploadFile, project_id: str) -> dict:
    ensure_upload_directory()

    document_type = validate_document_file(file)
    extension = get_file_extension(file.filename)

    content = await file.read()

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El archivo supera el tamaño máximo permitido de {MAX_FILE_SIZE_MB} MB"
        )

    project_folder = BASE_UPLOAD_DIR / project_id
    project_folder.mkdir(parents=True, exist_ok=True)

    unique_filename = f"{uuid4().hex}{extension}"
    file_path = project_folder / unique_filename

    with open(file_path, "wb") as stored_file:
        stored_file.write(content)

    return {
        "nombreOriginal": file.filename,
        "nombreArchivo": unique_filename,
        "tipoArchivo": document_type,
        "extension": extension.replace(".", ""),
        "rutaArchivo": str(file_path).replace("\\", "/"),
        "tamanioBytes": len(content)
    }


def delete_file_by_path(file_path: str) -> None:
    path = Path(file_path)

    if path.exists() and path.is_file():
        path.unlink()