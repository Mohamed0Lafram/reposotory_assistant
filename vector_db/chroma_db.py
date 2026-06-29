import json
import sys
from pathlib import Path
from typing import List, Any

# ---------- Safe imports ----------
try:
    from langchain_core.documents import Document
except ImportError:
    print("ERROR: 'langchain-core' not installed. Run: pip install langchain-core")
    sys.exit(1)

try:
    from langchain_community.embeddings import HuggingFaceEmbeddings
except ImportError:
    try:
        from langchain.embeddings import HuggingFaceEmbeddings
    except ImportError:
        print("ERROR: 'langchain-community' not installed. Run: pip install langchain-community sentence-transformers")
        sys.exit(1)

try:
    from langchain_community.vectorstores import Chroma
except ImportError:
    print("ERROR: 'langchain-community' or 'chromadb' not installed. Run: pip install chromadb langchain-community")
    sys.exit(1)


# ---------- Helper functions ----------
def extract_text(content_field: Any) -> str:
    """Convert the 'content' field into plain text."""
    if isinstance(content_field, str):
        return content_field
    if isinstance(content_field, list):
        return " ".join(str(item) for item in content_field)
    return json.dumps(content_field, ensure_ascii=False)


def is_primitive(value: Any) -> bool:
    """Return True if value is a Chroma‑allowed primitive."""
    return isinstance(value, (str, int, float, bool)) or value is None


def clean_metadata(metadata: dict) -> dict:
    """
    Recursively clean metadata:
      - remove keys with None or empty lists
      - convert dicts to JSON strings
      - convert non‑primitive lists to lists of strings
      - convert any other type to string
    This ensures all values are primitive or lists of primitives.
    """
    cleaned = {}
    for key, value in metadata.items():
        if value is None:
            continue
        if isinstance(value, list):
            if not value:               # empty list → skip
                continue
            if all(is_primitive(item) for item in value):
                cleaned[key] = value    # keep as is
            else:
                # Convert each non‑primitive to string
                cleaned[key] = [str(item) for item in value]
        elif isinstance(value, dict):
            # Chroma doesn't support nested dicts; store as JSON string
            cleaned[key] = json.dumps(value, ensure_ascii=False)
        elif is_primitive(value):
            cleaned[key] = value
        else:
            # Fallback: convert to string
            cleaned[key] = str(value)
    return cleaned


def sanitize_metadata(metadata: dict) -> dict:
    """Remove empty lists and None (pre‑filter)."""
    cleaned = {}
    for key, value in metadata.items():
        if isinstance(value, list) and not value:
            continue
        if value is None:
            continue
        cleaned[key] = value
    return cleaned


# ---------- Main builder ----------
def build_chroma_db(
    chunks_file: str,
    persist_dir: str = "./chroma_bge_db",
    model_name: str = "BAAI/bge-base-en-v1.5",
):
    file_path = Path(chunks_file)

    if not file_path.exists():
        print(f"❌ ERROR: File not found at '{file_path.absolute()}'")
        print("Please check the path and try again.")
        return

    print(f"✅ Loading embedding model: {model_name} ...")
    embedding_model = HuggingFaceEmbeddings(model_name=model_name)

    print(f"✅ Reading chunks from: {file_path.name} ...")
    documents: List[Document] = []

    with file_path.open("r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue

            try:
                chunk = json.loads(line)
            except json.JSONDecodeError as e:
                print(f"⚠️ Skipping invalid JSON at line {line_num}: {e}")
                continue

            content_field = chunk.get("content", "")
            page_text = extract_text(content_field)

            if not page_text.strip():
                print(f"⚠️ Skipping empty content at line {line_num}")
                continue

            # Build metadata (exclude 'content', keep original)
            metadata = {k: v for k, v in chunk.items() if k != "content"}
            metadata["_original_content"] = content_field

            # Step 1: Remove empty lists and None
            metadata = sanitize_metadata(metadata)

            # Step 2: Convert any remaining complex types
            metadata = clean_metadata(metadata)

            doc = Document(page_content=page_text, metadata=metadata)
            documents.append(doc)

    if not documents:
        print("❌ ERROR: No valid documents found.")
        return

    print(f"✅ Loaded {len(documents)} documents. Building vector store...")

    vectorstore = Chroma.from_documents(
        documents=documents,
        embedding=embedding_model,
        persist_directory=persist_dir,
    )

    print(f"✅ SUCCESS! Vector store saved to: {Path(persist_dir).absolute()}")
    return vectorstore


# ---------- Run ----------
if __name__ == "__main__":
    build_chroma_db(
        '/home/mohamed/Documents/mohamed/REPOSOTORY INFORMATION/chunking/chunks/all_chunks.jsonl'
    )