"""
AyuSutra — Secure FastAPI Backend
==================================
Security features implemented:
  • CSRF double-submit cookie pattern
  • Rate limiting per IP (slowapi)
  • Input validation & sanitisation (Pydantic + bleach)
  • CORS restricted to allowed origins
  • Secure HTTP-only cookie for CSRF
  • SQL injection safe (SQLAlchemy ORM)
  • XSS prevention (HTML escaping on all string fields)
  • Secrets from environment variables only
  • Request size limiting
  • Structured logging (no PII in logs)
  • SQLite for dev; swap DATABASE_URL for Postgres in prod
"""

import os
import secrets
import logging
import html
import re
import uuid
from datetime import datetime, timezone
from typing import Optional

import httpx

import bleach
from fastapi import FastAPI, Request, Response, HTTPException, Depends, Cookie
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, EmailStr, field_validator, model_validator
from pydantic import Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool
from starlette.middleware.base import BaseHTTPMiddleware
from dotenv import load_dotenv

# ── CONFIG ────────────────────────────────────────────────────
load_dotenv()

DATABASE_URL    = os.getenv('DATABASE_URL', 'sqlite:///./ayusutra.db')
SECRET_KEY      = os.getenv('SECRET_KEY', secrets.token_hex(32))  # MUST be set in prod
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost,https://ayusutra.in,https://www.ayusutra.in').split(',')
ALLOWED_HOSTS   = os.getenv('ALLOWED_HOSTS',   'localhost,ayusutra.in,www.ayusutra.in,api.ayusutra.in').split(',')
ENVIRONMENT     = os.getenv('ENVIRONMENT', 'development')
MAX_BODY_BYTES  = 32_768  # 32 KB max request size

# ── LOGGING ───────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(name)s | %(message)s',
)
logger = logging.getLogger('ayusutra')

# ── DATABASE ──────────────────────────────────────────────────
engine_args = {}
if DATABASE_URL.startswith('sqlite'):
    engine_args = {'connect_args': {'check_same_thread': False}, 'poolclass': StaticPool}

engine  = create_engine(DATABASE_URL, **engine_args)
Session_ = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase): pass

class Consultation(Base):
    __tablename__ = 'consultations'
    id           = Column(Integer, primary_key=True, index=True)
    consult_type = Column(String(10), nullable=False)        # offline | online
    name         = Column(String(80),  nullable=False)
    age          = Column(Integer,     nullable=False)
    sex          = Column(String(20),  nullable=False)
    phone        = Column(String(20),  nullable=False)
    email        = Column(String(120), nullable=True)
    concern      = Column(String(50),  nullable=False)
    message      = Column(Text,        nullable=True)
    ip_hash      = Column(String(64),  nullable=True)        # hashed, never raw IP
    created_at   = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    processed    = Column(Boolean, default=False)

Base.metadata.create_all(bind=engine)

# ── ANALYTICS DB ─────────────────────────────────────────────
try:
    from app.analytics import (
        init_analytics_db, record_visit, get_stats,
        is_tracked, SESSION_COOKIE, SESSION_MAX,
    )
except ImportError:
    from analytics import (  # when run from inside app/ directory
        init_analytics_db, record_visit, get_stats,
        is_tracked, SESSION_COOKIE, SESSION_MAX,
    )
init_analytics_db()


def get_db():
    db = Session_()
    try:
        yield db
    finally:
        db.close()

# ── RATE LIMITER ──────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

# ── FASTAPI APP ───────────────────────────────────────────────
app = FastAPI(
    title='AyuSutra API',
    docs_url=None if ENVIRONMENT == 'production' else '/docs',   # hide in prod
    redoc_url=None if ENVIRONMENT == 'production' else '/redoc',
    openapi_url=None if ENVIRONMENT == 'production' else '/openapi.json',
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── STATIC & TEMPLATES ────────────────────────────────────────
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# ── MIDDLEWARE: CORS ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=['GET', 'POST'],
    allow_headers=['Content-Type', 'X-CSRF-Token'],
)

# ── MIDDLEWARE: TRUSTED HOSTS ────────────────────────────────
if ENVIRONMENT == 'production':
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=ALLOWED_HOSTS)

