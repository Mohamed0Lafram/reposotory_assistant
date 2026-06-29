import sys
import re
import json
from pathlib import Path

def chunk_markdown(md_text):
    """
    Split Markdown text into chunks based on headings.
    Each chunk contains:
        - headers: list of headings leading to this section (e.g. ["Chapter 1", "Section 1.2"])
        - content: the text under that heading (without the heading line itself)
    Introductory text before any heading is placed in a chunk with an empty headers list.
    """
    lines = md_text.splitlines()
    chunks = []
    stack = []        # current heading hierarchy
    content = []      # lines being accumulated for the current chunk

    for line in lines:
        m = re.match(r'^(#+)\s+(.*)', line)
        if m:
            # Save the previous chunk if there was any content
            if content:
                chunks.append({
                    "headers": stack.copy(),
                    "content": "\n".join(content).strip()
                })

            level = len(m.group(1))      # number of # symbols
            title = m.group(2)           # heading text

            # Trim the stack to the new level (level-1 because level 1 = first element)
            stack = stack[:level-1]
            stack.append(title)
            content = []
        else:
            content.append(line)

    # Save the final chunk (even if stack is empty – intro text)
    if content:
        chunks.append({
            "headers": stack.copy(),
            "content": "\n".join(content).strip()
        })

    return chunks


def chunk_readme_file(file_path):
    """
    Reads a Markdown file, chunks it, and returns a list of enriched chunk objects
    in the desired JSON format.
    """
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        md_text = f.read()

    # Get basic file info
    path = Path(file_path)
    file_name = path.name
    file_stem = path.stem          # e.g., "README"
    file_type = "documentation"    # you can also detect from extension
    language = "markdown"

    # Chunk the text
    raw_chunks = chunk_markdown(md_text)

    result = []
    for idx, chunk in enumerate(raw_chunks, start=1):
        section_hierarchy = chunk["headers"]

        # Build a base slug from the section hierarchy (e.g., "install_windows")
        if section_hierarchy:
            # Use the last heading as the most specific, or join all
            # To match your example "readme_install_001" we take the first heading if only one,
            # or we can join all. We'll join all and replace spaces with underscores.
            base = "_".join(section_hierarchy).lower().replace(" ", "_")
        else:
            base = "intro"

        # Create a chunk_id: <file_stem>_<base>_<3-digit index>
        # e.g., README_install_001 -> lowercased
        chunk_id = f"{file_stem}_{base}_{idx:03d}".lower()

        result.append({
            "chunk_id": chunk_id,
            "file_path": str(file_path),
            "file_name": file_name,
            "file_type": file_type,
            "language": language,
            "section_hierarchy": section_hierarchy,
            "content": chunk["content"]
        })

    return result

