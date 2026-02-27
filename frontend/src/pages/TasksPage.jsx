import { useState, useEffect } from 'react'
import api from '../lib/api'
import { ListTodo, CheckCircle2, Clock, ArrowRight, Play, Check } from 'lucide-react'

const STATUS_MAP = {
  todo: { label: 'To Do', cls: 'badge-gray' },
  in_progress: { label: '진행중', cls: 'badge-blue' },
  done: { label: '완료', cls: 'badge-green' },
}

const PRIORITY_MAP = {
  low: { label: '낮음', dot: 'bg-gray-300' },
  medium: { label: '보통', dot: 'bg-blue-400' },
  high: { label: '높음', dot: 'bg-amber-400' },
  urgent: { label: '긴급', dot: 'bg-red-500' },
}

const COL_CONFIG = {
  todo: { label: 'To Do', dot: 'bg-gray-400', border: 'border-gray-200', countBg: 'bg-gray-100 text-gray-600' },
  in_progress: { label: '진행중', dot: 'bg-blue-500', border: 'border-blue-200', countBg: 'bg-blue-50 text-blue-700' },
  done: { label: '완료', dot: 'bg-emerald-500', border: 'border-emerald-200', countBg: 'bg-emerald-50 text-emerald-700' },
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [mobileTab, setMobileTab] = useState('todo')

  useEffect(() => { loadTasks() }, [])

  const loadTasks = async () => {
    try {
      const res = await api.get('/tasks')
      setTasks(res.data)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/tasks/${id}`, { status: newStatus })
      loadTasks()
    } catch (e) {
      alert(e.response?.data?.detail || '오류')
    }
  }

  const columns = ['todo', 'in_progress', 'done']

  const renderTaskCard = (task, colKey) => (
    <div key={task.id} className="card-hover p-4">
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-semibold text-gray-900 flex-1 mr-2">{task.title}</p>
        {task.priority && (
          <span className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_MAP[task.priority]?.dot || 'bg-gray-300'}`} />
            <span className="text-[11px] font-medium text-gray-500">{PRIORITY_MAP[task.priority]?.label}</span>
          </span>
        )}
      </div>
      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assignee && (
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center ring-1 ring-inset ring-purple-200/50">
                <span className="text-[10px] font-bold text-purple-700">{task.assignee.name[0]}</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">{task.assignee.name}</span>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {colKey === 'todo' && (
            <button
              onClick={() => updateStatus(task.id, 'in_progress')}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Play className="w-3 h-3" /> 시작
            </button>
          )}
          {colKey === 'in_progress' && (
            <button
              onClick={() => updateStatus(task.id, 'done')}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Check className="w-3 h-3" /> 완료
            </button>
          )}
        </div>
      </div>
      {task.due_date && (
        <div className="mt-2.5 pt-2.5 border-t border-gray-50 flex items-center gap-1.5 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span className="font-medium">{task.due_date.split('T')[0]}</span>
        </div>
      )}
    </div>
  )

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center ring-1 ring-inset ring-purple-600/10">
            <ListTodo className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="page-title">업무관리</h1>
            <p className="page-subtitle hidden sm:block">AI에게 "김철수에게 보고서 업무 등록해줘"라고 요청해보세요</p>
          </div>
        </div>
      </div>

      {/* Mobile Tab Selector */}
      <div className="md:hidden flex gap-1 mb-4 bg-gray-100/80 rounded-xl p-1">
        {columns.map(key => {
          const c = COL_CONFIG[key]
          const count = tasks.filter(t => t.status === key).length
          return (
            <button
              key={key}
              onClick={() => setMobileTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                mobileTab === key
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5'
                  : 'text-gray-500'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
              {c.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${mobileTab === key ? c.countBg : 'bg-gray-200/60 text-gray-400'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Mobile: Single column view */}
      <div className="md:hidden space-y-2.5">
        {(() => {
          const colTasks = tasks.filter(t => t.status === mobileTab)
          return colTasks.length === 0 ? (
            <div className="card py-12 text-center">
              <ListTodo className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">업무가 없습니다</p>
            </div>
          ) : (
            colTasks.map(task => renderTaskCard(task, mobileTab))
          )
        })()}
      </div>

      {/* Desktop: Kanban Board */}
      <div className="hidden md:grid grid-cols-3 gap-5">
        {columns.map(key => {
          const c = COL_CONFIG[key]
          const colTasks = tasks.filter(t => t.status === key)
          return (
            <div key={key} className="space-y-3">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-gray-100">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                  <h2 className="text-sm font-bold text-gray-800">{c.label}</h2>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.countBg}`}>
                  {colTasks.length}
                </span>
              </div>
              {/* Task Cards */}
              <div className="space-y-2.5">
                {colTasks.map(task => renderTaskCard(task, key))}
                {colTasks.length === 0 && (
                  <div className="py-10 text-center rounded-xl border-2 border-dashed border-gray-100">
                    <ListTodo className="w-6 h-6 text-gray-200 mx-auto mb-1.5" />
                    <p className="text-xs text-gray-300 font-medium">비어있음</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
