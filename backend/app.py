from flask import Flask, request, jsonify
from flask_cors import CORS
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
import requests
import os
from datetime import datetime


# Ensure VADER is available (downloads once)
try:
    nltk.data.find('sentiment/vader_lexicon.zip')
except LookupError:
    nltk.download('vader_lexicon')

sia = SentimentIntensityAnalyzer()


app = Flask(__name__)
CORS(app)

# # Change model as you like (must be pulled in Ollama: e.g., `ollama pull llama3`)
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "llama3")

SYSTEM_PROMPT = """You are a supportive, non-judgmental mental health companion.
Goals:
- Be empathetic, warm, validating feelings.
- Ask gentle, open-ended questions.
- Offer self-care tips and evidence-informed psychoeducation at a high level.
- Encourage seeking professional help when appropriate.

Safety:
- If user expresses intent to harm self/others, or severe crisis, respond with a supportive crisis message and guide them to contact local emergency services or trusted people immediately. Do not give medical advice or instructions for self-harm.
- Do NOT diagnose or prescribe. Encourage professional support.

Style:
- Short paragraphs. Simple language. Avoid clinical jargon unless requested.
"""

# Simple crisis detector (expand as needed)
CRISIS_REGEX = re.compile(
    r"(suicide|kill myself|end my life|self-harm|self harm|hurt myself|"
    r"harm myself|kill (?:him|her|them|someone)|i don'?t want to live|"
    r"i can'?t go on|overdose|cutting|i want to die)",
    re.IGNORECASE
)

CRISIS_RESPONSE = (
    "I'm really sorry you're going through this. You deserve care and support.\n\n"
    "If you feel in immediate danger, please contact **local emergency services** or a "
    "trusted person nearby right now.\n\n"
    "You can also consider reaching out to a **local mental health professional** or a "
    "confidential helpline in your country. If you can, talk to someone you trust about how you feel.\n\n"
    "I'm here to listen. Would you like to tell me more about what's been hardest lately?"
)

@app.route("/chat", methods=["POST"])
def chat():
    body = request.get_json(force=True)
    user_message = (body.get("message") or "").strip()
    history = body.get("history") or []  # [{role: 'user'|'assistant'|'system', content: str}, ...]

    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    # Crisis check — short-circuit with supportive response
    if CRISIS_REGEX.search(user_message):
        return jsonify({
            "reply": CRISIS_RESPONSE,
            "crisis": True
        }), 200

    # Build messages for Ollama
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    # Keep only last ~12 turns to stay light (tune as needed)
    for m in history[-24:]:
        if m.get("role") in ("user", "assistant", "system") and isinstance(m.get("content"), str):
            messages.append({"role": m["role"], "content": m["content"]})
    messages.append({"role": "user", "content": user_message})

    # Call Ollama chat API
    try:
        r = requests.post(
            f"{OLLAMA_HOST}/api/chat",
            json={"model": MODEL_NAME, "messages": messages, "stream": False},
            timeout=60,
        )
        r.raise_for_status()
        data = r.json()
        reply = data.get("message", {}).get("content", "").strip() or \
                data.get("response", "").strip()  # some models use "response"
        if not reply:
            reply = "I'm here with you. Could you share a bit more about how you're feeling?"

        return jsonify({"reply": reply, "crisis": False}), 200
    except requests.RequestException as e:
        print("Ollama error:", e)
        return jsonify({"error": "LLM backend unavailable"}), 502
def label_from_compound(c):
    if c >= 0.05: return "positive"
    if c <= -0.05: return "negative"
    return "neutral"

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True})

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json(force=True)
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "text is required"}), 400
    scores = sia.polarity_scores(text)
    mapped_scores = {
    "positive": scores["pos"],
    "neutral": scores["neu"],
    "negative": scores["neg"],
    "compound": scores["compound"]
    }
    return jsonify({"scores": mapped_scores, "sentiment": label_from_compound(scores["compound"])})

@app.route("/batch", methods=["POST"])
def batch():
    data = request.get_json(force=True)
    items = data.get("items") or []  # [{text, ts?}]
    out = []
    for i in items:
        t = (i.get("text") or "").strip()
        ts = i.get("ts")  # optional timestamp for charting
        if not t: 
            continue
        s = sia.polarity_scores(t)
        out.append({
            "text": t,
            "ts": ts,
            "scores": s,
            "label": label_from_compound(s["compound"])
        })
    return jsonify({"results": out})

if __name__ == "__main__":
    app.run()
