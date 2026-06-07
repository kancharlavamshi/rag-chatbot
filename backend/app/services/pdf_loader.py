import fitz  # PyMuPDF
import hashlib
from pathlib import Path
from typing import List, Dict, Any


def file_hash(path: Path) -> str:
    return hashlib.md5(path.read_bytes()).hexdigest()


def load_pdfs(pdf_dir: str) -> List[Dict[str, Any]]:
    chunks = []
    pdf_path = Path(pdf_dir)

    for pdf_file in sorted(pdf_path.glob("*.pdf")):
        pdf_hash = file_hash(pdf_file)
        print(f"  Processing {pdf_file.name} ...")

        doc = fitz.open(str(pdf_file))
        print(f"  {doc.page_count} pages")

        for page_num in range(doc.page_count):
            text = doc[page_num].get_text("text")

            if not text or len(text.strip()) < 50:
                continue

            for chunk_idx, chunk_text in enumerate(_split_text(text, chunk_size=800, overlap=150)):
                chunks.append({
                    "text": chunk_text,
                    "metadata": {
                        "filename": pdf_file.name,
                        "page": page_num + 1,
                        "chunk_index": chunk_idx,
                        "file_hash": pdf_hash,
                    },
                })

        doc.close()
        print(f"  Done — {len(chunks)} chunks so far")

    return chunks


def _split_text(text: str, chunk_size: int, overlap: int) -> List[str]:
    text = text.strip()
    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end]

        if end < len(text):
            last_period = chunk.rfind(". ")
            if last_period > chunk_size // 2:
                chunk = chunk[: last_period + 1]
                end = start + last_period + 1

        chunk = chunk.strip()
        if chunk:
            chunks.append(chunk)

        next_start = end - overlap
        if next_start <= start:
            break
        start = next_start

    return chunks
