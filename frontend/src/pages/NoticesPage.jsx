import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Megaphone, Pin, ChevronRight } from 'lucide-react'

export default function NoticesPage() {
  const [notices, setNotices] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadNotices() }, [])

  const loadNotices = async () => {
    try {
      const res = await api.get('/notices')
      setNotices(res.data)
    } finally {
      setLoading(false)
    }
  }

  // Separate pinned and regular
  const pinned = notices.filter(n => n.is_pinned)
  const regular = notices.filter(n => !n.is_pinned)

  return (
    <div className="page-container max-w-4xl">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center ring-1 ring-inset ring-amber-600/10">
            <Megaphone className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="page-title">공지사항</h1>
            <p className="page-subtitle hidden sm:block">AI에게 "회사 워크숍 공지 작성해줘"라고 요청해보세요</p>
          </div>
        </div>
      </div>

      {notices.length === 0 ? (
        <div className="card py-20 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-400">공지사항이 없습니다</p>
          <p className="text-xs text-gray-300 mt-1">AI에게 공지 작성을 요청해보세요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pinned notices */}
          {pinned.length > 0 && (
            <div className="space-y-2">
              {pinned.map(notice => (
                <div
                  key={notice.id}
                  onClick={() => setSelected(notice)}
                  className="card px-4 sm:px-5 py-4 cursor-pointer hover:shadow-md transition-all group bg-gradient-to-r from-amber-50/50 to-transparent ring-1 ring-inset ring-amber-200/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 ring-1 ring-inset ring-amber-300/30">
                      <Pin className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">{notice.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {notice.author?.name} · {notice.created_at?.split('T')[0]}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Regular notices */}
          {regular.length > 0 && (
            <div className="space-y-2">
              {pinned.length > 0 && <div className="divider" />}
              {regular.map(notice => (
                <div
                  key={notice.id}
                  onClick={() => setSelected(notice)}
                  className="card px-4 sm:px-5 py-4 cursor-pointer hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-baikal-600 transition-colors">{notice.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {notice.author?.name} · {notice.created_at?.split('T')[0]}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="px-5 sm:px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {selected.is_pinned && (
                  <span className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Pin className="w-3 h-3 text-amber-600" />
                  </span>
                )}
                <h2 className="text-base sm:text-lg font-bold text-gray-900">{selected.title}</h2>
              </div>
              <p className="text-sm text-gray-500 mt-1.5 font-medium">
                {selected.author?.name} · {selected.created_at?.split('T')[0]}
              </p>
            </div>
            <div className="px-5 sm:px-6 py-5">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selected.content}</p>
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
