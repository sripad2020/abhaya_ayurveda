"""
AyuSutra — Vercel Serverless Entry Point
=========================================
Vercel runs this file as an ASGI serverless function.
The `app` object is imported from the root main.py.

Directory structure expected by Vercel:
  api/
    index.py        ← this file
  static/           ← served by Vercel CDN automatically
  templates/
  main.py
  requirements.txt
"""

import sys
import os

# Add the project root to sys.path so imports from main.py work correctly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app  # noqa: F401 — Vercel picks up `app` automatically

# Vercel looks for the `app` variable (ASGI app) in this module
# No additional code needed — FastAPI/Starlette is ASGI-compatible natively
