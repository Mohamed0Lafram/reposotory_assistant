from flask import Flask, render_template, request, jsonify
import re


app = Flask(__name__)


def dummy_ai(question: str, url: str) -> str:
    """Simple if/else chatbot logic based on keywords."""
    q = question.lower()
    domain = re.sub(r"^https?://", "", url).split("/")[0]
    if question == "what language is used in the repo":
        return f'Based on the provided files, the primary programming language used in the `front` directory of the repository is **JavaScript**, specifically utilizing the **React** framework.'
    if question == "how to use the repo":
        return ''' To install a repository, the exact steps depend on the project's programming language and tools, but the general process is usually:

Clone the repository from GitHub:
git clone https://github.com/Mohamed0Lafram/online-chess-game.git
Navigate into the project directory:
cd repository
Read the README.md file to check installation requirements and setup instructions.
Install dependencies. Common examples include:

Python:

pip install -r requirements.txt

Node.js:

npm install

Java (Maven):

mvn install
Configure any required environment variables or configuration files.
Run the application or tests according to the project's documentation.

A well-documented repository typically includes all installation instructions in its README file, making it the primary source of information during setup.'''
    if any(k in q for k in ["about", "what is", "describe", "explain"]):
        return (
            f"Based on <strong>{domain}</strong>, this looks like a website dedicated "
            "to providing content and services to its visitors. It appears to have a "
            "clear structure and purpose."
        )

    if any(k in q for k in ["who", "audience", "for", "target"]):
        return (
            f"This site seems aimed at a broad audience — likely people curious about "
            f"the topic or in need of the services offered on <strong>{domain}</strong>."
        )

    if any(k in q for k in ["do", "feature", "offer", "can i", "use"]):
        return (
            f"On <strong>{domain}</strong> you can browse content, find information, "
            "and interact with the tools or services available. Multiple sections "
            "likely exist to explore."
        )

    if any(k in q for k in ["secure", "safe", "https", "ssl", "certificate"]):
        if url.startswith("https"):
            return (
                "The URL uses <strong>HTTPS</strong> — the connection is encrypted "
                "and the site follows standard security practices."
            )
        return (
            "This URL uses plain <strong>HTTP</strong>, which is unencrypted. "
            "Avoid sharing sensitive information on this page."
        )

    if any(k in q for k in ["contact", "email", "phone", "reach"]):
        return (
            f"There's likely a contact section or footer on <strong>{domain}</strong> "
            "with an email address or social links. Scroll to the bottom of the page "
            "to find them."
        )

    if any(k in q for k in ["price", "cost", "free", "paid", "plan", "subscription"]):
        return (
            "I can't confirm exact pricing from the URL alone, but many sites like "
            f"<strong>{domain}</strong> offer both free and premium options. "
            "Check their pricing page directly."
        )

    if any(k in q for k in ["hello", "hi", "hey", "greet"]):
        return (
            f"Hello! I'm here to help you understand <strong>{domain}</strong>. "
            "Ask me anything about the page!"
        )

    if any(k in q for k in ["language", "programming", "lang", "code", "repo", "repository", "framework", "stack", "tech"]):
        return (
            "Based on the provided files, the primary programming language used in the "
            "<strong>front</strong> directory of the repository is <strong>JavaScript</strong>, "
            "specifically utilizing the <strong>React</strong> framework."
        )

    if any(k in q for k in ["mobile", "app", "android", "ios", "phone"]):
        return (
            f"Many modern sites like <strong>{domain}</strong> have a mobile-friendly "
            "version or a dedicated app. Check the App Store or Google Play for "
            "a native application."
        )

    # Default fallback
    return (
        f"Good question about <strong>{domain}</strong>. Based on the URL I'd suggest "
        "exploring the page directly for a definitive answer — but I'm happy to help "
        "you interpret anything you find!"
    )


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    question = data.get("question", "").strip()
    url = data.get("url", "").strip()

    if not question or not url:
        return jsonify({"error": "Missing question or url"}), 400

    answer = dummy_ai(question, url)
    return jsonify({"answer": answer})


if __name__ == "__main__":
    app.run(debug=True, port=5000)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    question = data.get("question", "").strip()
    url = data.get("url", "").strip()

    if not question or not url:
        return jsonify({"error": "Missing question or url"}), 400

    answer = dummy_ai(question)
    return jsonify({"answer": answer})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
