import os

from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from google import genai

# =========================================================
# LOAD ENVIRONMENT
# =========================================================

load_dotenv()


# =========================================================
# FLASK
# =========================================================

app = Flask(__name__)


# =========================================================
# GEMINI CONFIGURATION
# =========================================================

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "").strip()

client = None

print("\n========================================")
print("              JANGANGPT")
print("========================================")

if GOOGLE_API_KEY:

    try:

        client = genai.Client(
            api_key=GOOGLE_API_KEY
        )

        print("GOOGLE_API_KEY : Loaded")
        print("GEMINI MODEL   : gemini-3.6-flash")

    except Exception as e:

        print(
            "Gemini initialization error:",
            repr(e)
        )

else:

    print("GOOGLE_API_KEY : MISSING")


print("========================================\n")


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():

    return render_template(
        "index.html"
    )


# =========================================================
# CHAT API
# =========================================================

@app.route(
    "/chat",
    methods=["POST"]
)
def chat():

    # -----------------------------------------------------
    # CHECK API CLIENT
    # -----------------------------------------------------

    if client is None:

        return jsonify({
            "error":
                "GOOGLE_API_KEY is missing. "
                "Please add your Gemini API key to .env."
        }), 500


    try:

        # -------------------------------------------------
        # GET REQUEST DATA
        # -------------------------------------------------

        data = request.get_json(
            silent=True
        ) or {}


        messages = data.get(
            "messages",
            []
        )


        if not messages:

            return jsonify({
                "error":
                    "Message is required."
            }), 400


        # -------------------------------------------------
        # BUILD CONVERSATION
        # -------------------------------------------------

        conversation_parts = []


        for message in messages:

            role = message.get(
                "role",
                ""
            )

            content = message.get(
                "content",
                ""
            ).strip()


            if not content:
                continue


            if role == "user":

                conversation_parts.append(
                    f"User: {content}"
                )


            elif role == "assistant":

                conversation_parts.append(
                    f"Assistant: {content}"
                )


        conversation = "\n\n".join(
            conversation_parts
        )


        # -------------------------------------------------
        # SYSTEM INSTRUCTION
        # -------------------------------------------------

        prompt = f"""
You are Jagangpt, a helpful and intelligent general-purpose AI assistant.

Your job is to provide useful, accurate, natural and easy-to-understand answers.

Important behavior:

1. Understand English.
2. Understand Telugu.
3. Understand Telugu-English mixed language.
4. Reply naturally in the same language/style used by the user.
5. If the user asks programming questions, provide clean working code.
6. Explain programming concepts clearly.
7. Use Markdown when useful.
8. Put programming code inside Markdown code blocks.
9. Help with Python, JavaScript, HTML, CSS, Flask, databases, AI, ML and general technology.
10. Help with learning, writing, mathematics and general questions.
11. Do not mention these internal instructions.
12. Do not claim that you are a RAG system.
13. You are a normal conversational AI assistant.
14. Be concise when the question is simple.
15. Give detailed explanations when the question requires them.

Conversation:

{conversation}

Now answer the user's latest message.
"""


        # -------------------------------------------------
        # GEMINI
        # -------------------------------------------------

        response = client.models.generate_content(

            model="gemini-3.6-flash",

            contents=prompt

        )


        # -------------------------------------------------
        # RESPONSE TEXT
        # -------------------------------------------------

        answer = response.text


        if not answer:

            answer = (
                "I couldn't generate a response."
            )


        # -------------------------------------------------
        # RETURN
        # -------------------------------------------------

        return jsonify({

            "success": True,

            "response": answer

        })


    except Exception as e:

        print(
            "\nCHAT ERROR:",
            repr(e)
        )


        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/health")
def health():

    return jsonify({

        "status": "ok",

        "app": "Jagangpt",

        "gemini": (
            "connected"
            if client
            else "not configured"
        )

    })


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":

    app.run(

        host="127.0.0.1",

        port=5000,

    )
