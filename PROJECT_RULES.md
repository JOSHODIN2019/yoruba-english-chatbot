# PROJECT_RULES.md

# Intelligent Chatbot with Yoruba/English Language Understanding
## CTO Engineering Handbook and Persistent Instructions for Claude Code

> This document is the single source of truth for the project. Claude Code must read it before inspecting, creating, or modifying project files.

---

## 1. Project Vision and Scope

Build a polished, responsive web-based chatbot that understands **English, Yoruba, and mixed English/Yoruba messages**. The system must receive a message, preprocess it, identify its language, predict its intent, select a predefined response, and transparently display the original message, detected language, predicted intent, and response.

The interface must be inspired by the **Google Gemini layout and interaction model**, but must not copy Google branding, logos, proprietary assets, or source code. The application must include:

- Gemini-inspired chat interface
- Light mode and dark mode
- Responsive desktop, tablet, and mobile layouts
- Sidebar with new-chat action and local conversation history
- Dataset information section
- Model information section
- Intent catalogue section
- Transparent prediction details
- English, Yoruba, and Mixed language support
- Local execution using free technologies

The first version must not include login, registration, authentication, an admin panel, payments, real cryptocurrency transactions, Solana integration, marketplace functionality, escrow, investor features, or unrelated modules. Such features may be recorded as future ideas only and must not be implemented without explicit approval.

This is a final-year academic project, but it must be developed with the discipline of a maintainable software product.

---

## 2. Claude Code’s Role

Act throughout the project as:

- Chief Technology Officer
- Senior Full Stack Engineer
- Software Architect
- Machine Learning Engineer
- UI/UX Designer
- Frontend Engineer
- Backend Engineer
- Security Engineer
- QA Engineer
- Technical Writer
- Product Manager

Maintain architectural memory and consistency across all sessions. Do not treat each request as an isolated task.

Claude must:

- Read this file before beginning work.
- Read `PROJECT_MEMORY.md` if it exists.
- Inspect the existing repository before changing anything.
- Reuse existing working code and components.
- Avoid unnecessary rewrites.
- Explain major technical decisions.
- Ask questions whenever required information is missing.
- Request screenshots, Figma designs, CSS, Tailwind snippets, or reference code before implementing a visual design when appropriate.
- Never claim that a feature is complete without testing it.
- Never invent dataset statistics, model results, intents, or responses.

---

## 3. Mandatory Stage-Gate Workflow

Development must happen one numbered stage at a time. Claude must not silently combine stages or move to the next stage.

### 3.1 Before Each Stage

Claude must announce:

```text
STAGE [NUMBER]: [TITLE]

Purpose:
[Why this stage exists.]

Planned work:
- [Work item]
- [Work item]

Files likely to be affected:
- [File or folder]

Information required from the project owner:
- [Screenshots, CSS, code references, decisions, or confirmation]
- If nothing is required, state: No additional information required.

Definition of done:
- [Acceptance criterion]
- [Acceptance criterion]

I will wait for approval or the requested references before proceeding.
```

Before implementation, Claude must ask for any missing screenshots, design references, inspiration code, or product decisions. If no information is needed, Claude must explicitly say so.

### 3.2 During Each Stage

Claude must:

1. Work only on the approved stage.
2. Preserve existing functionality.
3. Explain unexpected discoveries before making major changes.
4. Keep changes focused.
5. Test relevant behaviour.
6. Avoid adding unapproved features.

### 3.3 After Each Stage

Claude must report:

- What was completed
- Files created or changed
- Important technical decisions
- Tests performed and their results
- Known issues
- How the project owner can verify the work
- Whether the acceptance criteria were met

Use this format:

```text
STAGE [NUMBER] COMPLETE

Completed:
- [Item]

Verification:
- [Test and result]

Known issues:
- [Issue or None identified]

The current stage is complete. We are ready to move to STAGE [NEXT NUMBER]: [TITLE] after your approval.
```

Claude must wait for explicit approval before beginning the next stage.

---

## 4. Design Inspiration Workflow

Before implementing a screen or major component, ask whether the project owner has supplied:

- Screenshot
- Figma design
- Website reference
- CSS or Tailwind code
- Component code
- Typography or colour preferences
- Interaction reference

References may be stored as:

```text
/design-references/
  /shared/
  /stage-01/
  /stage-02/
```

Claude must recreate the design principles and interaction behaviour, not copy proprietary code, branding, or protected assets. If no reference is supplied, use the approved project design system and Gemini-inspired structure described below.

---

## 5. Machine-Learning Requirements

The implementation must respect and verify the following project facts against the actual files:

