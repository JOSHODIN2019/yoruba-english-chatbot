"""Intent catalogue service (Stage 19). Exposes the 150 defined intents
(name, category, description) for the frontend's intent catalogue screen.
Reuses the same data/intents.json that response_selection reads from, so
the catalogue can never drift out of sync with what the chatbot can
actually respond to."""
import json
from pathlib import Path

_DATA_DIR = Path(__file__).resolve().parents[3] / "data"

with open(_DATA_DIR / "intents.json", encoding="utf-8") as f:
    _intents = json.load(f)


def get_intent_catalogue() -> list[dict]:
    return [
        {
            "intent": name,
            "category": spec["category"],
            "description": spec["description"],
        }
        for name, spec in sorted(_intents.items())
    ]
