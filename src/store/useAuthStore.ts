import { create } from 'zustand'
import type { Lawyer } from '../types'
import { lawyers } from '../data/mockData'

interface AuthState {
  currentUser: Lawyer | null
  isAuthenticated: boolean
  mustChangePassword: boolean
  loginError: string
  passwordExpiryDays: number

  login: (lawyerId: string, password: string) => boolean
  logout: () => void
  changePassword: (oldPassword: string, newPassword: string) => string | null
  setPasswordExpiryDays: (days: number) => void
}

function isPasswordExpired(lastChange: string | null, expiryDays: number): boolean {
  if (!lastChange) return true
  const last = new Date(lastChange).getTime()
  const now = Date.now()
  return (now - last) / (1000 * 60 * 60 * 24) >= expiryDays
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  mustChangePassword: false,
  loginError: '',
  passwordExpiryDays: 45,

  login: (lawyerId: string, password: string) => {
    const lawyer = lawyers.find((l) => l.id === lawyerId)
    if (!lawyer) {
      set({ loginError: '用户不存在' })
      return false
    }
    if (lawyer.password !== password) {
      set({ loginError: '密码错误' })
      return false
    }
    const needsChange = lawyer.mustChangePassword || isPasswordExpired(lawyer.lastPasswordChange, get().passwordExpiryDays)
    set({
      currentUser: lawyer,
      isAuthenticated: true,
      mustChangePassword: needsChange,
      loginError: '',
    })
    return true
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false, mustChangePassword: false, loginError: '' })
  },

  changePassword: (oldPassword: string, newPassword: string) => {
    const { currentUser } = get()
    if (!currentUser) return '未登录'
    if (currentUser.password !== oldPassword) return '原密码错误'
    if (newPassword.length < 6) return '新密码不能少于6位'
    if (newPassword === oldPassword) return '新密码不能与原密码相同'

    const now = new Date().toISOString().slice(0, 10)
    const updated: Lawyer = {
      ...currentUser,
      password: newPassword,
      mustChangePassword: false,
      lastPasswordChange: now,
    }
    const idx = lawyers.findIndex((l) => l.id === currentUser.id)
    if (idx !== -1) {
      lawyers[idx] = updated
    }
    set({ currentUser: updated, mustChangePassword: false })
    return null
  },

  setPasswordExpiryDays: (days: number) => {
    set({ passwordExpiryDays: days })
  },
}))
