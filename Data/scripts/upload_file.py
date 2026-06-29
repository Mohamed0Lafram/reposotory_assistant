#!/usr/bin/env python3
"""
download_repo.py — Download a GitHub repository
Usage: python download_repo.py <github_url> [destination]

Examples:
  python download_repo.py https://github.com/user/repo
  python download_repo.py https://github.com/user/repo my-folder
  python download_repo.py https://github.com/user/repo/tree/dev
"""

import re
import sys
import os
import io
import zipfile
import urllib.request
import urllib.error
import shutil
import subprocess


# ── URL parsing ────────────────────────────────────────────────────────────────

def parse_github_url(url: str) -> tuple[str, str, str]:
    """
    Parse a GitHub URL and return (owner, repo, branch).
    Branch is an empty string when not specified.
    """
    url = url.rstrip("/").removesuffix(".git")
    pattern = r"^https://github\.com/([^/]+)/([^/]+)(?:/tree/(.+))?$"
    match = re.match(pattern, url)
    if not match:
        print(f"❌  Invalid GitHub URL: {url}")
        print("    Expected: https://github.com/owner/repo[/tree/branch]")
        sys.exit(1)
    owner, repo, branch = match.group(1), match.group(2), match.group(3) or ""
    return owner, repo, branch


# ── download strategies ────────────────────────────────────────────────────────



def download_zip(owner: str, repo: str, branch: str, dest: str) -> None:
    """Download the repo ZIP archive from GitHub and extract it."""
    ref = branch or "HEAD"
    zip_url = f"https://github.com/{owner}/{repo}/archive/{ref}.zip"
 
    print("▶  Downloading ZIP archive …")
    print(f"   {zip_url}")
 
    try:
        with urllib.request.urlopen(zip_url) as response:
            total = response.headers.get("Content-Length")
            total = int(total) if total else None
            downloaded = 0
            chunks = []
 
            while True:
                chunk = response.read(1024 * 64)  # 64 KB
                if not chunk:
                    break
                chunks.append(chunk)
                downloaded += len(chunk)
                if total:
                    pct = downloaded / total * 100
                    bar = "█" * int(pct // 2) + "░" * (50 - int(pct // 2))
                    print(f"\r   [{bar}] {pct:5.1f}%", end="", flush=True)
 
            print()  # newline after progress bar
            data = b"".join(chunks)
 
    except urllib.error.HTTPError as e:
        print(f"\n❌  HTTP {e.code}: {e.reason}")
        print("    Check that the repo/branch exists and is public.")
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"\n❌  Network error: {e.reason}")
        sys.exit(1)
 
    print("▶  Extracting …")
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        # GitHub names the top-level folder inside the ZIP as "repo-ref"
        top_level = zf.namelist()[0].split("/")[0]
        zf.extractall(".")

    
    # Rename the extracted folder to the repo name, inside dest
    target = os.path.join(dest, repo)   # e.g., "./myfolder/myproject"
    if os.path.exists(target):
        shutil.rmtree(target)           # optional: remove existing folder
    shutil.move(top_level, target)
    # Always move the extracted folder into dest
    if top_level != dest:
        shutil.move(top_level, f"./{dest}/")
    
    print(f"▶  Placed repository into: {dest}/")
 


# ── main ───────────────────────────────────────────────────────────────────────

def main() -> None:

    raw_url = "https://github.com/Mohamed0Lafram/online-chess-game"
    owner, repo, branch = parse_github_url(raw_url)
    dest ="repo"



    clone_url = f"https://github.com/{owner}/{repo}.git"

    # Try git first; fall back to ZIP download
    download_zip(owner, repo, branch, dest)

    print(f"\n✅  Done! Repository saved to: {dest}/")


if __name__ == "__main__":
    main()