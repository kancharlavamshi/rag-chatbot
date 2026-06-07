import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..models.db import get_db, Message
from ..models.schemas import HistoryMessage, Source
from ..core.auth import get_current_user_id

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=List[HistoryMessage])
def get_history(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    messages = (
        db.query(Message)
        .filter(Message.user_id == user_id)
        .order_by(Message.created_at.desc())
        .limit(50)
        .all()
    )

    return [
        HistoryMessage(
            id=msg.id,
            question=msg.question,
            answer=msg.answer,
            sources=[Source(**s) for s in json.loads(msg.sources)],
            created_at=msg.created_at,
        )
        for msg in messages
    ]


@router.delete("/{message_id}", status_code=204)
def delete_message(
    message_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    msg = db.query(Message).filter(Message.id == message_id, Message.user_id == user_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(msg)
    db.commit()


@router.delete("", status_code=204)
def delete_all_history(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    db.query(Message).filter(Message.user_id == user_id).delete()
    db.commit()
