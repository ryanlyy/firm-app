import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { ShieldCheck, Eye, EyeOff, KeyRound } from 'lucide-react'

export default function ChangePassword() {
  const navigate = useNavigate()
  const { currentUser, mustChangePassword, changePassword, logout } = useAuthStore()
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const isFirstLogin = currentUser?.mustChangePassword && !currentUser?.lastPasswordChange
  const isExpired = mustChangePassword && !isFirstLogin

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPwd !== confirmPwd) {
      setError('两次输入的新密码不一致')
      return
    }

    const result = changePassword(oldPwd, newPwd)
    if (result) {
      setError(result)
      return
    }

    setSuccess(true)
    setTimeout(() => navigate('/'), 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <KeyRound size={32} className="text-primary-900" />
          </div>
          <h1 className="text-2xl font-bold text-white">修改登录密码</h1>
          {isFirstLogin && (
            <p className="text-amber-300 text-sm mt-2">首次登录，请设置新的登录密码</p>
          )}
          {isExpired && (
            <p className="text-amber-300 text-sm mt-2">您的密码已超过有效期，请修改密码后继续使用</p>
          )}
        </div>

        {success ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center space-y-4">
            <ShieldCheck size={48} className="text-emerald-500 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-800">密码修改成功</h3>
            <p className="text-sm text-gray-500">正在跳转到工作台...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 space-y-5">
            <div className="text-center pb-2">
              <p className="text-sm text-gray-600">
                当前用户：<span className="font-semibold text-gray-800">{currentUser?.name}</span>（{currentUser?.title}）
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">原密码</label>
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPwd}
                  onChange={(e) => setOldPwd(e.target.value)}
                  required
                  placeholder="请输入当前密码"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 pr-10"
                />
                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">新密码</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  required
                  minLength={6}
                  placeholder="至少6位，不能与原密码相同"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 pr-10"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">确认新密码</label>
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                required
                placeholder="再次输入新密码"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-primary-800 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
            >
              确认修改
            </button>

            {!mustChangePassword && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                返回
              </button>
            )}

            {mustChangePassword && (
              <button
                type="button"
                onClick={logout}
                className="w-full py-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                退出登录
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
