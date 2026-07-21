# VivaSign

VivaSign is a webcam-based American Sign Language practice app. It guides learners
through the key positions of a sign, captures each position, and presents feedback
alongside written instructions and video demonstrations.

## Features

- Guided webcam capture with a countdown for each keyframe
- Practice material for seven common ASL signs
- Written instructions and locally hosted video demonstrations
- Reference-based feedback that works without external services
- Optional visual assessment powered by Google Gemini
- Responsive, accessible React interface

## How it works

1. The learner selects a sign.
2. VivaSign displays a countdown for each key position in the sign.
3. The browser captures a webcam image at the end of each countdown.
4. The API returns feedback for each captured frame.
5. Written guidance and a video demonstration are available for comparison.

VivaSign supports two evaluation modes:

- **Reference mode** uses the bundled sign catalog and demonstration videos. It
  verifies the complete capture and feedback workflow, but does not visually score
  captured images.
- **AI evaluation mode** compares captured frames with sign reference data using
  Google Gemini. This mode requires Gemini and PostgreSQL configuration.

## Technology

- **Frontend:** React, React Router, and the browser MediaDevices API
- **Backend:** Python, Flask, and Gunicorn
- **Optional services:** PostgreSQL and Google Gemini

## Local development

### Requirements

- Python 3.10 or later
- Node.js 20 or later
- A browser with webcam support

### Start the API

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
flask --app api run --port 5000
```

The health endpoint at <http://localhost:5000/health> reports the active evaluation
mode. With the example configuration, the response is:

```json
{"mode":"local","status":"ok"}
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

## Configuration

The backend reads configuration from `backend/.env`.

| Variable | Description | Default |
| --- | --- | --- |
| `VIVASIGN_LOCAL_MODE` | Enables the bundled reference mode | Automatically enabled when cloud configuration is absent |
| `GEMINI_API_KEY` | Google Gemini API key | None |
| `GEMINI_MODEL` | Gemini model used for evaluation | `gemini-2.0-flash` |
| `DB_HOST` | PostgreSQL server hostname | None |
| `DB_PORT` | PostgreSQL server port | `5432` |
| `DB_NAME` | PostgreSQL database name | None |
| `DB_USER` | PostgreSQL username | None |
| `DB_PASSWORD` | PostgreSQL password | None |

Set `VIVASIGN_LOCAL_MODE=false` and provide all Gemini and PostgreSQL values to enable
AI evaluation.

The frontend reads `REACT_APP_API_BASE_URL` from `frontend/.env`. It defaults to
`http://localhost:5000` when the variable is not defined.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Reports API status and evaluation mode |
| `GET` | `/signs` | Lists available signs and keyframe counts |
| `POST` | `/evaluate` | Evaluates one captured keyframe |
| `GET` | `/explain` | Returns written guidance for a sign |
| `GET` | `/video` | Returns the demonstration video URL for a sign |
| `GET` | `/media/<filename>` | Serves bundled videos in reference mode |

## Verification

```bash
cd backend && python -m unittest discover -s tests
cd frontend && npm test -- --watchAll=false
cd frontend && npm run build
```

## Privacy and limitations

Reference mode processes captures within the local API workflow and does not send
them to Gemini. AI evaluation mode uploads captured frames to Google Gemini for
analysis. Deployments should provide an appropriate privacy notice and access controls
before accepting public submissions.

VivaSign is a learning aid, not a replacement for instruction from a qualified or
fluent ASL educator. Automated feedback may be incomplete or inaccurate.

## Project background

VivaSign was created by Gesture Gurus for HackDartmouth X.

**Team:** Owen Chen, Axel O’Brien, Jaime Graft, and Joao De Arujo Junior

- [Devpost project](https://devpost.com/software/vivasign)
- [Video demo](https://www.youtube.com/watch?v=pD90VZ25B0M)
