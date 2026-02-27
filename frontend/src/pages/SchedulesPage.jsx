import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Calendar, MapPin, Clock } from 'lucide-react'

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadSchedules() }, [])

  const loadSchedules = async () => {
    try {
      const res = await api.get('/schedules')
      setSchedules(res.data)
    } finally {
      setLoading(false)
    }
  }

  // Group by date
  const grouped = schedules.reduce((acc, s) => {
    const date = s.start_time?.split('T')[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(s)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort()

  const getDayName = (dateStr) => {
    try {
      const d = new Date(dateStr)
      return DAY_NAMES[d.getDay()]
    } catch { return '' }
  }

  const isToday = (dateStr) => {
    const today = new Date().toISOString().split('T')[0]
    return dateStr === today
  }

  return (
    <div className="page-container max-w-4xl">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center ring-1 ring-inset ring-emerald-600/10">
            <Calendar className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="page-title">일정관리</h1>
            <p className="page-subtitle hidden sm:block">AI에게 "3월 10일 회의 등록해줘"라고 요청해보세요</p>
          </div>
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <div className="card py-20 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-400">일정이 없습니다</p>
          <p className="text-xs text-gray-300 mt-1">AI에게 일정 등록을 요청해보세요</p>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {sortedDates.map(date => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl flex flex-col items-center justify-center ring-1 ring-inset ${
                  isToday(date)
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 ring-emerald-400/30'
                    : 'bg-emerald-50 ring-emerald-600/10'
                }`}>
                  <span className={`text-[10px] font-bold ${
                    isToday(date) ? 'text-emerald-100' : 'text-emerald-600'
                  }`}>
                    {date.split('-')[1]}월
                  </span>
                  <span className={`text-lg sm:text-xl font-black -mt-0.5 ${
                    isToday(date) ? 'text-white' : 'text-emerald-700'
                  }`}>
                    {date.split('-')[2]}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">{date}</p>
                    <span className="text-xs font-medium text-gray-400">({getDayName(date)})</span>
                    {isToday(date) && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-inset ring-emerald-600/10">오늘</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{grouped[date].length}건의 일정</p>
                </div>
              </div>

              {/* Schedule Items */}
              <div className="space-y-2.5 ml-3 sm:ml-7 border-l-2 border-emerald-100 pl-4 sm:pl-6">
                {grouped[date].map(item => (
                  <div key={item.id} className="card-hover p-4">
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium">{formatTime(item.start_time)} ~ {formatTime(item.end_time)}</span>
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium">{item.location}</span>
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatTime(isoStr) {
  if (!isoStr) return ''
  const parts = isoStr.split('T')
  if (parts.length < 2) return ''
  return parts[1].substring(0, 5)
}
