from pypdf import PdfReader
from pathlib import Path
from sentence_transformers import SentenceTransformer
import faiss


# Load embedding model
embedding_model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)


# Read PDF
BASE_DIR = Path(__file__).resolve().parent
PDF_PATH = BASE_DIR / "documents" / "employee_guide.pdf"

reader = PdfReader(PDF_PATH)

text = ""

for page in reader.pages:
    text += page.extract_text() + "\n"


# Simple chunking
chunk_size = 500

chunks = [
    text[i:i + chunk_size]
    for i in range(0, len(text), chunk_size)
]


# Create embeddings
embeddings = embedding_model.encode(chunks)

# Create FAISS vector database
dimension = embeddings.shape[1]

index = faiss.IndexFlatL2(dimension)

index.add(embeddings)

# Search inside  documents
def search_documents(question, top_k=3):

    question_embedding = embedding_model.encode(
        [question]
    )

    distances, indexes = index.search(
        question_embedding,
        top_k
    )

    results = []

    for i in indexes[0]:
        results.append(chunks[i])

    return results