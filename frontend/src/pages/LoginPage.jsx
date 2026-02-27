import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/store'
import { Zap, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
      toast.success('로그인 성공!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || '로그인에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const quickLogin = async (email, password) => {
    setIsLoading(true)
    try {
      await login(email, password)
      toast.success('로그인 성공!')
      navigate('/')
    } catch (err) {
      toast.error('로그인에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Sophisticated gradient background */}
      <div className="absolute inset-0 bg-dark" />
      <div className="absolute inset-0 bg-gradient-to-br from-baikal-950/90 via-dark to-dark-secondary" />
      
      {/* Animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-baikal-500/8 rounded-full blur-[120px] animate-float" />
        <div className="absolute top-1/2 -left-48 w-[400px] h-[400px] bg-accent-purple/6 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute -bottom-32 right-1/4 w-[350px] h-[350px] bg-baikal-400/5 rounded-full blur-[80px] animate-float" style={{ animationDelay: '-1.5s' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]" 
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-8 sm:mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-3 sm:gap-4 mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-baikal-400 via-baikal-500 to-accent-purple rounded-2xl flex items-center justify-center shadow-glow-blue">
              <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">BAIKAL</h1>
              <p className="text-baikal-300 text-xs sm:text-sm font-semibold tracking-[0.2em]">GROUPWARE AI</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-baikal-400" />
            AI Agent 중심 차세대 그룹웨어
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl animate-slide-up ring-1 ring-inset ring-white/[0.05]">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-1">로그인</h2>
          <p className="text-sm text-gray-500 mb-6">계정 정보를 입력하세요</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@baikal.ai"
                className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 
                  focus:outline-none focus:ring-2 focus:ring-baikal-500/50 focus:border-baikal-500/30 focus:bg-white/[0.07]
                  hover:border-white/[0.15] transition-all duration-200 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">비밀번호</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white placeholder-gray-600 
                    focus:outline-none focus:ring-2 focus:ring-baikal-500/50 focus:border-baikal-500/30 focus:bg-white/[0.07]
                    hover:border-white/[0.15] transition-all duration-200 pr-12 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-baikal-500 to-baikal-600 text-white font-semibold rounded-xl 
                hover:from-baikal-400 hover:to-baikal-500
                active:scale-[0.98] transition-all duration-200 
                disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                shadow-lg shadow-baikal-500/20 hover:shadow-baikal-500/30
                flex items-center justify-center gap-2 text-sm mt-6"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  로그인 중...
                </>
              ) : (
                <>로그인 <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Quick login */}
          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <p className="text-2xs font-medium text-gray-500 uppercase tracking-wider mb-3">Quick Access</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => quickLogin('admin@baikal.ai', 'admin1234')}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl
                  text-left hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200 group
                  disabled:opacity-50"
              >
                <div className="w-7 h-7 bg-baikal-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-baikal-400">A</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">관리자</p>
                  <p className="text-2xs text-gray-600 truncate">admin@baikal.ai</p>
                </div>
              </button>
              <button
                onClick={() => quickLogin('kim@baikal.ai', 'user1234')}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl
                  text-left hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200 group
                  disabled:opacity-50"
              >
                <div className="w-7 h-7 bg-accent-purple/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-purple-400">K</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">김철수</p>
                  <p className="text-2xs text-gray-600 truncate">kim@baikal.ai</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6 sm:mt-8">
          © 2026 BAIKAL AI. All rights reserved.
        </p>
      </div>
    </div>
  )
}