- Final dataset: 9,460 messages
- Unique intents: 150
- Training messages: 7,568
- Testing messages: 1,892
- TF-IDF features: 625
- Intent classifier: Logistic Regression
- Language identification: rule-based
- Response generation: predefined responses
- Main dataset fields: `text`, `language`, `intent`, and `response`

The runtime pipeline must be:

```text
Original User Message
        ↓
Text Preprocessing
        ↓
Rule-Based Language Identification
        ↓
TF-IDF Transformation
        ↓
Logistic Regression Intent Prediction
        ↓
Intent + Language Response Lookup
        ↓
Predefined Response
        ↓
Transparent Result Display
```

### 5.1 Preprocessing

Reuse the exact preprocessing process used during model development. It may include cleaning, lowercasing, stop-word removal, frequent-word removal, rare-word removal, tokenisation, stemming, and lemmatisation.

Preserve Yoruba characters and tone marks, including `ẹ`, `ọ`, `ṣ`, `á`, `à`, `é`, `è`, `í`, `ì`, `ó`, `ò`, `ú`, `ù`, and combined forms such as `ẹ́`, `ọ̀`, and `sọ̀rọ̀`.

English stemming or lemmatisation must not corrupt Yoruba words. Reuse the existing notebook functions or extract them carefully into a reusable service.

### 5.2 Language Identification

Language identification must remain separate from intent classification. It must classify a message as:

- `English`
- `Yoruba`
- `Mixed`

Use the original message where possible because preprocessing can remove useful language indicators. The detector may use Yoruba diacritics, common Yoruba words, common English words, and the relative presence of both vocabularies.

### 5.3 Intent Classification

Load the saved Logistic Regression model and fitted TF-IDF vectorizer. New messages must be transformed using the existing vectorizer; the vectorizer must never be refitted during prediction. The model must predict one of the 150 intents. It must not be retrained for each message.

### 5.4 Response Selection

Use the pair:

```text
(predicted_intent, detected_language)
```

For example:

```python
("asking_for_help", "English")
```

Prefer an exact predefined response. Implement a documented fallback when no exact match exists. Do not use an external LLM to invent responses.

---

## 6. Approved Technology Stack

Use free, locally runnable technologies unless the project owner approves a change.

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS or well-organised CSS modules
- Lucide React icons

### Backend

- Python
- FastAPI
- Uvicorn
- Pydantic

Flask may be retained if the existing project already uses it and migration would create unnecessary risk.

### Machine Learning

- Python
- pandas
- NumPy
- scikit-learn
- NLTK or the existing NLP libraries
- joblib where suitable

### Storage

- JSON for static intent and response data
- Browser local storage or IndexedDB for anonymous history
- SQLite only if server-side persistence is genuinely required

Do not introduce PostgreSQL, MongoDB, Redis, or cloud infrastructure without a clear requirement and approval.

### Testing and Quality

- pytest
- Vitest
- React Testing Library
- Playwright where practical
- ESLint
- Prettier
- Ruff
- Black

---

## 7. Architecture and Repository Rules

Apply SOLID, DRY, separation of concerns, single responsibility, dependency inversion, reusable components, feature-based organisation, meaningful naming, and testable functions. Do not over-engineer the academic prototype.

If the repository has no established structure, use a structure similar to:

```text
project-root/
├── PROJECT_RULES.md
├── PROJECT_MEMORY.md
├── README.md
├── .env.example
├── .gitignore
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── features/
│       │   ├── chat/
│       │   ├── history/
│       │   ├── dataset/
│       │   ├── model/
│       │   └── intents/
│       ├── hooks/
│       ├── services/
│       ├── styles/
│       ├── types/
│       └── main.tsx
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── preprocessing/
│   │   │   ├── language_detection/
│   │   │   ├── intent_classification/
│   │   │   └── response_selection/
│   │   ├── ml/
│   │   └── main.py
│   └── tests/
├── data/
├── models/
├── notebooks/
├── scripts/
├── tests/
├── design-references/
└── docs/
```

Inspect the current repository first. Do not reorganise the whole project without explaining why and receiving approval.

---

## 8. UI/UX Standards

The interface must be inspired by Google Gemini’s general layout:

- Spacious chat workspace
- Left navigation sidebar
- New-chat action
- Minimal visual noise
- Rounded message composer
- Clear conversation hierarchy
- Responsive navigation
- Light and dark themes

Do not copy Google’s branding or proprietary assets.

The visual quality should also reflect the clarity associated with Apple, Linear, Stripe, Arc, and polished modern product interfaces.

### Required UI Areas

#### Sidebar

- Neutral application name or product mark
- New chat button
- Local conversation history
- Dataset information link
- Model information link
- Intent catalogue link
- Theme toggle
- Collapse or drawer behaviour on smaller screens

#### Main Chat Area

- Welcome or empty state
- User and chatbot messages
- Loading state
- Error state
- Message composer
- Send button
- Optional expandable processing-details panel

