"""
Loads environment variables from the project-root .env file (not
backend/.env - the same file README.md tells the project owner to create
via `cp .env.example .env`), regardless of which directory uvicorn is
started from.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

_PROJECT_ROOT = Path(__file__).resolve().parents[3]
load_dotenv(_PROJECT_ROOT / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

# Whether the OpenAI-backed pipeline can be used at all. If this is False
# (no key configured), the API falls back to the local TF-IDF + Logistic
# Regression pipeline automatically - see app/api/chat.py.
OPENAI_ENABLED = bool(OPENAI_API_KEY)

# Comma-separated list of additional allowed CORS origins, for the
# deployed frontend (e.g. https://your-app.vercel.app). Local dev origins
# (any http://localhost:<port> or http://127.0.0.1:<port>) are always
# allowed separately in app/main.py regardless of this setting.
FRONTEND_URLS = [
    url.strip()
    for url in os.getenv("FRONTEND_URLS", "").split(",")
    if url.strip()
]
