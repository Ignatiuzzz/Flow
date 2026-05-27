from datetime import datetime, timezone
from typing import Any, Optional

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field
from pydantic_core import core_schema


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type: Any, handler: Any):
        return core_schema.no_info_plain_validator_function(
            cls.validate,
            serialization=core_schema.to_string_ser_schema()
        )

    @classmethod
    def validate(cls, value: Any) -> ObjectId:
        if isinstance(value, ObjectId):
            return value

        if isinstance(value, str) and ObjectId.is_valid(value):
            return ObjectId(value)

        raise ValueError("ObjectId inválido")


def current_datetime() -> datetime:
    return datetime.now(timezone.utc)


class MongoBaseModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=ObjectId, alias="_id")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={
            ObjectId: str
        }
    )