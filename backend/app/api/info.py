"""Read-only informational endpoints for the frontend's dataset/model/
intent-catalogue screens (PROJECT_RULES.md Section 8, "Information
Views"). Each endpoint is a thin wrapper around its corresponding
service - "Use only verified project data" per that same section, so no
logic beyond reading the already-verified JSON artifacts lives here."""
from fastapi import APIRouter

from app.services.dataset_info import get_dataset_info
from app.services.intent_catalogue import get_intent_catalogue
from app.services.model_info import get_model_info

router = APIRouter(prefix="/api", tags=["info"])


@router.get("/dataset/info")
def dataset_info() -> dict:
    return get_dataset_info()


@router.get("/model/info")
def model_info() -> dict:
    return get_model_info()


@router.get("/intents")
def intent_catalogue() -> list[dict]:
    return get_intent_catalogue()