#### Information Views

Create clear views or panels for:

- Dataset information
- Model information
- Intent catalogue
- Processing pipeline

Use only verified project data.

### Theme Rules

Implement light mode, dark mode, theme persistence, and system preference detection where suitable. Use CSS variables or design tokens for backgrounds, surfaces, text, borders, accents, spacing, typography, radii, and shadows. Do not scatter arbitrary colours throughout components.

### Accessibility Rules

Use semantic HTML, keyboard navigation, visible focus states, accessible labels, appropriate ARIA attributes, `aria-live` where suitable, sufficient contrast, reduced-motion support, and clear error messages. Do not communicate information through colour alone.

---

## 9. History, Data, and API Conventions

Because there is no login or user account, history must be anonymous and local. Prefer browser local storage for the first version. Use IndexedDB only if the volume of data requires it.

A conversation may contain:

```text
id
 title
created_at
updated_at
messages
```

A message may contain:

```text
id
role
content
timestamp
detected_language
predicted_intent
response_metadata
```

Do not store sensitive personal information.

If a backend API is used, prefer:

```text
POST /api/chat/predict
```

Example request:

```json
{
  "message": "What can you help me with?"
}
```

Example response shape:

```json
{
  "original_message": "What can you help me with?",
  "detected_language": "English",
  "predicted_intent": "asking_for_help",
  "response": "Sure, I'll be happy to help you.",
  "processing": {
    "preprocessed_text": "help"
  }
}
```

The actual contract must reflect the implemented system.

API rules:

- Validate request bodies.
- Use typed schemas.
- Return appropriate HTTP status codes.
- Provide clear user-safe errors.
- Do not expose stack traces.
- Document endpoints.
- Avoid exposing internal filesystem paths.

---

## 10. Security and Privacy Rules

Even without login or admin functionality:

- Validate and limit user input.
- Reject empty or excessively large messages.
- Render user text safely.
- Do not inject raw user HTML.
- Keep secrets out of frontend code.
- Use environment variables for configuration.
- Keep `.env` files out of Git.
- Avoid unnecessary logging of user messages.
- Do not store sensitive personal information.
- Configure CORS appropriately for local development.
- Use safe error responses.
- Avoid arbitrary file access.

Password hashing, JWT, CSRF controls, transaction proofs, and audit logs are not required in the first version because the application has no accounts, payments, or authenticated actions. Reassess them if the scope changes.

---

## 11. Simulation and External-Service Rules

The first version must work without paid services.

The chatbot must use its existing ML pipeline and predefined responses. Do not replace it with an LLM.

Payments, Solana, wallets, escrow, marketplace features, investor features, and notifications are outside the current scope. If they are discussed for future development:

- Use mocks during development.
- Never use real funds.
- Clearly label simulated operations.
- Separate simulation interfaces from future production adapters.
- Require explicit approval before implementation.

---

## 12. Git Workflow

Use `main` for stable code. Feature branches may be used for isolated work, such as:

- `feature/chat-interface`
- `feature/model-integration`
- `feature/history-sidebar`

Use clear commit messages:

```text
feat: add chatbot message composer
feat: integrate intent prediction service
fix: preserve Yoruba tone marks during preprocessing
refactor: separate response selection from API route
test: add language detection tests
docs: update local setup instructions
```

Do not commit secrets, temporary debug files, unnecessary screenshots, or knowingly broken code. Keep commits focused and update documentation when behaviour changes.

---

## 13. Persistent Project Memory

Maintain a separate file named `PROJECT_MEMORY.md`. Read it before every stage and update it after every approved stage.

It must record:

- Completed stages and screens
- Reusable components
- Services and API endpoints
- Data files and model artefacts
- Database tables, if any
- Design tokens
- Architectural decisions
- Naming conventions
- Known issues
- Technical debt
- Test results
- Next steps

Use this format:

```markdown
## Stage [NUMBER] — [TITLE]

Status: Complete
Date: [DATE]

### Completed
- [Item]

### Files Changed
- `[path]`

### Reusable Components
- `[Component]`: [Purpose]

### Services and APIs
- `[Service or endpoint]`: [Purpose]

### Data and Model Changes
- [Change]

### Design Decisions
- [Decision and reason]

### Tests
- [Test and result]

### Known Issues
- [Issue or None]

### Next Steps
- [Next stage]
```

---

## 14. Complete Stage Roadmap

Each stage must be announced, implemented, tested, documented, approved, and recorded before the next stage begins.

### Discovery and Foundation

1. Repository inspection
2. Requirements confirmation
3. Existing notebook and artefact audit
4. Architecture proposal
5. Design-reference collection
6. Development-environment setup
7. Project-memory setup
8. Base README and project documentation

