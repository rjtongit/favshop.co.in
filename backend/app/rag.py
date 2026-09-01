import json
from pathlib import Path

import faiss
from sentence_transformers import SentenceTransformer


# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
VECTOR_STORE_DIR = BASE_DIR / "vector_store"

INDEX_PATH = VECTOR_STORE_DIR / "index.faiss"
METADATA_PATH = VECTOR_STORE_DIR / "metadata.json"


# --------------------------------------------------
# Load embedding model
# --------------------------------------------------

embedding_model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)


# --------------------------------------------------
# Load FAISS index
# --------------------------------------------------

index = None

if INDEX_PATH.exists():
    index = faiss.read_index(str(INDEX_PATH))


# --------------------------------------------------
# Load metadata
# --------------------------------------------------

chunks = []

if METADATA_PATH.exists():
    with open(
        METADATA_PATH,
        "r",
        encoding="utf-8"
    ) as file:

        chunks = json.load(file)


# --------------------------------------------------
# Search documents
# --------------------------------------------------

def search_documents(question: str, top_k: int = 3):

    if index is None:
        raise RuntimeError(
            "FAISS index not found. Run: python -m app.ingest"
        )

    question_embedding = embedding_model.encode(
        [question]
    )

    distances, indexes = index.search(
        question_embedding,
        top_k
    )

    results = []

    for i in indexes[0]:

        if i == -1:
            continue

        results.append(chunks[i])

    return results