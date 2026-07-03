import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { lawyers } from '../data/mockData'
import { Scale, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login, loginError, mustChangePassword } = useAuthStore()
  const [selectedId, setSelectedId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (login(selectedId, password)) {
      const { mustChangePassword: needsChange } = useAuthStore.getState()
      navigate(needsChange ? '/change-password' : '/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Scale size={32} className="text-primary-900" />
          </div>
          <h1 className="text-2xl font-bold text-white">山东云根律师事务所</h1>
          <p className="text-primary-300 text-sm mt-1 tracking-widest">SHANDONG YUNGEN LAW FIRM</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-2xl p-8 space-y-5">
          <div className="text-center pb-2">
            <h2 className="text-lg font-semibold text-gray-800">系统登录</h2>
            <p className="text-xs text-gray-500 mt-1">请选择您的账号并输入密码</p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">选择用户</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
            >
              <option value="">请选择登录账号</option>
              {lawyers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} - {l.title}{l.role === 'admin' ? '（管理员）' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1.5">登录密码</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="请输入密码"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {loginError && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-primary-800 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
          >
            登 录
          </button>

          <div className="text-center text-xs text-gray-400 pt-2">
            <p>默认密码：123456</p>
            <p className="mt-1">管理员可查看所有数据 · 普通律师仅可查看自己的案件</p>
          </div>
        </form>
      </div>
    </div>
  )
}
