#!/usr/bin/env python3
"""
chunk_to_json.py - Split a source file into logical chunks and output JSON.

Usage:
    python chunk_to_json.py path/to/file.ext

As a module:
    from chunk_to_json import chunk_file
    chunks = chunk_file("src/auth.py")
"""

import sys
import re
import json
from pathlib import Path

# ----------------------------------------------------------------------
# Language configuration
# ----------------------------------------------------------------------
LANG_CONFIG = {
    '.py':   (True,  [r'^\s*(?:def|class|async\s+def)\s+'], '#', ("'''", "'''")),
    '.rb':   (True,  [r'^\s*(?:def|class|module)\s+'], '#', ("=begin", "=end")),
    '.js':   (False, [r'^\s*(?:function\s+|class\s+|async\s+function\s+|const\s+\w+\s*=\s*(?:function|async\s+function)?|let\s+\w+\s*=\s*(?:function|async\s+function)?)'], '//', ('/*', '*/')),
    '.ts':   (False, [r'^\s*(?:function\s+|class\s+|async\s+function\s+|const\s+\w+\s*=\s*(?:function|async\s+function)?)'], '//', ('/*', '*/')),
    '.java': (False, [r'^\s*(?:public|private|protected)?\s*(?:static\s+)?\s*(?:class|interface|enum|record|\w+\s+\w+\s*\([^)]*\)\s*\{)'], '//', ('/*', '*/')),
    '.c':    (False, [r'^\s*(?:[\w\*]+\s+[\w\*]+\s*\([^;]*\)\s*\{|struct\s+\w+\s*\{)'], '//', ('/*', '*/')),
    '.cpp':  (False, [r'^\s*(?:[\w\*:]+\s+[\w\*:]+\s*\([^;]*\)\s*\{|class\s+\w+|struct\s+\w+)'], '//', ('/*', '*/')),
    '.h':    (False, [r'^\s*(?:[\w\*]+\s+[\w\*]+\s*\([^;]*\)\s*\{|class\s+\w+|struct\s+\w+)'], '//', ('/*', '*/')),
    '.cs':   (False, [r'^\s*(?:public|private|protected|internal)?\s*(?:static\s+)?\s*(?:class|struct|interface|enum|\w+\s+\w+\s*\([^)]*\)\s*\{)'], '//', ('/*', '*/')),
    '.go':   (False, [r'^\s*(?:func\s+|type\s+\w+\s+struct\s*\{)'], '//', ('/*', '*/')),
    '.rs':   (False, [r'^\s*(?:fn\s+|struct\s+|enum\s+|impl\s+)'], '//', ('/*', '*/')),
    '.php':  (False, [r'^\s*(?:function\s+|class\s+|trait\s+|interface\s+)'], '//', ('/*', '*/')),
    '.swift':(False, [r'^\s*(?:func\s+|class\s+|struct\s+|enum\s+|protocol\s+)'], '//', ('/*', '*/')),
    '.kt':   (False, [r'^\s*(?:fun\s+|class\s+|interface\s+|object\s+|data\s+class\s+)'], '//', ('/*', '*/')),
    '.scala':(False, [r'^\s*(?:def\s+|class\s+|object\s+|trait\s+)'], '//', ('/*', '*/')),
    '.css':  (False, [r'^\s*(?:[#.][\w-]+|\w+|\*)\s*\{'], None, ('/*', '*/')),
    '.html' : (False, [r'^\s*<[a-zA-Z][^>]*>'], None, ('<!--', '-->')),
}

LANG_NAMES = {
    '.py': 'Python',
    '.rb': 'Ruby',
    '.js': 'JavaScript',
    '.ts': 'TypeScript',
    '.java': 'Java',
    '.c': 'C',
    '.cpp': 'C++',
    '.h': 'C/C++ Header',
    '.cs': 'C#',
    '.go': 'Go',
    '.rs': 'Rust',
    '.php': 'PHP',
    '.swift': 'Swift',
    '.kt': 'Kotlin',
    '.scala': 'Scala',
    '.css': 'CSS',
    '.html': 'HTML',
}

DEFAULT_INDENT_BASED = False
DEFAULT_PATTERNS = [
    r'^\s*(?:function\s+|class\s+|def\s+|fun\s+|fn\s+|func\s+|async\s+function\s+|\w+\s+\w+\s*\([^)]*\)\s*\{)'
]
DEFAULT_SINGLE = '//'
DEFAULT_MULTI = ('/*', '*/')

