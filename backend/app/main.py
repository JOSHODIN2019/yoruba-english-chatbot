"""FastAPI application entry point.

Stage 20 (Backend application bootstrap): wires the routers built on top
of the Stage 9-19 service layer into one app, alongside the Stage 6
health check.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import chat, info
from app.core.config import FRONTEND_URLS

app = FastAPI(title="Yoruba/English Chatbot API")

# Vite picks the next free port when its default (5173) is already taken
# by another project, so a hardcoded port list breaks CORS unpredictably
# (confirmed: this happened during Stage 27 testing, on port 5180). Match
# any localhost/127.0.0.1 dev port instead, and separately allow whatever
# deployed frontend origin(s) are configured via FRONTEND_URLS (e.g. the
# Vercel deployment URL) - both local dev and production work at once.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_origins=FRONTEND_URLS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(info.router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
