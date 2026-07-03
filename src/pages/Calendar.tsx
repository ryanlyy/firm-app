import { useState, useMemo } from 'react'
import Header from '../components/Header'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { useStore } from '../store/useStore'
import { usePermissions } from '../hooks/usePermissions'
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin } from 'lucide-react'
import type { CalendarEvent } from '../types'

const eventTypeColors: Record<string, string> = {
  '开庭': 'bg-red-500',
  '会议': 'bg-blue-500',
  '截止日期': 'bg-amber-500',
  '咨询': 'bg-purple-500',
  '调解': 'bg-emerald-500',
}

const defaultEvent: Omit<CalendarEvent, 'id'> = {
  title: '', date: '', time: '', type: '会议', location: '', notes: '', caseId: '', caseTitle: '',
}

export default function Calendar() {
  const { addEvent, deleteEvent } = useStore()
  const { events, cases } = usePermissions()
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1))
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [viewing, setViewing] = useState<CalendarEvent | null>(null)
  const [form, setForm] = useState(defaultEvent)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const prevDays = new Date(year, month, 0).getDate()
    const days: { day: number; currentMonth: boolean; dateStr: string }[] = []

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevDays - i
      days.push({ day: d, currentMonth: false, dateStr: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}` })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, currentMonth: true, dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` })
    }
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, currentMonth: false, dateStr: `${year}-${String(month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}` })
    }
    return days
  }, [year, month])

  const getEventsForDate = (dateStr: string) => events.filter((e) => e.date === dateStr)
  const today = new Date().toISOString().slice(0, 10)

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const upcomingEvents = [...events]
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 8)

  const handleCreate = () => {
    addEvent({ ...form, id: `E${Date.now()}` } as CalendarEvent)
    setModalOpen(false)
    setForm(defaultEvent)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此日程吗？')) {
      deleteEvent(id)
      setDetailOpen(false)
    }
  }

  const setField = (key: string, value: string) => {
    setForm((p) => {
      const updated = { ...p, [key]: value }
      if (key === 'caseId') {
        const found = cases.find((c) => c.id === value)
        if (found) updated.caseTitle = found.title
      }
      return updated
    })
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <>
      <Header title="日程安排" subtitle="管理开庭、会议和重要截止日期" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex gap-6">
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {year}年{month + 1}月
                </h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentDate(new Date(2026, 3, 1))} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">今天</button>
                  <button onClick={prevMonth} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"><ChevronLeft size={18} /></button>
                  <button onClick={nextMonth} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"><ChevronRight size={18} /></button>
                  <button onClick={() => { setForm(defaultEvent); setModalOpen(true) }} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors ml-2">
                    <Plus size={14} /> 新建日程
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden">
                {weekDays.map((d) => (
                  <div key={d} className="bg-gray-50 px-2 py-2 text-center text-xs font-medium text-gray-500">{d}</div>
                ))}
                {calendarDays.map((day, i) => {
                  const dayEvents = getEventsForDate(day.dateStr)
                  const isToday = day.dateStr === today
                  return (
                    <div
                      key={i}
                      className={`bg-white min-h-[90px] p-1.5 ${!day.currentMonth ? 'opacity-40' : ''} ${isToday ? 'ring-2 ring-primary-500 ring-inset' : ''}`}
                    >
                      <span className={`text-xs font-medium ${isToday ? 'bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-600'}`}>
                        {day.day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <button
                            key={ev.id}
                            onClick={() => { setViewing(ev); setDetailOpen(true) }}
                            className={`w-full text-left text-[10px] px-1.5 py-0.5 rounded text-white truncate ${eventTypeColors[ev.type] || 'bg-gray-500'}`}
                          >
                            {ev.time.slice(0, 5)} {ev.title.slice(0, 8)}
                          </button>
                        ))}
                        {dayEvents.length > 3 && <p className="text-[10px] text-gray-400 pl-1">+{dayEvents.length - 3} 更多</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="w-80 shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">即将到来</h3>
              <div className="space-y-3">
                {upcomingEvents.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => { setViewing(e); setDetailOpen(true) }}
                    className="w-full text-left p-3 rounded-lg bg-gray-50/80 hover:bg-gray-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${eventTypeColors[e.type] || 'bg-gray-500'}`} />
                      <span className="text-sm font-medium text-gray-800 truncate">{e.title}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
                      <span>{e.date}</span>
                      <span className="flex items-center gap-0.5"><Clock size={11} /> {e.time}</span>
                    </div>
                    <div className="mt-1">
                      <StatusBadge status={e.type} />
                    </div>
                  </button>
                ))}
                {upcomingEvents.length === 0 && <p className="text-sm text-gray-400 text-center py-4">暂无近期日程</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="日程详情">
        {viewing && (
          <div className="space-y-4 text-sm">
            <h4 className="text-lg font-semibold text-gray-800">{viewing.title}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-gray-500">日期：</span><span>{viewing.date}</span></div>
              <div><span className="text-gray-500">时间：</span><span>{viewing.time}</span></div>
              <div><span className="text-gray-500">类型：</span><StatusBadge status={viewing.type} /></div>
              <div className="flex items-start gap-1"><span className="text-gray-500 shrink-0">地点：</span><span className="flex items-center gap-1"><MapPin size={14} className="text-gray-400 shrink-0" />{viewing.location}</span></div>
            </div>
            {viewing.caseTitle && <div><span className="text-gray-500">关联案件：</span><span>{viewing.caseTitle}</span></div>}
            {viewing.notes && <div><span className="text-gray-500">备注：</span><p className="mt-1 text-gray-700">{viewing.notes}</p></div>}
            <div className="flex justify-end pt-2">
              <button onClick={() => handleDelete(viewing.id)} className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">删除日程</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="新建日程">
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-gray-600 mb-1">标题</label>
            <input value={form.title} onChange={(e) => setField('title', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">日期</label>
              <input type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">时间</label>
              <input type="time" value={form.time} onChange={(e) => setField('time', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">类型</label>
              <select value={form.type} onChange={(e) => setField('type', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                <option value="开庭">开庭</option>
                <option value="会议">会议</option>
                <option value="截止日期">截止日期</option>
                <option value="咨询">咨询</option>
                <option value="调解">调解</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">关联案件</label>
              <select value={form.caseId} onChange={(e) => setField('caseId', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                <option value="">无</option>
                {cases.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">地点</label>
            <input value={form.location} onChange={(e) => setField('location', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">备注</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setField('notes', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">取消</button>
            <button onClick={handleCreate} className="px-5 py-2 text-sm text-white bg-primary-800 rounded-lg hover:bg-primary-700">保存</button>
          </div>
        </div>
      </Modal>
    </>
  )
}
