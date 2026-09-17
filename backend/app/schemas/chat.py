"""Request/response schemas for the chat prediction endpoint.

Field shape follows the example contract in PROJECT_RULES.md Section 9.
Validation limits (Section 10: "Validate and limit user input. Reject
empty or excessively large messages.") are enforced here via Pydantic,
before any message reaches the ML pipeline.
"""
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)


class ProcessingDetails(BaseModel):
    preprocessed_text: str


class ChatResponse(BaseModel):
    original_message: str
    detected_language: str
    predicted_intent: str
    response: str
    processing: ProcessingDetails
