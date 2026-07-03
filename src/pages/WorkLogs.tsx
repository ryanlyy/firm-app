import { useState, useMemo } from 'react'
import Header from '../components/Header'
import Modal from '../components/Modal'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/useAuthStore'
import { Clock, Plus, FileDown, Search, Filter, Calendar } from 'lucide-react'
import type { WorkLog } from '../types'

const workLogTypes: WorkLog['type'][] = [
  '案件工作', '法律咨询', '文书起草', '会议', '调查取证', '法律研究', '行政事务', '其他',
]

const defaultForm: Omit<WorkLog, 'id' | 'lawyerId' | 'lawyerName'> = {
  date: new Date().toISOString().slice(0, 10),
  hours: 1,
  content: '',
  type: '案件工作',
  caseId: '',
  caseTitle: '',
  clientId: '',
  clientName: '',
}

function toToday() {
  return new Date().toISOString().slice(0, 10)
}

function toMonthStart() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export default function WorkLogs() {
  const { workLogs, cases, clients, addWorkLog, lawyers } = useStore()
  const currentUser = useAuthStore((s) => s.currentUser)
  const isAdmin = currentUser?.role === 'admin'

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<WorkLog['type'] | ''>('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(defaultForm)

  const visibleLogs = useMemo(() => {
    let logs = isAdmin ? workLogs : workLogs.filter((l) => l.lawyerId === currentUser?.id)

    if (search) {
      const q = search.toLowerCase()
      logs = logs.filter(
        (l) =>
          l.content.toLowerCase().includes(q) ||
          l.lawyerName.toLowerCase().includes(q) ||
          (l.caseTitle && l.caseTitle.toLowerCase().includes(q)) ||
          (l.clientName && l.clientName.toLowerCase().includes(q)),
      )
    }

    if (typeFilter) {
      logs = logs.filter((l) => l.type === typeFilter)
    }

    if (dateStart) {
      logs = logs.filter((l) => l.date >= dateStart)
    }
    if (dateEnd) {
      logs = logs.filter((l) => l.date <= dateEnd)
    }

    return [...logs].sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0))
  }, [workLogs, isAdmin, currentUser, search, typeFilter, dateStart, dateEnd])

  const totalLogs = visibleLogs.length
  const today = toToday()
  const monthStart = toMonthStart()
  const monthHours = visibleLogs
    .filter((l) => l.date >= monthStart && l.date <= today)
    .reduce((s, l) => s + l.hours, 0)
  const todayHours = visibleLogs
    .filter((l) => l.date === today)
    .reduce((s, l) => s + l.hours, 0)

  const setField = (key: string, value: string | number) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value }
      if (key === 'caseId') {
        const c = cases.find((x) => x.id === value)
        if (c) {
          updated.caseTitle = c.title
          updated.clientId = c.clientId
          updated.clientName = c.clientName
        } else {
          updated.caseTitle = ''
        }
      }
      if (key === 'clientId') {
        const cl = clients.find((x) => x.id === value)
        if (cl) updated.clientName = cl.name
        else updated.clientName = ''
      }
      return updated
    })
  }

  const openCreate = () => {
    setForm({ ...defaultForm, date: toToday() })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!currentUser) return
    const log: WorkLog = {
      ...form,
      id: `WL${Date.now()}`,
      lawyerId: currentUser.id,
      lawyerName: currentUser.name,
      hours: Number(form.hours) || 0,
    }
    addWorkLog(log)
    setModalOpen(false)
  }

  const exportCSV = () => {
    const header = ['日期', '律师', '类型', '工时(小时)', '案件', '客户', '工作内容']
    const rows = visibleLogs.map((l) => [
      l.date,
      l.lawyerName,
      l.type,
      String(l.hours),
      l.caseTitle || '',
      l.clientName || '',
      `"${l.content.replace(/"/g, '""')}"`,
    ])
    const bom = '\uFEFF'
    const csv = bom + [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `工作日志_${toToday()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const typeColorMap: Record<WorkLog['type'], string> = {
    '案件工作': 'bg-blue-50 text-blue-700',
    '法律咨询': 'bg-emerald-50 text-emerald-700',
    '文书起草': 'bg-violet-50 text-violet-700',
    '会议': 'bg-amber-50 text-amber-700',
    '调查取证': 'bg-rose-50 text-rose-700',
    '法律研究': 'bg-cyan-50 text-cyan-700',
    '行政事务': 'bg-gray-100 text-gray-600',
    '其他': 'bg-gray-50 text-gray-500',
  }

  return (
    <>
      <Header title="工作日志" subtitle="记录工作内容，导出顾问单位工作报告" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">日志总数</p>
              <p className="text-xl font-semibold text-gray-900">{totalLogs}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">本月工时</p>
              <p className="text-xl font-semibold text-gray-900">{monthHours.toFixed(1)} <span className="text-sm font-normal text-gray-400">小时</span></p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">今日工时</p>
              <p className="text-xl font-semibold text-gray-900">{todayHours.toFixed(1)} <span className="text-sm font-normal text-gray-400">小时</span></p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索内容、律师、案件、客户..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Filter size={14} />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as WorkLog['type'] | '')}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              <option value="">全部类型</option>
              {workLogTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Calendar size={14} />
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              title="开始日期"
            />
            <span className="text-gray-400">~</span>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              title="结束日期"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileDown size={16} /> 导出CSV
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus size={16} /> 新增日志
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">日期</th>
                  {isAdmin && <th className="px-4 py-3 font-medium">律师</th>}
                  <th className="px-4 py-3 font-medium">类型</th>
                  <th className="px-4 py-3 font-medium text-right">工时</th>
                  <th className="px-4 py-3 font-medium">关联案件</th>
                  <th className="px-4 py-3 font-medium">客户</th>
                  <th className="px-4 py-3 font-medium">工作内容</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visibleLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{log.date}</td>
                    {isAdmin && <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{log.lawyerName}</td>}
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${typeColorMap[log.type]}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">{log.hours}h</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{log.caseTitle || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{log.clientName || '-'}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[320px] truncate">{log.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visibleLogs.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">暂无符合条件的工作日志</div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="新增工作日志">
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">日期</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setField('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">工作类型</label>
              <select
                value={form.type}
                onChange={(e) => setField('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                {workLogTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">关联案件（可选）</label>
              <select
                value={form.caseId}
                onChange={(e) => setField('caseId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                <option value="">无</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">客户（可选）</label>
              <select
                value={form.clientId}
                onChange={(e) => setField('clientId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                <option value="">无</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">工时（小时）</label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={form.hours}
              onChange={(e) => setField('hours', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">工作内容</label>
            <textarea
              rows={4}
              value={form.content}
              onChange={(e) => setField('content', e.target.value)}
              placeholder="请描述今日工作内容..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm text-white bg-primary-800 rounded-lg hover:bg-primary-700 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
