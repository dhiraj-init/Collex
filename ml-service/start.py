"""
start.py — convenience wrapper to start the ML service.

Usage:
    python start.py
"""
import subprocess, sys

subprocess.run([
    sys.executable, "-m", "uvicorn",
    "main:app",
    "--host", "0.0.0.0",
    "--port", "8000",
    "--reload",
])
