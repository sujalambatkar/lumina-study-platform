from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status, Request
from datetime import datetime, timezone
import uuid

from app.auth.utils import get_current_user
from app.database import get_db
from app.documents.models import DocumentPublic, DocumentStatusResponse, URLIngestionRequest
from app.documents.ingestion import ingest_pdf, ingest_youtube, ingest_web, delete_document_collection
from app.security import upload_rate_limit

router = APIRouter(prefix="/documents", tags=["documents"])

ALLOWED_MIME_TYPES = {"application/pdf"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("/upload", response_model=DocumentPublic, status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    _: None = Depends(upload_rate_limit),
) -> DocumentPublic:
    file_bytes = await file.read()

    # Validate by magic bytes — don't trust Content-Type header alone
    if not file_bytes.startswith(b"%PDF"):
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Only valid PDF files are supported")

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large (max 50MB)")

    document_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    title = (file.filename or "Untitled").replace(".pdf", "")

    doc = {
        "_id": document_id,
        "user_id": current_user["_id"],
        "title": title,
        "source_type": "pdf",
        "source_url": None,
        "status": "processing",
        "progress": 0,
        "chunk_count": 0,
        "error_message": None,
        "created_at": now,
        "updated_at": now,
    }
    db = get_db()
    await db.documents.insert_one(doc)
    background_tasks.add_task(ingest_pdf, document_id, file_bytes)

    return DocumentPublic(**{**doc, "id": document_id})


@router.post("/url", response_model=DocumentPublic, status_code=status.HTTP_202_ACCEPTED)
async def ingest_url(
    payload: URLIngestionRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
) -> DocumentPublic:
    document_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    title = payload.title or payload.url[:80]

    doc = {
        "_id": document_id,
        "user_id": current_user["_id"],
        "title": title,
        "source_type": payload.type,
        "source_url": payload.url,
        "status": "processing",
        "progress": 0,
        "chunk_count": 0,
        "error_message": None,
        "created_at": now,
        "updated_at": now,
    }
    db = get_db()
    await db.documents.insert_one(doc)

    if payload.type == "youtube":
        background_tasks.add_task(ingest_youtube, document_id, payload.url)
    else:
        background_tasks.add_task(ingest_web, document_id, payload.url)

    return DocumentPublic(**{**doc, "id": document_id})


@router.get("/", response_model=list[DocumentPublic])
async def list_documents(current_user: dict = Depends(get_current_user)) -> list[DocumentPublic]:
    db = get_db()
    cursor = db.documents.find({"user_id": current_user["_id"]}).sort("created_at", -1)
    docs = await cursor.to_list(length=200)
    return [DocumentPublic(**{**d, "id": d["_id"]}) for d in docs]


@router.get("/{document_id}", response_model=DocumentPublic)
async def get_document(document_id: str, current_user: dict = Depends(get_current_user)) -> DocumentPublic:
    db = get_db()
    doc = await db.documents.find_one({"_id": document_id, "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return DocumentPublic(**{**doc, "id": doc["_id"]})


@router.get("/{document_id}/status", response_model=DocumentStatusResponse)
async def get_document_status(document_id: str, current_user: dict = Depends(get_current_user)) -> DocumentStatusResponse:
    db = get_db()
    doc = await db.documents.find_one(
        {"_id": document_id, "user_id": current_user["_id"]},
        {"status": 1, "progress": 1, "chunk_count": 1, "error_message": 1},
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return DocumentStatusResponse(
        status=doc["status"],
        progress=doc.get("progress", 0),
        chunk_count=doc.get("chunk_count", 0),
        error_message=doc.get("error_message"),
    )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: str, current_user: dict = Depends(get_current_user)) -> None:
    db = get_db()
    result = await db.documents.delete_one({"_id": document_id, "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    delete_document_collection(document_id)
