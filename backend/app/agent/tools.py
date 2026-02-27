"""
BAIKAL AI Agent Tools - Function Calling 기반 도구 정의
각 도구는 OpenAI Function Calling 스펙에 맞게 정의됨
"""

# ─── Tool Definitions for OpenAI Function Calling ─────

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "create_approval",
            "description": "전자결재 문서를 생성합니다. 출장 신청서, 휴가 신청서, 구매 요청서 등 다양한 결재 문서를 작성할 수 있습니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "결재 문서 제목 (예: '3월 출장 신청서', '연차 휴가 신청')"
                    },
                    "content": {
                        "type": "string",
                        "description": "결재 문서 본문 내용. 상세하게 작성합니다."
                    },
                    "category": {
                        "type": "string",
                        "description": "결재 카테고리: general, travel, leave, purchase",
                        "enum": ["general", "travel", "leave", "purchase"]
                    },
                    "approver_names": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "결재자 이름 목록 (결재 순서대로). 비어있으면 결재라인 없이 초안만 생성"
                    }
                },
                "required": ["title", "content"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_task",
            "description": "업무를 생성하고 담당자에게 할당합니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "업무 제목"
                    },
                    "description": {
                        "type": "string",
                        "description": "업무 상세 설명"
                    },
                    "assignee_name": {
                        "type": "string",
                        "description": "담당자 이름 (없으면 본인에게 할당)"
                    },
                    "priority": {
                        "type": "string",
                        "description": "우선순위: low, medium, high, urgent",
                        "enum": ["low", "medium", "high", "urgent"]
                    },
                    "due_date": {
                        "type": "string",
                        "description": "마감일 (ISO 8601 형식, 예: 2026-03-15T18:00:00)"
                    }
                },
                "required": ["title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_schedule",
            "description": "일정을 등록합니다. 회의, 미팅, 이벤트 등을 등록할 수 있습니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "일정 제목"
                    },
                    "description": {
                        "type": "string",
                        "description": "일정 상세 설명"
                    },
                    "start_time": {
                        "type": "string",
                        "description": "시작 시간 (ISO 8601 형식, 예: 2026-03-10T14:00:00)"
                    },
                    "end_time": {
                        "type": "string",
                        "description": "종료 시간 (ISO 8601 형식, 예: 2026-03-10T15:00:00)"
                    },
                    "location": {
                        "type": "string",
                        "description": "장소"
                    }
                },
                "required": ["title", "start_time", "end_time"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_notice",
            "description": "공지사항을 작성합니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "공지사항 제목"
                    },
                    "content": {
                        "type": "string",
                        "description": "공지사항 본문 내용"
                    },
                    "is_pinned": {
                        "type": "boolean",
                        "description": "상단 고정 여부",
                        "default": False
                    }
                },
                "required": ["title", "content"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_users",
            "description": "사용자를 검색합니다. 이름으로 검색할 수 있습니다.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "검색할 사용자 이름"
                    }
                },
                "required": ["name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_my_approvals",
            "description": "내가 작성한 결재 문서 목록을 조회합니다.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_my_tasks",
            "description": "내 업무 목록을 조회합니다.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_my_schedules",
            "description": "내 일정 목록을 조회합니다.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_notices",
            "description": "공지사항 목록을 조회합니다.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    }
]
