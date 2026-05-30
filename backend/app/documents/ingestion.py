from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Optional

from app.database import get_db
from app.documents.parsers import parse_pdf_bytes, parse_youtube_transcript, parse_web_url


def _split_text(text: str, chunk_size: int = 800, overlap: int = 100) -> list[str]:
    if len(text) <= chunk_size:
        return [text]
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        if end == len(text):
            break
        start = end - overlap
    return chunks


async def _update_status(doc_id: str, status: str, progress: int,
                         chunk_count: int = 0, error: Optional[str] = None) -> None:
    db = get_db()
    update: dict = {
        "status": status,
        "progress": progress,
        "chunk_count": chunk_count,
        "updated_at": datetime.now(timezone.utc),
    }
    if error:
        update["error_message"] = error
    await db.documents.update_one({"_id": doc_id}, {"$set": update})


async def _store_chunks(document_id: str, chunks: list[str]) -> None:
    db = get_db()
    # Remove old chunks for this document (re-ingestion case)
    await db.chunks.delete_many({"document_id": document_id})
    if not chunks:
        return
    docs = [
        {"document_id": document_id, "chunk_index": i, "text": chunk}
        for i, chunk in enumerate(chunks)
    ]
    await db.chunks.insert_many(docs)
    # Ensure text index exists (idempotent)
    await db.chunks.create_index([("text", "text"), ("document_id", 1)])


async def _ingest(document_id: str, full_text: str) -> None:
    await _update_status(document_id, "processing", 30)
    chunks = _split_text(full_text)
    await _update_status(document_id, "processing", 60)
    await _store_chunks(document_id, chunks)
    await _update_status(document_id, "ready", 100, chunk_count=len(chunks))


async def ingest_pdf(document_id: str, file_bytes: bytes) -> None:
    try:
        await _update_status(document_id, "processing", 10)
        loop = asyncio.get_event_loop()
        pages = await loop.run_in_executor(None, parse_pdf_bytes, file_bytes)
        full_text = "\n\n".join(pages)
        await _ingest(document_id, full_text)
    except Exception as exc:
        await _update_status(document_id, "failed", 0, error=str(exc))


async def ingest_youtube(document_id: str, url: str) -> None:
    try:
        await _update_status(document_id, "processing", 10)
        loop = asyncio.get_event_loop()
        segments, _ = await loop.run_in_executor(None, parse_youtube_transcript, url)
        full_text = "\n".join(segments)
        await _ingest(document_id, full_text)
    except Exception as exc:
        await _update_status(document_id, "failed", 0, error=str(exc))


async def ingest_web(document_id: str, url: str) -> None:
    try:
        await _update_status(document_id, "processing", 10)
        full_text = await parse_web_url(url)
        await _ingest(document_id, full_text)
    except Exception as exc:
        await _update_status(document_id, "failed", 0, error=str(exc))


async def retrieve_chunks(document_id: str, query: str, n_results: int = 6) -> list[dict]:
    db = get_db()
    try:
        # MongoDB full-text search within this document's chunks
        cursor = db.chunks.find(
            {"$text": {"$search": query}, "document_id": document_id},
            {"score": {"$meta": "textScore"}, "text": 1, "chunk_index": 1}
        ).sort([("score", {"$meta": "textScore"})]).limit(n_results)
        results = await cursor.to_list(length=n_results)
        if results:
            return [{"text": r["text"], "chunk_index": r.get("chunk_index", 0)} for r in results]
    except Exception:
        pass

    # Fallback: return first N chunks if text search fails (index not ready yet)
    cursor = db.chunks.find(
        {"document_id": document_id},
        {"text": 1, "chunk_index": 1}
    ).sort("chunk_index", 1).limit(n_results)
    results = await cursor.to_list(length=n_results)
    return [{"text": r["text"], "chunk_index": r.get("chunk_index", 0)} for r in results]


async def delete_document_chunks(document_id: str) -> None:
    db = get_db()
    await db.chunks.delete_many({"document_id": document_id})
