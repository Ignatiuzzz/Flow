from typing import Any, Dict, List

from bson import ObjectId
from fastapi import HTTPException, status


def to_object_id(id_value: str) -> ObjectId:
    if not ObjectId.is_valid(id_value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID inválido"
        )

    return ObjectId(id_value)


def serialize_document(document: Dict[str, Any] | None) -> Dict[str, Any] | None:
    if document is None:
        return None

    document["id"] = str(document["_id"])
    document.pop("_id", None)

    for key, value in document.items():
        if isinstance(value, ObjectId):
            document[key] = str(value)

        if isinstance(value, list):
            document[key] = [
                str(item) if isinstance(item, ObjectId) else item
                for item in value
            ]

    return document


def serialize_documents(documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [serialize_document(document) for document in documents]