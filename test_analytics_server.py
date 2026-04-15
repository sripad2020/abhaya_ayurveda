import sys, os, json, threading
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
from pathlib import Path

# ── Seed analytics DB with realistic fake data ─────────────────
from app.analytics import init_analytics_db, get_stats, get_connection, SESSION_COOKIE, SESSION_MAX

def seed_data():
    """Insert realistic demo data into analytics.db"""
    import uuid, random
    from datetime import datetime, timezone, timedelta

    conn = get_connection()
    cur  = conn.cursor()

    count = cur.execute("SELECT COUNT(*) FROM visits").fetchone()[0]
    if count > 80:
        print("[seed] Already have %d rows, skipping seed." % count)
        conn.close()
        return

    pages    = ["/", "/assess", "/consult", "/body-wisdom"]
    countries = [
        ("India", "Mumbai"), ("India", "Delhi"), ("India", "Bangalore"),
        ("United States", "New York"), ("United States", "San Francisco"),
        ("United Kingdom", "London"), ("Germany", "Berlin"),
        ("Australia", "Sydney"), ("Singapore", "Singapore"),
        ("UAE", "Dubai"), ("Canada", "Toronto"),
        ("Local / Dev", ""), ("Unknown", ""),
    ]
    referrers = [
        "https://google.com/search?q=ayurveda",
        "https://instagram.com/",
        "https://facebook.com/",
        "",  # direct
        "",
        "",
        "https://twitter.com/",
        "https://linkedin.com/",
    ]

    now = datetime.now(timezone.utc)
    rows = []
    sessions = [str(uuid.uuid4()) for _ in range(120)]

    for i in range(400):
        session = random.choice(sessions)
        page    = random.choice(pages)
        country, city = random.choice(countries)
        ref     = random.choice(referrers)
        days_ago  = random.randint(0, 29)
        hours_ago = random.randint(0, 23)
        visited   = (now - timedelta(days=days_ago, hours=hours_ago)).isoformat()
        ip_hash   = "demohash%04d" % i
        ua        = "Mozilla/5.0 (Demo Browser)"
        rows.append((session, page, ip_hash, country, city, ua, ref, visited))

    cur.executemany(
        "INSERT INTO visits (session_id,page,ip_hash,country,city,user_agent,referrer,visited_at) VALUES (?,?,?,?,?,?,?,?)",
        rows,
    )
    conn.commit()
    conn.close()
    print("[seed] Inserted %d demo visits across %d unique sessions." % (len(rows), len(sessions)))


# ── Tiny HTTP server ───────────────────────────────────────────
BASE_DIR      = Path(__file__).parent
TEMPLATES_DIR = BASE_DIR / "templates"
STATIC_DIR    = BASE_DIR / "static"

MIME = {
    ".html": "text/html; charset=utf-8",
    ".css":  "text/css",
    ".js":   "application/javascript",
    ".jpg":  "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png":  "image/png",
    ".ico":  "image/x-icon",
    ".json": "application/json",
}

class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print("  %s  %s" % (args[0], args[1]))

    def send_response_body(self, code, content_type, body):
        if isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", len(body))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        path   = parsed.path

        # API endpoint
        if path == "/api/analytics":
            qs   = parse_qs(parsed.query)
            days = int(qs.get("days", ["30"])[0])
            days = max(1, min(days, 365))
            data = get_stats(days)
            self.send_response_body(200, "application/json", json.dumps(data))
            return

        # Analytics dashboard
        if path in ("/admin/analytics", "/admin/analytics/"):
            html = (TEMPLATES_DIR / "analytics.html").read_text(encoding="utf-8")
            self.send_response_body(200, "text/html; charset=utf-8", html)
            return

        # Root redirect to analytics
        if path == "/":
            self.send_response(302)
            self.send_header("Location", "/admin/analytics")
            self.end_headers()
            return

        # Static files
        if path.startswith("/static/"):
            file_path = BASE_DIR / path.lstrip("/")
            if file_path.exists():
                suffix = file_path.suffix.lower()
                ct = MIME.get(suffix, "application/octet-stream")
                self.send_response_body(200, ct, file_path.read_bytes())
                return
            self.send_response_body(404, "text/plain", b"Not found")
            return

        # Health check
        if path == "/health":
            self.send_response_body(200, "application/json", json.dumps({"status": "ok"}))
            return

        self.send_response_body(404, "text/plain", b"Not found")


def run(port=8003):
    init_analytics_db()
    seed_data()
    stats = get_stats(30)
    print("\n" + "="*60)
    print("  AyuSutra Analytics — Test Server")
    print("="*60)
    print("  Total visits  : %d" % stats["total_visits"])
    print("  Unique users  : %d" % stats["unique_users"])
    print("  Today visits  : %d" % stats["today_visits"])
    print("  Countries     : %d" % len(stats["countries"]))
    print("")
    print("  Dashboard -> http://localhost:%d/admin/analytics" % port)
    print("  Raw JSON  -> http://localhost:%d/api/analytics?days=30" % port)
    print("="*60)

    server = HTTPServer(("", port), Handler)

    def open_browser():
        import time, webbrowser
        time.sleep(0.6)
        webbrowser.open("http://localhost:%d/admin/analytics" % port)

    threading.Thread(target=open_browser, daemon=True).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[server] Stopped.")

if __name__ == "__main__":
    run()
