import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from Data.scripts.walk_directory import scan_directory
from chunk_folder import chunk_file_by_type
import json
import os

def save_all_chunks_jsonl(
    input_dir: str,
    output_dir: str = "/home/mohamed/Documents/mohamed/REPOSOTORY INFORMATION/chunking/chunks"
):
    """
    Scan all files in `input_dir`, chunk each file, and save all chunks
    as line‑delimited JSON (.jsonl) in `output_dir`.
    """
    files_path = scan_directory(input_dir, absolute=True)

    all_chunks = []
    for file_path in files_path:
        chunks = chunk_file_by_type(file_path)
        for chunk in chunks:
            chunk['source_file'] = file_path
            all_chunks.append(chunk)

    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    output_file = os.path.join(output_dir, 'all_chunks.jsonl')
    with open(output_file, 'w', encoding='utf-8') as f:
        for chunk in all_chunks:
            f.write(json.dumps(chunk, ensure_ascii=False) + '\n')

    print(f"Saved {len(all_chunks)} chunks to {output_file}")

if __name__ == "__main__":
    # Example usage: replace with your actual input directory
    save_all_chunks_jsonl("/home/mohamed/Documents/mohamed/REPOSOTORY INFORMATION/Data/injestion/online-chess-game")