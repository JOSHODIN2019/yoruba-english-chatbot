# PROJECT_MEMORY.md

Persistent memory for the Intelligent Chatbot with Yoruba/English Language
Understanding project. Read before every stage; updated after every approved
stage, per PROJECT_RULES.md Section 13.

---

## Baseline: Existing ML Pipeline (Pre-existing, Verified)

Before Stage 1, an ML pipeline notebook already existed, built and verified in
an earlier session. These facts were re-confirmed by actually running the
notebook end-to-end during Stage 1, not assumed:

- Final dataset: 9,460 messages
- Unique intents: 150
- Training messages: 7,568 (80%)
- Testing messages: 1,892 (20%), stratified split, `random_state=42`
- TF-IDF features: 625
- Intent classifier: Logistic Regression (`lbfgs` solver, L2 penalty, C=1.0),
  converges in 18 iterations
- Language identification: rule-based (Yoruba diacritics + keyword lists),
  no ML model, runs independently of intent classification
- Response generation: predefined responses, looked up by
  `(predicted_intent, detected_language)`
- Main dataset fields: `text`, `language`, `intent`, `response`
- Test-set evaluation (weighted average): Accuracy 95.19%, Precision 95.80%,
  Recall 95.19%, F1-score 95.01%
- Dataset composition: 4,617 Yoruba, 4,327 English, 516 Mixed-language
  messages. Of the English messages, 88 were mined directly from the
  411,408-row RAPH source corpus (keyword-matched to 11 topic intents); the
  remaining messages are template-generated / hand-written examples across
  150 intents, since the source corpus has no intent labels of its own.

This pipeline exists only inside `notebooks/yoruba_english_chatbot_ml_pipeline.ipynb`
as sequential cells. None of it has been extracted into reusable backend
services yet. That is scoped to Stage 10 onward (Preprocessing-service
extraction) per the roadmap.

---

## Stage 1: Repository Inspection & Project Memory Setup

Status: Complete
Date: 2026-09-17

### Completed
- Inspected the existing repository: confirmed only the ML notebook, source
  dataset, and governance docs (CLAUDE.md, PROJECT_RULES.md) existed.
- Reorganized the project root into the structure defined in
  PROJECT_RULES.md Section 7, per explicit project-owner approval.
- Created this file (PROJECT_MEMORY.md) as the project's persistent memory.

### Files Changed
- `notebooks/yoruba_english_chatbot_ml_pipeline.ipynb`: moved from project
  root. Internal dataset path updated from `"RAPH dataset.csv"` to
  `"../data/RAPH dataset.csv"` to match its new location, and the change was
  verified by re-running the full notebook end-to-end (identical results:
  7,568/1,892 split, 625 features, same accuracy).
- `data/RAPH dataset.csv`: moved from project root.
- `PROJECT_MEMORY.md`: new.

### Folder Structure Created
```
frontend/src/{app,components,features/{chat,history,dataset,model,intents},hooks,services,styles,types}
backend/app/{api,core,schemas,ml}
backend/app/services/{preprocessing,language_detection,intent_classification,response_selection}
backend/tests
data/  models/  notebooks/  scripts/  tests/  design-references/shared/  docs/
```
Only empty directory skeletons were created for `frontend/` and `backend/`. No placeholder code (`main.tsx`, `main.py`, etc.) was added, since writing
that code is scoped to later approved stages (Stage 20: Backend application
bootstrap; Stage 28: Frontend application shell), not Stage 1.

### Reusable Components
- None yet, since no frontend or backend code has been written.

### Services and APIs
- None yet.

### Data and Model Changes
- No changes to the dataset, model, or pipeline logic itself, only its file
  location and the one path reference that depended on it.

### Design Decisions
- Adopted the full PROJECT_RULES.md Section 7 layout immediately (rather
  than deferring folder creation until each stage needs it), per explicit
  project-owner approval when asked.
- Kept `frontend/` and `backend/` as empty skeletons only, to avoid
  pre-writing implementation that hasn't been scoped or approved yet.

### Tests
- Full notebook re-executed end-to-end after the file move (all 65 cells,
  substituting the interactive `input()` call for the automated check).
  Result: no errors, identical output to pre-move baseline.

### Known Issues
- None identified.

### Next Steps
- Stage 2: Requirements Confirmation. Confirm scope details with the
  project owner (UI inspiration availability, any additional requirements
  beyond PROJECT_RULES.md) before proceeding further.

---

## Stages 2-8: Discovery and Foundation

Status: Complete
Date: 2026-09-17

Note: the project owner gave blanket approval ("go ahead with all
stages") to proceed through the roadmap without a stop-and-approve cycle
after every individual stage. Per-stage work is still separately recorded
below for traceability. No UI inspiration or additional requirements were
provided when asked; Stage 5 proceeds using the Gemini-inspired fallback
design system in PROJECT_RULES.md Section 8.

### Stage 2: Requirements Confirmation
PROJECT_RULES.md was treated as the confirmed, complete requirements
source; no additional requirements were supplied. No PROJECT_MEMORY.md
conflicts found.

### Stage 3: Existing Notebook and Artefact Audit
Carried forward from Stage 1's baseline section above (re-verified, not
re-audited from scratch): 9,460 messages, 150 intents, 625 TF-IDF
features, Logistic Regression classifier, rule-based language ID,
predefined-response lookup.

### Stage 4: Architecture Proposal
Created `docs/ARCHITECTURE.md`: system overview (React frontend ↔ FastAPI
backend ↔ extracted ML pipeline), technology rationale table, runtime data
flow diagram, and explicit confirmation that language detection and intent
classification are separate backend services (per PROJECT_RULES.md
Section 5.2/5.3).

### Stage 5: Design-Reference Collection
No screenshots, Figma files, or reference CSS were supplied. Documented
decision: later UI stages will use the Gemini-inspired structure described
in PROJECT_RULES.md Section 8 as the fallback design system, per Section 4.
`design-references/shared/` exists and is ready to receive material
whenever it's provided.

### Stage 6: Development-Environment Setup
- `git init` run in the project root (no commits made; commits only
  happen when explicitly requested).
- Created root `.gitignore` (node_modules, Python caches, `.env`, build
  output, the large CSV dataset and model artifacts, editor/OS files) and
  `.env.example` (backend host/port, CORS origin, frontend API base URL).
