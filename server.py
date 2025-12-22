import json
import os
import sqlite3
import hashlib
import smtplib
import html
from email.message import EmailMessage
from pathlib import Path
from flask import Flask, request, jsonify, g, abort, make_response


def load_env_file(path: Path = Path(".env")):
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if key and key not in os.environ:
            os.environ[key] = value


load_env_file()

DB_PATH = os.environ.get("SITE_DB", "site-data.db")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "west123")
TOKEN_SECRET = os.environ.get("TOKEN_SECRET", "dev-secret")
TABLE_SQL = """
CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    payload TEXT NOT NULL
);
"""
DEFAULT_CONTENT_PATH = Path("site-data.json")
SMTP_HOST = os.environ.get("SMTP_HOST")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
SMTP_FROM = os.environ.get("SMTP_FROM") or SMTP_USER
CONTACT_RECEIVER_EMAIL = os.environ.get("CONTACT_RECEIVER_EMAIL") or SMTP_FROM

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.execute(TABLE_SQL)
        g.db.commit()
    return g.db

def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def load_default_payload():
    if DEFAULT_CONTENT_PATH.exists():
        try:
            return json.loads(DEFAULT_CONTENT_PATH.read_text())
        except Exception:
            pass
    return {}


def ensure_seed():
    db = get_db()
    cur = db.execute("SELECT payload FROM content WHERE id = 1")
    row = cur.fetchone()
    if row is None:
        payload = load_default_payload()
        db.execute("INSERT INTO content (id, payload) VALUES (1, ?)", (json.dumps(payload),))
        db.commit()


def make_token(password: str) -> str:
    return hashlib.sha256(f"{password}:{TOKEN_SECRET}".encode()).hexdigest()


def require_auth():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.lower().startswith("bearer "):
        abort(make_response(jsonify({"error": "missing token"}), 401))
    token = auth_header.split(None, 1)[1].strip()
    if token != make_token(ADMIN_PASSWORD):
        abort(make_response(jsonify({"error": "invalid token"}), 401))


app = Flask(__name__)
app.teardown_appcontext(close_db)


def send_email(to_address: str, subject: str, body: str, reply_to: str = None, html_body: str = None):
    if not SMTP_HOST or not SMTP_FROM:
        raise RuntimeError("SMTP is not configured. Set SMTP_HOST and SMTP_FROM.")

    msg = EmailMessage()
    msg["From"] = SMTP_FROM
    msg["To"] = to_address
    msg["Subject"] = subject
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.set_content(body)
    if html_body:
        msg.add_alternative(html_body, subtype="html")

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
        smtp.starttls()
        if SMTP_USER and SMTP_PASSWORD:
            smtp.login(SMTP_USER, SMTP_PASSWORD)
        smtp.send_message(msg)

@app.after_request
def add_cors(resp):
    resp.headers.setdefault("Access-Control-Allow-Origin", "*")
    resp.headers.setdefault("Access-Control-Allow-Headers", "Authorization, Content-Type")
    resp.headers.setdefault("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return resp

@app.route("/api/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}
    password = body.get("password", "")
    if password != ADMIN_PASSWORD:
        return jsonify({"error": "invalid credentials"}), 401
    return jsonify({"token": make_token(password)})

@app.route("/api/content", methods=["GET", "POST", "OPTIONS"])
def content():
    ensure_seed()
    if request.method == "GET":
        db = get_db()
        row = db.execute("SELECT payload FROM content WHERE id = 1").fetchone()
        payload = json.loads(row[0]) if row else {}
        return jsonify(payload)

    if request.method == "OPTIONS":
        return ("", 204)

    require_auth()
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({"error": "invalid json"}), 400
    db = get_db()
    db.execute("UPDATE content SET payload = ? WHERE id = 1", (json.dumps(body),))
    db.commit()
    return jsonify({"status": "ok"})


@app.route("/api/contact", methods=["GET", "POST", "OPTIONS"], strict_slashes=False)
def contact():
    if request.method == "GET":
        return jsonify({"status": "ok"})

    if request.method == "OPTIONS":
        return ("", 204)

    body = request.get_json(silent=True) or {}
    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip()
    message = (body.get("message") or "").strip()
    subject = (body.get("subject") or "Website enquiry").strip()
    
    print(body, name , email , message, subject)
    print("printed")

    if not name or not email or not message:
        return jsonify({"error": "name, email, and message are required"}), 400

    if not CONTACT_RECEIVER_EMAIL:
        return jsonify({"error": "contact receiver email not configured"}), 500

    try:
        admin_body = (
            f"New website enquiry\n\n"
            f"Name: {name}\n"
            f"Email: {email}\n"
            f"Subject: {subject or 'Contact Form'}\n\n"
            f"{message}\n"
        )
        send_email(CONTACT_RECEIVER_EMAIL, f"New enquiry from {name}", admin_body, reply_to=email)

        escaped_name = html.escape(name)
        escaped_message = html.escape(message).replace("\n", "<br>")
        confirmation_body = (
            f"Hi {name},\n\n"
            "Thanks for reaching out to West Basketball Club. We received your message and will respond soon.\n\n"
            "Here's what you sent:\n"
            f"{message}\n\n"
            "If you need to add anything, just reply to this email.\n\n"
            "- West Basketball Club"
        )
        confirmation_html = f"""
        <html>
  <body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#111;">
    
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;background:#ffffff;">
      <tr>
        <td align="center">

          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="text-align:left;">
            
            <!-- Logo / Tag -->
            <tr>
              <td style="text-align:center;padding-bottom:20px;">
                <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:#16a34a;color:#ffffff;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">
                  West Basketball Club
                </div>
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td style="text-align:center;padding-bottom:12px;">
                <h1 style="margin:0;font-size:22px;color:#111;">Thanks, {escaped_name}!</h1>
              </td>
            </tr>

            <!-- Subtitle -->
            <tr>
              <td style="text-align:center;padding-bottom:24px;">
                <p style="margin:0;font-size:14px;color:#444;">We've received your message and will get back to you shortly.</p>
              </td>
            </tr>

            <!-- Message Box -->
            <tr>
              <td>
                <div style="border-left:4px solid #dc2626;padding:12px 16px;background:#f9fafb;border-radius:6px;">
                  <p style="margin:0 0 6px 0;font-weight:600;color:#111;">Your Message:</p>
                  <p style="margin:0 0 10px 0;color:#444;line-height:1.5;">{escaped_message}</p>
                  <p style="margin:0;font-size:13px;color:#dc2626;font-weight:600;">We'll reply to: {html.escape(email)}</p>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding-top:24px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#666;">If you need to add anything, just reply to this email.</p>
                <p style="margin:6px 0 0;font-size:12px;color:#666;">Newcastle • Australia</p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
</html>

        """
        send_email(email, "Thanks for contacting West Basketball Club", confirmation_body, html_body=confirmation_html)
    except Exception as exc:  # noqa: BLE001
        print("Email send failed:", exc)
        return jsonify({"error": "Unable to send your message right now."}), 500

    return jsonify({"status": "ok"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Serving on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port)