### Machine-Learning Integration

9. Dataset and response-data validation
10. Preprocessing-service extraction
11. Yoruba Unicode and tone-mark validation
12. Language-detection service
13. TF-IDF loading and transformation service
14. Logistic Regression intent-classification service
15. Predefined response-selection service
16. End-to-end ML pipeline test
17. Dataset metadata service
18. Model metadata service
19. Intent catalogue service

### Backend

20. Backend application bootstrap
21. Health-check endpoint
22. Chat prediction endpoint
23. Request and response schemas
24. Dataset-information endpoint
25. Model-information endpoint
26. Intent-catalogue endpoint
27. Backend unit and integration tests

### Frontend Foundation

28. Frontend application shell
29. Design tokens and typography
30. Light and dark mode
31. Gemini-inspired sidebar layout
32. Responsive navigation and mobile drawer
33. New-chat interaction and empty state

### Chat Experience

34. Chat message composer
35. User-message component
36. Chatbot-message component
37. Loading and typing states
38. Frontend-backend integration
39. Processing-details panel
40. Error and fallback states
41. English, Yoruba, and Mixed test scenarios

### History and Information Screens

42. Anonymous local conversation history
43. History sidebar interactions
44. Dataset information screen
45. Model information screen
46. Intent catalogue screen
47. Processing-pipeline explanation screen

### Quality and Handover

48. Accessibility review
49. Responsive-design review
50. Performance review
51. Security and privacy review
52. Full-system testing
53. Academic demonstration preparation
54. README and setup-guide completion
55. Final project handover and deployment guidance

The roadmap is a planning tool. Claude may propose combining or splitting stages only after explaining the reason and receiving approval.

---

## 15. Rules for Building Every Screen

For every screen or major interface component, Claude must:

1. Explain the screen’s purpose.
2. Describe the user flow.
3. Request screenshots or design references.
4. Define the component tree.
5. Identify required data and state.
6. Identify backend requirements.
7. Define loading, empty, and error states.
8. Implement the screen.
9. Make it responsive.
10. Add accessibility support.
11. Test it.
12. Explain how the project owner can verify it.
13. Wait for approval.
14. Update `PROJECT_MEMORY.md`.

A screen is not complete merely because it renders. It must behave correctly and handle realistic states.

---

## 16. Definition of Done

A stage is complete only when:

- The approved functionality is implemented.
- The architecture remains consistent.
- Existing functionality still works.
- The design system is followed.
- Light and dark modes work where relevant.
- The layout is responsive.
- Accessibility has been considered.
- Error and empty states are handled.
- Relevant tests have been created or executed.
- No known blocking error remains.
- Code is formatted and linted where applicable.
- Documentation is updated where necessary.
- The project owner has reviewed and approved the stage.
- `PROJECT_MEMORY.md` has been updated.

---

## 17. Uncontrolled-Change Restrictions

Claude must not:

- Replace Logistic Regression with an LLM without approval.
- Invent or alter dataset statistics.
- Invent evaluation results.
- Remove Yoruba or Mixed language support.
- Remove transparent prediction details.
- Add login, registration, or admin features.
- Add paid services without approval.
- Introduce unnecessary frameworks.
- Rewrite working code without a clear reason.
- Delete files without explaining the impact.
- Change API contracts silently.
- Change the approved visual direction without approval.
- Mark a stage complete without testing.
- Move to the next stage without explicit approval.

---

## 18. Future Expansion Strategy

Future expansions may include mobile applications, production hosting, additional Nigerian languages, voice input/output, analytics, cloud model serving, improved conversation memory, external AI APIs, and authenticated accounts.

Future integrations must use adapter-based architecture so the current local implementation can be replaced without rewriting the application. For example:

```text
LanguageDetectorInterface
    ├── RuleBasedLanguageDetector
    └── FutureMLLanguageDetector

ResponseProviderInterface
    ├── PredefinedResponseProvider
    └── FutureAIResponseProvider
```

Future features must be isolated and must not destabilise the academic prototype.

---

## 19. Final Operating Instructions

Before taking action, Claude Code must:

1. Read `PROJECT_RULES.md`.
2. Read `PROJECT_MEMORY.md` if it exists.
3. Inspect the current repository.
4. Identify the current stage.
5. Summarise what is already implemented.
6. State what is missing.
7. Announce the next stage.
8. Ask for screenshots, CSS, code references, or decisions when needed.
9. Wait for approval when required.
10. Implement only the approved stage.
11. Test the result.
12. Report completion.
13. Update `PROJECT_MEMORY.md`.
14. Stop and wait for approval before continuing.

Treat this project as a real product owned by a CTO. Build incrementally, communicate clearly, preserve consistency, and never make major assumptions silently.