def detect_language(file_path):
    """Return configuration for the given file."""
    ext = Path(file_path).suffix.lower()
    if ext in LANG_CONFIG:
        return LANG_CONFIG[ext]
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            first_line = f.readline()
            if first_line.startswith('#!'):
                if 'python' in first_line:
                    return LANG_CONFIG['.py']
                if 'ruby' in first_line:
                    return LANG_CONFIG['.rb']
                if 'node' in first_line or 'js' in first_line:
                    return LANG_CONFIG['.js']
    except:
        pass
    return (DEFAULT_INDENT_BASED, DEFAULT_PATTERNS, DEFAULT_SINGLE, DEFAULT_MULTI)

def get_language_name(file_path):
    ext = Path(file_path).suffix.lower()
    if ext in LANG_NAMES:
        return LANG_NAMES[ext]
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            first_line = f.readline()
            if first_line.startswith('#!'):
                if 'python' in first_line:
                    return 'Python'
                if 'ruby' in first_line:
                    return 'Ruby'
                if 'node' in first_line or 'js' in first_line:
                    return 'JavaScript'
    except:
        pass
    return ext[1:].capitalize() if ext else 'Unknown'

# ----------------------------------------------------------------------
# Splitting logic
# ----------------------------------------------------------------------
def is_definition_line(line, patterns):
    for pat in patterns:
        if re.search(pat, line):
            return True
    return False

def split_by_indentation(lines, patterns):
    chunks = []
    current_chunk = []
    current_indent = None
    in_chunk = False

    for line in lines:
        stripped = line.lstrip()
        indent = len(line) - len(stripped)
        if not stripped or stripped.startswith('#') or stripped.startswith('//'):
            if in_chunk:
                current_chunk.append(line)
            continue

        is_def = is_definition_line(line, patterns)

        if is_def:
            if in_chunk and indent <= current_indent:
                chunks.append(''.join(current_chunk))
                current_chunk = []
            current_chunk = [line]
            current_indent = indent
            in_chunk = True
        else:
            if in_chunk:
                if indent < current_indent:
                    chunks.append(''.join(current_chunk))
                    current_chunk = []
                    in_chunk = False
                else:
                    current_chunk.append(line)
    if current_chunk:
        chunks.append(''.join(current_chunk))
    return chunks

def find_matching_brace(lines, start_idx):
    line = lines[start_idx]
    brace_pos = line.find('{')
    if brace_pos == -1:
        for i in range(start_idx, len(lines)):
            if '{' in lines[i]:
                brace_pos = lines[i].find('{')
                start_idx = i
                break
        else:
            return None
    stack = 0
    for i in range(start_idx, len(lines)):
        line = lines[i]
        for ch in line:
            if ch == '{':
                stack += 1
            elif ch == '}':
                stack -= 1
                if stack == 0:
                    return i
    return None

def split_by_braces(lines, patterns):
    chunks = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if is_definition_line(line, patterns):
            start_idx = i
            brace_line_idx = None
            for j in range(i, min(i+5, len(lines))):
                if '{' in lines[j]:
                    brace_line_idx = j
                    break
            if brace_line_idx is not None:
                end_idx = find_matching_brace(lines, brace_line_idx)
                if end_idx is not None:
                    chunk_lines = lines[start_idx:end_idx+1]
                    chunks.append(''.join(chunk_lines))
                    i = end_idx + 1
                    continue
            chunk_lines = [lines[start_idx]]
            j = start_idx + 1
            while j < len(lines) and not is_definition_line(lines[j], patterns):
                chunk_lines.append(lines[j])
                j += 1
            chunks.append(''.join(chunk_lines))
            i = j
        else:
            i += 1
    return chunks

