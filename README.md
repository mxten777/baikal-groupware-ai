# BAIKAL Groupware AI

> AI Agent 중심 차세대 그룹웨어 MVP

## 📌 제품 개요

**BAIKAL Groupware AI**는 기존 메뉴/게시판 중심 그룹웨어가 아닌, **AI Agent가 업무를 수행하는 플랫폼**입니다.

사용자는 메뉴를 찾지 않습니다. **AI에게 말합니다.**

```
"출장 신청서 만들어줘"
"내일 오후 2시 회의 등록해줘"
"김철수에게 보고서 업무 등록해줘"
"회사 워크숍 공지 작성해줘"
```

AI Agent가 Function Calling을 통해 자동으로 처리합니다.

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────┐
│                  Web UI (React)               │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │  Sidebar  │  │ AI Chat  │  │Result Panel│ │
│  │   Menu    │  │  Panel   │  │            │ │
│  └──────────┘  └──────────┘  └────────────┘ │
└──────────────────┬──────────────────────────┘
                   │
          ┌────────▼────────┐
          │  API Server      │
          │  (FastAPI)       │
          └────────┬────────┘
                   │
     ┌─────────────┼──────────────┐
     │             │              │
┌────▼────┐  ┌────▼─────┐  ┌────▼──────┐
│   DB    │  │ AI Agent │  │  Tool     │
│PostgreSQL│  │  Engine  │  │ Executor  │
└─────────┘  └────┬─────┘  └───────────┘
                  │
            ┌─────▼──────┐
            │    LLM     │
            │ OpenAI /   │
            │  Ollama    │
            └────────────┘
```

## 🛠️ 기술 스택

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Tailwind CSS + Vite |
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL 16 |
| AI | OpenAI GPT-4o / Ollama (Function Calling) |
| Auth | JWT (python-jose + bcrypt) |
| Deploy | Docker Compose |
| State | Zustand (Frontend) |

## 📁 프로젝트 구조

```
baikal-groupware-ai/
├── docker-compose.yml
├── .env.example
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py                 # FastAPI 앱 엔트리
│       ├── core/
│       │   ├── config.py           # 환경 설정
│       │   └── security.py         # JWT + 비밀번호 해싱
│       ├── db/
│       │   ├── database.py         # SQLAlchemy Async 설정
│       │   ├── models.py           # DB 모델 (7 테이블)
│       │   └── init_db.py          # 테이블 생성 + 시드 데이터
│       ├── schemas/
│       │   └── schemas.py          # Pydantic 스키마
│       ├── api/
│       │   ├── deps.py             # 인증 의존성
│       │   ├── auth.py             # 로그인/회원가입/사용자
│       │   ├── approvals.py        # 전자결재 CRUD + 승인/반려
│       │   ├── tasks.py            # 업무관리
│       │   ├── notices.py          # 공지사항
│       │   ├── schedules.py        # 일정관리
│       │   └── chat.py             # AI Chat 엔드포인트
│       └── agent/
│           ├── tools.py            # Function Calling 도구 정의
│           ├── executor.py         # 도구 실행기
│           └── engine.py           # AI Agent 엔진 (핵심)
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── lib/
        │   └── api.js              # Axios 인스턴스
        ├── stores/
        │   └── store.js            # Zustand 스토어
        ├── layouts/
        │   └── MainLayout.jsx      # 3-column 레이아웃
        ├── components/
        │   ├── ChatPanel.jsx       # AI Chat UI
        │   └── ResultPanel.jsx     # 결과 패널
        └── pages/
            ├── LoginPage.jsx
            ├── DashboardPage.jsx
            ├── ApprovalsPage.jsx
            ├── TasksPage.jsx
            ├── SchedulesPage.jsx
            └── NoticesPage.jsx
```

## 🗄️ DB 설계

| 테이블 | 설명 |
|--------|------|
| `users` | 사용자 (관리자/일반) |
| `approvals` | 전자결재 문서 |
| `approval_lines` | 결재라인 (순차 결재) |
| `approval_logs` | 결재 이력 |
| `tasks` | 업무 |
| `notices` | 공지사항 |
| `schedules` | 일정 |
| `chat_messages` | AI 대화 기록 |

## 🤖 AI Agent 설계

### Tool Router (Function Calling)

| Tool | 기능 |
|------|------|
| `create_approval` | 결재문서 생성 |
| `create_task` | 업무 등록 |
| `create_schedule` | 일정 등록 |
| `create_notice` | 공지 작성 |
| `search_users` | 사용자 검색 |
| `list_my_approvals` | 내 결재 조회 |
| `list_my_tasks` | 내 업무 조회 |
| `list_my_schedules` | 내 일정 조회 |
| `list_notices` | 공지 조회 |

### Agent 처리 흐름

```
사용자 메시지
    ↓
System Prompt + Chat History 구성
    ↓
LLM 호출 (OpenAI / Ollama)
    ↓
Function Calling 감지?
    ├── Yes → Tool Executor → DB 작업 → 결과 반환 → LLM 재호출 → 최종 응답
    └── No → 직접 응답
```

## 🚀 실행 방법

### 1. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일에서 OPENAI_API_KEY 설정
```

### 2. Docker Compose 실행

```bash
docker-compose up --build
```

### 3. 접속

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

### 4. 테스트 계정

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin@baikal.ai | admin1234 |
| 김철수 (개발팀장) | kim@baikal.ai | user1234 |
| 이영희 (개발선임) | lee@baikal.ai | user1234 |
| 박지민 (마케팅팀장) | park@baikal.ai | user1234 |
| 최민수 (인사과장) | choi@baikal.ai | user1234 |

### 로컬 개발 (Docker 없이)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**PostgreSQL** (로컬):
```bash
docker run -d --name baikal-db \
  -e POSTGRES_USER=baikal \
  -e POSTGRES_PASSWORD=baikal1234 \
  -e POSTGRES_DB=baikal_groupware \
  -p 5432:5432 \
  postgres:16-alpine
```

## 🎯 MVP 완료 기준

- [x] JWT 기반 로그인/인증
- [x] AI Agent Chat UI (Function Calling)
- [x] 전자결재 (생성 → 상신 → 승인/반려)
- [x] 업무관리 (Kanban 보드)
- [x] 일정관리
- [x] 공지사항
- [x] 3-Column 레이아웃 (메뉴 | Chat | 결과)
- [x] Docker Compose 배포
- [x] OpenAI / Ollama 지원

## 📋 개발 순서 (4주)

| 주차 | 내용 |
|------|------|
| 1주차 | DB 설계, Backend API, JWT 인증 |
| 2주차 | AI Agent Engine (Function Calling + Tools) |
| 3주차 | Frontend UI (Login, Layout, Chat, Pages) |
| 4주차 | 통합 테스트, Docker, 배포, 버그 수정 |

## 🔮 확장 계획

- **BAIKAL Private AI** 통합
- **BAIKAL RPA AI** 통합
- 실시간 알림 (WebSocket)
- 파일 첨부
- 조직도 관리
- 다국어 지원

---

**© 2026 BAIKAL AI. All rights reserved.**
