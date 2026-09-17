"""
OpenAI-backed replacement for the local TF-IDF + Logistic Regression
pipeline: one structured call detects the language, classifies the
intent (constrained to the same 150-intent catalogue the local model
uses, so it can never invent a label the rest of the app doesn't know
about), and writes a short reply.

This module only classifies and writes text - it does not touch
preprocessing, the local model, or response_selection at all. See
app/api/chat.py for how the two pipelines are wired together (OpenAI
first, local pipeline as an automatic fallback).
"""
import json
from pathlib import Path

from openai import OpenAI

from app.core.config import OPENAI_API_KEY, OPENAI_MODEL

_DATA_DIR = Path(__file__).resolve().parents[4] / "data"

with open(_DATA_DIR / "intents.json", encoding="utf-8") as f:
    _intents: dict = json.load(f)

_INTENT_NAMES = sorted(_intents.keys())

_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


def _build_intent_reference() -> str:
    """One line per intent with its description and example responses, so
    the model has real grounding for both correct classification and
    reply style/length/tone - not just a bare list of label names."""
    lines = []
    for name in _INTENT_NAMES:
        spec = _intents[name]
        lines.append(
            f'- {name}: {spec["description"]}\n'
            f'  EN example: "{spec["response_english"]}"\n'
            f'  YO example: "{spec["response_yoruba"]}"'
        )
    return "\n".join(lines)


_SYSTEM_PROMPT = f"""You are the classification and reply engine behind a Yoruba/English chatbot.

For every user message, determine:
1. detected_language: exactly one of "English", "Yoruba", or "Mixed" (Mixed means the message genuinely combines both languages, not just a loanword).
2. predicted_intent: exactly one label from the allowed list below. Choose the single closest match. Never invent a new label.
3. response: a short, simple reply in the same language as detected_language (or naturally mixing both if Mixed). Keep it brief and natural, similar in length and tone to the example responses shown for that intent. Do not be verbose, flowery, or add anything the user didn't ask about.

Allowed intents (label: description, with example responses for tone and length reference):

{_build_intent_reference()}
"""

_RESPONSE_SCHEMA = {
    "type": "json_schema",
    "json_schema": {
        "name": "chatbot_classification",
        "schema": {
            "type": "object",
            "properties": {
                "detected_language": {
                    "type": "string",
                    "enum": ["English", "Yoruba", "Mixed"],
                },
                "predicted_intent": {"type": "string", "enum": _INTENT_NAMES},
                "response": {"type": "string"},
            },
            "required": ["detected_language", "predicted_intent", "response"],
            "additionalProperties": False,
        },
        "strict": True,
    },
}


class OpenAIPipelineError(Exception):
    """Raised whenever the OpenAI pipeline cannot produce a usable result,
    so the caller (app/api/chat.py) can fall back to the local pipeline."""


def classify_and_respond(message: str) -> dict:
    if _client is None:
        raise OpenAIPipelineError("OPENAI_API_KEY is not configured")

    try:
        completion = _client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": message},
            ],
            response_format=_RESPONSE_SCHEMA,
            temperature=0.3,
        )
    except Exception as exc:  # network errors, auth errors, rate limits, etc.
        raise OpenAIPipelineError(f"OpenAI request failed: {exc}") from exc

    raw_content = completion.choices[0].message.content
    if not raw_content:
        raise OpenAIPipelineError("OpenAI returned an empty response")

    try:
        result = json.loads(raw_content)
    except json.JSONDecodeError as exc:
        raise OpenAIPipelineError(f"OpenAI returned invalid JSON: {exc}") from exc

    if result.get("predicted_intent") not in _intents:
        raise OpenAIPipelineError(
            f"OpenAI returned an unknown intent: {result.get('predicted_intent')!r}"
        )
    if not result.get("response", "").strip():
        raise OpenAIPipelineError("OpenAI returned an empty response field")

    return result
