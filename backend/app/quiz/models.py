from pydantic import BaseModel, Field
from typing import Optional


class QuizOption(BaseModel):
    label: str
    text: str


class QuizQuestion(BaseModel):
    question: str
    options: list[str]
    correct: str
    explanation: str


class QuizGenerateRequest(BaseModel):
    document_id: str
    topic: str
    count: int = Field(default=5, ge=1, le=20)


class QuizGenerateResponse(BaseModel):
    document_id: str
    topic: str
    questions: list[QuizQuestion]


class QuizSubmitRequest(BaseModel):
    document_id: str
    topic: str
    score: int
    total: int


class QuizSubmitResponse(BaseModel):
    message: str
    percentage: float
