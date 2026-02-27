import { useState, useRef, useEffect } from 'react'
import { useChatStore } from '../stores/store'
import { Send, Loader2, Trash2, Sparkles, CheckCircle2, AlertTriangle, Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const SUGGESTIONS = [
  { text: '출장 신청서 만들어줘', emoji: '📝' },
  { text: '내일 오후 2시 회의 등록해줘', emoji: '📅' },
  { text: '김철수에게 보고서 업무 등록해줘', emoji: '📋' },
  { text: '회사 워크숍 공지 작성해줘', emoji: '📢' },
  { text: '내 결재 문서 조회해줘', emoji: '🔍' },
  { text: '내 업무 목록 보여줘', emoji: '📊' },
]

export default function ChatPanel() {
  const [input, setInput] = useState('')
  const messages = useChatStore((s) => s.messages)
  const isLoading = useChatStore((s) => s.isLoading)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const clearMessages = useChatStore((s) => s.clearMessages)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    sendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-6">
            <div className="w-14 h-14 bg-gradient-to-br from-baikal-100 via-baikal-50 to-purple-100 rounded-3xl flex items-center justify-center mb-4 shadow-sm ring-1 ring-inset ring-baikal-200/30">
              <Sparkles className="w-7 h-7 text-baikal-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">무엇을 도와드릴까요?</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-[260px] leading-relaxed">
              AI에게 업무를 요청하세요.<br/>결재, 일정, 업무, 공지를 AI가 처리합니다.
            </p>
            <div className="grid grid-cols-1 gap-1.5 w-full max-w-[300px]">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s.text); }}
                  className="text-left text-sm px-3.5 py-2.5 rounded-xl border border-gray-150 text-gray-600 
                    hover:border-baikal-300 hover:text-baikal-700 hover:bg-baikal-50/50 hover:shadow-sm
                    active:scale-[0.98] transition-all duration-200 flex items-center gap-2.5"
                >
                  <span className="text-base">{s.emoji}</span>
                  <span>{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 bg-gradient-to-br from-baikal-500 to-accent-purple rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-baikal-500 to-baikal-600 text-white rounded-br-lg shadow-sm'
                  : 'bg-gray-50 text-gray-800 rounded-bl-lg ring-1 ring-inset ring-gray-100'
              }`}
            >
              <div className={`text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 ${
                msg.role === 'user' ? 'prose-invert' : ''
              }`}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              {msg.toolResults && msg.toolResults.length > 0 && (
                <div className={`mt-2.5 pt-2.5 border-t ${msg.role === 'user' ? 'border-white/15' : 'border-gray-200/80'}`}>
                  {msg.toolResults.map((result, ridx) => (
                    <div key={ridx} className="text-xs">
                      {result.success ? (
                        <span className="flex items-center gap-1.5 text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="font-medium">{result.data?.message || '작업이 완료되었습니다.'}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-red-500">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{result.error}</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 justify-start animate-fade-in">
            <div className="w-7 h-7 bg-gradient-to-br from-baikal-500 to-accent-purple rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-gray-50 rounded-2xl rounded-bl-lg px-4 py-3 flex items-center gap-2 ring-1 ring-inset ring-gray-100">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-baikal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-baikal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-baikal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-gray-500 ml-1">AI가 처리 중입니다...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 px-3 sm:px-4 py-3 bg-white">
        <div className="flex items-end gap-2">
          <button
            onClick={clearMessages}
            className="btn-icon !w-9 !h-9 flex-shrink-0"
            title="대화 초기화"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="AI에게 업무를 요청하세요..."
              rows={1}
              className="w-full px-4 py-2.5 bg-surface-secondary border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 
                focus:outline-none focus:ring-2 focus:ring-baikal-500/30 focus:border-baikal-400 
                hover:border-gray-300
                resize-none transition-all duration-200"
              style={{ minHeight: '42px', maxHeight: '120px' }}
              onInput={(e) => {
                e.target.style.height = 'auto'
                e.target.style.height = e.target.scrollHeight + 'px'
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 bg-gradient-to-b from-baikal-500 to-baikal-600 text-white rounded-xl 
              hover:from-baikal-600 hover:to-baikal-700 transition-all 
              disabled:opacity-30 disabled:cursor-not-allowed 
              active:scale-95 flex items-center justify-center flex-shrink-0
              shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
