from openai import OpenAI
from typing import Dict, Any, List, Generator
from .vectorstore import similarity_search
from ..core.config import settings
from ..models.schemas import Source

_openai = OpenAI(api_key=settings.openai_api_key)

_SYSTEM_PROMPT = """You are a helpful document assistant. Answer questions using the context chunks provided.

Rules:
1. Answer ONLY from the provided context. Never use outside knowledge.
2. Reason across all chunks — the answer may be spread across multiple chunks or pages.
3. If the answer is genuinely not present anywhere in the context, respond with exactly: "I couldn't find an answer to that in the provided documents."
4. Be concise and factual.
5. When your answer draws from a specific source, naturally mention it (e.g., "According to 2404.08293v1.pdf, page 1...").
6. Do not speculate or infer beyond what is explicitly stated."""


def _build_context(chunks: List[Dict[str, Any]]) -> str:
    return "\n\n---\n\n".join(
        f"[Source {i}: {c['filename']}, Page {c['page']}]\n{c['text']}"
        for i, c in enumerate(chunks, 1)
    )


def _get_sources(chunks: List[Dict[str, Any]]) -> List[Source]:
    seen: set = set()
    sources: List[Source] = []
    for chunk in chunks:
        key = (chunk["filename"], chunk["page"])
        if key not in seen:
            seen.add(key)
            sources.append(Source(filename=chunk["filename"], page=chunk["page"]))
    return sources


def answer_question(question: str) -> Dict[str, Any]:
    chunks = similarity_search(question, top_k=8)

    if not chunks:
        return {
            "answer": "No documents have been ingested yet. Please run the ingestion step first.",
            "sources": [],
        }

    context = _build_context(chunks)

    response = _openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
        ],
        temperature=0.1,
        max_tokens=1024,
    )

    answer = response.choices[0].message.content
    return {"answer": answer, "sources": _get_sources(chunks)}


def stream_answer(question: str) -> tuple[Generator[str, None, None], List[Source]]:
    chunks = similarity_search(question, top_k=8)

    if not chunks:
        def _empty():
            yield "No documents have been ingested yet. Please run the ingestion step first."
        return _empty(), []

    context = _build_context(chunks)
    sources = _get_sources(chunks)

    stream = _openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
        ],
        temperature=0.1,
        max_tokens=1024,
        stream=True,
    )

    def _gen():
        for chunk in stream:
            token = chunk.choices[0].delta.content
            if token:
                yield token

    return _gen(), sources
