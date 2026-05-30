from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Optional

import chromadb
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer

from app.config import settings
from app.database import get_db
from app.documents.parsers import parse_pdf_bytes, parse_youtube_transcript, parse_web_url

_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
_embedding_model: Optional[SentenceTransformer] = None
_chroma_client: Optional[chromadb.PersistentClient] = None


def get_embedding_model() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedding_model


def get_chroma_client() -> chromadb.PersistentClient:
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
    return _chroma_client


async def _update_document_status(
    document_id: str, status: str, progress: int, chunk_count: int = 0, error: Optional[str] = None
) -> None:
    db = get_db()
    update: dict = {
        "status": status,
        "progress": progress,
        "chunk_count": chunk_count,
        "updated_at": datetime.now(timezone.utc),
    }
    if error:
        update["error_message"] = error
    await db.documents.update_one({"_id": document_id}, {"$set": update})


async def ingest_pdf(document_id: str, file_bytes: bytes) -> None:
    try:
        await _update_document_status(document_id, "processing", 10)
        loop = asyncio.get_event_loop()
        pages = await loop.run_in_executor(None, parse_pdf_bytes, file_bytes)
        full_text = "\n\n".join(pages)
        await _update_document_status(document_id, "processing", 30)
        await _embed_and_store(document_id, full_text)
    except Exception as exc:
        await _update_document_status(document_id, "failed", 0, error=str(exc))


async def ingest_youtube(document_id: str, url: str) -> None:
    try:
        await _update_document_status(document_id, "processing", 10)
        loop = asyncio.get_event_loop()
        segments, _video_id = await loop.run_in_executor(None, parse_youtube_transcript, url)
        full_text = "\n".join(segments)
        await _update_document_status(document_id, "processing", 30)
        await _embed_and_store(document_id, full_text)
    except Exception as exc:
        await _update_document_status(document_id, "failed", 0, error=str(exc))


async def ingest_web(document_id: str, url: str) -> None:
    try:
        await _update_document_status(document_id, "processing", 10)
        full_text = await parse_web_url(url)
        await _update_document_status(document_id, "processing", 30)
        await _embed_and_store(document_id, full_text)
    except Exception as exc:
        await _update_document_status(document_id, "failed", 0, error=str(exc))


async def _embed_and_store(document_id: str, full_text: str) -> None:
    loop = asyncio.get_event_loop()

    chunks = _splitter.split_text(full_text)
    await _update_document_status(document_id, "processing", 50)

    model = get_embedding_model()
    embeddings = await loop.run_in_executor(None, lambda: model.encode(chunks).tolist())
    await _update_document_status(document_id, "processing", 80)

    client = get_chroma_client()
    collection_name = f"doc_{document_id}".replace("-", "_")
    collection = client.get_or_create_collection(collection_name)

    ids = [f"{document_id}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"document_id": document_id, "chunk_index": i} for i in range(len(chunks))]

    collection.add(documents=chunks, embeddings=embeddings, ids=ids, metadatas=metadatas)
    await _update_document_status(document_id, "ready", 100, chunk_count=len(chunks))


def retrieve_chunks(document_id: str, query: str, n_results: int = 5) -> list[dict]:
    model = get_embedding_model()
    query_embedding = model.encode([query]).tolist()[0]

    client = get_chroma_client()
    collection_name = f"doc_{document_id}".replace("-", "_")

    try:
        collection = client.get_collection(collection_name)
    except Exception:
        return []

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(n_results, collection.count()),
        include=["documents", "metadatas"],
    )

    chunks: list[dict] = []
    if results["documents"]:
        for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
            chunks.append({"text": doc, "chunk_index": meta.get("chunk_index", 0)})
    return chunks


def get_all_chunks(document_id: str) -> list[str]:
    client = get_chroma_client()
    collection_name = f"doc_{document_id}".replace("-", "_")
    try:
        collection = client.get_collection(collection_name)
        results = collection.get(include=["documents"])
        return results["documents"] or []
    except Exception:
        return []


def delete_document_collection(document_id: str) -> None:
    client = get_chroma_client()
    collection_name = f"doc_{document_id}".replace("-", "_")
    try:
        client.delete_collection(collection_name)
    except Exception:
        pass
