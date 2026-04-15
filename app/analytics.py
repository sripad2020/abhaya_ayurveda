"""
AyuSutra — Visitor Analytics Module
=====================================
Tracks:
  • Every page visit (page, timestamp, session_id, ip_hash, user_agent)
  • Unique users via session cookie (uuid4 per browser)
  • Country / city via ip-api.com (cached per IP hash, rate-safe)
  • Page-wise breakdown
  • Total visits  vs  unique-user visits (same user, multiple pages = counted once)

Data stored in a separate SQLite DB (analytics.db) to keep it isolated.
No raw IPs are stored — only SHA-256(ip + salt) hashes.
"""

import hashlib
import sqlite3
import os
import re
import logging
from datetime import datetime, timezone, timedelta
from functools import lru_cache
from pathlib import Path
from typing import Optional

import httpx

logger = logging.getLogger("ayusutra.analytics")

# ── CONFIG ────────────────────────────────────────────────────
ANALYTICS_DB   = os.getenv("ANALYTICS_DB", "./analytics.db")
SALT           = os.getenv("SECRET_KEY", "ayusutra-salt")    # same secret as main
SESSION_COOKIE = "ayu_sid"            # visitor session identifier cookie
SESSION_MAX    = 60 * 60 * 24 * 30   # 30-day session

# Pages we actually want to track (ignore static, api, docs)
TRACKED_PAGES = {"/", "/assess", "/consult", "/body-wisdom"}

# ── DB INIT ───────────────────────────────────────────────────
def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(ANALYTICS_DB, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_analytics_db():
    """Create analytics tables if they don't exist."""
    conn = get_connection()
    cur  = conn.cursor()
    cur.executescript("""
        CREATE TABLE IF NOT EXISTS visits (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id  TEXT    NOT NULL,
            page        TEXT    NOT NULL,
            ip_hash     TEXT    NOT NULL,
            country     TEXT    DEFAULT 'Unknown',
            city        TEXT    DEFAULT '',
            user_agent  TEXT    DEFAULT '',
            referrer    TEXT    DEFAULT '',
            visited_at  TEXT    NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_visits_session  ON visits (session_id);
        CREATE INDEX IF NOT EXISTS idx_visits_page     ON visits (page);
        CREATE INDEX IF NOT EXISTS idx_visits_country  ON visits (country);
        CREATE INDEX IF NOT EXISTS idx_visits_date     ON visits (visited_at);

        /* Per-IP geolocation cache so we never re-query the same IP */
        CREATE TABLE IF NOT EXISTS geo_cache (
            ip_hash   TEXT PRIMARY KEY,
            country   TEXT DEFAULT 'Unknown',
            city      TEXT DEFAULT '',
            fetched_at TEXT NOT NULL
        );
    """)
    conn.commit()
    conn.close()


# ── HELPERS ───────────────────────────────────────────────────
def hash_ip(ip: str) -> str:
    return hashlib.sha256((ip + SALT).encode()).hexdigest()[:32]


def is_tracked(path: str) -> bool:
    """Only track HTML pages, skip static files and API calls."""
    if path.startswith("/static"):  return False
    if path.startswith("/api"):     return False
    if path in ("/health", "/csrf-token", "/consultations", "/docs",
                "/redoc", "/openapi.json", "/favicon.ico"): return False
    if re.search(r"\.\w{2,4}$", path):                    return False
    return True


# ── GEO LOOKUP ────────────────────────────────────────────────
GEO_SKIP = {"127.0.0.1", "::1", "localhost", "testclient", "unknown"}


async def get_geo(ip: str, ip_hash: str) -> tuple[str, str]:
    """
    Return (country, city) for an IP, using local cache first.
    Falls back to ip-api.com (free, 45 req/min, no key needed).
    """
    if ip in GEO_SKIP:
        return ("Local / Dev", "")

    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT country, city FROM geo_cache WHERE ip_hash = ?", (ip_hash,)
        ).fetchone()
        if row:
            return (row["country"], row["city"])

        # Query ip-api.com
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(
                f"http://ip-api.com/json/{ip}?fields=status,country,city",
            )
            data = r.json() if r.status_code == 200 else {}

        country = data.get("country", "Unknown") if data.get("status") == "success" else "Unknown"
        city    = data.get("city",    "")        if data.get("status") == "success" else ""

        conn.execute(
            "INSERT OR REPLACE INTO geo_cache (ip_hash, country, city, fetched_at) VALUES (?,?,?,?)",
            (ip_hash, country, city, datetime.now(timezone.utc).isoformat()),
        )
        conn.commit()
        return (country, city)
    except Exception as e:
        logger.debug("Geo lookup failed for %s: %s", ip_hash[:8], e)
        return ("Unknown", "")
    finally:
        conn.close()


