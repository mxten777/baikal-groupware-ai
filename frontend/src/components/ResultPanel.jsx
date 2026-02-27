import {
  X, FileCheck, ListTodo, Calendar, Megaphone, Users, CheckCircle2
} from 'lucide-react'

const TYPE_CONFIG = {
  approval: { icon: FileCheck, label: '전자결재', color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-600/10' },
  task: { icon: ListTodo, label: '업무', color: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-600/10' },
  schedule: { icon: Calendar, label: '일정', color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-600/10' },
  notice: { icon: Megaphone, label: '공지사항', color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-600/10' },
  users: { icon: Users, label: '사용자', color: 'text-gray-600', bg: 'bg-gray-50', ring: 'ring-gray-500/10' },
  approvals: { icon: FileCheck, label: '결재 목록', color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-600/10' },
  tasks: { icon: ListTodo, label: '업무 목록', color: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-600/10' },
  schedules: { icon: Calendar, label: '일정 목록', color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-600/10' },
  notices: { icon: Megaphone, label: '공지 목록', color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-600/10' },
}

export default function ResultPanel({ data, onClose }) {
  if (!data) return null
  
  const config = TYPE_CONFIG[data.type] || TYPE_CONFIG.approval
  const Icon = config.icon
  const info = data.data

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 flex-shrink-0 bg-white">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 ${config.bg} rounded-xl flex items-center justify-center ring-1 ring-inset ${config.ring}`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>
          <span className="text-sm font-bold text-gray-900">{config.label}</span>
        </div>
        <button onClick={onClose} className="btn-icon !w-8 !h-8">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {info?.message && (
          <div className="flex items-start gap-2.5 mb-4 p-3.5 bg-emerald-50 rounded-xl ring-1 ring-inset ring-emerald-600/10">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800 font-medium">{info.message}</p>
          </div>
        )}

        {data.type === 'approval' && <ApprovalDetail data={info} />}
        {data.type === 'task' && <TaskDetail data={info} />}
        {data.type === 'schedule' && <ScheduleDetail data={info} />}
        {data.type === 'notice' && <NoticeDetail data={info} />}
        {data.type === 'users' && <UsersList data={info} />}
        {data.type === 'approvals' && <ApprovalsList data={info} />}
        {data.type === 'tasks' && <TasksList data={info} />}
        {data.type === 'schedules' && <SchedulesList data={info} />}
        {data.type === 'notices' && <NoticesList data={info} />}
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 w-16 flex-shrink-0 pt-0.5 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-gray-800 flex-1 font-medium">{value}</span>
    </div>
  )
}

function ApprovalDetail({ data }) {
  return (
    <div className="card p-4">
      <DetailRow label="제목" value={data.title} />
      <DetailRow label="카테고리" value={data.category} />
      <DetailRow label="상태" value={data.status} />
      <DetailRow label="결재라인" value={data.approvers?.join(' → ')} />
      {data.content && (
        <div className="pt-3 mt-2 border-t border-gray-100">
          <p className="section-title mb-2">내용</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{data.content}</p>
        </div>
      )}
    </div>
  )
}

function TaskDetail({ data }) {
  return (
    <div className="card p-4">
      <DetailRow label="제목" value={data.title} />
      <DetailRow label="담당자" value={data.assignee} />
      <DetailRow label="우선순위" value={data.priority} />
      <DetailRow label="마감일" value={data.due_date} />
      {data.description && (
        <div className="pt-3 mt-2 border-t border-gray-100">
          <p className="section-title mb-2">설명</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.description}</p>
        </div>
      )}
    </div>
  )
}

function ScheduleDetail({ data }) {
  return (
    <div className="card p-4">
      <DetailRow label="제목" value={data.title} />
      <DetailRow label="시작" value={data.start_time} />
      <DetailRow label="종료" value={data.end_time} />
      <DetailRow label="장소" value={data.location} />
    </div>
  )
}

function NoticeDetail({ data }) {
  return (
    <div className="card p-4">
      <DetailRow label="제목" value={data.title} />
      {data.content && (
        <div className="pt-3 mt-2 border-t border-gray-100">
          <p className="section-title mb-2">내용</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.content}</p>
        </div>
      )}
    </div>
  )
}

function UsersList({ data }) {
  return (
    <div className="space-y-2">
      {data.users?.map((u, i) => (
        <div key={i} className="card p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-baikal-100 to-baikal-50 rounded-xl flex items-center justify-center text-sm font-bold text-baikal-700 ring-1 ring-inset ring-baikal-200/30">
            {u.name?.[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{u.name}</p>
            <p className="text-xs text-gray-500">{u.department} · {u.position}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ApprovalsList({ data }) {
  const STATUS = { draft: 'badge-gray', pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red' }
  const LABEL = { draft: '초안', pending: '대기', approved: '승인', rejected: '반려' }
  return (
    <div className="space-y-2">
      {data.approvals?.map((a, i) => (
        <div key={i} className="card p-3.5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
            <span className={STATUS[a.status] || 'badge-gray'}>{LABEL[a.status] || a.status}</span>
          </div>
          <p className="text-xs text-gray-400">{a.created_at?.split('T')[0]}</p>
        </div>
      ))}
    </div>
  )
}

function TasksList({ data }) {
  return (
    <div className="space-y-2">
      {data.tasks?.map((t, i) => (
        <div key={i} className="card p-3.5">
          <p className="text-sm font-semibold text-gray-900 mb-1.5">{t.title}</p>
          <div className="flex items-center gap-2">
            <span className="badge-gray">{t.status}</span>
            <span className="badge-blue">{t.priority}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function SchedulesList({ data }) {
  return (
    <div className="space-y-2">
      {data.schedules?.map((s, i) => (
        <div key={i} className="card p-3.5">
          <p className="text-sm font-semibold text-gray-900">{s.title}</p>
          <p className="text-xs text-gray-400 mt-1">{s.start_time?.split('T')[0]}</p>
        </div>
      ))}
    </div>
  )
}

function NoticesList({ data }) {
  return (
    <div className="space-y-2">
      {data.notices?.map((n, i) => (
        <div key={i} className="card p-3.5">
          <p className="text-sm font-semibold text-gray-900">{n.title}</p>
          <p className="text-xs text-gray-400 mt-1">{n.author} · {n.created_at?.split('T')[0]}</p>
        </div>
      ))}
    </div>
  )
}
