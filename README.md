# Lumina — AI Study Platform


[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org)
[![Groq](https://img.shields.io/badge/Groq-llama--3.3--70b-orange?style=flat)](https://groq.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat&logo=mongodb)](https://mongodb.com/atlas)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-0.5-purple?style=flat)](https://trychroma.com)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat)](LICENSE)

Lumina is a full-stack AI-powered study platform. Upload PDFs, YouTube videos, and web articles — then chat with your material, generate concept maps, take AI quizzes, and track what you've understood.

---

## Features

- **Multi-source ingestion** — PDF, YouTube transcripts, web scraping
- **AI chat with citations** — RAG pipeline cites page numbers and timestamps inline
- **Concept maps** — Auto-extracted knowledge graphs rendered with React Flow
- **AI-generated quizzes** — Variable question count, per-question explanations, PDF report export
- **Understanding tracker** — Tracks mastery per topic across all documents
- **Streaming responses** — SSE token streaming for real-time chat
- **JWT authentication** — httpOnly cookie sessions + per-account brute-force lockout
- **Rate limiting** — IP-based and per-account protection on all sensitive endpoints

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI 0.115 + async Python |
| LLM | Groq llama-3.3-70b-versatile |
| Embeddings | sentence-transformers all-MiniLM-L6-v2 (local, free) |
| Vector DB | ChromaDB (persistent, in-process) |
| Database | MongoDB Atlas (Motor async driver) |
| Auth | JWT (python-jose) + bcrypt |
| Frontend | Next.js 15 App Router + TypeScript |
| UI | Tailwind CSS v4 + Framer Motion |
| Graph | React Flow (@xyflow/react) |
| State | Zustand |
| Deploy | Render (backend) + Vercel (frontend) |

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- MongoDB Atlas account (free M0 cluster)
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Backend

```bash
cd lumina/backend

python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# Fill in GROQ_API_KEY, MONGODB_URI, JWT_SECRET

uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`

### Frontend

```bash
cd lumina/frontend

npm install

cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```

Frontend runs at `http://localhost:3000`

---

## Environment Variables

### Backend `.env`

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq API key for LLM inference |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | Database name (default: `lumina`) |
| `JWT_SECRET` | Long random string for signing JWTs |
| `FRONTEND_URL` | Your Vercel deployment URL (used for CORS) |
| `CHROMA_PERSIST_DIR` | ChromaDB storage path (default: `./chroma_store`) |

### Frontend `.env.local`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

---

## Deployment

### Backend → Render

1. Create a **Web Service** on [render.com](https://render.com), connect this repo
2. Set runtime to **Docker**
3. Add environment variables
4. Render uses `backend/render.yaml` for the persistent disk (ChromaDB storage)

### Frontend → Vercel

1. Import this repo on [vercel.com](https://vercel.com)
2. Set `NEXT_PUBLIC_API_URL` to your Render backend URL
3. Deploy — Vercel auto-detects Next.js

---

## Architecture

```
[ Browser ]
    |
    v
[ Next.js 15 — Vercel ]
    |  REST + SSE
    v
[ FastAPI — Render ]
    |
    +---> [ MongoDB Atlas ]   (users, documents, quiz scores)
    |
    +---> [ ChromaDB ]        (document vectors, semantic search)
    |
    +---> [ Groq API ]        (Llama 3.3 70B — chat, quiz, concepts)
    |
    +---> [ sentence-transformers ]  (local embeddings, free)
```

### How chat works

1. User sends a question
2. Backend converts it to a vector and finds the 6 most relevant chunks in ChromaDB
3. Chunks + question are sent to Llama 3.3 70B via Groq
4. Response streams back token by token via SSE

### How ingestion works

1. File/URL submitted → document ID returned immediately
2. Background task: extract text → split into 800-char chunks → embed → store in ChromaDB
3. Frontend polls `/documents/{id}/status` until ready

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Sign in |
| GET | `/auth/me` | Current user |
| POST | `/documents/upload` | Upload PDF |
| POST | `/documents/url` | Ingest YouTube / web URL |
| GET | `/documents/` | List documents |
| GET | `/documents/{id}/status` | Poll ingestion status |
| DELETE | `/documents/{id}` | Delete document |
| GET | `/chat/stream` | SSE streaming chat |
| POST | `/concepts/map` | Generate concept graph |
| POST | `/quiz/generate` | Generate quiz questions |
| POST | `/quiz/submit` | Submit quiz score |
| GET | `/tracker/{document_id}` | Topic mastery breakdown |
| GET | `/tracker/summary/all` | Overall stats |

---

## Security

- Brute force: IP rate limit (5/min) + per-account lockout after 10 failed attempts (30 min)
- User enumeration prevented: same error for wrong email and wrong password
- File validation: magic byte check on PDF uploads (not just Content-Type)
- Security headers: X-Frame-Options, X-Content-Type-Options, HSTS, CSP
- Tokens: httpOnly + secure + samesite cookies, JWT on all API calls

---

## License

MIT
