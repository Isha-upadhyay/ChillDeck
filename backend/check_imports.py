#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Quick script to check for import errors before running the server.
Run this to identify any missing dependencies or import issues.
"""
import sys
import traceback
import os

# Fix Windows console encoding
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

def check_import(module_name, description):
    try:
        __import__(module_name)
        print(f"[OK] {description}")
        return True
    except ImportError as e:
        print(f"[FAIL] {description}: {e}")
        return False
    except Exception as e:
        print(f"[WARN] {description}: {e}")
        traceback.print_exc()
        return False

print("=" * 60)
print("Checking Backend Imports...")
print("=" * 60)

errors = []

# Core dependencies
print("\n[Core Dependencies]")
errors.append(not check_import("fastapi", "FastAPI"))
errors.append(not check_import("uvicorn", "Uvicorn"))
errors.append(not check_import("pydantic", "Pydantic"))
errors.append(not check_import("pydantic_settings", "Pydantic Settings"))

# Database
print("\n[Database]")
errors.append(not check_import("sqlmodel", "SQLModel"))
errors.append(not check_import("sqlalchemy", "SQLAlchemy"))

# Auth
print("\n[Authentication]")
errors.append(not check_import("passlib", "Passlib"))
errors.append(not check_import("jwt", "PyJWT"))

# File processing
print("\n[File Processing]")
errors.append(not check_import("pdfplumber", "PDFPlumber"))
errors.append(not check_import("docx", "python-docx"))

# AI/ML
print("\n[AI/ML]")
errors.append(not check_import("groq", "Groq"))
errors.append(not check_import("tavily", "Tavily"))
errors.append(not check_import("sentence_transformers", "Sentence Transformers"))
errors.append(not check_import("chromadb", "ChromaDB"))

# LangChain (optional)
print("\n[LangChain (Optional)]")
try:
    import langchain
    print("[OK] LangChain")
except:
    print("[WARN] LangChain (optional, not critical)")

# Application imports
print("\n[Application Modules]")
try:
    from app.core.config import settings
    print("[OK] App Config")
except Exception as e:
    print(f"[FAIL] App Config: {e}")
    errors.append(True)

try:
    from app.core.logger import logger
    print("[OK] Logger")
except Exception as e:
    print(f"[FAIL] Logger: {e}")
    errors.append(True)

try:
    from app.api.slides import router
    print("[OK] Slides Router")
except Exception as e:
    print(f"[FAIL] Slides Router: {e}")
    errors.append(True)

try:
    from app.api.upload import router
    print("[OK] Upload Router")
except Exception as e:
    print(f"[FAIL] Upload Router: {e}")
    errors.append(True)

try:
    from app.api.user import router
    print("[OK] User Router")
except Exception as e:
    print(f"[FAIL] User Router: {e}")
    errors.append(True)

# AI Agents
print("\n[AI Agents]")
try:
    from ai.agents.planner import PlannerAgent
    print("[OK] Planner Agent")
except Exception as e:
    print(f"[FAIL] Planner Agent: {e}")
    errors.append(True)

try:
    from ai.agents.writer import WriterAgent
    print("[OK] Writer Agent")
except Exception as e:
    print(f"[FAIL] Writer Agent: {e}")
    errors.append(True)

try:
    from ai.llms.groq_client import GroqLLM
    print("[OK] Groq LLM Client")
except Exception as e:
    print(f"[FAIL] Groq LLM Client: {e}")
    errors.append(True)

print("\n" + "=" * 60)
if any(errors):
    print("[ERROR] Some imports failed. Please install missing dependencies:")
    print("   pip install -r requirements.txt")
    sys.exit(1)
else:
    print("[SUCCESS] All critical imports successful!")
    print("=" * 60)
    sys.exit(0)

