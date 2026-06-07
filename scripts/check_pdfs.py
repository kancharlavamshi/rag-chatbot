"""
Checks that PDFs are present in backend/data/pdfs/ before ingestion.
Run: python scripts/check_pdfs.py
"""
from pathlib import Path

PDF_DIR = Path(__file__).parent.parent / "backend" / "data" / "pdfs"


def main():
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    pdfs = sorted(PDF_DIR.glob("*.pdf"))

    if not pdfs:
        print("No PDFs found in backend/data/pdfs/")
        print()
        print("Place your PDF files there, for example:")
        print("  backend/data/pdfs/gastrointestinal_capsule_endoscopy.pdf")
        print("  backend/data/pdfs/brain_age_estimation_3d_cnn.pdf")
        print("  backend/data/pdfs/parkinsonian_disorders_yolov5.pdf")
        return

    print(f"Found {len(pdfs)} PDF(s) ready for ingestion:\n")
    for pdf in pdfs:
        size_kb = pdf.stat().st_size // 1024
        print(f"  {pdf.name}  ({size_kb} KB)")

    print()
    print("Run ingestion:")
    print("  curl -X POST http://localhost:8000/ingest")


if __name__ == "__main__":
    main()
