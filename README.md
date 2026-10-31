# Lumina

A study companion demo: upload material, chat with it (with cited sources), explore a concept map, take quizzes, and track mastery.

This is a **demo**: it runs entirely in the browser with built-in sample data. No login, no database, no API keys.

- Three sample documents are included; uploads and links are simulated and reuse sample content.
- Chat answers are pre-written and streamed to look live.
- Quiz results feed the Tracker and are stored in your browser (localStorage).

## Run locally

```bash
cd frontend
npm install
npm run dev
```

## Deploy

Import the repo on Vercel and set the **Root Directory** to `frontend`. No environment variables are needed.

## Sample data

All documents, chat answers, quizzes and concept maps live in `frontend/src/lib/mockData.ts`; the simulated API is `frontend/src/lib/api.ts`.

> The `backend/` folder (FastAPI + MongoDB + Groq) is the original full version and is not used by the demo.
