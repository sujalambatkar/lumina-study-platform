# Lumina

A simple study companion demo. Chat with a document, take a quiz, and explore its key concepts.

This is a **demo**: it runs entirely in the browser with built-in sample data. No login, no database, no API keys.

## Run locally

```bash
cd frontend
npm install
npm run dev
```

## Deploy

Import the repo on Vercel and set the **Root Directory** to `frontend`. No environment variables are needed.

## Sample data

All documents, chat answers, quizzes and concepts live in `frontend/src/lib/data.ts`.

> The `backend/` folder (FastAPI + MongoDB + Groq) is the original full version and is not used by the demo.
