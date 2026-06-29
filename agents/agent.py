"""
agent.py – Answer questions about the repository using the retrieval module
and an LLM (Gemini, OpenAI, or local transformer).
"""

import os
import sys
from pathlib import Path

# ------------------------------------------------------------
# 1. Add the parent folder (where 'retrieval' lives) to sys.path
#    This assumes 'agent' and 'retrieval' are sibling folders.
# ------------------------------------------------------------
# Get the directory of this script (agent/)
agent_dir = Path(__file__).resolve().parent
# The project root is one level up from agent/
project_root = agent_dir.parent
# Add the project root so that 'retrieval' can be imported
sys.path.insert(0, str(project_root))

# Now we can import from the retrieval package
from retrieval.parent_child import retrieve_parent_child

# ------------------------------------------------------------
# 2. Agent configuration
# ------------------------------------------------------------
USE_GEMINI = True                     # Set True to use Gemini
USE_OPENAI = False                    # Set True to use OpenAI (ignored if USE_GEMINI is True)
MAX_CONTENT_CHARS = 4000
TOP_K_FILES = 3
GEMINI_MODEL = "gemini-2.5-flash"     # or "gemini-1.5-pro"

# ------------------------------------------------------------
# 3. Core answering function
# ------------------------------------------------------------
def answer_repo_question(query: str) -> str:
    # Retrieve files
    parents = retrieve_parent_child(query, top_k_children=TOP_K_FILES * 5)
    if not parents:
        return "No relevant files found in the repository."

    parents = parents[:TOP_K_FILES]

    # Build context
    context_parts = []
    for p in parents:
        file_id = p['id']
        content = p['content']
        if len(content) > MAX_CONTENT_CHARS:
            content = content[:MAX_CONTENT_CHARS] + "\n... [file truncated]"
        context_parts.append(f"--- File: {file_id} ---\n```\n{content}\n```")
    context = "\n\n".join(context_parts)

    prompt = (
        "You are an AI assistant that answers questions about a software repository. "
        "Use the following file contents as context. If the answer is not in the context, "
        "say 'I don't know'.\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {query}\n\n"
        "Answer:"
    )

    if USE_GEMINI:
        return answer_with_gemini(prompt)


def answer_with_gemini(prompt: str) -> str:
    try:
        import google.generativeai as genai
    except ImportError:
        return "Please install google-generativeai: pip install google-generativeai"

    api_key = "AQ.Ab8RN6INfGyyWJRVCiQlPT5z5cnkcPA3MEt2lUmmfWhzkmKYsA"
    if not api_key:
        return "Please set the GEMINI_API_KEY environment variable."

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(GEMINI_MODEL)
    try:
        print("1")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Gemini error: {e}"


# ------------------------------------------------------------
# 4. CLI entry point
# ------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
    else:
        query = input("Enter your question about the repository: ")

    answer = answer_repo_question(query)
    print("\n" + "="*50)
    print("ANSWER:")
    print(answer)