# ── MIDDLEWARE: REQUEST SIZE LIMIT ───────────────────────────
class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get('content-length')
        if content_length and int(content_length) > MAX_BODY_BYTES:
            return JSONResponse(status_code=413, content={'detail': 'Request body too large.'})
        return await call_next(request)

app.add_middleware(RequestSizeLimitMiddleware)

# ── MIDDLEWARE: VISITOR ANALYTICS ─────────────────────────────
class AnalyticsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        path = request.url.path
        if is_tracked(path) and response.status_code < 400:
            session_id = request.cookies.get(SESSION_COOKIE)
            new_session = not bool(session_id)
            if new_session:
                session_id = str(uuid.uuid4())
            ip = request.client.host or 'unknown'
            ua = request.headers.get('user-agent', '')[:300]
            ref = request.headers.get('referer', '')[:300]
            # Fire-and-forget visit recording (non-blocking)
            import asyncio
            asyncio.ensure_future(record_visit(
                session_id=session_id,
                page=path,
                ip=ip,
                user_agent=ua,
                referrer=ref,
            ))
            if new_session:
                response.set_cookie(
                    key=SESSION_COOKIE,
                    value=session_id,
                    httponly=True,
                    samesite='lax',
                    max_age=SESSION_MAX,
                    path='/',
                )
        return response

app.add_middleware(AnalyticsMiddleware)

# ── MIDDLEWARE: SECURITY HEADERS ──────────────────────────────
@app.middleware('http')
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers['X-Content-Type-Options']    = 'nosniff'
    response.headers['X-Frame-Options']           = 'DENY'
    response.headers['X-XSS-Protection']          = '1; mode=block'
    response.headers['Referrer-Policy']           = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy']        = 'geolocation=(), microphone=()'
    if ENVIRONMENT == 'production':
        response.headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload'
    return response

# ── CSRF UTILITIES ────────────────────────────────────────────
CSRF_COOKIE_NAME = 'ayusutra_csrf'

def generate_csrf_token() -> str:
    return secrets.token_urlsafe(32)

def verify_csrf(request: Request, cookie_token: Optional[str]) -> bool:
    header_token = request.headers.get('X-CSRF-Token') or ''
    if not cookie_token or not header_token:
        return False
    # Constant-time comparison to prevent timing attacks
    return secrets.compare_digest(cookie_token, header_token)

# ── SANITISATION HELPERS ──────────────────────────────────────
ALLOWED_TAGS: list[str] = []  # No HTML tags allowed in any field

def sanitize_text(value: str) -> str:
    """Strip all HTML, escape special chars, strip whitespace."""
    cleaned = bleach.clean(value, tags=ALLOWED_TAGS, strip=True)
    return html.escape(cleaned).strip()

def validate_phone(value: str) -> bool:
    return bool(re.fullmatch(r'[+]?[0-9\s\-]{7,15}', value.strip()))

# ── PYDANTIC SCHEMA ───────────────────────────────────────────
class ConsultationIn(BaseModel):
    consult_type: str  = Field(..., pattern='^(offline|online)$')
    name:         str  = Field(..., min_length=2, max_length=80)
    age:          int  = Field(..., ge=1, le=120)
    sex:          str  = Field(..., pattern='^(male|female|trans)$')
    phone:        str  = Field(..., min_length=7, max_length=20)
    email:        Optional[EmailStr] = None
    concern:      str  = Field(..., min_length=1, max_length=50)
    message:      Optional[str] = Field(None, max_length=1000)
    csrf_token:   str  = Field(..., min_length=1)

    @field_validator('name', 'phone', 'concern', mode='before')
    @classmethod
    def strip_html(cls, v):
        return sanitize_text(str(v))

    @field_validator('message', mode='before')
    @classmethod
    def sanitize_message(cls, v):
        if v is None: return v
        return sanitize_text(str(v))

    @field_validator('phone')
    @classmethod
    def validate_phone_format(cls, v):
        if not validate_phone(v):
            raise ValueError('Invalid phone number format.')
        return v

    @model_validator(mode='after')
    def email_required_for_online(self) -> 'ConsultationIn':
        if self.consult_type == 'online' and not self.email:
            raise ValueError('Email is required for online consultations.')
        return self

