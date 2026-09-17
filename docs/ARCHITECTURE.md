# Architecture

## System Overview

The Yoruba/English chatbot is a client-server web application with three
layers:

```
┌─────────────────────┐      HTTP/JSON       ┌──────────────────────┐
│  Frontend (React)    │ ───────────────────> │  Backend (FastAPI)   │
│  frontend/src/       │ <─────────────────── │  backend/app/        │
└─────────────────────┘                       └───────────┬──────────┘
                                                            │
                                               loads at startup
                                                            │
                                               ┌────────────▼──────────┐
                                               │  ML Pipeline Artifacts │
                                               │  models/  data/       │
                                               │  (extracted from the  │
                                               │  notebook, see below) │
                                               └────────────────────────┘
```

- **Frontend**: React + TypeScript + Vite, styled with Tailwind CSS. Sends
  a user's message to the backend and displays the response.
- **Backend**: FastAPI. Hosts the ML pipeline as a set of services and
  exposes them over a small JSON API.
- **ML Pipeline**: Originally built and verified in
  `notebooks/yoruba_english_chatbot_ml_pipeline.ipynb`. Its logic
  (preprocessing, language detection, TF-IDF + Logistic Regression intent
  classification, response selection) will be extracted into
  `backend/app/services/` so the backend can reuse it without depending on
  a running Jupyter kernel.

## Why Each Technology

| Technology | Why |
|---|---|
| React + TypeScript | Component-based UI with type safety; large ecosystem; matches the approved stack in PROJECT_RULES.md. |
| Vite | Fast dev server and build tool for the React app; no separate bundler config needed. |
| Tailwind CSS | Utility-first styling that keeps design tokens (spacing, color, radius) consistent across components without hand-rolled CSS sprawl, needed for the "polished modern product interface" requirement. |
| FastAPI | Python web framework with automatic request validation (via Pydantic) and interactive API docs, so the ML pipeline (already in Python) can be served without a language switch. |
| Uvicorn | ASGI server that actually runs the FastAPI application. |
| Pydantic | Typed request/response schemas: catches malformed requests before they reach the ML pipeline. |
| pandas / scikit-learn / NLTK | Already used throughout the existing, verified ML pipeline notebook; reused as-is rather than rewritten in a different stack. |
| joblib | Standard way to persist a fitted scikit-learn model + TF-IDF vectorizer to disk, so the backend can load them once at startup instead of retraining on every request. |
| openai | Primary chat pipeline (intent, language, and reply generation in one structured call). See "Data Flow" below for how it relates to the local ML pipeline. |
| python-dotenv | Loads `OPENAI_API_KEY`/`OPENAI_MODEL` from the project-root `.env` file at backend startup. |

## Data Flow (Runtime Prediction)

As of the OpenAI integration (see `PROJECT_MEMORY.md`), there are two
pipelines behind `POST /api/chat/predict`, tried in order. The response
shape returned to the frontend is identical either way - the frontend
cannot tell which one answered.

```
User message (frontend)
        │  POST /api/chat/predict
        ▼
FastAPI endpoint (backend/app/api/chat.py)
        │
        ├──> PRIMARY: OpenAI pipeline (backend/app/services/openai_pipeline/)
        │    One structured call returns detected_language, predicted_intent
        │    (constrained to the same 150-intent catalogue below - it can
        │    never invent a label the rest of the app doesn't know), and a
        │    short written response, all in the detected language.
        │
        │    If this fails for ANY reason (no API key configured, network
        │    error, rate limit, invalid output) ──┐
        │                                          ▼
        └──> FALLBACK: local ML pipeline (original, still fully intact)
             │
             ├──> Preprocessing service (clean, lowercase, stop-word/
             │    frequent-word/rare-word removal, tokenize, stem, lemmatize)
             │
             ├──> Language detection service (rule-based: Yoruba diacritics +
             │    keyword lists, runs on the ORIGINAL message, independent of
             │    the intent classifier)
             │
             ├──> Intent classification service (TF-IDF transform using the
             │    already-fitted vectorizer, then Logistic Regression predict;
             │    the vectorizer is never refitted at request time)
             │
             └──> Response selection service (looks up a predefined response
                  by (predicted_intent, detected_language))
        │
        ▼
JSON response → frontend displays message, language, intent, response
```

**Why the local pipeline was kept rather than deleted**: it is still the
actual academic deliverable this project demonstrates (the original
notebook brief explicitly required TF-IDF + Logistic Regression only, no
LLMs), it guarantees the chatbot keeps working even if OpenAI is
unreachable or unconfigured, and it matches PROJECT_RULES.md Section 18's
own adapter-based-architecture guidance for exactly this kind of future
integration.

## Why Language Detection and Intent Classification Are Separate Services

These are two independent processes, not one combined step:

- **Language detection** is deterministic rule-based logic. It has no
  training data, no model file, and does not depend on the intent
  classifier's output.
- **Intent classification** is the trained Logistic Regression model. It
  does not know or care what language the message is in. It only sees
  TF-IDF features.

Keeping them as separate backend services (`language_detection/` and
`intent_classification/`) means either one can be changed, tested, or
replaced independently, e.g. swapping in a future ML-based language
detector (see PROJECT_RULES.md Section 18, `LanguageDetectorInterface`)
without touching intent classification at all.

## Project Structure

See the top-level layout in `PROJECT_RULES.md` Section 7 and the current
state in `PROJECT_MEMORY.md`. In short:

- `frontend/`: React + TS + Vite + Tailwind application
- `backend/`: FastAPI application and services
- `notebooks/`: the original, verified ML pipeline notebook (kept as the
  reference/source of truth for the pipeline's logic and results)
- `data/`: source dataset (RAPH dataset.csv)
- `models/`: persisted model artifacts (fitted TF-IDF vectorizer,
  trained Logistic Regression model), once extracted from the notebook
- `design-references/`: any UI inspiration supplied by the project owner
- `docs/`: this file and other project documentation
