from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.db.database import get_db
from app.db.models import Schedule, User
from app.schemas.schemas import ScheduleCreate, ScheduleResponse, UserBrief
from app.api.deps import get_current_user

router = APIRouter(prefix="/schedules", tags=["Schedules"])


@router.post("", response_model=ScheduleResponse, status_code=201)
async def create_schedule(
    req: ScheduleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    schedule = Schedule(
        title=req.title,
        description=req.description or "",
        start_time=req.start_time,
        end_time=req.end_time,
        location=req.location or "",
        creator_id=current_user.id,
    )
    db.add(schedule)
    await db.flush()

    result = await db.execute(
        select(Schedule).options(selectinload(Schedule.creator)).where(Schedule.id == schedule.id)
    )
    schedule = result.scalar_one()
    return _build_schedule_response(schedule)


@router.get("", response_model=list[ScheduleResponse])
async def list_schedules(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Schedule)
        .options(selectinload(Schedule.creator))
        .order_by(Schedule.start_time.desc())
    )
    return [_build_schedule_response(s) for s in result.scalars().all()]


@router.get("/my", response_model=list[ScheduleResponse])
async def my_schedules(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Schedule)
        .options(selectinload(Schedule.creator))
        .where(Schedule.creator_id == current_user.id)
        .order_by(Schedule.start_time.desc())
    )
    return [_build_schedule_response(s) for s in result.scalars().all()]


@router.get("/{schedule_id}", response_model=ScheduleResponse)
async def get_schedule(
    schedule_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Schedule).options(selectinload(Schedule.creator)).where(Schedule.id == schedule_id)
    )
    schedule = result.scalar_one_or_none()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return _build_schedule_response(schedule)


def _build_schedule_response(schedule: Schedule) -> ScheduleResponse:
    return ScheduleResponse(
        id=schedule.id,
        title=schedule.title,
        description=schedule.description,
        start_time=schedule.start_time,
        end_time=schedule.end_time,
        location=schedule.location,
        creator=UserBrief.model_validate(schedule.creator),
        created_at=schedule.created_at,
    )