# ── HELPER: hash IP (GDPR-friendly) ──────────────────────────
import hashlib

def hash_ip(ip: str) -> str:
    return hashlib.sha256((ip + SECRET_KEY).encode()).hexdigest()[:24]

# ── ROUTES ────────────────────────────────────────────────────

@app.get('/', response_class=HTMLResponse)
async def index_page(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get('/assess', response_class=HTMLResponse)
async def assess_page(request: Request):
    return templates.TemplateResponse("assess.html", {"request": request})

@app.get('/consult', response_class=HTMLResponse)
async def consult_page(request: Request):
    return templates.TemplateResponse("consult.html", {"request": request})

@app.get('/body-wisdom', response_class=HTMLResponse)
async def body_wisdom_page(request: Request):
    return templates.TemplateResponse("health.html", {"request": request})

@app.get('/features', response_class=HTMLResponse)
async def features_page(request: Request):
    return templates.TemplateResponse("features.html", {"request": request})

@app.get('/health')
async def health():
    """Public health check."""
    return {'status': 'ok', 'service': 'AyuSutra API'}


# ── ANALYTICS API ─────────────────────────────────────────────
@app.get('/api/analytics')
async def analytics_api(days: int = 30):
    """Return visitor stats as JSON. Protect this route in production."""
    if days < 1 or days > 365:
        days = 30
    return get_stats(days)


@app.get('/admin/analytics', response_class=HTMLResponse)
async def analytics_dashboard(request: Request):
    """Server-rendered analytics dashboard."""
    return templates.TemplateResponse('analytics.html', {'request': request})


@app.get('/csrf-token')
@limiter.limit('60/minute')
async def get_csrf_token(request: Request, response: Response):
    """
    Issue a new CSRF token as an HTTP-only cookie.
    Frontend reads the token from the JSON body and sends it back
    as an X-CSRF-Token header (double-submit cookie pattern).
    """
    token = generate_csrf_token()
    response.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=(ENVIRONMENT == 'production'),
        samesite='strict',
        max_age=3600,
        path='/',
    )
    return {'csrf_token': token}


@app.post('/consultations', status_code=201)
@limiter.limit('5/minute;20/hour')          # 5 per min, 20 per hour per IP
async def create_consultation(
    request:      Request,
    payload:      ConsultationIn,
    db:           Session = Depends(get_db),
    csrf_cookie:  Optional[str] = Cookie(default=None, alias=CSRF_COOKIE_NAME),
):
    """
    Accept a new consultation request.
    Security checks:
      1. CSRF double-submit verification
      2. Input validation via Pydantic (above)
      3. Rate limiting via slowapi
      4. Body size limit via middleware
    """

    # 1 — CSRF check
    if not verify_csrf(request, csrf_cookie):
        logger.warning('CSRF validation failed | ip=%s', hash_ip(request.client.host or ''))
        raise HTTPException(status_code=403, detail='CSRF validation failed.')

    # 2 — Save to DB (ORM prevents SQL injection)
    client_ip = request.client.host or 'unknown'
    record = Consultation(
        consult_type = payload.consult_type,
        name         = payload.name,
        age          = payload.age,
        sex          = payload.sex,
        phone        = payload.phone,
        email        = str(payload.email) if payload.email else None,
        concern      = payload.concern,
        message      = payload.message,
        ip_hash      = hash_ip(client_ip),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    logger.info(
        'Consultation created | id=%d | type=%s | concern=%s',
        record.id, payload.consult_type, payload.concern,
    )

    # 3 — (Optional) send notification email here
    # await send_notification_email(record)

    return {'status': 'success', 'id': record.id, 'message': 'Consultation request received.'}


# ── ERROR HANDLERS ─────────────────────────────────────────────
@app.exception_handler(404)
async def not_found(_req, _exc):
    return JSONResponse(status_code=404, content={'detail': 'Not found.'})

@app.exception_handler(500)
async def server_error(_req, exc):
    logger.error('Internal server error: %s', exc)
    return JSONResponse(status_code=500, content={'detail': 'Internal server error.'})