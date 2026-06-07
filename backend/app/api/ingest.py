import uuid
from fastapi import APIRouter, BackgroundTasks, HTTPException
from ..services.pdf_loader import load_pdfs
from ..services.vectorstore import store_chunks
from ..core.config import settings

router = APIRouter(prefix="/ingest", tags=["ingest"])

_jobs: dict = {}


def _run_ingest(job_id: str) -> None:
    try:
        _jobs[job_id] = {"status": "running", "message": "Loading PDFs..."}
        chunks = load_pdfs(settings.pdf_dir)

        if not chunks:
            _jobs[job_id] = {
                "status": "failed",
                "message": f"No PDFs found in {settings.pdf_dir}",
            }
            return

        _jobs[job_id]["message"] = f"Embedding {len(chunks)} chunks..."
        count = store_chunks(chunks)

        _jobs[job_id] = {
            "status": "done",
            "message": f"Stored {count} chunks from {len(set(c['metadata']['filename'] for c in chunks))} file(s)",
        }
    except Exception as e:
        _jobs[job_id] = {"status": "failed", "message": str(e)}


@router.post("")
def ingest(background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())[:8]
    _jobs[job_id] = {"status": "queued", "message": "Waiting to start..."}
    background_tasks.add_task(_run_ingest, job_id)
    return {"job_id": job_id, "status": "queued", "poll": f"/ingest/status/{job_id}"}


@router.get("/status/{job_id}")
def ingest_status(job_id: str):
    if job_id not in _jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return _jobs[job_id]
