from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal


class DocumentBase(BaseModel):
    title: str
    source_type: Literal["pdf", "youtube", "web"]
    source_url: Optional[str] = None


class DocumentInDB(DocumentBase):
    id: str
    user_id: str
    status: Literal["processing", "ready", "failed"] = "processing"
    progress: int = Field(default=0, ge=0, le=100)
    chunk_count: int = 0
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class DocumentPublic(BaseModel):
    id: str
    title: str
    source_type: Literal["pdf", "youtube", "web"]
    source_url: Optional[str] = None
    status: Literal["processing", "ready", "failed"]
    progress: int
    chunk_count: int
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class DocumentStatusResponse(BaseModel):
    status: Literal["processing", "ready", "failed"]
    progress: int
    chunk_count: int
    error_message: Optional[str] = None


class URLIngestionRequest(BaseModel):
    url: str
    type: Literal["youtube", "web"]
    title: Optional[str] = None
