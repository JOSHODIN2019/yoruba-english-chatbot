# Intelligent Chatbot with Yoruba/English Language Understanding

A web-based chatbot that understands English, Yoruba, and mixed
English/Yoruba messages: it preprocesses a message, identifies its
language, predicts its intent using a trained Logistic Regression model,
and selects a matching predefined response, with the full prediction
process shown transparently to the user.

This is a final-year academic project, built with the discipline of a
maintainable software product. See `PROJECT_RULES.md` for the full
engineering handbook and `PROJECT_MEMORY.md` for what has actually been
built so far.

## Project Status

See `PROJECT_MEMORY.md` for the authoritative, up-to-date stage-by-stage
record. As of this writing, the full stack is built and working
end-to-end: the notebook's ML pipeline has been extracted into a FastAPI
backend, and a React chat interface (with dataset/model/intent-catalogue
information screens) talks to it live. Some review stages still need a
human in a real browser: see "What Still Needs Human Review" below
before treating this as launch-ready.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide icons
- **Backend**: Python, FastAPI, Uvicorn, Pydantic
- **Machine Learning**: pandas, scikit-learn (TF-IDF + Logistic
  Regression), NLTK

See `docs/ARCHITECTURE.md` for the full system design and rationale.

## Project Structure

```
frontend/    React + TypeScript + Vite + Tailwind chat application
backend/     FastAPI application, services, and tests
notebooks/   Original ML pipeline notebook (source of truth for the model)
scripts/     extract_pipeline_artifacts.py - regenerates models/ and
             data/*.json from the notebook
data/        Source dataset + generated JSON artifacts (intents,
             preprocessing config, dataset/model metadata)
models/      Persisted model artifacts (fitted TF-IDF vectorizer,
             trained Logistic Regression model)
design-references/   UI inspiration, if supplied (none yet - the app
             uses the Gemini-inspired fallback design system from
             PROJECT_RULES.md Section 8)
docs/        Project documentation
```

## Local Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+ with `pip`

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload --port 8000
```

Verify it's running:

```bash
curl http://127.0.0.1:8000/health
# {"status":"ok"}
```

Interactive API docs: `http://127.0.0.1:8000/docs`.

If `models/*.joblib` or `data/*.json` are missing (they're gitignored,
regenerable, not hand-maintained), generate them first:

```bash
python3 scripts/extract_pipeline_artifacts.py
```

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local URL it's running on (it picks the next free port
starting from 5173 if that one's taken, and the backend's CORS is configured
to accept any `localhost`/`127.0.0.1` port automatically, so this doesn't
need manual reconfiguration).

Open the printed URL. The chat, dataset info, model info, intent
catalogue, and "How it works" screens are all reachable from the sidebar.
**The frontend needs the backend running to do anything beyond render.
Start the backend first.**

### Environment Variables

Copy `.env.example` to `.env` (project root) and adjust as needed:

```bash
cp .env.example .env
```

`VITE_API_BASE_URL` controls where the frontend looks for the backend;
defaults to `http://127.0.0.1:8000` if unset.

`OPENAI_API_KEY`: the chat endpoint uses OpenAI to detect language,
classify intent, and write replies. Fill this in to enable it. Leave it
blank and the backend automatically falls back to the local TF-IDF +
Logistic Regression pipeline instead, no other configuration needed
(this also happens automatically at runtime if a request to OpenAI ever
fails, so the chatbot never fully breaks). `OPENAI_MODEL` defaults to
`gpt-4o-mini`; override it if that model isn't available on your account.

### Notebook

The original ML pipeline can be opened and run independently in Jupyter:

```bash
cd notebooks
jupyter notebook yoruba_english_chatbot_ml_pipeline.ipynb
```

It reads its dataset from `../data/RAPH dataset.csv` relative to its own
location, so keep `notebooks/` and `data/` alongside each other. If you
change the notebook's pipeline logic, re-run
`scripts/extract_pipeline_artifacts.py` afterward so the backend picks up
the change, since it does not read the notebook at request time.

### Running Tests

```bash
cd backend
python3 -m pytest tests/ -v
```

```bash
cd frontend
npm run build   # includes a full TypeScript check
npm run lint
```

## What Still Needs Human Review

Built without browser-automation tooling, so the following were verified
as thoroughly as possible without one (see `PROJECT_MEMORY.md` for exactly
what was checked) but still need a human to confirm in an actual browser
before this is considered launch-ready:

- Visual appearance against your own taste/expectations (no reference
  design was supplied, so the Gemini-inspired fallback in
  PROJECT_RULES.md Section 8 was implemented from its text description,
  not verified pixel-for-pixel against a screenshot)
- Manual click-through of every user flow (new chat, send message,
  switch conversations, delete conversation, navigate between all 5
  screens, toggle theme, resize to mobile width) in a real browser
- Actual mobile/tablet device testing (responsive classes were written
  and reasoned through, not visually confirmed at each breakpoint)
- Screen reader testing (semantic HTML and ARIA attributes were added
  throughout, but not run through an actual screen reader)

## Documentation

- `PROJECT_RULES.md`: engineering handbook, requirements, and stage
  roadmap (source of truth for scope and process)
- `PROJECT_MEMORY.md`: running record of what has been built, decided,
  and tested, stage by stage
- `docs/ARCHITECTURE.md`: system architecture and technology rationale
