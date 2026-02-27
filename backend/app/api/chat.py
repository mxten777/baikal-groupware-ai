from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import User
from app.schemas.schemas import ChatRequest, ChatResponse
from app.api.deps import get_current_user
from app.agent.engine import run_agent

router = APIRouter(prefix="/chat", tags=["AI Chat"])


@router.post("", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """AI Agent와 대화"""
    result = await run_agent(
        message=req.message,
        db=db,
        current_user=current_user,
    )
    return ChatResponse(
        reply=result["reply"],
        tool_results=result.get("tool_results"),
    )