def split_chunks(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    if not lines:
        return []
    indent_based, patterns, _, _ = detect_language(file_path)
    if indent_based:
        return split_by_indentation(lines, patterns)
    else:
        return split_by_braces(lines, patterns)

# ----------------------------------------------------------------------
# Comment extraction and type detection
# ----------------------------------------------------------------------
def extract_comments_and_code(chunk_text, single_comment, multi_comment):
    lines = chunk_text.splitlines(keepends=True)
    code_lines = []
    comment_list = []
    in_multi = False
    multi_start, multi_end = multi_comment if multi_comment else (None, None)

    for line in lines:
        stripped = line.lstrip()
        if multi_start and multi_end:
            if not in_multi and multi_start in line:
                in_multi = True
                start_idx = line.find(multi_start)
                if multi_end in line:
                    end_idx = line.find(multi_end, start_idx) + len(multi_end)
                    comment_list.append(line[start_idx:end_idx])
                    rest = line[:start_idx] + line[end_idx:]
                    if rest.strip():
                        code_lines.append(rest)
                    in_multi = False
                else:
                    comment_list.append(line[start_idx:])
                    code_lines.append(line[:start_idx])
                continue
            elif in_multi:
                if multi_end in line:
                    end_idx = line.find(multi_end) + len(multi_end)
                    comment_list.append(line[:end_idx])
                    rest = line[end_idx:]
                    if rest.strip():
                        code_lines.append(rest)
                    in_multi = False
                else:
                    comment_list.append(line)
                continue

        if single_comment and single_comment in line:
            idx = line.find(single_comment)
            code_part = line[:idx]
            comment_part = line[idx:].rstrip('\n')
            if code_part.strip():
                code_lines.append(code_part)
            if comment_part.strip():
                comment_list.append(comment_part)
        else:
            if line.strip():
                code_lines.append(line)

    return ''.join(code_lines), comment_list

def detect_type(first_line):
    line = first_line.strip()
    if re.search(r'\b(def|function|fn|func|fun|async\s+function)\b', line):
        return 'function'
    if re.search(r'\b(class|struct|interface|trait|enum|record|module)\b', line):
        return 'class'
    if re.search(r'\b(protocol)\b', line):
        return 'interface'
    if re.search(r'\b(type\s+\w+\s+struct)\b', line):
        return 'struct'
    return 'unknown'

def extract_symbol_name(first_line, chunk_type):
    line = first_line.strip()
    if chunk_type == 'function':
        patterns = [
            r'def\s+(\w+)',
            r'function\s+(\w+)',
            r'async\s+function\s+(\w+)',
            r'fn\s+(\w+)',
            r'func\s+(\w+)',
            r'fun\s+(\w+)',
            r'(\w+)\s*\([^)]*\)\s*\{',
        ]
        for pat in patterns:
            m = re.search(pat, line)
            if m:
                return m.group(1)
    elif chunk_type == 'class':
        patterns = [
            r'class\s+(\w+)',
            r'struct\s+(\w+)',
            r'interface\s+(\w+)',
            r'trait\s+(\w+)',
            r'enum\s+(\w+)',
            r'module\s+(\w+)',
            r'record\s+(\w+)',
            r'protocol\s+(\w+)',
        ]
        for pat in patterns:
            m = re.search(pat, line)
            if m:
                return m.group(1)
    elif chunk_type == 'interface':
        m = re.search(r'protocol\s+(\w+)', line)
        if m:
            return m.group(1)
    elif chunk_type == 'struct':
        m = re.search(r'type\s+(\w+)\s+struct', line)
        if m:
            return m.group(1)
    m = re.search(r'\b(?:def|function|class|struct|interface|trait|enum|module|record|protocol|fn|func|fun)\s+(\w+)', line)
    if m:
        return m.group(1)
    return ""

def process_chunk(chunk_text, lang_config):
    _, _, single_comment, multi_comment = lang_config
    code, comments = extract_comments_and_code(chunk_text, single_comment, multi_comment)
    first_line = ''
    for line in chunk_text.splitlines():
        if line.strip():
            first_line = line
            break
    chunk_type = detect_type(first_line) if first_line else 'unknown'
    symbol_name = extract_symbol_name(first_line, chunk_type) if first_line else ''
    return {
        'code': code.strip(),
        'comments': [c.strip() for c in comments if c.strip()],
        'chunk_type': chunk_type,
        'symbol_name': symbol_name
    }

# ----------------------------------------------------------------------
# Public API
# ----------------------------------------------------------------------
def chunk_code_file(file_path):
    """
    Split a source file into logical chunks and return a list of dictionaries.

    Each dictionary contains:
        chunk_id, file_path, file_name, file_type, language,
        chunk_type, symbol_name, content (code and comments).

    Args:
        file_path (str): Path to the source file.

    Returns:
        list: List of chunk dictionaries.
    """
    raw_chunks = split_chunks(file_path)
    if not raw_chunks:
        return []

    lang_config = detect_language(file_path)
    language_name = get_language_name(file_path)
    path_obj = Path(file_path)
    file_name = path_obj.name
    file_stem = path_obj.stem

    result = []
    for idx, chunk_text in enumerate(raw_chunks, start=1):
        if not chunk_text.strip():
            continue
        processed = process_chunk(chunk_text, lang_config)
        chunk_id = f"{file_stem}_{idx:03d}"
        entry = {
            "chunk_id": chunk_id,
            "file_path": file_path,
            "file_name": file_name,
            "file_type": "code",
            "language": language_name,
            "chunk_type": processed['chunk_type'],
            "symbol_name": processed['symbol_name'],
            "content": {
                "code": processed['code'],
                "comments": processed['comments']
            }
        }
        result.append(entry)
    return result

