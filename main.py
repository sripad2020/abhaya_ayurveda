"""
AyuSutra — FastAPI Backend (Database-free)
===========================================
Serves HTML pages via Jinja2 templates.
No database, no analytics, no ORM.
Safe for Vercel serverless deployment.
"""

import os
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv

# ── CONFIG ────────────────────────────────────────────────────
load_dotenv()

ENVIRONMENT     = os.getenv('ENVIRONMENT', 'development')
ALLOWED_ORIGINS = os.getenv(
    'ALLOWED_ORIGINS',
    'http://localhost,https://ayusutra.in,https://www.ayusutra.in'
).split(',')

# ── LOGGING ───────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
)
logger = logging.getLogger('ayusutra')

# ── APP ───────────────────────────────────────────────────────
app = FastAPI(
    title='AyuSutra',
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=['GET'],
    allow_headers=['*'],
)

# ── SECURITY HEADERS ─────────────────────────────────────────
@app.middleware('http')
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options']        = 'DENY'
    response.headers['X-XSS-Protection']       = '1; mode=block'
    response.headers['Referrer-Policy']         = 'strict-origin-when-cross-origin'
    if ENVIRONMENT == 'production':
        response.headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains'
    return response

# ── STATIC FILES & TEMPLATES ─────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.mount('/static', StaticFiles(directory=os.path.join(BASE_DIR, 'static')), name='static')
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, 'templates'))

# ── ROUTES ────────────────────────────────────────────────────

# ── ACTIVE: Core pages ──
@app.get('/', response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse('index.html', {'request': request})

@app.get('/assess', response_class=HTMLResponse)
async def assess(request: Request):
    return templates.TemplateResponse('assess.html', {'request': request})

@app.get('/features', response_class=HTMLResponse)
async def features(request: Request):
    return templates.TemplateResponse('features.html', {'request': request})

@app.get('/body-wisdom', response_class=HTMLResponse)
async def body_wisdom(request: Request):
    return templates.TemplateResponse('health.html', {'request': request})

@app.get('/health')
async def health_check():
    return {'status': 'ok', 'service': 'AyuSutra'}


# ── COMMENTED OUT: Requires database + email (re-enable when ready) ──
# @app.get('/consult', response_class=HTMLResponse)
# async def consult(request: Request):
#     return templates.TemplateResponse('consult.html', {'request': request})

# @app.post('/consultations', status_code=201)
# async def create_consultation(...):
#     # needs SQLAlchemy + pydantic[email] + bleach + slowapi
#     pass

# @app.get('/admin/analytics', response_class=HTMLResponse)
# async def analytics_dashboard(request: Request):
#     # needs analytics DB
#     pass

# ── ERROR HANDLERS ────────────────────────────────────────────
@app.exception_handler(404)
async def not_found(_req, _exc):
    return JSONResponse(status_code=404, content={'detail': 'Page not found.'})

@app.exception_handler(500)
async def server_error(_req, exc):
    logger.error('Server error: %s', exc)
    return JSONResponse(status_code=500, content={'detail': 'Internal server error.'})
