import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/store'
import api from '../lib/api'
import {
  FileCheck, ListTodo, Calendar, Megaphone, TrendingUp, Clock,
  CheckCircle2, AlertCircle, Sparkles, ArrowUpRight, ChevronRight
} from 'lucide-react'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    approvals: [], tasks: [], schedules: [], notices: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [approvals, tasks, schedules, notices] = await Promise.all([
        api.get('/approvals').then(r => r.data).catch(() => []),
        api.get('/tasks').then(r => r.data).catch(() => []),
        api.get('/schedules').then(r => r.data).catch(() => []),
        api.get('/notices').then(r => r.data).catch(() => []),
      ])
      setStats({ approvals, tasks, schedules, notices })
    } finally {
      setLoading(false)
    }
  }

  const pendingApprovals = stats.approvals.filter(a => a.status === 'pending').length
  const myTasks = stats.tasks.filter(t => t.status !== 'done').length
  const upcomingSchedules = stats.schedules.length

  const STAT_CARDS = [
    { label: '대기중 결재', value: pendingApprovals, icon: FileCheck, iconColor: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-600/10', link: '/approvals' },
    { label: '진행중 업무', value: myTasks, icon: ListTodo, iconColor: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-600/10', link: '/tasks' },
    { label: '다가오는 일정', value: upcomingSchedules, icon: Calendar, iconColor: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-600/10', link: '/schedules' },
    { label: '공지사항', value: stats.notices.length, icon: Megaphone, iconColor: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-600/10', link: '/notices' },
  ]

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return '좋은 아침이에요'
    if (h < 18) return '좋은 오후에요'
    return '좋은 저녁이에요'
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <p className="text-sm text-gray-500 mb-1">{getGreeting()} 👋</p>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {user?.name}님의 워크스페이스
            </h1>
          </div>
          <p className="text-xs text-gray-400">
            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {STAT_CARDS.map((card, i) => (
          <div key={i} onClick={() => navigate(card.link)}
            className="card-interactive p-4 sm:p-5 group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center ring-1 ring-inset ${card.ring}`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-0.5 tabular-nums">{card.value}</p>
            <p className="text-xs sm:text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Approvals */}
        <SectionCard
          title="최근 결재" icon={FileCheck} iconColor="text-blue-500"
          link="/approvals" onNavigate={() => navigate('/approvals')}
        >
          {stats.approvals.slice(0, 4).map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 px-1 group">
              <div className="min-w-0 flex-1 mr-3">
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-baikal-600 transition-colors">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.author?.name} · {item.created_at?.split('T')[0]}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
          {stats.approvals.length === 0 && <EmptyState text="결재 문서가 없습니다" />}
        </SectionCard>

        {/* Recent Tasks */}
        <SectionCard
          title="최근 업무" icon={ListTodo} iconColor="text-purple-500"
          link="/tasks" onNavigate={() => navigate('/tasks')}
        >
          {stats.tasks.slice(0, 4).map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 px-1 group">
              <div className="min-w-0 flex-1 mr-3">
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-baikal-600 transition-colors">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.assignee?.name || '미할당'} · {item.priority}</p>
              </div>
              <TaskStatusBadge status={item.status} />
            </div>
          ))}
          {stats.tasks.length === 0 && <EmptyState text="업무가 없습니다" />}
        </SectionCard>

        {/* Upcoming Schedules */}
        <SectionCard
          title="다가오는 일정" icon={Calendar} iconColor="text-emerald-500"
          link="/schedules" onNavigate={() => navigate('/schedules')}
        >
          {stats.schedules.slice(0, 4).map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-3 px-1">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ring-1 ring-inset ring-emerald-600/10">
                <span className="text-2xs font-bold text-emerald-600">
                  {item.start_time?.split('T')[0]?.split('-')[1]}월
                </span>
                <span className="text-sm font-bold text-emerald-700 -mt-0.5">
                  {item.start_time?.split('T')[0]?.split('-')[2]}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.location || '장소 미정'}</p>
              </div>
            </div>
          ))}
          {stats.schedules.length === 0 && <EmptyState text="일정이 없습니다" />}
        </SectionCard>

        {/* Recent Notices */}
        <SectionCard
          title="최근 공지" icon={Megaphone} iconColor="text-amber-500"
          link="/notices" onNavigate={() => navigate('/notices')}
        >
          {stats.notices.slice(0, 4).map((item, i) => (
            <div key={i} className="py-3 px-1">
              <div className="flex items-center gap-2">
                {item.is_pinned && <span className="text-amber-500 text-xs">📌</span>}
                <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{item.author?.name} · {item.created_at?.split('T')[0]}</p>
            </div>
          ))}
          {stats.notices.length === 0 && <EmptyState text="공지사항이 없습니다" />}
        </SectionCard>
      </div>

      {/* AI Hint Banner */}
      <div className="mt-6 sm:mt-8 card overflow-hidden">
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-baikal-600 via-baikal-600 to-accent-purple">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-white/5 rounded-full blur-2xl" />
          </div>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 ring-1 ring-inset ring-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">AI에게 업무를 요청하세요</p>
              <p className="text-xs text-white/70 mt-1">
                "출장 신청서 만들어줘", "내일 회의 등록해줘" 등을 AI Chat에 입력하면 자동으로 처리합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionCard({ title, icon: Icon, iconColor, children, onNavigate }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-100/80">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          {title}
        </h2>
        <button onClick={onNavigate} className="text-xs text-gray-400 hover:text-baikal-600 flex items-center gap-0.5 transition-colors">
          전체보기 <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="px-4 sm:px-5 divide-y divide-gray-50">
        {children}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    draft: { label: '초안', cls: 'badge-gray' },
    pending: { label: '대기', cls: 'badge-yellow' },
    approved: { label: '승인', cls: 'badge-green' },
    rejected: { label: '반려', cls: 'badge-red' },
  }
  const s = map[status] || map.draft
  return <span className={s.cls}>{s.label}</span>
}

function TaskStatusBadge({ status }) {
  const map = {
    todo: { label: 'To Do', cls: 'badge-gray' },
    in_progress: { label: '진행중', cls: 'badge-blue' },
    done: { label: '완료', cls: 'badge-green' },
  }
  const s = map[status] || map.todo
  return <span className={s.cls}>{s.label}</span>
}

function EmptyState({ text }) {
  return (
    <div className="py-10 text-center">
      <p className="text-sm text-gray-400">{text}</p>
      <p className="text-xs text-gray-300 mt-1">AI에게 생성을 요청해보세요</p>
    </div>
  )
}
