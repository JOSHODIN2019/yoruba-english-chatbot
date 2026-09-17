"""Chat prediction endpoint.

Primary path: OpenAI does language detection, intent classification, and
writes the reply in one structured call (app/services/openai_pipeline).
Automatic fallback: if OpenAI is not configured (no API key) or the call
fails for any reason (network, auth, rate limit, malformed output), the
original local pipeline runs instead (preprocessing -> rule-based
language detection -> TF-IDF/Logistic Regression -> predefined response
lookup). Either way the response shape returned to the frontend is
identical - the frontend has no idea which path answered a given request.
"""
import logging

from fastapi import APIRouter

from app.schemas.chat import ChatRequest, ChatResponse, ProcessingDetails
from app.services.intent_classification.classifier import predict_intent
from app.services.language_detection.detector import detect_language
from app.services.openai_pipeline.classifier import (
    OpenAIPipelineError,
    classify_and_respond,
)
from app.services.preprocessing.pipeline import preprocess_for_model
from app.services.response_selection.selector import select_response

router = APIRouter(prefix="/api/chat", tags=["chat"])

logger = logging.getLogger(__name__)


@router.post("/predict", response_model=ChatResponse)
def predict(request: ChatRequest) -> ChatResponse:
    # Computed either way: cheap, local, and gives the processing-details
    # panel something meaningful to show regardless of which pipeline
    # actually answered the request.
    processed_text = preprocess_for_model(request.message)

    try:
        result = classify_and_respond(request.message)
        detected_language = result["detected_language"]
        predicted_intent = result["predicted_intent"]
        response_text = result["response"]
    except OpenAIPipelineError as exc:
        logger.warning("OpenAI pipeline unavailable, using local model: %s", exc)
        predicted_intent = predict_intent(processed_text)
        detected_language = detect_language(request.message)
        response_text = select_response(predicted_intent, detected_language)

    return ChatResponse(
        original_message=request.message,
        detected_language=detected_language,
        predicted_intent=predicted_intent,
        response=response_text,
        processing=ProcessingDetails(preprocessed_text=processed_text),
    )
