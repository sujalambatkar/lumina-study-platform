import json
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse

from app.auth.utils import get_current_user
from app.database import get_db
from app.agent.graph import stream_agent_response
from app.security import chat_rate_limit

router = APIRouter(tags=["chat"])


@router.get("/chat/stream")
async def chat_stream(
    document_id: str,
    message: str,
    request: Request,
    current_user: dict = Depends(get_current_user),
    _: None = Depends(chat_rate_limit),
) -> StreamingResponse:
    db = get_db()
    doc = await db.documents.find_one({"_id": document_id, "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if doc["status"] != "ready":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Document is still processing")

    async def event_generator():
        try:
            async for token in stream_agent_response(document_id, message):
                yield f"data: {json.dumps({'token': token})}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"
        finally:
            yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
