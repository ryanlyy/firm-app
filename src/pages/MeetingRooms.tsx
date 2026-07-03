import { useState, useMemo } from 'react'
import Header from '../components/Header'
import Modal from '../components/Modal'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/useAuthStore'
import { DoorOpen, Plus, Clock, Users, MapPin, Monitor, Calendar, Trash2 } from 'lucide-react'
import type { MeetingRoom, MeetingBooking } from '../types'

const statusColors: Record<MeetingBooking['status'], string> = {
  '已预约': 'bg-blue-50 text-blue-700 border-blue-200',
  '进行中': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '已结束': 'bg-gray-50 text-gray-500 border-gray-200',
  '已取消': 'bg-red-50 text-red-500 border-red-200',
}

const timeSlots = Array.from({ length: 19 }, (_, i) => {
  const h = Math.floor(i / 2) + 8
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})

export default function MeetingRooms() {
  const { currentUser } = useAuthStore()
  const { meetingRooms, meetingBookings, addMeetingBooking, updateMeetingBooking, lawyers } = useStore()

  const [bookOpen, setBookOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))

  const [form, setForm] = useState({
    roomId: '',
    title: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    attendees: [] as string[],
    notes: '',
  })
  const [formError, setFormError] = useState('')

  const today = new Date().toISOString().slice(0, 10)

  const todayBookings = useMemo(
    () => meetingBookings
      .filter((b) => b.date === today && b.status !== '已取消')
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [meetingBookings, today],
  )

  const filteredBookings = useMemo(
    () => meetingBookings
      .filter((b) => b.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [meetingBookings, selectedDate],
  )

  const upcomingBookings = useMemo(
    () => meetingBookings
      .filter((b) => b.date >= today && b.status !== '已取消')
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)),
    [meetingBookings, today],
  )

  const getRoomBookings = (roomId: string) =>
    todayBookings.filter((b) => b.roomId === roomId)

  const hasConflict = (roomId: string, date: string, startTime: string, endTime: string, excludeId?: string) =>
    meetingBookings.some(
      (b) =>
        b.roomId === roomId &&
        b.date === date &&
        b.status !== '已取消' &&
        b.id !== excludeId &&
        b.startTime < endTime &&
        b.endTime > startTime,
    )

  const openBookModal = () => {
    setForm({ roomId: meetingRooms[0]?.id || '', title: '', date: today, startTime: '09:00', endTime: '10:00', attendees: [], notes: '' })
    setFormError('')
    setBookOpen(true)
  }

  const handleBook = () => {
    if (!currentUser || !form.roomId || !form.title.trim() || !form.date || !form.startTime || !form.endTime) {
      setFormError('请填写必要信息')
      return
    }
    if (form.startTime >= form.endTime) {
      setFormError('结束时间必须晚于开始时间')
      return
    }
    if (hasConflict(form.roomId, form.date, form.startTime, form.endTime)) {
      setFormError('该时段已有预约，请选择其他时间或会议室')
      return
    }

    const room = meetingRooms.find((r) => r.id === form.roomId)
    const booking: MeetingBooking = {
      id: `MB${Date.now()}`,
      roomId: form.roomId,
      roomName: room?.name || '',
      bookerId: currentUser.id,
      bookerName: currentUser.name,
      title: form.title,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      attendees: form.attendees,
      notes: form.notes,
      status: '已预约',
    }
    addMeetingBooking(booking)
    setBookOpen(false)
  }

  const handleCancel = (id: string) => {
    updateMeetingBooking(id, { status: '已取消' })
  }

  const toggleAttendee = (lawyerId: string) => {
    setForm((prev) => ({
      ...prev,
      attendees: prev.attendees.includes(lawyerId)
        ? prev.attendees.filter((a) => a !== lawyerId)
        : [...prev.attendees, lawyerId],
    }))
  }

  return (
    <>
      <Header title="会议管理" subtitle="会议室预约与管理" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Stats & actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm">
            <span className="text-gray-500">会议室总数：<span className="font-semibold text-gray-800">{meetingRooms.length}</span></span>
            <span className="text-blue-600">今日预约：<span className="font-semibold">{todayBookings.length}</span></span>
            <span className="text-emerald-600">即将开始：<span className="font-semibold">{upcomingBookings.length}</span></span>
          </div>
          <button onClick={openBookModal} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary-800 text-white rounded-xl hover:bg-primary-700 transition-colors">
            <Plus size={16} /> 预约会议室
          </button>
        </div>

        {/* Meeting rooms grid */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
            <DoorOpen size={16} className="text-gray-400" /> 会议室一览
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {meetingRooms.map((room) => {
              const roomBookingsToday = getRoomBookings(room.id)
              const isOccupied = roomBookingsToday.some((b) => {
                const now = new Date()
                const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
                return b.startTime <= nowStr && b.endTime > nowStr && b.status !== '已取消'
              })
              return (
                <div key={room.id} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">{room.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isOccupied ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {isOccupied ? '使用中' : '空闲'}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="shrink-0" />
                      <span>容纳 {room.capacity} 人</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="shrink-0" />
                      <span>{room.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Monitor size={13} className="shrink-0" />
                      <span className="truncate">{room.equipment.join('、')}</span>
                    </div>
                  </div>
                  {roomBookingsToday.length > 0 && (
                    <div className="border-t border-gray-50 pt-2 space-y-1">
                      <p className="text-[11px] text-gray-400 font-medium">今日安排</p>
                      {roomBookingsToday.map((b) => (
                        <div key={b.id} className="text-xs flex items-center gap-1 text-gray-600">
                          <Clock size={11} className="shrink-0 text-gray-400" />
                          <span>{b.startTime}-{b.endTime}</span>
                          <span className="truncate text-gray-500">{b.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Today's schedule timeline */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
            <Calendar size={16} className="text-gray-400" /> 今日会议安排
          </h3>
          {todayBookings.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 py-12 text-center text-gray-400 text-sm">今日暂无会议安排</div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
              {todayBookings.map((b) => (
                <div key={b.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="text-sm font-mono text-gray-600 w-28 shrink-0">
                    {b.startTime} - {b.endTime}
                  </div>
                  <div className="w-1 h-8 rounded-full bg-primary-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{b.title}</p>
                    <p className="text-xs text-gray-500">{b.roomName} · {b.bookerName}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${statusColors[b.status]}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking list with date filter */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Clock size={16} className="text-gray-400" /> 预约列表
            </h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">日期</th>
                    <th className="px-4 py-3 font-medium">会议室</th>
                    <th className="px-4 py-3 font-medium">预约人</th>
                    <th className="px-4 py-3 font-medium">会议主题</th>
                    <th className="px-4 py-3 font-medium">时间</th>
                    <th className="px-4 py-3 font-medium">参会人</th>
                    <th className="px-4 py-3 font-medium">状态</th>
                    <th className="px-4 py-3 font-medium text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredBookings.map((b) => {
                    const isOwn = b.bookerId === currentUser?.id
                    const canCancel = isOwn && (b.status === '已预约' || b.status === '进行中')
                    const attendeeNames = b.attendees
                      .map((aid) => lawyers.find((l) => l.id === aid)?.name)
                      .filter(Boolean)
                      .join('、')
                    return (
                      <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{b.date}</td>
                        <td className="px-4 py-3 text-gray-800 font-medium whitespace-nowrap">{b.roomName}</td>
                        <td className="px-4 py-3 text-gray-700">{b.bookerName}</td>
                        <td className="px-4 py-3 text-gray-800 max-w-[200px] truncate">{b.title}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap font-mono text-xs">{b.startTime}-{b.endTime}</td>
                        <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{attendeeNames || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${statusColors[b.status]}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            {canCancel && (
                              <button
                                onClick={() => handleCancel(b.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                title="取消预约"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredBookings.length === 0 && (
              <div className="py-16 text-center text-gray-400 text-sm">该日期暂无预约记录</div>
            )}
          </div>
        </div>
      </div>

      {/* Booking modal */}
      <Modal open={bookOpen} onClose={() => setBookOpen(false)} title="预约会议室" width="max-w-lg">
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-gray-600 mb-1">会议室 <span className="text-red-400">*</span></label>
            <select
              value={form.roomId}
              onChange={(e) => setForm({ ...form, roomId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              {meetingRooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}（{r.capacity}人 · {r.location}）</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">会议主题 <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              placeholder="输入会议主题..."
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">日期 <span className="text-red-400">*</span></label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              min={today}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-600 mb-1">开始时间 <span className="text-red-400">*</span></label>
              <select
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">结束时间 <span className="text-red-400">*</span></label>
              <select
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">参会人员</label>
            <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg max-h-32 overflow-y-auto">
              {lawyers.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => toggleAttendee(l.id)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                    form.attendees.includes(l.id)
                      ? 'bg-primary-800 text-white border-primary-800'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">备注</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
              placeholder="可选，填写会议备注..."
            />
          </div>
          {formError && (
            <div className="p-2.5 bg-red-50 rounded-lg text-xs text-red-600">{formError}</div>
          )}
          {form.roomId && form.date && form.startTime && form.endTime && form.startTime < form.endTime && hasConflict(form.roomId, form.date, form.startTime, form.endTime) && (
            <div className="p-2.5 bg-amber-50 rounded-lg text-xs text-amber-700 border border-amber-200">
              该时段该会议室已有预约，请更换时间或会议室。
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setBookOpen(false)} className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">取消</button>
            <button
              onClick={handleBook}
              disabled={!form.title.trim() || !form.roomId || !form.date}
              className="px-5 py-2 text-white bg-primary-800 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认预约
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
