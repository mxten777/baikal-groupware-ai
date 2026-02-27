from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID
from datetime import datetime, timezone

from app.db.database import get_db
from app.db.models import Approval, ApprovalLine, ApprovalLog, User
from app.schemas.schemas import (
    ApprovalCreate, ApprovalResponse, ApprovalActionRequest,
    ApprovalLineResponse, UserBrief,
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/approvals", tags=["Approvals"])


def _build_approval_response(approval: Approval) -> dict:
    lines = []
    for line in approval.approval_lines:
        lines.append(ApprovalLineResponse(
            id=line.id,
            approver=UserBrief.model_validate(line.approver),
            order=line.order,
            action=line.action,
            comment=line.comment or "",
            acted_at=line.acted_at,
        ))
    return ApprovalResponse(
        id=approval.id,
        title=approval.title,
        content=approval.content,
        category=approval.category,
        status=approval.status,
        author=UserBrief.model_validate(approval.author),
        created_at=approval.created_at,
        updated_at=approval.updated_at,
        approval_lines=lines,
    )


@router.post("", response_model=ApprovalResponse, status_code=201)
async def create_approval(
    req: ApprovalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    approval = Approval(
        title=req.title,
        content=req.content,
        category=req.category or "general",
        status="draft",
        author_id=current_user.id,
    )
    db.add(approval)
    await db.flush()

    for idx, approver_id in enumerate(req.approver_ids):
        line = ApprovalLine(
            approval_id=approval.id,
            approver_id=approver_id,
            order=idx + 1,
            action="pending",
        )
        db.add(line)

    log = ApprovalLog(
        approval_id=approval.id,
        user_id=current_user.id,
        action="created",
    )
    db.add(log)
    await db.flush()

    result = await db.execute(
        select(Approval)
        .options(
            selectinload(Approval.author),
            selectinload(Approval.approval_lines).selectinload(ApprovalLine.approver),
        )
        .where(Approval.id == approval.id)
    )
    approval = result.scalar_one()
    return _build_approval_response(approval)


@router.get("", response_model=list[ApprovalResponse])
async def list_approvals(
    status: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Approval)
        .options(
            selectinload(Approval.author),
            selectinload(Approval.approval_lines).selectinload(ApprovalLine.approver),
        )
        .order_by(Approval.created_at.desc())
    )
    if status:
        query = query.where(Approval.status == status)
    result = await db.execute(query)
    approvals = result.scalars().all()
    return [_build_approval_response(a) for a in approvals]


@router.get("/my", response_model=list[ApprovalResponse])
async def my_approvals(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Approval)
        .options(
            selectinload(Approval.author),
            selectinload(Approval.approval_lines).selectinload(ApprovalLine.approver),
        )
        .where(Approval.author_id == current_user.id)
        .order_by(Approval.created_at.desc())
    )
    return [_build_approval_response(a) for a in result.scalars().all()]


@router.get("/pending", response_model=list[ApprovalResponse])
async def pending_approvals(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Approval)
        .join(ApprovalLine)
        .options(
            selectinload(Approval.author),
            selectinload(Approval.approval_lines).selectinload(ApprovalLine.approver),
        )
        .where(
            ApprovalLine.approver_id == current_user.id,
            ApprovalLine.action == "pending",
            Approval.status == "pending",
        )
        .order_by(Approval.created_at.desc())
    )
    return [_build_approval_response(a) for a in result.scalars().all()]


@router.get("/{approval_id}", response_model=ApprovalResponse)
async def get_approval(
    approval_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Approval)
        .options(
            selectinload(Approval.author),
            selectinload(Approval.approval_lines).selectinload(ApprovalLine.approver),
        )
        .where(Approval.id == approval_id)
    )
    approval = result.scalar_one_or_none()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    return _build_approval_response(approval)


@router.post("/{approval_id}/submit", response_model=ApprovalResponse)
async def submit_approval(
    approval_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Approval)
        .options(
            selectinload(Approval.author),
            selectinload(Approval.approval_lines).selectinload(ApprovalLine.approver),
        )
        .where(Approval.id == approval_id)
    )
    approval = result.scalar_one_or_none()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    if str(approval.author_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only author can submit")
    if approval.status != "draft":
        raise HTTPException(status_code=400, detail="Only draft can be submitted")
    if not approval.approval_lines:
        raise HTTPException(status_code=400, detail="No approval line set")

    approval.status = "pending"
    log = ApprovalLog(approval_id=approval.id, user_id=current_user.id, action="submitted")
    db.add(log)
    await db.flush()
    await db.refresh(approval)
    return _build_approval_response(approval)


@router.post("/{approval_id}/action", response_model=ApprovalResponse)
async def action_approval(
    approval_id: UUID,
    req: ApprovalActionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Approval)
        .options(
            selectinload(Approval.author),
            selectinload(Approval.approval_lines).selectinload(ApprovalLine.approver),
        )
        .where(Approval.id == approval_id)
    )
    approval = result.scalar_one_or_none()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    if approval.status != "pending":
        raise HTTPException(status_code=400, detail="Approval is not pending")

    my_line = None
    for line in approval.approval_lines:
        if str(line.approver_id) == str(current_user.id) and line.action == "pending":
            my_line = line
            break

    if not my_line:
        raise HTTPException(status_code=403, detail="You are not a pending approver")

    for line in sorted(approval.approval_lines, key=lambda l: l.order):
        if line.action == "pending":
            if str(line.approver_id) != str(current_user.id):
                raise HTTPException(status_code=400, detail="Not your turn to approve")
            break

    if req.action == "approved":
        my_line.action = "approved"
        my_line.comment = req.comment or ""
        my_line.acted_at = datetime.now(timezone.utc)

        all_approved = all(
            l.action == "approved"
            for l in approval.approval_lines
            if str(l.id) != str(my_line.id)
        )
        if all_approved:
            approval.status = "approved"

    elif req.action == "rejected":
        my_line.action = "rejected"
        my_line.comment = req.comment or ""
        my_line.acted_at = datetime.now(timezone.utc)
        approval.status = "rejected"
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    log = ApprovalLog(
        approval_id=approval.id,
        user_id=current_user.id,
        action=req.action,
        comment=req.comment or "",
    )
    db.add(log)
    await db.flush()
    await db.refresh(approval)
    return _build_approval_response(approval)
