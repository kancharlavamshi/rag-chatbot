import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..models.db import get_db, Message
from ..models.schemas import ChatRequest
from ..services.rag import stream_answer
from ..core.auth import get_current_user_id

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
def chat(
    body: ChatRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    token_gen, sources = stream_answer(body.question)

    def event_stream():
        full_answer = []
        for token in token_gen:
            full_answer.append(token)
            yield f"data: {json.dumps({'token': token})}\n\n"

        answer = "".join(full_answer)
        db.add(Message(
            user_id=user_id,
            question=body.question,
            answer=answer,
            sources=json.dumps([s.model_dump() for s in sources]),
        ))
        db.commit()

        yield f"data: {json.dumps({'sources': [s.model_dump() for s in sources], 'done': True})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
