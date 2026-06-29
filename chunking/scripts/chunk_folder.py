import os
from pathlib import Path
from chunking.scripts.chunk_file.chunk_code_file import chunk_code_file
from chunking.scripts.chunk_file.chunk_readme_file import chunk_readme_file
from chunking.scripts.chunk_file.chunk_text import chunk_text
from chunking.scripts.chunk_file.chunk_whole import chunk_whole
# ------------------------------------------------------------
# 1.  File type detection (reuse your existing lists)
# ------------------------------------------------------------



README_EXTS = {'.md', '.markdown', '.mdown', '.mkd'}


CODE_EXTS = [
    '.py', '.rb', '.js', '.ts', '.java', '.c', '.cpp', '.h', '.cs',
    '.go', '.rs', '.php', '.swift', '.kt', '.scala', '.css', '.html'
]

DOCS_EXTS = [
    '.txt', '.tex', '.pdf', '.docx', '.odt', '.rst', '.md', '.xml', '.log'
]

TEXT_EXTS = [
    '.yaml', '.yml', '.json', '.toml', '.xml', '.config', '.settings',
    '.hcl', '.tf', '.tfvars', '.ini', '.cfg', '.conf', '.cnf',
    '.properties', '.props', '.env', '.sh', '.bash', '.zsh',
    '.plist', '.reg', '.dbml', '.prisma', '.sql', '.csv'
]


def detect_type(file_path):
    """Return 'code', 'docs', 'readme', 'text', or None."""
    ext = Path(file_path).suffix.lower()
    if ext in CODE_EXTS:
        return 'code'
    if ext in DOCS_EXTS:
        return 'docs'
    if ext in README_EXTS:
        return 'readme'
    if ext in TEXT_EXTS:
        return 'other'
    # Special case: file named 'README' (no extension)
    if Path(file_path).name.upper() == 'README':
        return 'readme'
    return None

# ------------------------------------------------------------
# 2.  Dispatcher function (uses your existing chunkers)
# ------------------------------------------------------------
def chunk_file_by_type(file_path, method='paragraphs'):
    """
    Dispatch to the appropriate chunking function based on file type.

    Parameters:
        file_path (str): path to the file.
        method (str): 'paragraphs' or 'whole' (only for docs/text).

    Returns:
        dict or None: result from the chunking function, or None if unknown.
    """
    if not os.path.isfile(file_path):
        return None

    ftype = detect_type(file_path)

    if ftype == 'code':
        # Assume you have a function `chunk_code(file_path)` that returns a dict
        return chunk_code_file(file_path)

    elif ftype == 'readme':
        # Assume you have `chunk_readme(file_path)` that returns a dict
        return chunk_readme_file(file_path)

    elif ftype == 'docs':
        # Assume you have `chunk_paragraph_based(file_path, method)` that returns a dict
        return chunk_text(file_path)
    
    elif ftype == 'other':
        # Assume you have `chunk_paragraph_based(file_path, method)` that returns a dict
        return chunk_whole(file_path)
    
    else:
        return []