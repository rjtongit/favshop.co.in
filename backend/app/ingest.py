import json
from pathlib import Path

import faiss
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer


# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

DOCUMENTS_DIR = BASE_DIR / "documents"
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
# Read PDFs and create chunks
# --------------------------------------------------

def load_documents():

    chunks = []

    for pdf_path in DOCUMENTS_DIR.glob("*.pdf"):

        print(
            f"Processing: {pdf_path.name}",
            flush=True
        )

        reader = PdfReader(pdf_path)

        for page_number, page in enumerate(
            reader.pages,
            start=1
        ):

            page_text = page.extract_text()

            if not page_text:
                continue

            chunk_size = 500

            for i in range(
                0,
                len(page_text),
                chunk_size
            ):

                chunk_text = page_text[
                    i:i + chunk_size
                ].strip()

                if not chunk_text:
                    continue

                chunks.append({
                    "source": pdf_path.name,
                    "page": page_number,
                    "text": chunk_text
                })

    return chunks


# --------------------------------------------------
# Create FAISS index
# --------------------------------------------------

def create_index(chunks):

    texts = [
        chunk["text"]
        for chunk in chunks
    ]

    print(
        f"Creating embeddings for {len(texts)} chunks...",
        flush=True
    )

    embeddings = embedding_model.encode(
        texts,
        convert_to_numpy=True,
        show_progress_bar=False
    ).astype("float32")

    print(
        f"Embeddings created: {embeddings.shape}",
        flush=True
    )

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    index.add(embeddings)

    print(
        f"FAISS contains {index.ntotal} vectors",
        flush=True
    )

    return index


# --------------------------------------------------
# Save vector store
# --------------------------------------------------

def save_vector_store(index, chunks):

    VECTOR_STORE_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    # Save FAISS index

    faiss.write_index(
        index,
        str(INDEX_PATH)
    )

    print(
        f"FAISS index saved to: {INDEX_PATH}",
        flush=True
    )

    # Save metadata

    with open(
        METADATA_PATH,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            chunks,
            file,
            ensure_ascii=False,
            indent=2
        )

    print(
        f"Metadata saved to: {METADATA_PATH}",
        flush=True
    )


# --------------------------------------------------
# Main
# --------------------------------------------------

if __name__ == "__main__":

    chunks = load_documents()

    if not chunks:

        raise RuntimeError(
            "No PDF content found."
        )

    index = create_index(chunks)

    save_vector_store(
        index,
        chunks
    )

    print(
        "Ingestion completed successfully.",
        flush=True
    )