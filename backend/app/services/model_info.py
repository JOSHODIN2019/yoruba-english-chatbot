"""Model metadata service (Stage 18). Exposes the real trained-model
configuration and real test-set evaluation metrics produced by
scripts/extract_pipeline_artifacts.py - never invented (see
PROJECT_RULES.md Section 17: "Invent evaluation results" is explicitly
forbidden)."""
import json
from pathlib import Path

_DATA_DIR = Path(__file__).resolve().parents[3] / "data"

with open(_DATA_DIR / "model_metadata.json", encoding="utf-8") as f:
    _model_metadata = json.load(f)


def get_model_info() -> dict:
    return _model_metadata
