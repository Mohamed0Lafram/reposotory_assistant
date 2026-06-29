import base64
from pathlib import Path

# ----------------------------------------------------------------------
# Allowed extensions (only these will be processed)
# ----------------------------------------------------------------------
ALLOWED_EXTENSIONS = {
    '.yaml', '.yml', '.json', '.toml', '.xml', '.config', '.settings',
    '.hcl', '.tf', '.tfvars', '.ini', '.cfg', '.conf', '.cnf',
    '.properties', '.props', '.env', '.sh', '.bash', '.zsh',
    '.plist', '.reg', '.dbml', '.prisma', '.sql', '.csv'
}

# Map each allowed extension to a file type (category)
FILE_TYPE_MAP = {
    '.yaml': 'config',
    '.yml': 'config',
    '.json': 'config',
    '.toml': 'config',
    '.xml': 'config',
    '.config': 'config',
    '.settings': 'config',
    '.hcl': 'config',
    '.tf': 'config',
    '.tfvars': 'config',
    '.ini': 'config',
    '.cfg': 'config',
    '.conf': 'config',
    '.cnf': 'config',
    '.properties': 'config',
    '.props': 'config',
    '.env': 'config',
    '.sh': 'script',
    '.bash': 'script',
    '.zsh': 'script',
    '.plist': 'config',
    '.reg': 'config',
    '.dbml': 'schema',
    '.prisma': 'schema',
    '.sql': 'query',
    '.csv': 'data',
}

# ----------------------------------------------------------------------
# Helper functions (unchanged)
# ----------------------------------------------------------------------
def read_file_as_text(file_path, encoding='utf-8'):
    """Try to read file as text; if fails, return None."""
    try:
        with open(file_path, 'r', encoding=encoding) as f:
            return f.read(), encoding, False
    except UnicodeDecodeError:
        for enc in ['latin-1', 'cp1252', 'utf-16']:
            try:
                with open(file_path, 'r', encoding=enc) as f:
                    return f.read(), enc, False
            except UnicodeDecodeError:
                continue
        return None, None, True

def read_file_binary(file_path):
    """Read file as binary and return base64-encoded string."""
    with open(file_path, 'rb') as f:
        raw = f.read()
    return base64.b64encode(raw).decode('ascii'), 'base64', True

# ----------------------------------------------------------------------
# The main function (returns a list of chunks)
# ----------------------------------------------------------------------
def chunk_whole(file_path, encoding='utf-8', language='english'):
    """
    Read the file and return a list of chunks (one per file) if the extension
    is in ALLOWED_EXTENSIONS; otherwise return an empty list.
    """
    path = Path(file_path)
    ext = path.suffix.lower()

    # Only process allowed extensions
    if ext not in ALLOWED_EXTENSIONS:
        return []

    # Get file type from mapping, default to 'unknown'
    file_type = FILE_TYPE_MAP.get(ext, 'unknown')

    # Read content (text or binary)
    content, used_encoding, is_binary = read_file_as_text(file_path, encoding)
    if content is None:
        content, used_encoding, is_binary = read_file_binary(file_path)

    # Build the single chunk (you can extend this to split into sections)
    chunk = {
        "chunk_id": f"{path.stem}_001",          # e.g., "settings_001"
        "file_path": str(path),
        "file_name": path.name,
        "file_type": file_type,
        "language": language,
        "section_name": [],                      # placeholder for future section splitting
        "content": content
    }

    return [chunk]