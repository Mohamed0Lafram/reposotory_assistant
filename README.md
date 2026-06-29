# Repository Assistant

An AI-powered assistant that answers questions about a software repository. It indexes source code and documentation into a vector database, retrieves the most relevant files for a query, and uses an LLM (Google Gemini) to generate grounded answers from that context.

## How It Works

```
Repository files → Chunking → Embeddings → ChromaDB → Retrieval → LLM → Answer
```

1. **Chunking** — Scans a repository and splits files into logical chunks (by function/class for code, by section for READMEs, by paragraph for docs).
2. **Embedding** — Converts each chunk into a vector using [BAAI/bge-base-en-v1.5](https://huggingface.co/BAAI/bge-base-en-v1.5).
3. **Vector store** — Persists embeddings in a local [ChromaDB](https://www.trychroma.com/) database.
4. **Retrieval** — Uses parent-child retrieval: finds relevant chunks, then reconstructs full source files for richer context.
5. **Agent** — Sends retrieved file contents to Gemini and returns a natural-language answer.

## Project Structure

```
.
├── agents/
│   └── agent.py              # CLI agent — answers questions via Gemini
├── chunking/
│   └── scripts/
│       ├── chunk_folder.py   # Dispatches files to the right chunker
│       ├── save_chunks.py    # Scans a repo and writes all_chunks.jsonl
│       └── chunk_file/
│           ├── chunk_code_file.py    # Splits code by function/class
│           ├── chunk_readme_file.py  # Splits READMEs by section
│           ├── chunk_text.py         # Splits docs (PDF, DOCX, etc.)
│           └── chunk_whole.py        # Stores small config files whole
├── embeddings/
│   └── bge_embedding.py      # HuggingFace BGE embedding model
├── retrieval/
│   ├── parent_child.py       # Parent-child retrieval from ChromaDB
│   └── test.py               # Inspect the vector database
├── vector_db/
│   └── chroma_db.py          # Build ChromaDB from chunked JSONL
└── ux/
    └── chatbot/
        ├── app.py              # Flask web UI (work in progress)
        └── templates/
            └── index.html
```

## Requirements

- Python 3.10+
- A [Google Gemini API key](https://aistudio.google.com/apikey) (for the agent)

### Python Dependencies

```bash
pip install chromadb sentence-transformers langchain-core langchain-community \
            langchain-huggingface google-generativeai flask
```

Optional dependencies for document chunking:

```bash
pip install PyPDF2 python-docx odfpy langdetect
```

## Setup

### 1. Clone and install

```bash
git clone <repository-url>
cd "REPOSOTORY INFORMATION"
python -m venv .venv
source .venv/bin/activate
pip install chromadb sentence-transformers langchain-core langchain-community \
            langchain-huggingface google-generativeai flask
```

### 2. Set your API key

The agent reads the Gemini API key from the `API_KEY` environment variable:

```bash
export API_KEY="your-gemini-api-key"
```

### 3. Index a repository

Point the chunking script at the repository you want to index. Edit the path in `chunking/scripts/save_chunks.py`, then run:

```bash
python chunking/scripts/save_chunks.py
```

This produces `chunking/chunks/all_chunks.jsonl`.

### 4. Build the vector database

```bash
python vector_db/chroma_db.py
```

By default this reads `chunking/chunks/all_chunks.jsonl` and writes the database to `./chroma_bge_db`.

## Usage

### Ask questions from the CLI

```bash
python agents/agent.py "How does authentication work?"
```

Or run interactively:

```bash
python agents/agent.py
# Enter your question about the repository:
```

### Inspect the vector database

```bash
python retrieval/test.py
```

### Web UI (experimental)

A Flask chatbot UI lives under `ux/chatbot/`. Start it with:

```bash
python ux/chatbot/app.py
```

Then open [http://localhost:5000](http://localhost:5000). The web interface is currently a frontend prototype and is not yet wired to the retrieval agent.

## Supported File Types

| Category | Extensions |
|----------|-----------|
| Code | `.py`, `.js`, `.ts`, `.java`, `.c`, `.cpp`, `.go`, `.rs`, `.rb`, and more |
| README | `.md`, `.markdown`, files named `README` |
| Documents | `.txt`, `.pdf`, `.docx`, `.odt`, `.rst`, `.tex` |
| Config / data | `.yaml`, `.json`, `.toml`, `.sql`, `.env`, `.sh`, and more |

Code files are chunked at function and class boundaries. READMEs are split by heading. Config and small text files are stored as whole-file chunks.

## Configuration

| Setting | File | Default |
|---------|------|---------|
| ChromaDB path | `retrieval/parent_child.py` | `./chroma_bge_db` |
| Embedding model | `retrieval/parent_child.py` | `BAAI/bge-base-en-v1.5` |
| Gemini model | `agents/agent.py` | `gemini-2.5-flash` |
| Top files retrieved | `agents/agent.py` | `3` |
| Max chars per file | `agents/agent.py` | `4000` |

Update the hard-coded paths in `save_chunks.py`, `chroma_db.py`, and `parent_child.py` to match your local setup.

## License

Add your license here.
