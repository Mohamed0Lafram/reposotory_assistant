#!/usr/bin/env python3
"""
app.py – Web interface for the repo chatbot using Gradio.
"""

import os
import shutil
from pathlib import Path
import gradio as gr

# ------------------------------------------------------------
# 1. Import your existing functions (replace these imports)
#    from your_ingestion_module import ingest_repo
#    from your_retrieval_module import answer_repo_question
# ------------------------------------------------------------
# For now, we'll define placeholder functions (replace with your real ones)
def ingest_repo(repo_url_or_path: str, db_path: str) -> str:
    """
    Your ingestion function – clone repo, chunk, store in ChromaDB.
    Return a status message.
    """
    print(f"⚠️ Using placeholder ingest_repo. Replace with your actual code.")
    # Simulate success
    return f"✅ Repository '{repo_url_or_path}' ingested successfully."

def answer_repo_question(query: str, db_path: str) -> str:
    """
    Your Q&A function – retrieve context and generate answer.
    """
    print(f"⚠️ Using placeholder answer_repo_question. Replace with your actual code.")
    return f"Placeholder answer for: '{query}'"

# ------------------------------------------------------------
# 2. Configuration
# ------------------------------------------------------------
DEFAULT_DB_PATH = "./repo_chatbot_db"

# Global variable to store the current DB path (per session)
current_db_path = DEFAULT_DB_PATH

# ------------------------------------------------------------
# 3. Functions called by the UI
# ------------------------------------------------------------
def ingest_repo_ui(repo_input: str) -> str:
    """
    Called when the user clicks "Ingest".
    """
    if not repo_input or not repo_input.strip():
        return "❌ Please enter a valid GitHub URL or local path."

    global current_db_path
    # Optionally, use a unique DB per repo
    # For simplicity, we use the same DB and overwrite on each ingest
    db_dir = Path(DEFAULT_DB_PATH)
    if db_dir.exists():
        shutil.rmtree(db_dir)   # clean old DB

    try:
        status = ingest_repo(repo_input, str(db_dir))
        current_db_path = str(db_dir)
        return status
    except Exception as e:
        return f"❌ Ingestion failed: {e}"

def answer_question_ui(query: str, history: list) -> tuple[str, list]:
    """
    Called when the user sends a chat message.
    """
    if not query.strip():
        return "", history

    # Check if DB exists
    if not Path(current_db_path).exists():
        history.append((query, "⚠️ No repository ingested yet. Please ingest a repo first."))
        return "", history

    try:
        answer = answer_repo_question(query, current_db_path)
        history.append((query, answer))
    except Exception as e:
        history.append((query, f"❌ Error: {e}"))
    return "", history

# ------------------------------------------------------------
# 4. Build the Gradio interface
# ------------------------------------------------------------
with gr.Blocks(title="Repo Chatbot", theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # 🤖 Repository Chatbot
    Enter a GitHub repository URL (or local path) to ingest, then ask questions about the codebase.
    """)

    with gr.Row():
        repo_input = gr.Textbox(
            label="Repository URL or Path",
            placeholder="e.g., https://github.com/username/repo or /path/to/local/repo",
            scale=8
        )
        ingest_btn = gr.Button("📥 Ingest", variant="primary", scale=1)

    ingest_status = gr.Textbox(label="Ingestion Status", interactive=False, lines=2)

    gr.Markdown("---")
    gr.Markdown("## 💬 Chat with your repository")

    chatbot = gr.Chatbot(height=400)
    msg = gr.Textbox(label="Ask a question", placeholder="What does this project do?", scale=8)
    clear = gr.Button("Clear Chat", variant="secondary")

    # Wire up events
    ingest_btn.click(
        fn=ingest_repo_ui,
        inputs=repo_input,
        outputs=ingest_status
    )

    # When user submits a message
    msg.submit(
        fn=answer_question_ui,
        inputs=[msg, chatbot],
        outputs=[msg, chatbot]
    )

    # Clear chat
    clear.click(lambda: [], outputs=chatbot)

# ------------------------------------------------------------
# 5. Run the app
# ------------------------------------------------------------
if __name__ == "__main__":
    demo.launch(share=False)   # set share=True for a public link