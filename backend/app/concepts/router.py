import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.auth.utils import get_current_user
from app.database import get_db
from app.agent.prompts import CONCEPT_EXTRACTION_PROMPT
from app.agent.graph import get_llm

router = APIRouter(prefix="/concepts", tags=["concepts"])


class ConceptNode(BaseModel):
    id: str
    label: str
    description: str


class ConceptEdge(BaseModel):
    source: str
    target: str
    label: str


class ConceptMapRequest(BaseModel):
    document_id: str


class ConceptMapResponse(BaseModel):
    document_id: str
    nodes: list[ConceptNode]
    edges: list[ConceptEdge]


@router.post("/map", response_model=ConceptMapResponse)
async def generate_concept_map(
    payload: ConceptMapRequest,
    current_user: dict = Depends(get_current_user),
) -> ConceptMapResponse:
    db = get_db()
    doc = await db.documents.find_one({"_id": payload.document_id, "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if doc["status"] != "ready":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Document is still processing")

    # Fetch chunks from MongoDB
    cursor = db.chunks.find(
        {"document_id": payload.document_id},
        {"text": 1}
    ).sort("chunk_index", 1).limit(20)
    chunk_docs = await cursor.to_list(length=20)
    all_text = [c["text"] for c in chunk_docs]

    if not all_text:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="No content found")

    combined = "\n\n".join(all_text)[:8000]
    prompt = CONCEPT_EXTRACTION_PROMPT.format(context=combined)

    llm = get_llm()
    response = await llm.ainvoke(prompt)
    content = response.content if hasattr(response, "content") else str(response)

    content = content.strip()
    if content.startswith("```"):
        lines = content.split("\n")
        end = len(lines) - 1 if lines[-1].strip() == "```" else len(lines)
        content = "\n".join(lines[1:end])

    try:
        data: dict[str, Any] = json.loads(content)
        nodes = [ConceptNode(**n) for n in data.get("nodes", [])]
        edges = [ConceptEdge(**e) for e in data.get("edges", [])]
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"LLM returned malformed graph: {exc}")

    return ConceptMapResponse(document_id=payload.document_id, nodes=nodes, edges=edges)
