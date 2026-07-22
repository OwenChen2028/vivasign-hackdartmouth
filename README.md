# VivaSign

VivaSign is a sign language learning platform using multimodal LLMs and
retrieval-augmented generation (RAG) to provide tailored feedback. It retrieves
sign-specific reference data from PostgreSQL, augments a Google Gemini prompt with
that context, and compares it with webcam captures of the learner's signing.

## Demo and HackDartmouth X

VivaSign was created by **Gesture Gurus** for HackDartmouth X.

[![Watch the VivaSign video demo](https://img.youtube.com/vi/pD90VZ25B0M/maxresdefault.jpg)](https://www.youtube.com/watch?v=pD90VZ25B0M)

- [Watch the video demo](https://www.youtube.com/watch?v=pD90VZ25B0M)
- [View the Devpost project](https://devpost.com/software/vivasign)

**Team:** Owen Chen, Axel O’Brien, Jaime Graft, and Joao De Arujo Junior

## Features

- Guided webcam capture with uninterrupted countdowns for each keyframe
- Gemini feedback on handshape, location, palm orientation, and non-manual signals
- Practice material for seven common ASL signs
- Written instructions and video demonstrations available before practice
- PostgreSQL-backed sign descriptions and video selection
- Capture-first processing so API latency never interrupts a gesture
- Responsive, accessible React interface

## How it works

1. The learner selects a sign and reviews its PostgreSQL-backed instructions and
   demonstration video.
2. VivaSign displays a countdown for each key position in the sign.
3. The browser captures every keyframe locally without waiting for network requests.
4. After the final capture, VivaSign submits the frames to Gemini in parallel.
5. The app presents each captured frame with focused AI feedback.

For each captured keyframe, the backend retrieves the expected handshape, location,
palm orientation, and non-manual signals from PostgreSQL. Those reference fields are
included with the image in the Gemini request, grounding the generated feedback in the
selected sign rather than asking the model to evaluate it without context.

VivaSign is intended to run in **AI evaluation mode**. In this mode, PostgreSQL stores
the sign reference fields and video filenames, while Gemini is called only after a
practice sequence to evaluate the captured frames.

**Reference mode** is a development fallback for running the interface without
PostgreSQL or Gemini. It uses bundled reference data, records the requested frames,
and displays them for comparison, but it does not visually assess the learner's signs.

## Technology

- **Frontend:** React, React Router, and the browser MediaDevices API
- **Backend:** Python, Flask, and Gunicorn
- **Retrieval layer:** PostgreSQL for sign reference data and video selection
- **Multimodal generation:** Google Gemini for image-based feedback grounded by the
  retrieved reference fields

## Local development

### Requirements

- Python 3.10 or later
- Node.js 20 or later
- PostgreSQL 14 or later
- A Google Gemini API key
- A browser with webcam support

### Install the backend

```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
```

### Create the database

Create a PostgreSQL database and load the included reference data:

```bash
createdb vivasign
psql --dbname vivasign --file backend/db_setup.txt
```

### Configure and start the API

Copy the example environment file and fill in the Gemini and PostgreSQL values:

```bash
cp backend/.env.example backend/.env
```

Keep `VIVASIGN_EVALUATION_MODE=ai`, set `GEMINI_API_KEY`, and provide every `DB_*`
value before starting the server:

```bash
cd backend
flask --app api run --port 5000
```

A successful AI-mode startup reports the following at
<http://localhost:5000/health>:

```json
{"mode":"ai","status":"ok"}
```

### Start the frontend

In a second terminal:

```bash
cd frontend
npm ci
cp .env.example .env
npm start
```

The development site is served at <http://localhost:3000>. Browsers treat localhost
as a secure context, allowing webcam access after permission is granted.

### Reference-mode fallback

To run the practice interface without PostgreSQL or Gemini, set:

```dotenv
VIVASIGN_EVALUATION_MODE=reference
```

Reference mode is useful for UI development and demonstrations, but it does not provide
AI feedback.

## Configuration

The backend reads configuration from `backend/.env`.

| Variable | Description | Default |
| --- | --- | --- |
| `VIVASIGN_EVALUATION_MODE` | Selects `ai` or the `reference` fallback | Automatically inferred if omitted |
| `CORS_ORIGINS` | Comma-separated frontend origins allowed by the API | Local React development origins |
| `GEMINI_API_KEY` | Google Gemini API key | None |
| `GEMINI_MODEL` | Gemini model used for evaluation | `gemini-3.6-flash` |
| `DB_HOST` | PostgreSQL server hostname | None |
| `DB_PORT` | PostgreSQL server port | `5432` |
| `DB_NAME` | PostgreSQL database name | None |
| `DB_USER` | PostgreSQL username | None |
| `DB_PASSWORD` | PostgreSQL password | None |

The intended configuration is `VIVASIGN_EVALUATION_MODE=ai` with all Gemini and
PostgreSQL values populated. The server validates this configuration at startup.

The frontend reads `REACT_APP_API_BASE_URL` from `frontend/.env`. It defaults to
`http://localhost:5000` when the variable is not defined.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Reports API status and evaluation mode |
| `GET` | `/signs` | Lists available signs and keyframe counts |
| `POST` | `/evaluate` | Evaluates one captured keyframe |
| `GET` | `/explain` | Formats written guidance directly from stored sign data |
| `GET` | `/video` | Returns the demonstration video location selected by the sign repository |
| `GET` | `/media/<filename>` | Serves bundled demonstration videos |

## Verification

```bash
cd backend && python -m unittest discover -s tests
cd frontend && npm test -- --watchAll=false
cd frontend && npm run build
```

## Privacy and limitations

AI evaluation uploads captured frames to Google Gemini only after the capture sequence
is complete. Captures are not stored in PostgreSQL, and VivaSign requests deletion of
temporary Gemini uploads after evaluation. Reference mode keeps the capture workflow
local and sends nothing to Gemini.

VivaSign is a learning aid, not a replacement for instruction from a qualified or
fluent ASL educator. Automated feedback may be incomplete or inaccurate.
