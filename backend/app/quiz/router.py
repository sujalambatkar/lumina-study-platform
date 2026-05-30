import json
from datetime import datetime, timezone
import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.utils import get_current_user
from app.database import get_db
from app.quiz.models import (
    QuizGenerateRequest,
    QuizGenerateResponse,
    QuizQuestion,
    QuizSubmitRequest,
    QuizSubmitResponse,
)
from app.documents.ingestion import retrieve_chunks
from app.agent.prompts import QUIZ_GENERATION_PROMPT
from app.agent.graph import get_llm

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.post("/generate", response_model=QuizGenerateResponse)
async def generate_quiz(
    payload: QuizGenerateRequest,
    current_user: dict = Depends(get_current_user),
) -> QuizGenerateResponse:
    db = get_db()
    doc = await db.documents.find_one({"_id": payload.document_id, "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if doc["status"] != "ready":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Document is still processing")

    chunks = retrieve_chunks(payload.document_id, payload.topic, n_results=8)
    if not chunks:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Not enough content to generate quiz")

    context = "\n\n".join(c["text"] for c in chunks)[:6000]
    prompt = QUIZ_GENERATION_PROMPT.format(topic=payload.topic, context=context, count=payload.count)

    llm = get_llm()
    response = llm.invoke(prompt)
    content = response.content if hasattr(response, "content") else str(response)

    content = content.strip()
    if content.startswith("```"):
        lines = content.split("\n")
        end = len(lines) - 1 if lines[-1].strip() == "```" else len(lines)
        content = "\n".join(lines[1:end])

    try:
        raw_questions = json.loads(content)
        questions = [QuizQuestion(**q) for q in raw_questions]
    except (json.JSONDecodeError, Exception) as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"LLM returned malformed quiz: {exc}")

    return QuizGenerateResponse(document_id=payload.document_id, topic=payload.topic, questions=questions)


@router.post("/submit", response_model=QuizSubmitResponse)
async def submit_quiz(
    payload: QuizSubmitRequest,
    current_user: dict = Depends(get_current_user),
) -> QuizSubmitResponse:
    db = get_db()
    doc = await db.documents.find_one({"_id": payload.document_id, "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    percentage = round((payload.score / max(payload.total, 1)) * 100, 1)

    attempt = {
        "_id": str(uuid.uuid4()),
        "user_id": current_user["_id"],
        "document_id": payload.document_id,
        "topic": payload.topic,
        "score": payload.score,
        "total": payload.total,
        "percentage": percentage,
        "timestamp": datetime.now(timezone.utc),
    }
    await db.quiz_attempts.insert_one(attempt)

    return QuizSubmitResponse(message="Score saved successfully", percentage=percentage)