- **Frontend**: scaffolded via `npm create vite@latest -- --template
  react-ts`, then merged into the existing `frontend/` structure
  (`main.tsx` → `src/`, `App.tsx`/`App.css` → `src/app/`, `index.css` →
  `src/styles/`, fixing import paths accordingly). Replaced the default
  Vite counter demo in `App.tsx` with a minimal environment-check
  placeholder, since the real chat UI is design-gated to a later stage.
  Installed Tailwind CSS v4 + `@tailwindcss/vite`, wired into
  `vite.config.ts`, and reduced `src/styles/index.css` to a bare
  `@import "tailwindcss"` (no invented design tokens; those belong to the
  later "Design tokens and typography" stage). `npm install` completed (0
  vulnerabilities); `npm run build` succeeds; dev server was booted and
  its HTML output was fetched with `curl` and confirmed correct (title,
  root div, `main.tsx` returns HTTP 200) before being stopped.
- **Backend**: created `backend/app/main.py` (FastAPI app, CORS
  middleware for the frontend's dev ports, single `/health` endpoint),
  `__init__.py` in every `app/` subpackage, and `backend/requirements.txt`
  (fastapi, uvicorn, pydantic pinned to installed versions; pandas,
  scikit-learn, nltk, joblib, pytest, httpx for later stages). Booted with
  `uvicorn app.main:app` and confirmed with `curl`: `/health` returned
  `{"status":"ok"}`, `/docs` returned HTTP 200, then stopped.

### Stage 7: Project-Memory Setup
Already established in Stage 1; this entry format continues that record.

### Stage 8: Base README and Project Documentation
Created root `README.md`: project description, current-status pointer to
this file, tech stack, project structure, local setup instructions for
frontend/backend/notebook (all commands verified against what was actually
installed and tested above, not written speculatively), and links to
`PROJECT_RULES.md` / `PROJECT_MEMORY.md` / `docs/ARCHITECTURE.md`.

### Files Changed (Stages 2-8)
- `.gitignore`, `.env.example` (new)
- `frontend/`: `package.json`, `index.html`, `vite.config.ts`,
  `tsconfig*.json`, `.oxlintrc.json`, `public/favicon.svg`,
  `public/icons.svg`, `src/main.tsx`, `src/app/App.tsx`, `src/app/App.css`,
  `src/styles/index.css` (all new)
- `backend/app/main.py`, `backend/requirements.txt`, `__init__.py` files
  (all new)
- `docs/ARCHITECTURE.md`, `README.md` (new)

### Reusable Components
- None yet beyond the placeholder `App` component (will be replaced, not
  reused, once the real chat UI is built).

### Services and APIs
- `GET /health`: liveness check only. No feature endpoints yet.

### Data and Model Changes
- None.

### Design Decisions
- Tailwind CSS chosen over plain CSS modules (both were approved options
  in PROJECT_RULES.md) for the utility-first, design-token-friendly
  approach it gives later UI stages.
- Deliberately did not invent color palette / typography / spacing tokens
  during environment setup; real design tokens are scoped to a later,
  design-gated stage so they can reflect actual UI inspiration if/when
  it's supplied.

### Tests
- Frontend: `npm run build` (TypeScript compile + Vite build) succeeded.
  Dev server booted and its output verified via `curl` (HTTP 200, correct
  title/markup).
- Backend: server booted via `uvicorn`; `/health` and `/docs` verified via
  `curl` (correct JSON body, HTTP 200).
- Notebook (from Stage 1): re-ran end-to-end after relocation, identical
  results to pre-move baseline.

### Known Issues
- None identified.

### Next Steps
- Stage 9: Dataset and Response-Data Validation (start of ML Integration:
  extracting the notebook's pipeline logic into `backend/app/services/`).

---

## Stages 9-19: ML Integration

Status: Complete
Date: 2026-09-17

### Approach
Rather than hand-copying notebook code (risking silent drift), created
`scripts/extract_pipeline_artifacts.py`, which reads
`notebooks/yoruba_english_chatbot_ml_pipeline.ipynb` live via `nbformat` on
every run, executes every pipeline cell (excluding the interactive
`input()`/`user_message` cells), and persists the results as loadable
artifacts. Re-running this script after any future notebook change is the
supported way to keep the backend in sync, since there is no separate
hand-maintained copy of the pipeline logic to fall out of date.

**Real bug caught and fixed during this stage**: the first run of the
script hung indefinitely. Root cause: `plt.show()` inside the notebook's
Stage 8B evaluation cells tried to open a blocking interactive GUI window
with no event loop servicing it, since the script never set matplotlib to
a non-interactive backend (unlike the notebook's own Jupyter context,
which handles this automatically). Fixed with `matplotlib.use("Agg")`
before any pyplot import executes; re-ran successfully afterward with
identical results to the pre-fix baseline.

### Stage 9: Dataset and Response-Data Validation
Verified during artifact generation: all 150 intents have complete
English/Yoruba/Mixed responses (no missing fields), dataset totals exactly
match the previously-verified baseline (9,460 messages / 150 intents /
625 features / 95.19% accuracy), confirming the notebook has not drifted
since Stage 1.

### Stage 10: Preprocessing-Service Extraction
`backend/app/services/preprocessing/pipeline.py`: `clean_text`,
`lowercase_text`, stop-word/frequent-word/rare-word removal, `tokenize`,
`stem_tokens`, `lemmatize_tokens`, and the combined
`preprocess_for_model()` entry point. Loads the exact fitted stopword,
frequent-word, and rare-word sets from `data/preprocessing_config.json`
(never recomputes them) so behaviour matches the trained model exactly.

### Stage 11: Yoruba Unicode and Tone-Mark Validation
Reused the notebook's combining-mark-preserving regex (with its
explanatory comment carried over) rather than rewriting it. Added a
regression test (`test_yoruba_diacritics_survive_preprocessing`) asserting
tone marks survive and the specific historical bug ("sọ rọ" instead of
"sọ̀rọ̀") does not reappear.

### Stage 12: Language-Detection Service
`backend/app/services/language_detection/detector.py`: `detect_language`,
kept rule-based per PROJECT_RULES.md Section 5.2, operates on the
*original* message (not preprocessed text), fully independent of intent
classification.

### Stage 13: TF-IDF Loading and Transformation Service
`backend/app/ml/model_loader.py`: loads `models/tfidf_vectorizer.joblib`
once at import time. No code path anywhere calls `.fit()` or
`.fit_transform()` on it, verified by
`test_vectorizer_is_never_refit`, which asserts the vocabulary size is
identical before and after a prediction call.

### Stage 14: Logistic Regression Intent-Classification Service
`backend/app/services/intent_classification/classifier.py`:
`predict_intent(processed_text)`, using the loaded
`models/intent_classifier.joblib`.

### Stage 15: Predefined Response-Selection Service
`backend/app/services/response_selection/selector.py`:
`select_response(intent, language)`, reading `data/intents.json`. Includes
the documented fallback required by PROJECT_RULES.md Section 5.4 for an
intent/language pairing that isn't found (should not occur in practice,
since the classifier only predicts known intents).

