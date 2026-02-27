"""
BAIKAL Groupware AI - DB 초기화 및 시드 데이터
"""
from sqlalchemy import select
from app.db.database import engine, async_session, Base
from app.db.models import User
from app.core.security import get_password_hash


async def init_db():
    """DB 테이블 생성"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def seed_data():
    """초기 데이터 생성"""
    async with async_session() as db:
        # Check if admin exists
        result = await db.execute(select(User).where(User.email == "admin@baikal.ai"))
        if result.scalar_one_or_none():
            return  # Already seeded

        users = [
            User(
                email="admin@baikal.ai",
                hashed_password=get_password_hash("admin1234"),
                name="관리자",
                department="경영지원",
                position="대표",
                role="admin",
            ),
            User(
                email="kim@baikal.ai",
                hashed_password=get_password_hash("user1234"),
                name="김철수",
                department="개발팀",
                position="팀장",
                role="user",
            ),
            User(
                email="lee@baikal.ai",
                hashed_password=get_password_hash("user1234"),
                name="이영희",
                department="개발팀",
                position="선임",
                role="user",
            ),
            User(
                email="park@baikal.ai",
                hashed_password=get_password_hash("user1234"),
                name="박지민",
                department="마케팅팀",
                position="팀장",
                role="user",
            ),
            User(
                email="choi@baikal.ai",
                hashed_password=get_password_hash("user1234"),
                name="최민수",
                department="인사팀",
                position="과장",
                role="user",
            ),
        ]

        for user in users:
            db.add(user)
        
        await db.commit()
        print("✅ Seed data created successfully")
