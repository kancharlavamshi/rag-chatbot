from app.services.pdf_loader import load_pdfs
from app.services.vectorstore import store_chunks

print('Loading PDFs...')
chunks = load_pdfs('./data/pdfs')
print(f'Loaded {len(chunks)} chunks')

print('Storing to ChromaDB...')
count = store_chunks(chunks)
print(f'Done: {count} chunks stored')
