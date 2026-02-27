from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.db.database import get_db
from app.db.models import Notice, User
from app.schemas.schemas import NoticeCreate, NoticeResponse, UserBrief
from app.api.deps import get_current_user

router = APIRouter(prefix="/notices", tags=["Notices"])


@router.post("", response_model=NoticeResponse, status_code=201)
async def create_notice(
    req: NoticeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notice = Notice(
        title=req.title,
        content=req.content,
        is_pinned=req.is_pinned or False,
        author_id=current_user.id,
    )
    db.add(notice)
    await db.flush()

    result = await db.execute(
        select(Notice).options(selectinload(Notice.author)).where(Notice.id == notice.id)
    )
    notice = result.scalar_one()
    return _build_notice_response(notice)


@router.get("", response_model=list[NoticeResponse])
async def list_notices(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Notice)
        .options(selectinload(Notice.author))
        .order_by(Notice.is_pinned.desc(), Notice.created_at.desc())
    )
    return [_build_notice_response(n) for n in result.scalars().all()]


@router.get("/{notice_id}", response_model=NoticeResponse)
async def get_notice(
    notice_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Notice).options(selectinload(Notice.author)).where(Notice.id == notice_id)
    )
    notice = result.scalar_one_or_none()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    return _build_notice_response(notice)


def _build_notice_response(notice: Notice) -> NoticeResponse:
    return NoticeResponse(
        id=notice.id,
        title=notice.title,
        content=notice.content,
        is_pinned=notice.is_pinned,
        author=UserBrief.model_validate(notice.author),
        created_at=notice.created_at,
        updated_at=notice.updated_at,
    )
