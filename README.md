# Lumina

An AI study companion. Upload a PDF or paste a link, then chat with it (with cited sources), explore a concept map, take quizzes and track mastery.

This is a demo: no login and no database. Everything is stored in your browser.

- **Sample documents:** three built-in documents with pre-written answers that work offline.
- **Your own documents:** PDFs (text-based, up to 4 MB), web pages and YouTube videos with captions are read on the server and answered by an LLM through Groq. Answers are restricted to the document, and off-topic or prompt-injection messages are refused.

## Run locally

```bash
cd frontend
cp .env.example .env.local   # add your GROQ_API_KEY
npm install
npm run dev
```

## Deploy (Vercel)

Import the repo, set **Root Directory** to `frontend`, and add the environment variable `GROQ_API_KEY`. Without it the sample documents still work, but uploads can't be answered.

## Layout

- `frontend/src/app/api/*`: server routes (`extract`, `chat`, `quiz`, `concepts`)
- `frontend/src/lib/server/*`: Groq client, retrieval, rate limit and SSRF guard
- `frontend/src/lib/api.ts`: browser-side API (sample documents + real routes)
- `frontend/src/lib/mockData.ts`: sample document content

> The `backend/` folder (FastAPI + MongoDB) is the original full version and is not used by the demo.
