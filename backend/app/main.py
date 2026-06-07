from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, chat, history, ingest
from .models.db import create_tables

app = FastAPI(title="RAG Chatbot API", version="1.0.0", docs_url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    create_tables()


app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(history.router)
app.include_router(ingest.router)


@app.get("/health")
def health():
    return {"status": "ok"}
