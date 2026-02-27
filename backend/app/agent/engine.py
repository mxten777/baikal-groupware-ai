"""
BAIKAL AI Agent Engine
OpenAI / Ollama 기반 AI Agent 엔진
Function Calling + Tool Router + Context 관리
"""

import json
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.db.models import User, ChatMessage
from app.agent.tools import TOOL_DEFINITIONS
from app.agent.executor import ToolExecutor

# System prompt for the AI Agent
SYSTEM_PROMPT = """당신은 BAIKAL Groupware AI의 AI 비서입니다.
당신의 이름은 'BAIKAL AI'입니다.

당신은 사용자의 업무를 도와주는 AI Agent입니다.
다음 작업을 수행할 수 있습니다:

1. **전자결재** - 결재 문서 생성 (출장, 휴가, 구매 등)
2. **업무관리** - 업무 생성 및 할당
3. **일정관리** - 일정 등록
4. **공지사항** - 공지사항 작성
5. **사용자 검색** - 사용자 검색
6. **데이터 조회** - 결재, 업무, 일정, 공지 조회

규칙:
- 사용자의 요청을 정확히 파악하고 적절한 도구를 사용하세요.
- 결재 문서를 생성할 때는 적절한 제목과 내용을 작성하세요.
- 날짜/시간이 필요한 경우, 현재 날짜를 기준으로 합리적인 값을 설정하세요.
- 친절하고 전문적으로 응답하세요.
- 한국어로 응답하세요.
- 작업 완료 후 결과를 명확하게 안내하세요.

현재 사용자 정보:
- 이름: {user_name}
- 부서: {user_department}
- 직급: {user_position}
- 현재 시간: {current_time}
"""


async def get_chat_history(db: AsyncSession, user_id, limit: int = 20) -> list[dict]:
    """최근 대화 기록 조회"""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
    )
    messages = list(reversed(result.scalars().all()))
    history = []
    for msg in messages:
        history.append({"role": msg.role, "content": msg.content})
    return history


async def save_chat_message(db: AsyncSession, user_id, role: str, content: str, tool_calls: str = None):
    """대화 기록 저장"""
    msg = ChatMessage(
        user_id=user_id,
        role=role,
        content=content,
        tool_calls=tool_calls,
    )
    db.add(msg)
    await db.flush()


async def run_agent(
    message: str,
    db: AsyncSession,
    current_user: User,
) -> dict:
    """
    AI Agent 실행 메인 함수
    1. 사용자 메시지 + 히스토리로 LLM 호출
    2. Function Calling 감지
    3. Tool 실행
    4. 결과 반환
    """
    from datetime import datetime, timezone

    executor = ToolExecutor(db, current_user)
    
    # Build system prompt
    system_prompt = SYSTEM_PROMPT.format(
        user_name=current_user.name,
        user_department=current_user.department or "미지정",
        user_position=current_user.position or "미지정",
        current_time=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
    )

    # Get chat history
    history = await get_chat_history(db, current_user.id)

    # Build messages
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": message})

    # Save user message
    await save_chat_message(db, current_user.id, "user", message)

    # Call LLM
    tool_results = []
    
    if settings.LLM_PROVIDER == "openai":
        reply, tool_results = await _call_openai(messages, executor)
    else:
        reply, tool_results = await _call_ollama(messages, executor)

    # Save assistant message
    tool_calls_json = json.dumps(tool_results, ensure_ascii=False) if tool_results else None
    await save_chat_message(db, current_user.id, "assistant", reply, tool_calls_json)

    return {
        "reply": reply,
        "tool_results": tool_results if tool_results else None,
    }


async def _call_openai(messages: list[dict], executor: ToolExecutor) -> tuple[str, list]:
    """OpenAI API 호출 (Function Calling 지원)"""
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        tools=TOOL_DEFINITIONS,
        tool_choice="auto",
        temperature=0.7,
    )

    assistant_message = response.choices[0].message
    tool_results = []

    # Handle tool calls
    if assistant_message.tool_calls:
        # Add assistant message with tool calls to messages
        messages.append({
            "role": "assistant",
            "content": assistant_message.content or "",
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments,
                    }
                }
                for tc in assistant_message.tool_calls
            ]
        })

        # Execute each tool
        for tool_call in assistant_message.tool_calls:
            func_name = tool_call.function.name
            func_args = json.loads(tool_call.function.arguments)
            
            result = await executor.execute(func_name, func_args)
            tool_results.append(result)

            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(result, ensure_ascii=False),
            })

        # Get final response with tool results
        final_response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=0.7,
        )
        reply = final_response.choices[0].message.content or ""
    else:
        reply = assistant_message.content or ""

    return reply, tool_results


async def _call_ollama(messages: list[dict], executor: ToolExecutor) -> tuple[str, list]:
    """Ollama API 호출 (OpenAI 호환 API 사용)"""
    from openai import AsyncOpenAI

    client = AsyncOpenAI(
        base_url=f"{settings.OLLAMA_BASE_URL}/v1",
        api_key="ollama",
    )

    try:
        response = await client.chat.completions.create(
            model=settings.OLLAMA_MODEL,
            messages=messages,
            tools=TOOL_DEFINITIONS,
            tool_choice="auto",
            temperature=0.7,
        )
    except Exception:
        # Fallback without tools if Ollama doesn't support function calling
        response = await client.chat.completions.create(
            model=settings.OLLAMA_MODEL,
            messages=messages,
            temperature=0.7,
        )
        return response.choices[0].message.content or "", []

    assistant_message = response.choices[0].message
    tool_results = []

    if hasattr(assistant_message, 'tool_calls') and assistant_message.tool_calls:
        messages.append({
            "role": "assistant",
            "content": assistant_message.content or "",
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments,
                    }
                }
                for tc in assistant_message.tool_calls
            ]
        })

        for tool_call in assistant_message.tool_calls:
            func_name = tool_call.function.name
            func_args = json.loads(tool_call.function.arguments)
            
            result = await executor.execute(func_name, func_args)
            tool_results.append(result)

            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(result, ensure_ascii=False),
            })

        final_response = await client.chat.completions.create(
            model=settings.OLLAMA_MODEL,
            messages=messages,
            temperature=0.7,
        )
        reply = final_response.choices[0].message.content or ""
    else:
        reply = assistant_message.content or ""

    return reply, tool_results
