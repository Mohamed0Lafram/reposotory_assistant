#!/usr/bin/env python3
"""
chunk_paragraphs.py - Chunk various document types by paragraphs.

Supported formats: .txt, .tex, .pdf, .docx, .odt, .rst, .md, .xml, .log (and plain text fallback)

Usage:
    python chunk_paragraphs.py <file_path> [--format json|text]

Output (JSON):
    List of chunk objects with metadata.
"""

import sys
import re
import json
from pathlib import Path

# ----------------------------------------------------------------------
# Optional dependencies
# ----------------------------------------------------------------------
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

try:
    import docx
except ImportError:
    docx = None

try:
    import odf.opendocument
    from odf.text import P
except ImportError:
    odf = None

try:
    from langdetect import detect
    HAS_LANGDETECT = True
except ImportError:
    HAS_LANGDETECT = False
    detect = None

# ----------------------------------------------------------------------
# Core chunking function
# ----------------------------------------------------------------------
def chunk_text(file_path):
    """
    Parse a file and return a list of paragraph chunks with metadata.

    Args:
        file_path (str): Path to the input file.

    Returns:
        list: A list of dictionaries, each containing:
            - chunk_id (str): unique identifier
            - file_path (str): original file path
            - file_name (str): base name of the file
            - file_type (str): category (e.g., 'documentation')
            - language (str): detected language or 'unknown'
            - section_name (list): hierarchical headings (may be empty)
            - content (str): the paragraph text
    """
    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def chunk_by_paragraphs(text):
        paragraphs = re.split(r'\n\s*\n+', text.strip())
        return [p.strip() for p in paragraphs if p.strip()]

    def detect_language(text):
        if HAS_LANGDETECT and text:
            try:
                return detect(text)
            except Exception:
                pass
        return 'unknown'

    def get_file_type(ext):
        mapping = {
            '.txt': 'text',
            '.tex': 'latex',
            '.pdf': 'pdf',
            '.docx': 'word',
            '.odt': 'word',
            '.rst': 'restructuredtext',
            '.md': 'markdown',
            '.xml': 'xml',
            '.log': 'log',
        }
        return mapping.get(ext, 'documentation')

    # ------------------------------------------------------------------
    # Section detection
    # ------------------------------------------------------------------
    def detect_sections(text):
        """
        Scan text for headings and return a list of (line_index, level, heading_text)
        for lines that look like section titles.
        """
        headings = []
        lines = text.splitlines()
        i = 0
        while i < len(lines):
            line = lines[i].strip()

            # Markdown headings: #, ##, ...
            md_match = re.match(r'^(#{1,6})\s+(.+)$', line)
            if md_match:
                level = len(md_match.group(1))
                heading = md_match.group(2).strip()
                headings.append((i, level, heading))
                i += 1
                continue

            # LaTeX \section, \subsection, ...  (fixed regex)
            latex_match = re.match(r'\\(?:sub)*section\*?\s*\{([^}]*)\}', line)
            if latex_match:
                # Count number of "sub" occurrences to determine level
                cmd = latex_match.group(0)
                level = cmd.count('sub') + 1
                heading = latex_match.group(1).strip()
                headings.append((i, level, heading))
                i += 1
                continue

            # RST headings: over/underlined with =, -, ~, etc.
            if i < len(lines) - 1:
                next_line = lines[i+1].strip()
                if re.match(r'^[=\-~`\'"]+$', next_line) and len(next_line) >= len(line):
                    level = 1  # treat all as same level for simplicity
                    heading = line
                    headings.append((i, level, heading))
                    i += 2
                    continue

            i += 1
        return headings

    def assign_section_names(text, headings):
        """
        Scan the full text and produce a list of (section_stack, paragraph_text)
        where section_stack is the current list of hierarchical headings.
        """
        lines = text.splitlines()
        heading_indices = {idx for idx, _, _ in headings}
        heading_info = {idx: (level, text) for idx, level, text in headings}

        section_stack = []
        current_para_lines = []
        result = []

        i = 0
        while i < len(lines):
            line = lines[i]
            stripped = line.strip()

            if i in heading_indices:
                # Flush any accumulated paragraph
                if current_para_lines:
                    para_text = '\n'.join(current_para_lines).strip()
                    if para_text:
                        result.append((list(section_stack), para_text))
                    current_para_lines = []

                # Update section stack
                level, heading_text = heading_info[i]
                while len(section_stack) >= level:
                    section_stack.pop()
                section_stack.append(heading_text)
                i += 1
                continue

            # Not a heading: collect lines until a blank line or next heading
            if stripped == '':
                if current_para_lines:
                    para_text = '\n'.join(current_para_lines).strip()
                    if para_text:
                        result.append((list(section_stack), para_text))
                    current_para_lines = []
            else:
                current_para_lines.append(line)
            i += 1

        # Flush final paragraph
        if current_para_lines:
            para_text = '\n'.join(current_para_lines).strip()
            if para_text:
                result.append((list(section_stack), para_text))

        return result

    # ------------------------------------------------------------------
    # File parsers (unchanged)
    # ------------------------------------------------------------------
    def parse_txt(file_path):
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()

    def parse_tex(file_path):
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        content = re.sub(r'(?<!\\)%.*$', '', content, flags=re.MULTILINE)
        content = re.sub(r'\\[a-zA-Z]+(\[[^\]]*\])?(\{[^}]*\})?', '', content)
        content = re.sub(r'\\begin\{[^}]*\}.*?\\end\{[^}]*\}', '', content, flags=re.DOTALL)
        return content

    def parse_pdf(file_path):
        if PyPDF2 is None:
            raise ImportError("PyPDF2 is not installed. Run: pip install PyPDF2")
        text = []
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text.append(page_text)
        return '\n'.join(text)

    def parse_docx(file_path):
        if docx is None:
            raise ImportError("python-docx is not installed. Run: pip install python-docx")
        doc = docx.Document(file_path)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return '\n\n'.join(paragraphs)

    def parse_odt(file_path):
        if odf is None:
            raise ImportError("odfpy is not installed. Run: pip install odfpy")
        doc = odf.opendocument.load(file_path)
        paragraphs = []
        for p in doc.getElementsByType(P):
            text = ''.join([node.data for node in p.childNodes if hasattr(node, 'data')])
            if text.strip():
                paragraphs.append(text)
        return '\n\n'.join(paragraphs)

    def parse_rst(file_path):
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        content = re.sub(r'\.\. [a-zA-Z_]+::.*?(\n\s+\S.*?)*?(?=\n\n|\n[^\s])', '', content, flags=re.DOTALL)
        content = re.sub(r'\.\. .*$', '', content, flags=re.MULTILINE)
        return content

    def parse_md(file_path):
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()

    def parse_xml(file_path):
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        content = re.sub(r'<[^>]+>', ' ', content)
        return content

    def parse_log(file_path):
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()

    def parse_unknown(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        except Exception:
            return ""

    # ------------------------------------------------------------------
    # File type detection
    # ------------------------------------------------------------------
    PARSERS = {
        '.txt': parse_txt,
        '.tex': parse_tex,
        '.pdf': parse_pdf,
        '.docx': parse_docx,
        '.odt': parse_odt,
        '.rst': parse_rst,
        '.md': parse_md,
        '.xml': parse_xml,
        '.log': parse_log,
    }

    ext = Path(file_path).suffix.lower()
    parser = PARSERS.get(ext, parse_unknown)

    # ------------------------------------------------------------------
    # Parse and chunk
    # ------------------------------------------------------------------
    try:
        text = parser(file_path)
    except Exception:
        return []

    # Detect headings and get paragraphs with section stacks
    headings = detect_sections(text)
    paragraphs_with_sections = assign_section_names(text, headings)

    # Prepare metadata
    path_obj = Path(file_path)
    file_name = path_obj.name
    file_type = get_file_type(ext)
    lang = detect_language(text)

    # Build chunks
    chunks = []
    for idx, (section_stack, para_text) in enumerate(paragraphs_with_sections, start=1):
        stem = path_obj.stem
        if section_stack:
            # use the deepest section as part of the id
            last_section = re.sub(r'\W+', '_', section_stack[-1]).strip('_')
            chunk_id = f"{stem}_{last_section}_{idx:03d}"
        else:
            chunk_id = f"{stem}_{idx:03d}"

        chunks.append({
            "chunk_id": chunk_id,
            "file_path": file_path,
            "file_name": file_name,
            "file_type": file_type,
            "language": lang,
            "section_name": section_stack,
            "content": para_text,
        })

    return chunks

