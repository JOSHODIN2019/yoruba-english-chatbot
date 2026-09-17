"""
Stage 27: Backend integration tests. Exercises the actual FastAPI app
(routing, request validation, response schemas) via TestClient, on top of
the Stage 16 service-level tests which cover the ML logic itself.
"""
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.services.openai_pipeline.classifier import OpenAIPipelineError

client = TestClient(app)


def _force_local_pipeline():
    """Patches classify_and_respond to always raise, so tests that verify
    the LOCAL ML pipeline's specific behavior (matching the notebook's
    worked examples exactly) stay deterministic regardless of whether a
    real OPENAI_API_KEY happens to be configured in .env - OpenAI would
    otherwise answer these requests instead, and its answers can validly
    differ from the local model's (see PROJECT_MEMORY.md)."""
    return patch(
        "app.api.chat.classify_and_respond",
        side_effect=OpenAIPipelineError("forced local pipeline for this test"),
    )


def test_chat_predict_uses_openai_result_when_available():
    """Every other test in this file exercises the fallback path (no
    OPENAI_API_KEY is configured in this environment). This test mocks
    classify_and_respond to simulate OpenAI succeeding, and confirms the
    endpoint actually returns ITS result (not silently falling back
    anyway), while the response shape stays identical either way."""
    with patch("app.api.chat.classify_and_respond") as mock_classify:
        mock_classify.return_value = {
            "detected_language": "English",
            "predicted_intent": "greeting",
            "response": "Hey there! What can I do for you?",
        }
        response = client.post(
            "/api/chat/predict", json={"message": "yo what's up"}
        )
    assert response.status_code == 200
    body = response.json()
    assert body["detected_language"] == "English"
    assert body["predicted_intent"] == "greeting"
    assert body["response"] == "Hey there! What can I do for you?"
    assert body["original_message"] == "yo what's up"
    assert "preprocessed_text" in body["processing"]


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_chat_predict_english():
    with _force_local_pipeline():
        response = client.post(
            "/api/chat/predict", json={"message": "What can you help me with?"}
        )
    assert response.status_code == 200
    body = response.json()
    assert body["detected_language"] == "English"
    assert body["predicted_intent"] == "asking_for_help"
    assert body["response"] == "Sure, I'll be happy to help you."
    assert body["original_message"] == "What can you help me with?"
    assert "preprocessed_text" in body["processing"]


def test_chat_predict_yoruba():
    with _force_local_pipeline():
        response = client.post(
            "/api/chat/predict", json={"message": "Kí ni orúkọ rẹ?"}
        )
    assert response.status_code == 200
    body = response.json()
    assert body["detected_language"] == "Yoruba"
    assert body["predicted_intent"] == "ask_bot_name"


def test_chat_predict_mixed():
    with _force_local_pipeline():
        response = client.post(
            "/api/chat/predict", json={"message": "Please jọ̀ọ́ help me"}
        )
    assert response.status_code == 200
    assert response.json()["detected_language"] == "Mixed"


def test_chat_predict_rejects_empty_message():
    response = client.post("/api/chat/predict", json={"message": ""})
    assert response.status_code == 422


def test_chat_predict_rejects_oversized_message():
    response = client.post("/api/chat/predict", json={"message": "a" * 1001})
    assert response.status_code == 422


def test_chat_predict_rejects_missing_field():
    response = client.post("/api/chat/predict", json={})
    assert response.status_code == 422


def test_dataset_info_endpoint():
    response = client.get("/api/dataset/info")
    assert response.status_code == 200
    body = response.json()
    assert body["total_messages"] == 9460
    assert body["unique_intents"] == 150


def test_model_info_endpoint():
    response = client.get("/api/model/info")
    assert response.status_code == 200
    body = response.json()
    assert body["algorithm"] == "Logistic Regression (multinomial)"
    assert 0 < body["evaluation_metrics"]["Accuracy"] <= 1


def test_intent_catalogue_endpoint():
    response = client.get("/api/intents")
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 150
    assert {"intent", "category", "description"} <= body[0].keys()


def test_cors_headers_present_for_allowed_origin():
    response = client.options(
        "/api/chat/predict",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