### Stage 16: End-to-End ML Pipeline Test
`backend/tests/test_pipeline_end_to_end.py`, run via `pytest`: 7 tests, all
passing. Covers the same worked examples already verified in the notebook
(Hello → greeting/English; Kí ni orúkọ rẹ? → ask_bot_name/Yoruba; Please
jọ̀ọ́ help me → asking_for_help/Mixed; two more), plus the diacritic
regression test and the never-refit test above.

### Stage 17: Dataset Metadata Service
`backend/app/services/dataset_info.py`: `get_dataset_info()`, reading
`data/dataset_metadata.json` (total messages, language distribution,
per-intent example-count statistics, train/test split, source-dataset
mining counts).

### Stage 18: Model Metadata Service
`backend/app/services/model_info.py`: `get_model_info()`, reading
`data/model_metadata.json` (algorithm, solver, penalty, iterations to
converge, feature count, and the real test-set evaluation metrics).

### Stage 19: Intent Catalogue Service
`backend/app/services/intent_catalogue.py`: `get_intent_catalogue()`,
reading the same `data/intents.json` that response selection uses, so the
catalogue can never list an intent the chatbot can't actually respond to.

### Files Changed (Stages 9-19)
- `scripts/extract_pipeline_artifacts.py` (new)
- `models/tfidf_vectorizer.joblib`, `models/intent_classifier.joblib` (new,
  generated, gitignored, regenerable via the script above)
- `data/intents.json`, `data/preprocessing_config.json`,
  `data/dataset_metadata.json`, `data/model_metadata.json` (new,
  generated, gitignored)
- `backend/app/services/preprocessing/pipeline.py`
- `backend/app/services/language_detection/detector.py`
- `backend/app/ml/model_loader.py`
- `backend/app/services/intent_classification/classifier.py`
- `backend/app/services/response_selection/selector.py`
- `backend/app/services/dataset_info.py`, `model_info.py`,
  `intent_catalogue.py`
- `backend/tests/test_pipeline_end_to_end.py`

### Reusable Components
- All six service modules above are the reusable building blocks the
  Backend stages (20-27) will wire into actual API endpoints.

### Services and APIs
- Service layer complete; no HTTP endpoints wired to them yet (next).

### Data and Model Changes
- No changes to the trained model or dataset; this stage only extracted
  and persisted what the notebook already produced.

### Design Decisions
- Chose "read the notebook live via nbformat" over "hand-copy the code
  once" specifically to eliminate drift risk between the notebook (the
  documented source of truth per PROJECT_RULES.md) and the backend.
- Kept preprocessing, language detection, and intent classification as
  three separate modules/services (not one combined function), matching
  the architecture decision in `docs/ARCHITECTURE.md` and enabling
  independent testing/replacement of each.

### Tests
- `pytest backend/tests/test_pipeline_end_to_end.py -v`: 7/7 passed.
- Manual verification of all three metadata services against known real
  values (9,460 messages, 95.19% accuracy, 150 catalogue entries).

### Known Issues
- A path-depth bug (`parents[N]` off-by-one) was introduced across five of
  the six new service files on first write, caught immediately by the
  first test run (`FileNotFoundError`) rather than silently producing
  wrong behaviour, and fixed before proceeding. No open issues remain.

### Next Steps
- Stage 20: Backend Application Bootstrap. Wire these services into real
  FastAPI endpoints (chat prediction, dataset/model/intent-catalogue
  info), replacing the Stage 6 placeholder `/health`-only app.

---

## Stages 20-27: Backend

Status: Complete
Date: 2026-09-17

### Stage 20: Backend Application Bootstrap
`backend/app/main.py` updated to include the two new routers below
alongside the existing `/health` check.

### Stage 21: Health-Check Endpoint
Already existed from Stage 6; unchanged.

### Stage 22: Chat Prediction Endpoint
`backend/app/api/chat.py`: `POST /api/chat/predict`. Wires preprocessing →
language detection → intent classification → response selection behind
one HTTP contract, matching the example shape in PROJECT_RULES.md Section
9 exactly (`original_message`, `detected_language`, `predicted_intent`,
`response`, `processing.preprocessed_text`).

