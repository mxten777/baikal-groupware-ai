"""
BAIKAL AI Agent - Tool Executor
실제 DB 작업을 수행하는 도구 실행기
"""

import json
from datetime import datetime, timezone
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.models import (
    User, Approval, ApprovalLine, ApprovalLog,
    Task, Notice, Schedule, ChatMessage,
)


class ToolExecutor:
    def __init__(self, db: AsyncSession, current_user: User):
        self.db = db
        self.current_user = current_user

    async def execute(self, tool_name: str, arguments: dict) -> dict:
        """도구를 실행하고 결과를 반환"""
        handler = getattr(self, f"_handle_{tool_name}", None)
        if not handler:
            return {"error": f"Unknown tool: {tool_name}"}
        try:
            return await handler(arguments)
        except Exception as e:
            return {"error": str(e)}

    # ─── create_approval ──────────────────────────────
    async def _handle_create_approval(self, args: dict) -> dict:
        approver_names = args.get("approver_names", [])
        approver_ids = []

        # 이름으로 결재자 검색
        for name in approver_names:
            result = await self.db.execute(
                select(User).where(User.name.ilike(f"%{name}%"))
            )
            user = result.scalar_one_or_none()
            if user:
                approver_ids.append(user.id)

        approval = Approval(
            title=args["title"],
            content=args["content"],
            category=args.get("category", "general"),
            status="draft",
            author_id=self.current_user.id,
        )
        self.db.add(approval)
        await self.db.flush()

        for idx, aid in enumerate(approver_ids):
            line = ApprovalLine(
                approval_id=approval.id,
                approver_id=aid,
                order=idx + 1,
                action="pending",
            )
            self.db.add(line)

        log = ApprovalLog(
            approval_id=approval.id,
            user_id=self.current_user.id,
            action="created",
            comment="AI Agent를 통해 생성됨",
        )
        self.db.add(log)
        await self.db.flush()

        approver_info = []
        for name in approver_names:
            approver_info.append(name)

        return {
            "success": True,
            "type": "approval",
            "data": {
                "id": str(approval.id),
                "title": approval.title,
                "content": approval.content,
                "category": approval.category,
                "status": approval.status,
                "approvers": approver_info,
                "message": f"결재문서 '{approval.title}'이(가) 초안으로 생성되었습니다." + (
                    f" 결재라인: {' → '.join(approver_info)}" if approver_info else " 결재라인을 추가해주세요."
                ),
            }
        }

    # ─── create_task ──────────────────────────────────
    async def _handle_create_task(self, args: dict) -> dict:
        assignee_id = None
        assignee_name = args.get("assignee_name")

        if assignee_name:
            result = await self.db.execute(
                select(User).where(User.name.ilike(f"%{assignee_name}%"))
            )
            assignee = result.scalar_one_or_none()
            if assignee:
                assignee_id = assignee.id
                assignee_name = assignee.name
            else:
                assignee_name = f"{assignee_name} (사용자를 찾을 수 없어 본인에게 할당)"
                assignee_id = self.current_user.id
        else:
            assignee_id = self.current_user.id
            assignee_name = self.current_user.name

        due_date = None
        if args.get("due_date"):
            try:
                due_date = datetime.fromisoformat(args["due_date"])
                if due_date.tzinfo is None:
                    due_date = due_date.replace(tzinfo=timezone.utc)
            except (ValueError, TypeError):
                pass

        task = Task(
            title=args["title"],
            description=args.get("description", ""),
            priority=args.get("priority", "medium"),
            due_date=due_date,
            creator_id=self.current_user.id,
            assignee_id=assignee_id,
        )
        self.db.add(task)
        await self.db.flush()

        return {
            "success": True,
            "type": "task",
            "data": {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "priority": task.priority,
                "assignee": assignee_name,
                "due_date": str(task.due_date) if task.due_date else None,
                "message": f"업무 '{task.title}'이(가) 생성되었습니다. 담당자: {assignee_name}",
            }
        }

    # ─── create_schedule ──────────────────────────────
    async def _handle_create_schedule(self, args: dict) -> dict:
        start_time = datetime.fromisoformat(args["start_time"])
        end_time = datetime.fromisoformat(args["end_time"])
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)
        if end_time.tzinfo is None:
            end_time = end_time.replace(tzinfo=timezone.utc)

        schedule = Schedule(
            title=args["title"],
            description=args.get("description", ""),
            start_time=start_time,
            end_time=end_time,
            location=args.get("location", ""),
            creator_id=self.current_user.id,
        )
        self.db.add(schedule)
        await self.db.flush()

        return {
            "success": True,
            "type": "schedule",
            "data": {
                "id": str(schedule.id),
                "title": schedule.title,
                "start_time": str(schedule.start_time),
                "end_time": str(schedule.end_time),
                "location": schedule.location,
                "message": f"일정 '{schedule.title}'이(가) 등록되었습니다. ({start_time.strftime('%Y-%m-%d %H:%M')} ~ {end_time.strftime('%H:%M')})",
            }
        }

    # ─── create_notice ────────────────────────────────
    async def _handle_create_notice(self, args: dict) -> dict:
        notice = Notice(
            title=args["title"],
            content=args["content"],
            is_pinned=args.get("is_pinned", False),
            author_id=self.current_user.id,
        )
        self.db.add(notice)
        await self.db.flush()

        return {
            "success": True,
            "type": "notice",
            "data": {
                "id": str(notice.id),
                "title": notice.title,
                "content": notice.content,
                "message": f"공지사항 '{notice.title}'이(가) 게시되었습니다.",
            }
        }

    # ─── search_users ────────────────────────────────
    async def _handle_search_users(self, args: dict) -> dict:
        name = args.get("name", "")
        result = await self.db.execute(
            select(User).where(User.name.ilike(f"%{name}%"), User.is_active == True)
        )
        users = result.scalars().all()
        return {
            "success": True,
            "type": "users",
            "data": {
                "users": [
                    {"id": str(u.id), "name": u.name, "department": u.department, "position": u.position}
                    for u in users
                ],
                "message": f"{len(users)}명의 사용자를 찾았습니다." if users else f"'{name}' 사용자를 찾을 수 없습니다.",
            }
        }

    # ─── list_my_approvals ────────────────────────────
    async def _handle_list_my_approvals(self, args: dict) -> dict:
        result = await self.db.execute(
            select(Approval)
            .where(Approval.author_id == self.current_user.id)
            .order_by(Approval.created_at.desc())
            .limit(10)
        )
        approvals = result.scalars().all()
        return {
            "success": True,
            "type": "approvals",
            "data": {
                "approvals": [
                    {"id": str(a.id), "title": a.title, "status": a.status, "created_at": str(a.created_at)}
                    for a in approvals
                ],
                "message": f"{len(approvals)}건의 결재 문서가 있습니다.",
            }
        }

    # ─── list_my_tasks ────────────────────────────────
    async def _handle_list_my_tasks(self, args: dict) -> dict:
        result = await self.db.execute(
            select(Task)
            .where(
                (Task.creator_id == self.current_user.id) | (Task.assignee_id == self.current_user.id)
            )
            .order_by(Task.created_at.desc())
            .limit(10)
        )
        tasks = result.scalars().all()
        return {
            "success": True,
            "type": "tasks",
            "data": {
                "tasks": [
                    {"id": str(t.id), "title": t.title, "status": t.status, "priority": t.priority}
                    for t in tasks
                ],
                "message": f"{len(tasks)}건의 업무가 있습니다.",
            }
        }

    # ─── list_my_schedules ────────────────────────────
    async def _handle_list_my_schedules(self, args: dict) -> dict:
        result = await self.db.execute(
            select(Schedule)
            .where(Schedule.creator_id == self.current_user.id)
            .order_by(Schedule.start_time.desc())
            .limit(10)
        )
        schedules = result.scalars().all()
        return {
            "success": True,
            "type": "schedules",
            "data": {
                "schedules": [
                    {"id": str(s.id), "title": s.title, "start_time": str(s.start_time), "end_time": str(s.end_time)}
                    for s in schedules
                ],
                "message": f"{len(schedules)}건의 일정이 있습니다.",
            }
        }

    # ─── list_notices ─────────────────────────────────
    async def _handle_list_notices(self, args: dict) -> dict:
        result = await self.db.execute(
            select(Notice)
            .options(selectinload(Notice.author))
            .order_by(Notice.is_pinned.desc(), Notice.created_at.desc())
            .limit(10)
        )
        notices = result.scalars().all()
        return {
            "success": True,
            "type": "notices",
            "data": {
                "notices": [
                    {"id": str(n.id), "title": n.title, "author": n.author.name, "created_at": str(n.created_at)}
                    for n in notices
                ],
                "message": f"{len(notices)}건의 공지사항이 있습니다.",
            }
        }
