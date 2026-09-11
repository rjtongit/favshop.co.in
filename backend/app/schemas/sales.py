from pydantic import BaseModel, Field


class SalesQuestion(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000)


class SalesAnswer(BaseModel):
    answer: str
    operation: str
    result: object