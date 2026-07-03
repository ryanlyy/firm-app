import { Bell, Search, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

interface HeaderProps {
  title: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { currentUser, logout } = useAuthStore()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索案件、客户..."
            className="pl-9 pr-4 py-2 w-64 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
          />
        </div>
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
              {currentUser.name[0]}
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-800">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.title}{currentUser.role === 'admin' ? ' · 管理员' : ''}</p>
            </div>
            <button onClick={logout} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors ml-1" title="退出登录">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
