from pydantic import BaseModel, EmailStr
from typing import List
from datetime import datetime


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class Source(BaseModel):
    filename: str
    page: int


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str
    sources: List[Source]


class HistoryMessage(BaseModel):
    id: int
    question: str
    answer: str
    sources: List[Source]
    created_at: datetime

    model_config = {"from_attributes": True}


class IngestResponse(BaseModel):
    message: str
    chunks_stored: int
