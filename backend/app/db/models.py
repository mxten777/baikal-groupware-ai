import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, Integer, TypeDecorator
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class UUIDType(TypeDecorator):
    """Platform-independent UUID type (works with SQLite and PostgreSQL)."""
    impl = String(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return uuid.UUID(value) if not isinstance(value, uuid.UUID) else value
        return value


# ─── Enums ───────────────────────────────────────────
class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"


class ApprovalStatus(str, enum.Enum):
    draft = "draft"
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class ApprovalLineAction(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class TaskStatus(str, enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"


# ─── Users ───────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(UUIDType(), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    department = Column(String(100), default="")
    position = Column(String(100), default="")
    role = Column(String(20), default="user", nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    approvals = relationship("Approval", back_populates="author", foreign_keys="Approval.author_id")
    tasks_created = relationship("Task", back_populates="creator", foreign_keys="Task.creator_id")
    tasks_assigned = relationship("Task", back_populates="assignee", foreign_keys="Task.assignee_id")
    notices = relationship("Notice", back_populates="author")
    schedules = relationship("Schedule", back_populates="creator")


# ─── Approvals ───────────────────────────────────────
class Approval(Base):
    __tablename__ = "approvals"

    id = Column(UUIDType(), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), default="general")
    status = Column(String(20), default="draft", nullable=False)
    author_id = Column(UUIDType(), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    author = relationship("User", back_populates="approvals", foreign_keys=[author_id])
    approval_lines = relationship("ApprovalLine", back_populates="approval", order_by="ApprovalLine.order")
    approval_logs = relationship("ApprovalLog", back_populates="approval")


class ApprovalLine(Base):
    __tablename__ = "approval_lines"

    id = Column(UUIDType(), primary_key=True, default=uuid.uuid4)
    approval_id = Column(UUIDType(), ForeignKey("approvals.id"), nullable=False)
    approver_id = Column(UUIDType(), ForeignKey("users.id"), nullable=False)
    order = Column(Integer, nullable=False)
    action = Column(String(20), default="pending", nullable=False)
    comment = Column(Text, default="")
    acted_at = Column(DateTime(), nullable=True)

    # Relationships
    approval = relationship("Approval", back_populates="approval_lines")
    approver = relationship("User")


class ApprovalLog(Base):
    __tablename__ = "approval_logs"

    id = Column(UUIDType(), primary_key=True, default=uuid.uuid4)
    approval_id = Column(UUIDType(), ForeignKey("approvals.id"), nullable=False)
    user_id = Column(UUIDType(), ForeignKey("users.id"), nullable=False)
    action = Column(String(50), nullable=False)
    comment = Column(Text, default="")
    created_at = Column(DateTime(), default=lambda: datetime.now(timezone.utc))

    # Relationships
    approval = relationship("Approval", back_populates="approval_logs")
    user = relationship("User")


# ─── Tasks ───────────────────────────────────────────
class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUIDType(), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    description = Column(Text, default="")
    status = Column(String(20), default="todo", nullable=False)
    priority = Column(String(20), default="medium")
    due_date = Column(DateTime(), nullable=True)
    creator_id = Column(UUIDType(), ForeignKey("users.id"), nullable=False)
    assignee_id = Column(UUIDType(), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    creator = relationship("User", back_populates="tasks_created", foreign_keys=[creator_id])
    assignee = relationship("User", back_populates="tasks_assigned", foreign_keys=[assignee_id])


# ─── Notices ─────────────────────────────────────────
class Notice(Base):
    __tablename__ = "notices"

    id = Column(UUIDType(), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    content = Column(Text, nullable=False)
    is_pinned = Column(Boolean, default=False)
    author_id = Column(UUIDType(), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    author = relationship("User", back_populates="notices")


# ─── Schedules ───────────────────────────────────────
class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(UUIDType(), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    description = Column(Text, default="")
    start_time = Column(DateTime(), nullable=False)
    end_time = Column(DateTime(), nullable=False)
    location = Column(String(255), default="")
    creator_id = Column(UUIDType(), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    creator = relationship("User", back_populates="schedules")


# ─── Chat History ────────────────────────────────────
class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUIDType(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUIDType(), ForeignKey("users.id"), nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    tool_calls = Column(Text, nullable=True)
    created_at = Column(DateTime(), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