# ── RECORD VISIT ──────────────────────────────────────────────
async def record_visit(
    *,
    session_id: str,
    page:       str,
    ip:         str,
    user_agent: str = "",
    referrer:   str = "",
):
    ip_hash = hash_ip(ip)
    country, city = await get_geo(ip, ip_hash)
    conn = get_connection()
    try:
        conn.execute(
            """INSERT INTO visits
               (session_id, page, ip_hash, country, city, user_agent, referrer, visited_at)
               VALUES (?,?,?,?,?,?,?,?)""",
            (
                session_id,
                page,
                ip_hash,
                country,
                city,
                user_agent[:300],
                referrer[:300],
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        conn.commit()
    finally:
        conn.close()


# ── ANALYTICS QUERIES ─────────────────────────────────────────
def get_stats(days: int = 30) -> dict:
    """
    Return a dict with:
      - total_visits        : all rows in the window
      - unique_users        : distinct session_ids
      - today_visits        : rows from today
      - pages               : list of {page, visits, unique}
      - countries           : list of {country, visits}
      - daily               : last 14 days {date, visits, unique_users}
      - top_referrers       : list of {referrer, count}
    """
    conn = get_connection()
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    today = datetime.now(timezone.utc).date().isoformat()

    def q(sql, params=()):
        return conn.execute(sql, params).fetchall()

    total_visits  = q("SELECT COUNT(*) AS n FROM visits WHERE visited_at >= ?", (since,))[0]["n"]
    unique_users  = q("SELECT COUNT(DISTINCT session_id) AS n FROM visits WHERE visited_at >= ?", (since,))[0]["n"]
    today_visits  = q("SELECT COUNT(*) AS n FROM visits WHERE visited_at >= ?", (today + "T00:00:00+00:00",))[0]["n"]
    today_unique  = q("SELECT COUNT(DISTINCT session_id) AS n FROM visits WHERE visited_at >= ?", (today + "T00:00:00+00:00",))[0]["n"]

    pages = [
        dict(r) for r in q(
            """SELECT page,
                      COUNT(*) AS visits,
                      COUNT(DISTINCT session_id) AS unique_visitors
               FROM visits WHERE visited_at >= ?
               GROUP BY page ORDER BY visits DESC""",
            (since,),
        )
    ]

    countries = [
        dict(r) for r in q(
            """SELECT country,
                      COUNT(*) AS visits,
                      COUNT(DISTINCT session_id) AS unique_visitors
               FROM visits WHERE visited_at >= ?
               GROUP BY country ORDER BY visits DESC LIMIT 20""",
            (since,),
        )
    ]

    daily = [
        dict(r) for r in q(
            """SELECT substr(visited_at,1,10) AS date,
                      COUNT(*) AS visits,
                      COUNT(DISTINCT session_id) AS unique_users
               FROM visits WHERE visited_at >= ?
               GROUP BY date ORDER BY date ASC""",
            ((datetime.now(timezone.utc) - timedelta(days=14)).isoformat(),),
        )
    ]

    top_referrers = [
        dict(r) for r in q(
            """SELECT referrer,
                      COUNT(*) AS count
               FROM visits WHERE visited_at >= ? AND referrer != ''
               GROUP BY referrer ORDER BY count DESC LIMIT 10""",
            (since,),
        )
    ]

    conn.close()
    return {
        "total_visits":   total_visits,
        "unique_users":   unique_users,
        "today_visits":   today_visits,
        "today_unique":   today_unique,
        "pages":          pages,
        "countries":      countries,
        "daily":          daily,
        "top_referrers":  top_referrers,
        "period_days":    days,
    }
