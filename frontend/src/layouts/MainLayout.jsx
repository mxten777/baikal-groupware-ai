import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore, useChatStore } from '../stores/store'
import ChatPanel from '../components/ChatPanel'
import ResultPanel from '../components/ResultPanel'
import {
  Zap, LayoutDashboard, FileCheck, ListTodo, Calendar, Megaphone,
  MessageSquare, LogOut, ChevronLeft, ChevronRight, User, X,
  Menu, Sparkles, PanelRightOpen, PanelRightClose
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: '대시보드', desc: 'Overview' },
  { to: '/approvals', icon: FileCheck, label: '전자결재', desc: 'Approvals' },
  { to: '/tasks', icon: ListTodo, label: '업무관리', desc: 'Tasks' },
  { to: '/schedules', icon: Calendar, label: '일정관리', desc: 'Calendar' },
  { to: '/notices', icon: Megaphone, label: '공지사항', desc: 'Notices' },
]

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const resultPanel = useChatStore((s) => s.resultPanel)
  const navigate = useNavigate()
  const location = useLocation()

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false) }, [location])

  // Show chat by default on large screens
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)')
    setShowChat(mq.matches)
    const handler = (e) => { if (e.matches) setShowChat(true) }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }
  const toggleChat = () => { setShowChat(!showChat); if (!showChat) setShowResult(false) }

  return (
    <div className="h-[100dvh] flex overflow-hidden bg-surface-secondary">
      {/* ─── Mobile Overlay ───────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
             onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* ─── Sidebar ──────────────────────────── */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50
        ${sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-[260px]'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-[280px] bg-dark flex flex-col
        transition-all duration-300 ease-out flex-shrink-0
        shadow-2xl lg:shadow-none
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-baikal-400 via-baikal-500 to-accent-purple rounded-2xl flex items-center justify-center flex-shrink-0 shadow-glow-blue">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="animate-fade-in">
                <h1 className="text-sm font-bold text-white tracking-tight">BAIKAL</h1>
                <p className="text-2xs text-baikal-300 tracking-[0.2em] font-medium">GROUPWARE AI</p>
              </div>
            )}
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden btn-icon text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto">
          <p className="px-3 pt-2 pb-2 text-2xs font-semibold text-gray-500 uppercase tracking-wider">
            {sidebarCollapsed ? '•••' : 'Navigation'}
          </p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-white/[0.08] text-white shadow-inner-light'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-baikal-400 rounded-r-full" />
                  )}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive ? 'bg-baikal-500/20' : 'group-hover:bg-white/[0.04]'
                  }`}>
                    <item.icon className="w-[18px] h-[18px]" />
                  </div>
                  {!sidebarCollapsed && (
                    <div className="animate-fade-in min-w-0">
                      <span className="text-sm font-medium block">{item.label}</span>
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}

          <div className="divider-dark my-3 mx-2" />

          <p className="px-3 pt-1 pb-2 text-2xs font-semibold text-gray-500 uppercase tracking-wider">
            {sidebarCollapsed ? '•••' : 'AI Assistant'}
          </p>

          {/* AI Chat Toggle */}
          <button
            onClick={toggleChat}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
              showChat
                ? 'bg-gradient-to-r from-baikal-500/20 to-accent-purple/10 text-baikal-300 shadow-inner-light'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              showChat ? 'bg-baikal-500/20' : 'group-hover:bg-white/[0.04]'
            }`}>
              <Sparkles className="w-[18px] h-[18px]" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-sm font-medium animate-fade-in flex-1 text-left">AI Chat</span>
            )}
            {!sidebarCollapsed && showChat && (
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-slow ring-4 ring-emerald-400/20" />
            )}
          </button>
        </nav>

        {/* Collapse toggler (desktop only) */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex items-center justify-center px-4 py-3 text-gray-500 hover:text-white transition-colors border-t border-white/[0.06]"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* User Profile */}
        <div className="px-3 py-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-baikal-600 to-baikal-800 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ring-white/10">
              <span className="text-sm font-bold text-baikal-200">{user?.name?.[0]}</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 animate-fade-in">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-2xs text-gray-500 truncate">{user?.department} · {user?.position}</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button onClick={handleLogout}
                className="btn-icon !w-8 !h-8 text-gray-500 hover:!text-red-400 hover:!bg-red-500/10"
                title="로그아웃">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ─── Main Content Area ──────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="lg:hidden h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0 shadow-sm">
          <button onClick={() => setMobileMenuOpen(true)} className="btn-icon">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-baikal-400 to-baikal-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">BAIKAL</span>
          </div>
          <button onClick={toggleChat} className={`btn-icon ${showChat ? 'text-baikal-600 bg-baikal-50' : ''}`}>
            <MessageSquare className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 flex min-h-0">
          {/* Center - Page Content */}
          <main className="flex-1 min-w-0 overflow-auto">
            <Outlet />
          </main>

          {/* ─── AI Chat Panel (Desktop: sidebar, Mobile: sheet) ───── */}
          {showChat && (
            <>
              {/* Mobile chat overlay */}
              <div className="xl:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 animate-fade-in"
                   onClick={() => setShowChat(false)} />
              <div className={`
                fixed xl:relative inset-y-0 right-0 z-30
                w-[min(420px,100vw)] xl:w-[400px] 2xl:w-[420px]
                flex-shrink-0 border-l border-gray-100 flex flex-col bg-white
                shadow-premium-lg xl:shadow-none
                animate-slide-in xl:animate-none
              `}>
                {/* Chat Header */}
                <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 flex-shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-baikal-500 to-accent-purple rounded-xl flex items-center justify-center shadow-glow-blue">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900">BAIKAL AI</span>
                      <span className="ml-2 text-2xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-inset ring-emerald-600/10">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button onClick={() => setShowResult(!showResult)}
                      className="btn-icon !w-8 !h-8" title="결과 패널">
                      {showResult ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setShowChat(false)}
                      className="xl:hidden btn-icon !w-8 !h-8">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <ChatPanel />
              </div>
            </>
          )}

          {/* ─── Result Panel ──────────────────── */}
          {showResult && resultPanel && (
            <>
              <div className="2xl:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-20 animate-fade-in"
                   onClick={() => setShowResult(false)} />
              <div className={`
                fixed 2xl:relative inset-y-0 right-0 z-20
                w-[min(380px,100vw)] 2xl:w-[380px]
                flex-shrink-0 border-l border-gray-100 bg-surface-secondary overflow-auto
                shadow-premium-lg 2xl:shadow-none
                animate-slide-in 2xl:animate-none
              `}>
                <ResultPanel data={resultPanel} onClose={() => setShowResult(false)} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Mobile FAB for AI Chat ───────────── */}
      {!showChat && (
        <button onClick={() => setShowChat(true)}
          className="xl:hidden fixed bottom-6 right-6 z-20
            w-14 h-14 bg-gradient-to-br from-baikal-500 to-accent-purple rounded-2xl
            flex items-center justify-center text-white
            shadow-glow-blue hover:shadow-glow-purple
            active:scale-95 transition-all duration-200
            animate-scale-in">
          <Sparkles className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}
