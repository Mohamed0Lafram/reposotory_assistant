"""
retrieval.py – Parent‑child retrieval from a ChromaDB collection.
Assumes each document is a chunk with metadata: source_file (or file_path), chunk_id.
Retrieves relevant chunks, groups them by source file, and returns full file content as "parent".
"""

import sys
from pathlib import Path
import chromadb
from sentence_transformers import SentenceTransformer

# ------------------------------------------------------------
# 1. Configuration (adjust to your setup)
# ------------------------------------------------------------
DB_PATH = "/home/mohamed/Documents/mohamed/REPOSOTORY INFORMATION/chroma_bge_db"
COLLECTION_NAME = None              # If None, uses the first collection found
EMBEDDING_MODEL_NAME = "BAAI/bge-base-en-v1.5"   # Must match the one used during ingestion

# ------------------------------------------------------------
# 2. Connect to the database and load the embedding model
# ------------------------------------------------------------
client = chromadb.PersistentClient(path=DB_PATH)

# Get the collection (use first if name not specified)
collections = client.list_collections()
if not collections:
    raise ValueError(f"No collections found in {DB_PATH}")
if COLLECTION_NAME is None:
    collection = collections[0]
else:
    try:
        collection = client.get_collection(COLLECTION_NAME)
    except chromadb.errors.NotFoundError:
        raise ValueError(f"Collection '{COLLECTION_NAME}' not found.")

print(f"✅ Connected to collection: {collection.name}")

# Load the embedding model
print(f"Loading embedding model: {EMBEDDING_MODEL_NAME} ...")
embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)

def embed_query(text: str) -> list[float]:
    """Embed a query string and return a list of floats."""
    emb = embedding_model.encode(text)
    if hasattr(emb, "tolist"):
        emb = emb.tolist()
    return emb

# Verify dimension
dummy = embed_query("test")
print(f"🔢 Embedding dimension: {len(dummy)} (should be 768)")

# ------------------------------------------------------------
# 3. Core retrieval function
# ------------------------------------------------------------
def retrieve_parent_child(query: str, top_k_children: int = 10) -> list[dict]:
    """
    Retrieve child chunks matching the query, group them by source file,
    and return a list of parent objects.

    Each parent object has:
        - 'id': file path
        - 'content': full concatenated text of all chunks in that file
        - 'metadata': dict with source_file and chunk_count
        - 'children': list of dicts with 'id', 'content', 'metadata' for each chunk

    Args:
        query: The search query.
        top_k_children: Number of child chunks to retrieve initially.

    Returns:
        List of parent objects, sorted by the highest child relevance.
    """
    query_embedding = embed_query(query)

    # Step 1: Retrieve child chunks
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k_children,
        include=["documents", "metadatas"]
    )

    child_ids = results['ids'][0] if results['ids'] else []
    child_docs = results['documents'][0] if results['documents'] else []
    child_metas = results['metadatas'][0] if results['metadatas'] else []

    if not child_ids:
        return []

    # Step 2: Collect unique parent (source file) identifiers
    parent_ids = set()
    for meta in child_metas:
        # Use source_file if available, fallback to file_path
        parent = meta.get('source_file') or meta.get('file_path')
        if parent:
            parent_ids.add(parent)

    if not parent_ids:
        return []

    # Step 3: Fetch all chunks for each parent file
    parents = []
    for parent_id in parent_ids:
        parent_chunks = collection.get(
            where={"source_file": parent_id},
            include=["documents", "metadatas"]
        )
        if not parent_chunks['ids']:
            continue

        # Pair data
        chunk_data = list(zip(
            parent_chunks['ids'],
            parent_chunks['documents'],
            parent_chunks['metadatas']
        ))

        # Sort by chunk_id (assumes numeric suffix like _001, _002, etc.)
        chunk_data.sort(key=lambda x: x[2].get('chunk_id', x[0]))

        # Reconstruct full file content
        full_text = "\n".join([doc for _, doc, _ in chunk_data])

        parent_obj = {
            'id': parent_id,
            'content': full_text,
            'metadata': {
                'source_file': parent_id,
                'chunk_count': len(chunk_data)
            },
            'children': [
                {'id': cid, 'content': doc, 'metadata': meta}
                for cid, doc, meta in chunk_data
            ]
        }
        parents.append(parent_obj)

    return parents