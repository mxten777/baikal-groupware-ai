from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.db.database import get_db
from app.db.models import Task, User
from app.schemas.schemas import TaskCreate, TaskUpdate, TaskResponse, UserBrief
from app.api.deps import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(
    req: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = Task(
        title=req.title,
        description=req.description or "",
        priority=req.priority or "medium",
        due_date=req.due_date,
        creator_id=current_user.id,
        assignee_id=req.assignee_id,
    )
    db.add(task)
    await db.flush()

    result = await db.execute(
        select(Task)
        .options(selectinload(Task.creator), selectinload(Task.assignee))
        .where(Task.id == task.id)
    )
    task = result.scalar_one()
    return _build_task_response(task)


@router.get("", response_model=list[TaskResponse])
async def list_tasks(
    status: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Task)
        .options(selectinload(Task.creator), selectinload(Task.assignee))
        .order_by(Task.created_at.desc())
    )
    if status:
        query = query.where(Task.status == status)
    result = await db.execute(query)
    return [_build_task_response(t) for t in result.scalars().all()]


@router.get("/my", response_model=list[TaskResponse])
async def my_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Task)
        .options(selectinload(Task.creator), selectinload(Task.assignee))
        .where(
            or_(Task.creator_id == current_user.id, Task.assignee_id == current_user.id)
        )
        .order_by(Task.created_at.desc())
    )
    return [_build_task_response(t) for t in result.scalars().all()]


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Task)
        .options(selectinload(Task.creator), selectinload(Task.assignee))
        .where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return _build_task_response(task)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    req: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Task)
        .options(selectinload(Task.creator), selectinload(Task.assignee))
        .where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if req.title is not None:
        task.title = req.title
    if req.description is not None:
        task.description = req.description
    if req.status is not None:
        task.status = req.status
    if req.priority is not None:
        task.priority = req.priority
    if req.due_date is not None:
        task.due_date = req.due_date
    if req.assignee_id is not None:
        task.assignee_id = req.assignee_id

    await db.flush()
    await db.refresh(task)

    result = await db.execute(
        select(Task)
        .options(selectinload(Task.creator), selectinload(Task.assignee))
        .where(Task.id == task.id)
    )
    task = result.scalar_one()
    return _build_task_response(task)


def _build_task_response(task: Task) -> TaskResponse:
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        creator=UserBrief.model_validate(task.creator),
        assignee=UserBrief.model_validate(task.assignee) if task.assignee else None,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )
