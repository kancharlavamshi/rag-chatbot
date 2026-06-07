import chromadb
from chromadb.config import Settings as ChromaSettings
from openai import OpenAI
from typing import List, Dict, Any
from ..core.config import settings

_openai = OpenAI(api_key=settings.openai_api_key)
_EMBED_BATCH = 100


def _get_collection():
    client = chromadb.PersistentClient(
        path=settings.chroma_path,
        settings=ChromaSettings(anonymized_telemetry=False),
    )
    return client.get_or_create_collection(
        name="documents",
        metadata={"hnsw:space": "cosine"},
    )


def _embed(texts: List[str]) -> List[List[float]]:
    all_embeddings: List[List[float]] = []
    for i in range(0, len(texts), _EMBED_BATCH):
        batch = texts[i: i + _EMBED_BATCH]
        response = _openai.embeddings.create(model="text-embedding-3-small", input=batch)
        all_embeddings.extend(item.embedding for item in response.data)
    return all_embeddings


def already_ingested(file_hash: str) -> bool:
    collection = _get_collection()
    results = collection.get(where={"file_hash": file_hash}, limit=1)
    return len(results["ids"]) > 0


def store_chunks(chunks: List[Dict[str, Any]]) -> int:
    if not chunks:
        return 0

    # Group by file and skip already-ingested files
    by_file: Dict[str, List[Dict[str, Any]]] = {}
    for chunk in chunks:
        fname = chunk["metadata"]["filename"]
        by_file.setdefault(fname, []).append(chunk)

    new_chunks: List[Dict[str, Any]] = []
    for fname, file_chunks in by_file.items():
        fhash = file_chunks[0]["metadata"]["file_hash"]
        if already_ingested(fhash):
            print(f"  Skipping {fname} — already ingested")
        else:
            print(f"  Embedding {fname} ({len(file_chunks)} chunks)...")
            new_chunks.extend(file_chunks)

    if not new_chunks:
        print("  All files already ingested — nothing to do")
        return 0

    collection = _get_collection()
    texts = [c["text"] for c in new_chunks]
    metadatas = [c["metadata"] for c in new_chunks]
    ids = [
        f"{c['metadata']['filename']}__p{c['metadata']['page']}__c{c['metadata']['chunk_index']}"
        for c in new_chunks
    ]

    embeddings = _embed(texts)

    collection.upsert(ids=ids, documents=texts, embeddings=embeddings, metadatas=metadatas)
    return len(new_chunks)


def get_first_chunks(filenames: List[str]) -> List[Dict[str, Any]]:
    collection = _get_collection()
    chunks = []
    for filename in filenames:
        results = collection.get(
            ids=[f"{filename}__p1__c0"],
            include=["documents", "metadatas"],
        )
        for doc, meta in zip(results["documents"], results["metadatas"]):
            chunks.append({
                "text": doc,
                "filename": meta["filename"],
                "page": meta["page"],
                "score": 1.0,
            })
    return chunks


def similarity_search(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    collection = _get_collection()
    query_embedding = _embed([query])[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
    )

    chunks = []
    seen_ids = set()
    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        chunks.append({
            "text": doc,
            "filename": meta["filename"],
            "page": meta["page"],
            "score": round(1 - dist, 4),
        })
        seen_ids.add(meta["filename"])

    # Always prepend first chunk of each retrieved document so title/author info is in context
    first_chunks = [c for c in get_first_chunks(list(seen_ids)) if c["text"] not in {ch["text"] for ch in chunks}]
    return first_chunks + chunks
