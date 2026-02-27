import { useState, useEffect } from 'react'
import api from '../lib/api'
import { FileCheck, Send, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react'

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState([])
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadApprovals() }, [])

  const loadApprovals = async () => {
    try {
      const res = await api.get('/approvals')
      setApprovals(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (id) => {
    try {
      await api.post(`/approvals/${id}/submit`)
      loadApprovals()
    } catch (e) {
      alert(e.response?.data?.detail || '오류')
    }
  }

  const handleAction = async (id, action) => {
    const comment = prompt(`${action === 'approved' ? '승인' : '반려'} 코멘트:`)
    try {
      await api.post(`/approvals/${id}/action`, { action, comment: comment || '' })
      loadApprovals()
      setSelected(null)
    } catch (e) {
      alert(e.response?.data?.detail || '오류')
    }
  }

  const filtered = filter === 'all' ? approvals : approvals.filter(a => a.status === filter)

  const STATUS_MAP = {
    draft: { label: '초안', cls: 'badge-gray', icon: Clock },
    pending: { label: '대기', cls: 'badge-yellow', icon: Clock },
    approved: { label: '승인', cls: 'badge-green', icon: CheckCircle },
    rejected: { label: '반려', cls: 'badge-red', icon: XCircle },
  }

  const FILTERS = [
    { key: 'all', label: '전체' },
    { key: 'draft', label: '초안' },
    { key: 'pending', label: '대기' },
    { key: 'approved', label: '승인' },
    { key: 'rejected', label: '반려' },
  ]

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center ring-1 ring-inset ring-blue-600/10">
            <FileCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="page-title">전자결재</h1>
            <p className="page-subtitle hidden sm:block">AI에게 "출장 신청서 만들어줘"라고 요청해보세요</p>
          </div>
        </div>
      </div>

      {/* Filter tabs - scrollable on mobile */}
      <div className="flex gap-1 mb-5 bg-gray-100/80 rounded-xl p-1 overflow-x-auto no-scrollbar">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              filter === f.key
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.label}
            {f.key !== 'all' && (
              <span className="ml-1.5 text-[10px] opacity-60">
                {f.key === 'all' ? approvals.length : approvals.filter(a => a.status === f.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Desktop Table - hidden on mobile */}
      <div className="card overflow-hidden hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">제목</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3 w-24">카테고리</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3 w-24">작성자</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3 w-20">상태</th>
              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3 w-28">날짜</th>
              <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3 w-36">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((item) => {
              const st = STATUS_MAP[item.status] || STATUS_MAP.draft
              return (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => setSelected(item)}>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-baikal-600 transition-colors">{item.title}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">{item.category}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-gray-700 font-medium">{item.author?.name}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={st.cls}>{st.label}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-gray-400">{item.created_at?.split('T')[0]}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-1.5" onClick={e => e.stopPropagation()}>
                    {item.status === 'draft' && (
                      <button onClick={() => handleSubmit(item.id)} className="btn-primary !text-xs !px-3 !py-1.5 !rounded-lg">
                        <Send className="w-3 h-3 inline mr-1" />상신
                      </button>
                    )}
                    {item.status === 'pending' && (
                      <>
                        <button onClick={() => handleAction(item.id, 'approved')} className="btn-success !text-xs !px-3 !py-1.5 !rounded-lg">
                          승인
                        </button>
                        <button onClick={() => handleAction(item.id, 'rejected')} className="btn-danger !text-xs !px-3 !py-1.5 !rounded-lg">
                          반려
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileCheck className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-400">결재 문서가 없습니다</p>
            <p className="text-xs text-gray-300 mt-1">AI에게 "결재 문서 만들어줘"라고 요청해보세요</p>
          </div>
        )}
      </div>

      {/* Mobile Card List - shown only on mobile */}
      <div className="md:hidden space-y-2.5">
        {filtered.length === 0 ? (
          <div className="card py-16 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileCheck className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-400">결재 문서가 없습니다</p>
            <p className="text-xs text-gray-300 mt-1">AI에게 요청해보세요</p>
          </div>
        ) : (
          filtered.map((item) => {
            const st = STATUS_MAP[item.status] || STATUS_MAP.draft
            return (
              <div key={item.id} className="card p-4 active:scale-[0.98] transition-transform" onClick={() => setSelected(item)}>
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900 flex-1 mr-2">{item.title}</p>
                  <span className={st.cls}>{st.label}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{item.author?.name}</span>
                  <span>·</span>
                  <span>{item.category}</span>
                  <span>·</span>
                  <span>{item.created_at?.split('T')[0]}</span>
                </div>
                {(item.status === 'draft' || item.status === 'pending') && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50" onClick={e => e.stopPropagation()}>
                    {item.status === 'draft' && (
                      <button onClick={() => handleSubmit(item.id)} className="btn-primary !text-xs !px-3 !py-1.5 !rounded-lg flex-1">
                        <Send className="w-3 h-3 inline mr-1" />상신
                      </button>
                    )}
                    {item.status === 'pending' && (
                      <>
                        <button onClick={() => handleAction(item.id, 'approved')} className="btn-success !text-xs !py-1.5 !rounded-lg flex-1">승인</button>
                        <button onClick={() => handleAction(item.id, 'rejected')} className="btn-danger !text-xs !py-1.5 !rounded-lg flex-1">반려</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="px-5 sm:px-6 py-5 border-b border-gray-100">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">{selected.title}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
                <span className="font-medium">{selected.author?.name}</span>
                <span className="text-gray-300">·</span>
                <span>{selected.category}</span>
                <span className="text-gray-300">·</span>
                <span className={(STATUS_MAP[selected.status] || STATUS_MAP.draft).cls}>
                  {(STATUS_MAP[selected.status] || STATUS_MAP.draft).label}
                </span>
              </div>
            </div>
            <div className="px-5 sm:px-6 py-5">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selected.content}</p>

              {selected.approval_lines?.length > 0 && (
                <div className="mt-6">
                  <h3 className="section-title mb-3">결재라인</h3>
                  <div className="space-y-2">
                    {selected.approval_lines.map((line, i) => (
                      <div key={i} className="flex items-center gap-3 px-3.5 py-2.5 bg-gray-50 rounded-xl">
                        <span className="w-7 h-7 bg-gradient-to-br from-baikal-100 to-baikal-50 rounded-lg flex items-center justify-center text-xs font-bold text-baikal-700 ring-1 ring-inset ring-baikal-200/30">
                          {line.order}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{line.approver?.name}</span>
                        <span className="ml-auto">
                          <span className={(STATUS_MAP[line.action] || STATUS_MAP.draft).cls}>
                            {(STATUS_MAP[line.action] || STATUS_MAP.draft).label}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setSelected(null)} className="btn-secondary text-sm">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