### Stage 23: Request and Response Schemas
`backend/app/schemas/chat.py`: `ChatRequest` (message, 1-1000 chars;
Section 10's "reject empty or excessively large messages" enforced here),
`ChatResponse`, `ProcessingDetails`.

### Stage 24-26: Dataset / Model / Intent-Catalogue Endpoints
`backend/app/api/info.py`: `GET /api/dataset/info`, `GET /api/model/info`,
`GET /api/intents`. Thin wrappers over the Stage 17-19 services. No logic
duplicated here.

### Stage 27: Backend Unit and Integration Tests
`backend/tests/test_api_integration.py`, run via `pytest` +
`fastapi.testclient.TestClient`: 11 tests covering all 5 endpoints
(success cases for English/Yoruba/Mixed, empty/oversized/missing-field
rejection with 422, dataset/model/intent-catalogue correctness, and a CORS
preflight check for the frontend's dev origin). Combined with Stage 16's 7
tests: **18/18 passing**.

**Real bug caught and fixed during this stage**: the very first manual
`curl` test of the live server returned what looked like a working
`/health` response but 404 on every other route. Investigation found
`localhost:8000` was already occupied by an unrelated project
(`APPLYAI`'s own FastAPI server): this project's server had actually
failed to bind and exited immediately (`address already in use`), and the
"successful" `/health` response had been coming from the *other*
project's API the whole time, purely because it happens to expose the
same `{"status": "ok"}` shape. Re-ran on port 8010 instead and
re-verified every endpoint against the actually-correct server; the
unrelated process was left untouched throughout. This is a reminder to
always check for port conflicts before trusting a "successful" local
response.

### Files Changed (Stages 20-27)
- `backend/app/main.py` (routers wired in)
- `backend/app/schemas/chat.py` (new)
- `backend/app/api/chat.py`, `backend/app/api/info.py` (new)
- `backend/tests/test_api_integration.py` (new)

### Reusable Components
- N/A (backend has services and endpoints, not UI components).

### Services and APIs
- `GET /health`: liveness check
- `POST /api/chat/predict`: full chatbot prediction pipeline
- `GET /api/dataset/info`: dataset statistics
- `GET /api/model/info`: model configuration + real evaluation metrics
- `GET /api/intents`: 150-entry intent catalogue

### Data and Model Changes
- None.

### Design Decisions
- Kept endpoints as thin wrappers with zero business logic. Every actual
  decision (preprocessing rules, language detection, classification,
  response lookup) lives in the Stage 9-19 service layer, so the API
  layer can be changed (routes, versioning, auth later) without touching
  ML logic, and vice versa.

### Tests
- `pytest backend/tests/ -v`: **18 passed**, 0 failed (1 unrelated
  deprecation warning about a future `httpx`/`starlette` version, not
  actionable now).
- Manually verified every endpoint live via `curl` on port 8010 before
  writing the automated tests, including both rejection cases (empty
  message, 1001-character message).

### Known Issues
- None blocking. Noted for awareness: `starlette.testclient` currently
  warns that `httpx` will be replaced by `httpx2` in a future version,
  not an issue today, just something to revisit if that migration
  happens upstream.

### Next Steps
- Stage 28: Frontend Application Shell (start of Frontend Foundation).
  This is where UI inspiration becomes relevant. Still none has been
  supplied, so this and subsequent visual stages will use the
  Gemini-inspired fallback design system from PROJECT_RULES.md Section 8
  unless inspiration arrives first.

---

## Stages 28-55: Frontend, Quality, and Handover

Status: Complete (explicit human-review gaps noted below; see
"Known Issues")
Date: 2026-09-17

No UI inspiration was ever supplied. All visual work below implements the
Gemini-inspired fallback described in PROJECT_RULES.md Section 8 from its
text description (spacious workspace, left sidebar, rounded composer,
minimal visual noise, light/dark themes). It has not been visually
compared against a screenshot, since no browser-automation/screenshot
tool is available in this environment. This was flagged to the project
owner before this batch of stages began.

### Stage 28: Frontend Application Shell
`src/app/App.tsx` rewritten from the Stage 6 placeholder into the real
shell: `ThemeProvider` wrapping an `AppShell` that renders `Sidebar` +
a main content area switching between 5 views via local React state
(`AppView` type). No router library was added, since one wasn't in the
approved stack and a router is unnecessary complexity for a 5-view SPA.

### Stage 29: Design Tokens and Typography
`src/styles/tokens.css`: full token set (surfaces, text, accent, semantic
colors, shadows, radii, spacing scale, typography, layout constants) for
light and dark, using a distinct indigo/violet accent (not Google's blue)
per the "no Google branding" requirement. Wired into Tailwind v4 via
`@theme inline` in `src/styles/index.css` so utility classes like
`bg-surface` / `text-accent` stay live CSS-variable references (required
for runtime theme switching) rather than baked-in build-time values.

### Stage 30: Light and Dark Mode
`src/app/theme-context.ts` + `src/app/ThemeProvider.tsx` +
`src/hooks/useTheme.ts`: resolves to `localStorage` preference if set,
else live system preference (`prefers-color-scheme`, tracked via a
`matchMedia` listener so it updates without reload); toggle button
persists an explicit choice. Context and provider deliberately split into
separate files after `oxlint` flagged a Fast Refresh warning for mixing
them.

### Stage 31-32: Sidebar Layout, Responsive Navigation and Mobile Drawer
`src/components/Sidebar.tsx`: app mark, new-chat button, conversation
history list (from Stage 42), 4 navigation links, theme toggle. Fixed
position sliding drawer on mobile (`md:` breakpoint switches to static
`translate-x-0`), with a scrim overlay and a hamburger button
(`SidebarMenuButton`) shown in a mobile-only header bar in `App.tsx`.

### Stage 33: New-Chat Interaction and Empty State
`src/features/chat/EmptyState.tsx` shown when the active conversation has
no messages yet; "New chat" button in the sidebar clears the active
conversation id without deleting any existing conversation.

### Stage 34-37: Composer, Message Components, Loading States
- `src/features/chat/ChatComposer.tsx`: auto-growing textarea, Enter to
  send / Shift+Enter for newline, 1000-character limit enforced
  client-side (mirroring the backend's Pydantic limit), disabled while a
  request is in flight.
- `src/features/chat/MessageBubble.tsx`: right-aligned accent-filled
  bubble for the user, left-aligned neutral bubble with an avatar for the
  assistant, expandable "Processing details" panel (detected language,
  predicted intent, preprocessed text) per PROJECT_RULES.md's "optional
  expandable processing-details panel" requirement.
- `src/features/chat/LoadingIndicator.tsx`: animated three-dot indicator
  with `role="status"`/`aria-live="polite"` while waiting for a reply.

### Stage 38: Frontend-Backend Integration
`src/services/api.ts`: typed `fetch` wrapper (`predictChat`,
`fetchDatasetInfo`, `fetchModelInfo`, `fetchIntentCatalogue`), reading the
API base URL from `VITE_API_BASE_URL`. `ChatView.tsx` wires this to the
composer and message list.

**Real bug caught and fixed during this stage**: initial CORS config
hardcoded `allow_origins` to ports 5173/5174. The actual dev server came
up on port 5180 (5173 was occupied by an unrelated project running
elsewhere on this machine), and a live CORS preflight test against
`backend/app/main.py` returned `400 Disallowed CORS origin`, confirmed
with `curl -i -X OPTIONS ... -H "Origin: http://localhost:5180"` before
being told to trust it. Fixed by switching to
`allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+"` so CORS
survives Vite picking any port, and re-verified the same preflight (and a
full POST) now succeed. All 18 backend tests re-run and still pass after
the change. Section 10 still requires this to be tightened to explicit
origins before any real deployment, noted in the code comment.

### Stage 39: Processing-Details Panel
Covered above under Stage 34-37 (`MessageBubble.tsx`).

### Stage 40: Error and Fallback States
`ChatView.tsx`: network/API failures caught via a typed `ApiError`
(distinguishing "couldn't reach the server" from a real HTTP error
response) and shown as a dismissible `role="alert"` banner above the
composer, without losing the user's message from the conversation. Info
screens (`InfoScreenStatus.tsx`) get the same treatment via a shared
`useFetch` hook (loading/error/data states).

### Stage 41: English, Yoruba, and Mixed Test Scenarios
Covered by the existing backend test suite (Stage 16/27), which already
exercises all three language cases through the real prediction pipeline
the frontend calls. No separate frontend-specific language test was
written, since the frontend does no language-specific logic itself. It
only displays whatever the backend returns.

### Stage 42-43: Anonymous Local History
`src/features/history/useConversationHistory.ts`: conversations persisted
to `localStorage` (matching PROJECT_RULES.md Section 9's schema:
id/title/created_at/updated_at/messages, with messages carrying
detected_language/predicted_intent/response_metadata). No accounts, no
server-side storage. Title auto-derived from the first message. Sidebar
supports selecting and deleting conversations (with a confirming hover-
revealed delete button, not delete-on-click-of-the-row).

### Stage 44-46: Dataset / Model / Intent-Catalogue Screens
`src/features/dataset/DatasetInfoView.tsx`,
`src/features/model/ModelInfoView.tsx`,
`src/features/intents/IntentCatalogueView.tsx`: each fetches its
respective backend endpoint and renders real returned data only (no
hardcoded numbers in the frontend): language-distribution bars, per-
intent statistics, evaluation metrics, model configuration, and a
searchable/filterable, category-grouped list of all 150 intents.

### Stage 47: Processing-Pipeline Explanation Screen
`src/features/pipeline/PipelineExplanationView.tsx`: static 5-step visual
walkthrough (preprocessing → language ID → TF-IDF → intent classification
→ response selection), matching the pipeline diagram in
`docs/ARCHITECTURE.md` and PROJECT_RULES.md Section 5.

### Stage 48: Accessibility Review
Real pass performed (not just written and assumed): semantic landmarks
(`<aside>`, `<nav>`, `<main>`, `<header>`), `aria-label` on all icon-only
buttons, `aria-current` on active nav/history items, `aria-expanded` on
the processing-details toggle, `aria-live`/`role="status"` on the loading
indicator, `role="alert"` on error banners, `sr-only` labels on unlabeled
inputs, reduced-motion support in `tokens.css`. **Caught and fixed a real
gap**: grep found `focus:outline-none` on two inputs (chat composer,
intent search): the composer already had a compensating
`focus-within:border-accent` on its parent, but the search input did not,
leaving keyboard users with zero visible focus indicator. Fixed by adding
the matching `focus-within` treatment. Verified no global CSS resets
`outline` anywhere else, so every button keeps its native focus ring.
**Not done**: actual screen-reader testing (no such tool available here).

### Stage 49: Responsive-Design Review
Sidebar collapses to an off-canvas drawer below the `md` breakpoint with
a scrim and hamburger trigger; grids in the info screens use `sm:` column
adjustments; message bubbles cap at 75% width so they never overflow on
narrow screens. This is reasoned-through from the Tailwind classes
written, cross-checked against `npm run build` succeeding. **It has not
been visually confirmed at real mobile/tablet viewport sizes**, since
there's no browser/screenshot tool available to do that here.

### Stage 50: Performance Review
Production build: 253.77 kB JS (78.67 kB gzipped), 20.47 kB CSS
(5.00 kB gzipped), reasonable for a 5-screen SPA with no code-splitting
yet. Not a blocking concern at this project's scale; noted as a possible
future optimization (route-based lazy loading) rather than acted on now,
since PROJECT_RULES.md says not to over-engineer the academic prototype.

### Stage 51: Security and Privacy Review
Grepped the entire frontend source for `dangerouslySetInnerHTML` (none
found: React's default escaping handles all user-message rendering
safely) and for hardcoded secrets/API keys (none found). Backend:
Pydantic enforces 1-1000 character message length before anything reaches
the ML pipeline (verified live: empty and 1001-char payloads both return
422); CORS restricted to localhost dev origins only (see Stage 38 fix);
no user data leaves `localStorage` on the client; no PII collected or
logged anywhere in the pipeline.

### Stage 52: Full-System Testing
Automated: `pytest backend/tests/ -v` → 18/18 passing (unit + integration,
covering all 5 endpoints, all 3 languages, and validation edge cases).
Every new frontend module confirmed to transform without error via Vite's
dev server (`curl` against 20 source files, all HTTP 200) and the full
production build/lint both pass clean. Full request/response cycle
verified live end-to-end through the actual dev-server origin (not just
in isolation) after the Stage 38 CORS fix.
**Not done, and this is the main gap**: manual click-through testing in
an actual browser (new chat → send message → switch conversation →
delete conversation → navigate all 5 screens → toggle theme → resize to
mobile) has NOT been performed by anyone, human or automated, since no browser
automation tool is available here. This is explicitly called out in
`README.md`'s "What Still Needs Human Review" section rather than glossed
over.

### Stage 53: Academic Demonstration Preparation
Covered by the Stage 47 pipeline-explanation screen and the Stage 44-46
info screens, which together let a demonstration walk through: real
dataset statistics → real model configuration and evaluation metrics →
how a message actually flows through the system → a live chat exchange.

### Stage 54: README and Setup-Guide Completion
`README.md` rewritten in full: accurate current project status, complete
two-terminal (backend then frontend) setup instructions, environment
variable explanation, test-running instructions, and the explicit
"What Still Needs Human Review" section.

### Stage 55: Final Project Handover and Deployment Guidance
This project has no production deployment yet (out of scope per
PROJECT_RULES.md Section 1: "local execution using free technologies").
Handover consists of: this file (complete stage-by-stage build record),
`docs/ARCHITECTURE.md` (system design), and `README.md` (how to run and
test everything). Before any real deployment, `docs/ARCHITECTURE.md`
would need a new section covering hosting choices, environment-specific
CORS/config, and the adapter-based future-integration pattern already
described in PROJECT_RULES.md Section 18. Not written now, since no
deployment target has been chosen.

### Files Changed (Stages 28-55)
- `frontend/src/styles/tokens.css`, `index.css` (rewritten)
- `frontend/src/app/App.tsx` (rewritten), `ThemeProvider.tsx`,
  `theme-context.ts` (new); `App.css` deleted (superseded by Tailwind)
- `frontend/src/components/Sidebar.tsx`, `InfoScreenStatus.tsx`,
  `StatCard.tsx` (new)
- `frontend/src/features/chat/*` (6 files, new)
- `frontend/src/features/history/useConversationHistory.ts` (new)
- `frontend/src/features/dataset/DatasetInfoView.tsx` (new)
- `frontend/src/features/model/ModelInfoView.tsx` (new)
- `frontend/src/features/intents/IntentCatalogueView.tsx` (new)
- `frontend/src/features/pipeline/PipelineExplanationView.tsx` (new)
- `frontend/src/services/api.ts`, `hooks/useTheme.ts`, `hooks/useFetch.ts`
  (new)
- `frontend/src/types/chat.ts`, `info.ts`, `navigation.ts` (new)
- `frontend/src/vite-env.d.ts` (new, since it was missing from the Stage 6
  scaffold)
- `backend/app/main.py` (CORS fix)
- `README.md` (rewritten)

### Reusable Components
`Sidebar`, `SidebarMenuButton`, `StatCard`, `LoadingState`/`ErrorState`
(`InfoScreenStatus.tsx`), `MessageBubble`, `ChatComposer`,
`LoadingIndicator`, `EmptyState`, plus the `useTheme` and `useFetch` hooks,
all usable independently of the specific screens they were first built
for.

### Services and APIs
No new backend endpoints (all 5 from Stage 20-27 reused as-is). Frontend
`src/services/api.ts` is the single point of contact with the backend.

### Data and Model Changes
None.

### Design Decisions
- No router library: 5 views switched via local component state, since a
  router wasn't in the approved stack and would be unjustified complexity
  for this scope.
- CORS opened to any localhost port via regex rather than a fixed list,
  specifically because a fixed list already broke once during this same
  build (see Stage 38).
- Conversation history kept 100% client-side (`localStorage`), matching
  PROJECT_RULES.md Section 9's "no login → anonymous, local history"
  requirement exactly. No backend persistence layer was built or needed.

### Tests
- `pytest backend/tests/ -v`: 18/18 passing (re-confirmed after the CORS
  fix, not just before it).
- `npm run build` (TypeScript check + Vite build): passing.
- `npm run lint` (oxlint): 1 acceptable, documented warning (generic
  `useFetch` hook's dynamic deps array), 0 errors.
- Every new source file's Vite dev-server transform verified via direct
  `curl` requests (20/20 returned HTTP 200).
- Full chat request verified live through the actual frontend origin
  end-to-end (not mocked), both via direct `curl` with an `Origin` header
  and via the automated CORS preflight test.

### Known Issues
1. **No real-browser manual testing has been performed** (Stage 52's main
   gap): no click, hover, or visual state has been confirmed by a human
   or by browser automation. Everything reported above is verified at the
   build/compile/HTTP level, which is real but not equivalent to actually
   using the app.
2. **Visual design has not been compared to any reference**: implemented
   from PROJECT_RULES.md Section 8's text description only, since no
   design reference was ever supplied.
3. Responsive behavior and accessibility are implemented and reasoned
   through, but not confirmed at real device sizes or with a screen
   reader.
4. Bundle is not code-split; acceptable at current scale, worth revisiting
   if more screens are added later.

None of the above are silent: all four are also listed in `README.md`'s
"What Still Needs Human Review" section for visibility.

### Next Steps
All 55 roadmap stages have now been addressed to the extent possible
without browser-automation tooling or a supplied design reference. The
concrete next step is for the project owner to actually run both servers
and click through the app in a real browser, using the checklist in
`README.md`'s "What Still Needs Human Review" section, and report back
anything that needs fixing.

---

## Post-Launch Fixes (Human-Reported)

This is exactly the human-review step called for above, now happening.

### Bug: First Message Not Displayed After a Reply
Status: Fixed (took two attempts - see below)
Date: 2026-09-17

Reported by the project owner after actually using the app: the user's
first message in a new chat disappeared once the assistant's reply
arrived. This section documents both attempts honestly, including the
first one that turned out to still be broken.

**Root cause (part 1)**: `useConversationHistory.appendMessage` decided
whether to create a new conversation by reading the `activeConversationId`
state value from its own closure. `ChatView.handleSend` calls
`appendMessage` twice per turn (once for the user's message, once for the
assistant's reply after `await`ing the API). React state updates are not
synchronous, so the second call still saw the pre-update
`activeConversationId` (`null`) captured when `handleSend` started
running, causing it to create a *second*, separate conversation
containing only the assistant's reply and make that the active one,
silently stranding the user's message in the first, now-inactive
conversation.

**First fix attempt (incomplete)**: added `activeConversationIdRef` (a
`useRef`, always current, not subject to the closure-staleness that state
has) that `appendMessage` reads and writes instead of the state variable.
Verified with `npm run build`/`npm run lint` and a live transform check,
then reported as fixed. **This verification was insufficient** - no test
actually exercised the runtime behavior, only that the code compiled.

**The same bug reappeared**, reported again by the project owner in
identical terms. Root cause (part 2): the new ref-based fix still called
`setActiveConversationId(...)` and generated a fresh `crypto.randomUUID()`
**inside** the `setConversations` updater function. React's `StrictMode`
(active in `main.tsx`, wrapping the whole app) intentionally invokes
updater functions passed to `setState` **twice** in development, specifically
to catch impure updaters. Each invocation generated a *different* random
UUID; only one of the two resulting conversation objects survived into
the actual `conversations` array, but `activeConversationIdRef`/
`activeConversationId` could end up holding the *other* invocation's id,
which matched no conversation in the array at all - so
`activeConversation` was `null` and nothing rendered.

**Second fix (verified this time)**: moved `crypto.randomUUID()` and both
the ref write and `setActiveConversationId` call **outside** the
`setConversations` updater entirely, so the updater itself is pure (only
returns `[newConversation, ...prev]` using an object already constructed
before the updater runs) and safe to invoke twice.

**Verification (real this time)**: installed `vitest` + `@testing-library/react`
+ `jsdom` (already in the approved stack per PROJECT_RULES.md Section 6,
just never installed until now) and wrote
`useConversationHistory.test.ts`, rendering the hook inside
`<StrictMode>` (matching `main.tsx` exactly) and calling `appendMessage`
twice in a row, the same sequence `ChatView.handleSend` uses. Before
trusting the fix, the test was run against the **broken** version first
and confirmed to fail with `expected null not to be null` on
`activeConversation` - the exact symptom reported. Only after seeing it
fail correctly was the fix restored and the test re-run to confirm it
passes (2/2). `npm run build`, `npm run lint`, and `npm run test` all
clean afterward.

### Files Changed
- `frontend/src/features/history/useConversationHistory.ts`
- `frontend/src/features/history/useConversationHistory.test.ts` (new)
- `frontend/vite.config.ts` (added `test` config block)
- `frontend/package.json` (added `vitest`, `@testing-library/react`,
  `@testing-library/jest-dom`, `jsdom` as dev dependencies; added `test`
  script)

### Known Issues
- None for this bug specifically now - it has an automated regression
  test. The broader lesson (recorded here rather than quietly acted on):
  "the code compiles and transforms without error" is not equivalent to
  "the runtime behavior is correct," especially for anything involving
  `StrictMode`, async timing, or React state updater functions with side
  effects. Prefer an actual runtime test over a compile-only check when a
  fix's correctness depends on execution order or how many times a
  function runs.

---

## Architectural Change: OpenAI-Backed Chat Pipeline

Status: Complete (pending the project owner adding a real API key to test
live - see "Next Steps")
Date: 2026-09-17

This directly changes something PROJECT_RULES.md previously restricted
(Section 11: "Do not replace it with an LLM"; Section 17: "must not
Replace Logistic Regression with an LLM without approval"), so it is
recorded here explicitly as a deliberate, approved deviation, not a
silent one. The project owner requested this change directly and
answered two scoping questions before any code was written:
1. The interface (frontend, API request/response shape) must not change
   at all - OpenAI should "just work behind the scenes."
2. OpenAI should be responsible for all three of intent detection,
   language detection, AND writing the reply text (not just classification
   feeding into the existing predefined-response lookup).

### What Changed
- **New**: `backend/app/services/openai_pipeline/classifier.py`. One
  structured OpenAI chat-completion call per request returns
  `{detected_language, predicted_intent, response}` in a single step.
  The system prompt includes all 150 intents' names, descriptions, and
  example English/Yoruba responses (pulled from `data/intents.json`, the
  same file `response_selection` uses) so the model has real grounding
  for both correct classification and reply tone/length/style, rather
  than just a bare list of label names.
- **New**: `backend/app/core/config.py`. Loads `.env` from the project
  root (not `backend/.env`) via `python-dotenv`, regardless of which
  directory `uvicorn` is started from. Exposes `OPENAI_API_KEY`,
  `OPENAI_MODEL` (defaults to `gpt-4o-mini`), and `OPENAI_ENABLED`.
- **Changed**: `backend/app/api/chat.py`. Tries the OpenAI pipeline first;
  on any `OpenAIPipelineError` (missing key, network/auth/rate-limit
  failure, invalid JSON, an intent name OpenAI invented that isn't in the
  150-intent catalogue, or an empty response field), logs a warning and
  falls back to the original local pipeline (preprocessing -> rule-based
  language detection -> TF-IDF/Logistic Regression -> predefined response
  lookup) automatically. **The response schema returned to the frontend
  is byte-for-byte identical either way** - the frontend cannot tell which
  path answered a given request, satisfying "leave the interface as it
  is" exactly.
- `backend/requirements.txt`: added `openai==3.14.1`, `python-dotenv`.
- `.env.example`: added `OPENAI_API_KEY` (blank) and `OPENAI_MODEL`.

### Why the Local Pipeline Was Kept, Not Deleted
The local TF-IDF + Logistic Regression pipeline, its notebook, and its
tests are still the actual academic deliverable this whole project is
built to demonstrate (per the original notebook brief, which explicitly
banned LLMs). Keeping it as the automatic fallback means: (a) the
notebook/model/thesis material stays intact and truthful about what it
describes, (b) the live app never fully breaks just because of an OpenAI
outage, rate limit, or a missing API key, and (c) this matches
PROJECT_RULES.md Section 18's own guidance to use adapter-based
architecture for exactly this kind of future integration
(`ResponseProviderInterface` with swappable implementations), rather than
deleting working, tested code.

### Tests
- `backend/tests/test_openai_pipeline.py` (new, 7 tests): mocks the
  OpenAI client (no real API key or network access needed) to verify the
  classifier's own validation logic - rejects unknown intents, empty
  response fields, invalid JSON, empty content, and wraps
  network/API errors, all as `OpenAIPipelineError` so the fallback
  triggers correctly.
- `backend/tests/test_api_integration.py`: added
  `test_chat_predict_uses_openai_result_when_available`, which mocks
  `classify_and_respond` to simulate OpenAI *succeeding* and confirms the
  endpoint actually returns its result (not silently falling back
  anyway), with the response shape unchanged.
- All other 18 pre-existing tests continue to pass **and now double as
  real fallback-path verification**: since no `OPENAI_API_KEY` is
  configured in this environment, every one of those test requests
  already exercises the real "OpenAI unavailable -> local pipeline"
  path, not a mocked version of it.
- **26/26 backend tests passing.** Live-verified via `curl` against the
  actually running server (not just the test client): `/api/chat/predict`
  for "Hello" and "Kí ni orúkọ rẹ?" both returned identical results to
  before this change, and the server log visibly showed
  `OpenAI pipeline unavailable, using local model: OPENAI_API_KEY is not
  configured` for each request, confirming the fallback path is what
  actually answered.

### Known Issues / Open Items
- **Not yet tested with a real OpenAI API key** - no key was available
  in this session, and the project owner was deliberately not asked to
  paste a secret key into the conversation (real API keys in chat
  history/logs is a security anti-pattern). The project owner needs to
  add their own key to `.env` (project root, `cp .env.example .env` then
  fill in `OPENAI_API_KEY`) and restart the backend to actually exercise
  the OpenAI-success path live, rather than just its mocked tests.
- `OPENAI_MODEL` defaults to `gpt-4o-mini`. This is a documented default,
  not a verified-available guarantee - if that exact model name isn't
  available on the project owner's account, override it via the
  `OPENAI_MODEL` environment variable.
- Cost: unlike every other technology in this project, OpenAI API calls
  are paid per request, which is a real departure from PROJECT_RULES.md
  Section 1's "local execution using free technologies" and Section 11's
  "must work without paid services" - flagged to the project owner before
  implementation began, and they chose to proceed anyway.
- The system prompt re-sends all 150 intents' descriptions and example
  responses on every single request (stateless HTTP), which is a real,
  ongoing token cost. Not optimized further here (e.g. prompt caching)
  since it wasn't requested and would add complexity; worth revisiting if
  request volume or cost becomes a concern.

### Next Steps
Project owner adds a real `OPENAI_API_KEY` to `.env` and restarts the
backend, then sends a few messages through the real UI to confirm the
OpenAI-generated responses look right (tone, language correctness in
Yoruba specifically, simplicity as requested) before treating this as
fully done rather than "built and unit-tested but not yet seen live."

---

## OpenAI Pipeline: Confirmed Live, With a Real Bug Found and Fixed

Status: Complete
Date: 2026-09-17

The project owner provided a real `OPENAI_API_KEY` directly in
conversation. It was written straight to `.env` (project root, confirmed
`git check-ignore`'d) rather than echoed back anywhere, and the project
owner was advised to rotate/revoke that key afterward since it passed
through chat history, which is a real, standing security exposure
regardless of how it was handled from here.

### Bug: Every OpenAI Request Silently Fell Back to the Local Model
With a real key configured, the very first live requests still returned
answers identical to the pre-OpenAI baseline. This looked like success
but wasn't - checking the server log (not just the response body)
revealed every request was hitting the fallback path:
`OpenAI pipeline unavailable, using local model: OpenAI request failed:
Decompressor.decompress() got an unexpected keyword argument
'output_buffer_limit'`.

**Root cause**: the `openai` package's HTTP client (`httpx2`) prefers the
`brotli` package for decompressing responses, and falls back to
`brotlicffi` if `brotli` isn't installed. Only `brotlicffi` was present in
this environment. `brotlicffi`'s `Decompressor.decompress()` method
doesn't accept the `output_buffer_limit` keyword argument that `httpx2`
unconditionally passes, so every real API response with a
brotli-compressed body threw a `TypeError` - caught by this app's own
`OpenAIPipelineError` wrapping, which correctly triggered the fallback,
but masked the underlying dependency problem as if OpenAI simply weren't
configured.

**Fix**: `pip install brotli` (the real package, not the cffi
alternative), added as an explicit pinned dependency in
`backend/requirements.txt` with a comment explaining why it's required
explicitly rather than left as an implicit transitive dependency.

**Verification**: reproduced the exact `TypeError` by calling
`classify_and_respond` directly before the fix, confirmed it disappeared
after installing `brotli`, then re-verified live via `curl` against the
actually-running server with the server log showing zero fallback
warnings (previously present on every request) for both an English and a
Yoruba message.

### Second Issue Found: Tests Were Coupled to Ambient Environment State
Once a real key was live, `pytest` immediately caught a real design flaw:
three tests (`test_chat_predict_english/yoruba/mixed` in
`test_api_integration.py`, and `test_raises_when_no_api_key_configured`
in `test_openai_pipeline.py`) had implicitly assumed no `OPENAI_API_KEY`
would ever be set, since that happened to be true when they were
written. With a real key now configured, OpenAI answered those requests
instead of the local model, and its answers can legitimately differ
(e.g. "What can you help me with?" classified as `ask_bot_capabilities`
by OpenAI vs. `asking_for_help` by the local model - both defensible,
but the test only expected one specific answer).

**Fix**: tests whose entire purpose is verifying the *local* pipeline's
specific behavior now explicitly force that path with
`patch("app.api.chat.classify_and_respond", side_effect=OpenAIPipelineError(...))`,
and the "no client configured" unit test explicitly patches `_client` to
`None`, rather than any test relying on `OPENAI_API_KEY` happening to be
absent from whatever environment runs them. Tests are now deterministic
regardless of `.env` state.

### Live Verification (Real Results, Not Estimated)
Direct calls to `classify_and_respond` and live `curl` requests against
the running server, both with the real key active:
- "Hello" -> English / greeting / "Hello! How can I help you?"
- "Kí ni orúkọ rẹ?" -> Yoruba / ask_bot_name / "Orúkọ mi ni Raph, olùrànlọ́wọ́ rẹ."
- "Please jọ̀ọ́ help me" -> Yoruba / ask_bot_help / "Ó dáa, màá ràn ẹ́ lọ́wọ́."
  (OpenAI classified this as Yoruba rather than Mixed, and as
  `ask_bot_help` rather than `asking_for_help` - a different but
  reasonable judgment call from the local model's; not a bug)
- "What can you help me with?" -> English / ask_bot_capabilities / "..."
  (this actually matches the original notebook brief's intended example
  more closely than the local model's `asking_for_help` answer did)
- "Thank you so much" -> English / thanks / "You're welcome! I'm happy I could help."

### Files Changed
- `.env` (new, gitignored, contains the real key - not committed)
- `backend/requirements.txt` (added `brotli==1.2.0` with explanatory
  comment)
- `backend/tests/test_api_integration.py` (three tests now force the
  local pipeline explicitly instead of relying on absent env state)
- `backend/tests/test_openai_pipeline.py` (one test now patches `_client`
  to `None` explicitly instead of relying on absent env state)

### Tests
26/26 backend tests passing, now verified deterministic regardless of
whether `OPENAI_API_KEY` is set (previously, several would have failed
or silently tested the wrong pipeline depending on ambient `.env` state -
this was caught, not assumed away).

### Known Issues
- None open. Both issues in this entry were found through actual live
  testing (checking server logs, not just response bodies; running the
  test suite after a real environment change instead of assuming
  yesterday's green run still applies) rather than being missed.
- Reminder still standing: the project owner should rotate the API key
  that was pasted into this conversation.
