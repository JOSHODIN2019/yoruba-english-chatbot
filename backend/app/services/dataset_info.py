"""Dataset metadata service (Stage 17). Exposes the real, verified dataset
statistics produced by scripts/extract_pipeline_artifacts.py - nothing here
is computed on the fly or estimated."""
import json
from pathlib import Path

_DATA_DIR = Path(__file__).resolve().parents[3] / "data"

with open(_DATA_DIR / "dataset_metadata.json", encoding="utf-8") as f:
    _dataset_metadata = json.load(f)


def get_dataset_info() -> dict:
    return _dataset_metadata
