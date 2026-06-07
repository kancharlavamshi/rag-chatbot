# DocChat — RAG Chatbot

> Ask questions about your PDF documents and get precise answers with exact **source citations** (filename + page number). Powered by GPT-4o and ChromaDB — answers come **only from your documents**, never hallucinated.

---

## What It Does

Upload your PDFs, ask questions in natural language, and get answers grounded strictly in your documents. Every response includes clickable source citations showing exactly which file and page the answer came from.

- No hallucinations — if the answer isn't in your docs, the bot says so
- Streaming responses — text appears word by word like ChatGPT
- Full chat history — revisit past conversations per user
- Multi-user — each user has isolated chat history with JWT auth
- Duplicate detection — re-ingesting the same PDF is a no-op

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI + Python 3.11 |
| LLM | OpenAI `gpt-4o` (streaming) |
| Embeddings | OpenAI `text-embedding-3-small` |
| Vector DB | ChromaDB (local, persistent, cosine similarity) |
| PDF Parsing | PyMuPDF (`fitz`) |
| Auth | JWT — `python-jose` + `bcrypt` |
| Chat History | SQLite via SQLAlchemy |
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Infra | Docker Compose |

---

## Architecture

```
PDFs ──► PyMuPDF (extract text + page numbers)
      ──► Chunk text (by page)
      ──► OpenAI text-embedding-3-small
      ──► ChromaDB (stored with filename + page metadata)

User question
      ──► embed query
      ──► ChromaDB cosine similarity search (top 8 chunks)
      ──► prepend title/author chunks for context
      ──► GPT-4o (system prompt: answer ONLY from context)
      ──► Streaming response + deduplicated source list
```

---

## Project Structure

```
rag-chatbot/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py        # register, login → JWT
│   │   │   ├── chat.py        # POST /chat (streaming SSE)
│   │   │   ├── history.py     # GET /history
│   │   │   └── ingest.py      # POST /ingest
│   │   ├── core/
│   │   │   ├── config.py      # settings from .env
│   │   │   └── auth.py        # JWT decode / current user
│   │   ├── services/
│   │   │   ├── pdf_loader.py  # PyMuPDF → chunks
│   │   │   ├── vectorstore.py # ChromaDB store + similarity search
│   │   │   └── rag.py         # GPT-4o answer + streaming
│   │   ├── models/
│   │   │   ├── db.py          # SQLAlchemy User + ChatMessage models
│   │   │   └── schemas.py     # Pydantic request/response schemas
│   │   └── main.py            # FastAPI app, CORS, router mount
│   ├── data/pdfs/             # ← drop your PDFs here
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx        # redirect to /login
│       │   ├── login/page.tsx  # register + login form
│       │   └── chat/page.tsx   # main chat UI
│       ├── components/
│       │   ├── ChatWindow.tsx  # message list + scroll
│       │   ├── InputBar.tsx    # send message input
│       │   ├── MessageBubble.tsx # user / assistant message
│       │   ├── SourceCard.tsx  # citation badge
│       │   └── Sidebar.tsx     # chat history list
│       ├── lib/api.ts          # fetch wrapper with JWT header
│       └── types/index.ts      # shared TypeScript interfaces
├── scripts/
│   └── check_pdfs.py          # verify PDFs are detected
├── docker-compose.yml
└── .env.example
```

---

## Quick Start (Docker — Recommended)

### 1. Clone and configure

```bash
git clone https://github.com/your-username/rag-chatbot.git
cd rag-chatbot
cp .env.example .env
```

Edit `.env`:
```env
OPENAI_API_KEY=sk-...          # your OpenAI API key
JWT_SECRET=replace-with-a-long-random-string-at-least-32-chars
```

### 2. Add your PDFs

```bash
mkdir -p backend/data/pdfs
cp your-documents/*.pdf backend/data/pdfs/
```

### 3. Start the app

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

### 4. Ingest PDFs

Run once after the services are up:

```bash
curl -X POST http://localhost:8000/ingest
```

Or open http://localhost:8000/docs → `POST /ingest` → Execute.

### 5. Use the app

1. Open http://localhost:3000
2. Register an account
3. Ask questions about your PDFs

---

## Quick Start (Without Docker)

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # fill in OPENAI_API_KEY and JWT_SECRET
uvicorn app.main:app --reload
```

**Frontend** (separate terminal):
```bash
cd frontend
npm install
npm run dev
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Create account, returns JWT |
| `POST` | `/auth/login` | No | Login, returns JWT |
| `POST` | `/chat` | Bearer JWT | Ask a question — streams answer + sources |
| `GET` | `/history` | Bearer JWT | Get last 50 Q&A pairs |
| `POST` | `/ingest` | No | Index all PDFs in `data/pdfs/` |
| `GET` | `/health` | No | Health check |
| `GET` | `/docs` | No | Swagger UI |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `JWT_SECRET` | Yes | Random string ≥ 32 chars for signing tokens |

Copy `.env.example` → `.env` and fill in both values.

---

## How Duplicate Detection Works

Each PDF is hashed on ingest. If you call `/ingest` again with the same file, it is skipped silently — no duplicate embeddings, no wasted API calls.

---

## License

MIT
