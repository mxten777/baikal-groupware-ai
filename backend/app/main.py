"""
BAIKAL Groupware AI - Main Application
AI Agent 중심 차세대 그룹웨어
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.init_db import init_db, seed_data
from app.api.auth import router as auth_router
from app.api.approvals import router as approvals_router
from app.api.tasks import router as tasks_router
from app.api.notices import router as notices_router
from app.api.schedules import router as schedules_router
from app.api.chat import router as chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 BAIKAL Groupware AI Starting...")
    await init_db()
    await seed_data()
    print("✅ Database initialized")
    yield
    # Shutdown
    print("👋 BAIKAL Groupware AI Shutting down...")


app = FastAPI(
    title="BAIKAL Groupware AI",
    description="AI Agent 중심 차세대 그룹웨어 API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_router, prefix="/api")
app.include_router(approvals_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(notices_router, prefix="/api")
app.include_router(schedules_router, prefix="/api")
app.include_router(chat_router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "BAIKAL Groupware AI"}
