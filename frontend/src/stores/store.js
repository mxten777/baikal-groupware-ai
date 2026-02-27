import { create } from 'zustand'
import api from '../lib/api'

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('baikal_user') || 'null'),
  token: localStorage.getItem('baikal_token') || null,
  isAuthenticated: !!localStorage.getItem('baikal_token'),

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { access_token, user } = res.data
    localStorage.setItem('baikal_token', access_token)
    localStorage.setItem('baikal_user', JSON.stringify(user))
    set({ user, token: access_token, isAuthenticated: true })
    return user
  },

  logout: () => {
    localStorage.removeItem('baikal_token')
    localStorage.removeItem('baikal_user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  fetchMe: async () => {
    try {
      const res = await api.get('/auth/me')
      const user = res.data
      localStorage.setItem('baikal_user', JSON.stringify(user))
      set({ user })
    } catch {
      get().logout()
    }
  },
}))

export const useChatStore = create((set, get) => ({
  messages: [],
  isLoading: false,
  resultPanel: null,  // { type, data }

  addMessage: (role, content, toolResults = null) => {
    set((state) => ({
      messages: [...state.messages, { role, content, toolResults, timestamp: new Date() }],
    }))
  },

  setResultPanel: (panel) => set({ resultPanel: panel }),

  sendMessage: async (message) => {
    set({ isLoading: true })
    get().addMessage('user', message)

    try {
      const res = await api.post('/chat', { message })
      const { reply, tool_results } = res.data
      get().addMessage('assistant', reply, tool_results)
      
      // Set result panel if tool was called
      if (tool_results && tool_results.length > 0) {
        const result = tool_results[0]
        if (result.success) {
          set({ resultPanel: { type: result.type, data: result.data } })
        }
      }
    } catch (error) {
      const errMsg = error.response?.data?.detail || '오류가 발생했습니다. 다시 시도해주세요.'
      get().addMessage('assistant', `❌ ${errMsg}`)
    } finally {
      set({ isLoading: false })
    }
  },

  clearMessages: () => set({ messages: [], resultPanel: null }),
}))
