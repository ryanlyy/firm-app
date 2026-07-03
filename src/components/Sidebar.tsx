import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Scale,
  DollarSign,
  CalendarDays,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  KeyRound,
  Settings,
  Database,
  BookOpen,
  Building2,
  ShieldAlert,
  Stamp,
  ClipboardList,
  FolderOpen,
  DoorOpen,
  Receipt,
  CheckSquare,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import Modal from './Modal'

const allNavItems = [
  { to: '/', icon: LayoutDashboard, label: '工作台', adminOnly: false },
  { to: '/cases', icon: Briefcase, label: '案件管理', adminOnly: false },
  { to: '/clients', icon: Users, label: '客户管理', adminOnly: false },
  { to: '/conflict-check', icon: ShieldAlert, label: '利冲查询', adminOnly: false },
  { to: '/work-logs', icon: ClipboardList, label: '工作日志', adminOnly: false },
  { to: '/calendar', icon: CalendarDays, label: '日程安排', adminOnly: false },
  { to: '/documents', icon: FileText, label: '文档管理', adminOnly: false },
  { to: '/doc-templates', icon: FolderOpen, label: '知识文库', adminOnly: false },
  { to: '/seal-approval', icon: Stamp, label: '用印管理', adminOnly: false },
  { to: '/approvals', icon: CheckSquare, label: '审批中心', adminOnly: false },
  { to: '/invoice-mgmt', icon: Receipt, label: '发票管理', adminOnly: false },
  { to: '/finance', icon: DollarSign, label: '财务统计', adminOnly: true },
  { to: '/meeting-rooms', icon: DoorOpen, label: '会议管理', adminOnly: false },
  { to: '/lawyers', icon: Scale, label: '律师团队', adminOnly: true },
  { to: '/firm', icon: Building2, label: '律所简介', adminOnly: false },
  { to: '/backup', icon: Database, label: '数据备份', adminOnly: true },
  { to: '/manual', icon: BookOpen, label: '使用手册', adminOnly: false },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { currentUser, logout, passwordExpiryDays, setPasswordExpiryDays } = useAuthStore()
  const isAdmin = currentUser?.role === 'admin'
  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin)
  const [expiryInput, setExpiryInput] = useState(String(passwordExpiryDays))

  return (
    <aside
      className={`${
        collapsed ? 'w-[72px]' : 'w-60'
      } bg-primary-900 text-white flex flex-col transition-all duration-300 ease-in-out shrink-0`}
    >
      <div className="h-16 flex items-center px-4 border-b border-primary-800">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-accent-500 flex items-center justify-center font-bold text-primary-900 text-lg">
              云
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide">山东云根律师事务所</h1>
              <p className="text-[10px] text-primary-400 tracking-widest">YUNGEN LAW FIRM</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-lg bg-accent-500 flex items-center justify-center font-bold text-primary-900 text-lg mx-auto">
            云
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent-500/20 text-accent-400'
                  : 'text-primary-300 hover:bg-primary-800 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <item.icon size={20} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {currentUser && !collapsed && (
        <div className="px-2 pb-1 space-y-0.5">
          <NavLink
            to="/settings/password"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-accent-500/20 text-accent-400' : 'text-primary-300 hover:bg-primary-800 hover:text-white'
              }`
            }
          >
            <KeyRound size={18} className="shrink-0" />
            <span>修改密码</span>
          </NavLink>
          {isAdmin && (
            <button
              onClick={() => { setExpiryInput(String(passwordExpiryDays)); setSettingsOpen(true) }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-primary-300 hover:bg-primary-800 hover:text-white transition-colors w-full text-left"
            >
              <Settings size={18} className="shrink-0" />
              <span>密码策略</span>
            </button>
          )}
        </div>
      )}
      {currentUser && collapsed && (
        <div className="flex flex-col items-center gap-1 px-2 pb-1">
          <NavLink
            to="/settings/password"
            className={({ isActive }) =>
              `p-2 rounded-lg transition-colors ${isActive ? 'bg-accent-500/20 text-accent-400' : 'text-primary-300 hover:bg-primary-800 hover:text-white'}`
            }
            title="修改密码"
          >
            <KeyRound size={18} />
          </NavLink>
          {isAdmin && (
            <button
              onClick={() => { setExpiryInput(String(passwordExpiryDays)); setSettingsOpen(true) }}
              className="p-2 rounded-lg text-primary-300 hover:bg-primary-800 hover:text-white transition-colors"
              title="密码策略"
            >
              <Settings size={18} />
            </button>
          )}
        </div>
      )}

      {currentUser && !collapsed && (
        <div className="px-3 py-3 border-t border-primary-800">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
              {currentUser.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-primary-400">{currentUser.title}{isAdmin ? ' · 管理员' : ''}</p>
            </div>
            <button onClick={logout} className="p-1.5 rounded-lg text-primary-400 hover:bg-primary-800 hover:text-white transition-colors" title="退出登录">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
      {currentUser && collapsed && (
        <div className="py-3 border-t border-primary-800 flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
            {currentUser.name[0]}
          </div>
          <button onClick={logout} className="p-1.5 rounded-lg text-primary-400 hover:bg-primary-800 hover:text-white transition-colors" title="退出登录">
            <LogOut size={16} />
          </button>
        </div>
      )}

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="h-12 flex items-center justify-center border-t border-primary-800 text-primary-400 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="密码策略设置" width="max-w-sm">
        <div className="space-y-4 text-sm">
          <p className="text-gray-500">设置密码有效期天数，超过该天数后用户需重新修改密码。</p>
          <div>
            <label className="block text-gray-600 mb-1">密码有效期（天）</label>
            <input
              type="number"
              min={1}
              max={365}
              value={expiryInput}
              onChange={(e) => setExpiryInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <p className="text-xs text-gray-400">当前设置：每 <span className="font-semibold text-gray-600">{passwordExpiryDays}</span> 天要求修改一次密码</p>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setSettingsOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">取消</button>
            <button
              onClick={() => {
                const days = Math.max(1, Math.min(365, Number(expiryInput) || 45))
                setPasswordExpiryDays(days)
                setSettingsOpen(false)
              }}
              className="px-5 py-2 text-sm text-white bg-primary-800 rounded-lg hover:bg-primary-700"
            >
              保存
            </button>
          </div>
        </div>
      </Modal>
    </aside>
  )
}
