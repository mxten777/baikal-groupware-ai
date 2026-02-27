from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime


# ─── Auth ─────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


# ─── User ─────────────────────────────────────────────
class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    department: Optional[str] = ""
    position: Optional[str] = ""
    role: Optional[str] = "user"


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    department: str
    position: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserBrief(BaseModel):
    id: UUID
    name: str
    department: str
    position: str

    class Config:
        from_attributes = True


# ─── Approval ─────────────────────────────────────────
class ApprovalCreate(BaseModel):
    title: str
    content: str
    category: Optional[str] = "general"
    approver_ids: list[UUID] = []  # 결재라인 순서


class ApprovalResponse(BaseModel):
    id: UUID
    title: str
    content: str
    category: str
    status: str
    author: UserBrief
    created_at: datetime
    updated_at: datetime
    approval_lines: list["ApprovalLineResponse"] = []

    class Config:
        from_attributes = True


class ApprovalLineResponse(BaseModel):
    id: UUID
    approver: UserBrief
    order: int
    action: str
    comment: str
    acted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ApprovalActionRequest(BaseModel):
    action: str  # approved, rejected
    comment: Optional[str] = ""


# ─── Task ─────────────────────────────────────────────
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: Optional[str] = "medium"
    due_date: Optional[datetime] = None
    assignee_id: Optional[UUID] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    assignee_id: Optional[UUID] = None


class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: str
    status: str
    priority: str
    due_date: Optional[datetime] = None
    creator: UserBrief
    assignee: Optional[UserBrief] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── Notice ───────────────────────────────────────────
class NoticeCreate(BaseModel):
    title: str
    content: str
    is_pinned: Optional[bool] = False


class NoticeResponse(BaseModel):
    id: UUID
    title: str
    content: str
    is_pinned: bool
    author: UserBrief
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── Schedule ─────────────────────────────────────────
class ScheduleCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    start_time: datetime
    end_time: datetime
    location: Optional[str] = ""


class ScheduleResponse(BaseModel):
    id: UUID
    title: str
    description: str
    start_time: datetime
    end_time: datetime
    location: str
    creator: UserBrief
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Chat ─────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    tool_results: Optional[list[dict]] = None


# Forward references
TokenResponse.model_rebuild()
ApprovalResponse.model_rebuild()
