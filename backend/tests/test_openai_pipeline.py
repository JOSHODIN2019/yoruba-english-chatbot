"""
Unit tests for the OpenAI-backed pipeline's own validation logic, using
mocks so these run without a real API key or network access. The 18
tests in the other two files already prove the end-to-end fallback works
in practice, since no OPENAI_API_KEY is configured in this test
environment - every one of those requests already goes through the
"OpenAI unavailable -> local pipeline" path for real. These tests cover
the code paths that only run once a key IS configured: validating what
OpenAI actually returns.
"""
from unittest.mock import MagicMock, patch

import pytest

from app.services.openai_pipeline.classifier import (
    OpenAIPipelineError,
    classify_and_respond,
)


def _make_completion(content: str):
    completion = MagicMock()
    completion.choices = [MagicMock(message=MagicMock(content=content))]
    return completion


def test_raises_when_no_api_key_configured():
    # Explicitly force the "no client configured" scenario rather than
    # relying on OPENAI_API_KEY happening to be unset in whatever
    # environment this test runs in - it may well be set (e.g. once the
    # project owner adds a real key to .env), and this test must still
    # deterministically verify the fail-fast behavior either way.
    with patch("app.services.openai_pipeline.classifier._client", None):
        with pytest.raises(OpenAIPipelineError, match="not configured"):
            classify_and_respond("Hello")


@patch("app.services.openai_pipeline.classifier._client")
def test_valid_response_is_parsed(mock_client):
    mock_client.chat.completions.create.return_value = _make_completion(
        '{"detected_language": "English", "predicted_intent": "greeting", "response": "Hello!"}'
    )
    result = classify_and_respond("Hello")
    assert result == {
        "detected_language": "English",
        "predicted_intent": "greeting",
        "response": "Hello!",
    }


@patch("app.services.openai_pipeline.classifier._client")
def test_rejects_unknown_intent(mock_client):
    mock_client.chat.completions.create.return_value = _make_completion(
        '{"detected_language": "English", "predicted_intent": "not_a_real_intent", "response": "Hi"}'
    )
    with pytest.raises(OpenAIPipelineError, match="unknown intent"):
        classify_and_respond("Hello")


@patch("app.services.openai_pipeline.classifier._client")
def test_rejects_empty_response_field(mock_client):
    mock_client.chat.completions.create.return_value = _make_completion(
        '{"detected_language": "English", "predicted_intent": "greeting", "response": "  "}'
    )
    with pytest.raises(OpenAIPipelineError, match="empty response"):
        classify_and_respond("Hello")


@patch("app.services.openai_pipeline.classifier._client")
def test_rejects_invalid_json(mock_client):
    mock_client.chat.completions.create.return_value = _make_completion(
        "this is not json"
    )
    with pytest.raises(OpenAIPipelineError, match="invalid JSON"):
        classify_and_respond("Hello")


@patch("app.services.openai_pipeline.classifier._client")
def test_rejects_empty_content(mock_client):
    mock_client.chat.completions.create.return_value = _make_completion("")
    with pytest.raises(OpenAIPipelineError, match="empty response"):
        classify_and_respond("Hello")


@patch("app.services.openai_pipeline.classifier._client")
def test_wraps_network_or_api_errors(mock_client):
    mock_client.chat.completions.create.side_effect = ConnectionError("network down")
    with pytest.raises(OpenAIPipelineError, match="OpenAI request failed"):
        classify_and_respond("Hello")
