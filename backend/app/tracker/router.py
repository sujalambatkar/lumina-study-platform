from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime

from app.auth.utils import get_current_user
from app.database import get_db

router = APIRouter(prefix="/tracker", tags=["tracker"])


class TopicMastery(BaseModel):
    topic: str
    document_id: str
    document_title: str
    avg_score: Optional[float]
    attempt_count: int
    last_attempt: Optional[datetime]
    status: Literal["needs_review", "not_explored", "strong"]


class TrackerSummary(BaseModel):
    total_topics: int
    overall_mastery: float
    needs_review_count: int
    strong_count: int
    not_explored_count: int


@router.get("/{document_id}", response_model=list[TopicMastery])
async def get_document_tracker(
    document_id: str,
    current_user: dict = Depends(get_current_user),
) -> list[TopicMastery]:
    db = get_db()
    doc = await db.documents.find_one({"_id": document_id, "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    pipeline = [
        {"$match": {"user_id": current_user["_id"], "document_id": document_id}},
        {
            "$group": {
                "_id": "$topic",
                "avg_score": {"$avg": "$percentage"},
                "attempt_count": {"$sum": 1},
                "last_attempt": {"$max": "$timestamp"},
            }
        },
        {"$sort": {"avg_score": 1}},
    ]
    cursor = db.quiz_attempts.aggregate(pipeline)
    topic_stats = await cursor.to_list(length=100)

    results: list[TopicMastery] = []
    for stat in topic_stats:
        avg = stat["avg_score"]
        if avg < 60:
            mastery_status = "needs_review"
        elif avg >= 80:
            mastery_status = "strong"
        else:
            mastery_status = "not_explored"

        results.append(
            TopicMastery(
                topic=stat["_id"],
                document_id=document_id,
                document_title=doc["title"],
                avg_score=round(avg, 1),
                attempt_count=stat["attempt_count"],
                last_attempt=stat["last_attempt"],
                status=mastery_status,
            )
        )

    results.sort(key=lambda x: (x.status != "needs_review", x.status != "not_explored"))
    return results


@router.get("/summary/all", response_model=TrackerSummary)
async def get_tracker_summary(current_user: dict = Depends(get_current_user)) -> TrackerSummary:
    db = get_db()
    pipeline = [
        {"$match": {"user_id": current_user["_id"]}},
        {
            "$group": {
                "_id": {"topic": "$topic", "document_id": "$document_id"},
                "avg_score": {"$avg": "$percentage"},
            }
        },
    ]
    cursor = db.quiz_attempts.aggregate(pipeline)
    topic_stats = await cursor.to_list(length=500)

    total = len(topic_stats)
    if total == 0:
        return TrackerSummary(
            total_topics=0,
            overall_mastery=0.0,
            needs_review_count=0,
            strong_count=0,
            not_explored_count=0,
        )

    needs_review = sum(1 for s in topic_stats if s["avg_score"] < 60)
    strong = sum(1 for s in topic_stats if s["avg_score"] >= 80)
    not_explored = total - needs_review - strong
    overall = sum(s["avg_score"] for s in topic_stats) / total

    return TrackerSummary(
        total_topics=total,
        overall_mastery=round(overall, 1),
        needs_review_count=needs_review,
        strong_count=strong,
        not_explored_count=not_explored,
    )
