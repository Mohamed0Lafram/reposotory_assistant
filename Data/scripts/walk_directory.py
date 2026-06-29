#!/usr/bin/env python3
"""
File‑tree scanner – returns a list of file paths (relative or absolute).
"""

import os
import sys
import json

# ----------------------------------------------------------------------
# Default directories to skip
# ----------------------------------------------------------------------
IGNORE_DIRS = [
    ".git", ".github_cache",
    "__pycache__", ".pytest_cache", ".mypy_cache", ".ruff_cache",
    ".tox", ".nox", ".hypothesis", "venv", ".venv", "env", ".env", "site-packages",
    "node_modules", ".next", ".nuxt", ".npm", ".pnpm-store", ".yarn",
    ".parcel-cache", ".turbo",
    "build", "dist", "out", "release", "debug", "tmp", "temp",
    "target", ".gradle",
    "cmake-build-debug", "cmake-build-release", "CMakeFiles",
    "target",       # Rust
    "bin", "obj",   # .NET
    "vendor",       # PHP
    "pkg",          # Go
    "Pods", "DerivedData", ".build",
    ".cxx",
    ".terraform",
    ".idea", ".vscode", ".vs",
    "coverage", "htmlcov", ".coverage",
    ".cache", ".sass-cache", ".eslintcache",
    "logs", "log",
    ".docker",
    "backup", "backups", ".history", ".DS_Store",
]

IGNORE_SET = set(IGNORE_DIRS)

# ----------------------------------------------------------------------
# Forbidden system roots (safety check)
# ----------------------------------------------------------------------
FORBIDDEN_ROOTS = [
    # Unix-like
    "/bin", "/boot", "/dev", "/etc", "/lib", "/lib64",
    "/proc", "/sbin", "/sys", "/usr",
    # Windows
    "C:\\Windows", "C:\\System", "C:\\Program Files", "C:\\Program Files (x86)",
    "C:\\ProgramData", "C:\\Users\\Public",
]

def is_safe_root(path):
    """Return False if path is inside a forbidden system directory."""
    abs_path = os.path.abspath(path)
    if os.name == 'nt':
        abs_path = abs_path.lower()
        forbidden = {f.lower() for f in FORBIDDEN_ROOTS}
    else:
        forbidden = set(FORBIDDEN_ROOTS)

    for forbidden_root in forbidden:
        if abs_path == forbidden_root or abs_path.startswith(forbidden_root + os.sep):
            return False
    return True

def should_skip_dir(name, extra_ignore=None):
    """
    Return True if directory name is in the ignore set,
    starts with a dot, or is in extra_ignore (if provided).
    """
    if name in IGNORE_SET:
        return True
    if name.startswith('.'):
        return True
    if extra_ignore and name in extra_ignore:
        return True
    return False

def collect_files(base, absolute=False, extra_ignore=None):
    """
    Walk the directory tree, skipping ignored folders.
    Returns a list of file paths (relative to base or absolute).
    """
    base = os.path.abspath(base)
    file_paths = []

    for dirpath, dirnames, filenames in os.walk(base, topdown=True):
        # Filter out skipped directories (modify in‑place)
        for name in dirnames[:]:
            if should_skip_dir(name, extra_ignore):
                dirnames.remove(name)

        for fname in filenames:
            full = os.path.join(dirpath, fname)
            if absolute:
                file_paths.append(full)
            else:
                file_paths.append(os.path.relpath(full, base))

    return file_paths

# ----------------------------------------------------------------------
# Public API – the function you import and call
# ----------------------------------------------------------------------
def scan_directory(base, absolute=False, extra_ignore=None, no_safety=False):
    """
    Scan a directory and return a list of file paths.

    Parameters:
        base (str)        : root directory to scan
        absolute (bool)   : if True, return absolute paths; else relative (default False)
        extra_ignore (list): additional directory names to skip (e.g. ['my_temp', 'cache'])
        no_safety (bool)  : if True, bypass the system‑root safety check (default False)

    Returns:
        list of str : file paths

    Raises:
        ValueError: if base is not a directory or is a forbidden system root
    """
    if not os.path.isdir(base):
        raise ValueError(f"'{base}' is not a valid directory.")

    if not no_safety and not is_safe_root(base):
        raise ValueError(f"Refusing to scan system‑critical directory: {base}")

    return collect_files(base, absolute, extra_ignore)

