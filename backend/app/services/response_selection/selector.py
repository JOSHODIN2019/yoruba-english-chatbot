"""
Response selection service, extracted from
notebooks/yoruba_english_chatbot_ml_pipeline.ipynb (Stage 9.2).

Selects an existing predefined response by (predicted_intent,
detected_language) - never generates a new sentence (see
PROJECT_RULES.md Section 5.4 and Section 11: "Do not use an external LLM
to invent responses").
"""
import json
from pathlib import Path

_DATA_DIR = Path(__file__).resolve().parents[4] / "data"

with open(_DATA_DIR / "intents.json", encoding="utf-8") as f:
    _intents = json.load(f)

_RESPONSE_FIELD_BY_LANGUAGE = {
    "English": "response_english",
    "Yoruba": "response_yoruba",
    "Mixed": "response_mixed",
}


def select_response(intent: str, language: str) -> str:
    """Looks up a predefined response for (intent, language). Falls back
    to the English response if the intent or language pairing is somehow
    not found, per PROJECT_RULES.md Section 5.4's documented-fallback
    requirement - this should not normally happen, since the classifier
    only ever predicts one of the 150 known intents."""
    spec = _intents.get(intent)
    if spec is None:
        return "Sorry, I'm not quite sure I understood that. Could you rephrase it?"
    field = _RESPONSE_FIELD_BY_LANGUAGE.get(language, "response_english")
    return spec.get(field, spec["response_english"])
