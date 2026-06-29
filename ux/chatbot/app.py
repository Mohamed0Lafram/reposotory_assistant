from flask import Flask, render_template, request, jsonify
import re


app = Flask(__name__)




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
