import { useState } from 'react'
import Header from '../components/Header'
import Modal from '../components/Modal'
import { useStore } from '../store/useStore'
import { Plus, Search, Eye, Edit2, Trash2, Briefcase, Mail, Phone } from 'lucide-react'
import type { Lawyer } from '../types'

const titleColors: Record<string, string> = {
  '高级合伙人': 'bg-amber-50 text-amber-700 border-amber-200',
  '合伙人': 'bg-blue-50 text-blue-700 border-blue-200',
  '执业律师': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '实习律师': 'bg-gray-100 text-gray-600 border-gray-200',
}

const avatarColors = ['bg-primary-600', 'bg-emerald-600', 'bg-amber-600', 'bg-purple-600', 'bg-rose-600']

const defaultLawyer: Omit<Lawyer, 'id'> = {
  name: '', title: '执业律师', role: 'lawyer', phone: '', email: '', barNumber: '', specialization: [], joinDate: new Date().toISOString().slice(0, 10), avatar: '', activeCases: 0, password: '123456', mustChangePassword: true, lastPasswordChange: null,
}

export default function Lawyers() {
  const { lawyers, cases, addLawyer, updateLawyer, deleteLawyer } = useStore()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editing, setEditing] = useState<Lawyer | null>(null)
  const [viewing, setViewing] = useState<Lawyer | null>(null)
  const [form, setForm] = useState(defaultLawyer)
  const [specInput, setSpecInput] = useState('')

  const filtered = lawyers.filter((l) => l.name.includes(search) || l.title.includes(search) || l.specialization.some((s) => s.includes(search)))

  const openCreate = () => { setEditing(null); setForm(defaultLawyer); setSpecInput(''); setModalOpen(true) }
  const openEdit = (l: Lawyer) => { setEditing(l); setForm(l); setSpecInput(l.specialization.join('、')); setModalOpen(true) }

  const handleSave = () => {
    const data = { ...form, specialization: specInput.split(/[、,，]/).map((s) => s.trim()).filter(Boolean) }
    if (editing) updateLawyer(editing.id, data)
    else addLawyer({ ...data, id: `L${Date.now()}` } as Lawyer)
    setModalOpen(false)
  }

  const handleDelete = (id: string) => { if (confirm('确定要删除此律师信息吗？')) deleteLawyer(id) }
  const setField = (key: string, value: string | number) => setForm((p) => ({ ...p, [key]: value }))
  const getLawyerCases = (lawyerId: string) => cases.filter((c) => c.lawyerId === lawyerId)

  return (
    <>
      <Header title="律师团队" subtitle={`共 ${lawyers.length} 位律师`} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索姓名、职级、专长..." className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <button onClick={openCreate} className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
            <Plus size={16} /> 添加律师
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((l, i) => {
            const lawyerCases = getLawyerCases(l.id)
            return (
              <div key={l.id} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${avatarColors[i % avatarColors.length]} text-white flex items-center justify-center text-xl font-bold`}>
                      {l.name[0]}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{l.name}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${titleColors[l.title] || 'bg-gray-100 text-gray-600'}`}>{l.title}</span>
                        {l.role === 'admin' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">管理员</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setViewing(l); setDetailOpen(true) }} className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600"><Eye size={15} /></button>
                    <button onClick={() => openEdit(l)} className="p-1.5 rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(l.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /> {l.phone}</p>
                  <p className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /> {l.email}</p>
                  <p className="flex items-center gap-2"><Briefcase size={14} className="text-gray-400" /> 执业证号 {l.barNumber.slice(-6)}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {l.specialization.map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-md bg-primary-50 text-primary-700">{s}</span>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">入职时间 {l.joinDate}</span>
                  <span className="text-sm font-semibold text-primary-700">{lawyerCases.length} 件在办</span>
                </div>
              </div>
            )
          })}
        </div>
        {filtered.length === 0 && <div className="py-16 text-center text-gray-400 text-sm">暂无符合条件的律师</div>}
      </div>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="律师详情">
        {viewing && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-2xl font-bold">{viewing.name[0]}</div>
              <div>
                <h4 className="text-xl font-bold text-gray-800">{viewing.name}</h4>
                <p className="text-gray-500">{viewing.title}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-gray-500">电话：</span><span>{viewing.phone}</span></div>
              <div><span className="text-gray-500">邮箱：</span><span>{viewing.email}</span></div>
              <div><span className="text-gray-500">执业证号：</span><span className="font-mono text-xs">{viewing.barNumber}</span></div>
              <div><span className="text-gray-500">入职日期：</span><span>{viewing.joinDate}</span></div>
              <div><span className="text-gray-500">系统角色：</span><span>{viewing.role === 'admin' ? '管理员' : '普通律师'}</span></div>
            </div>
            <div>
              <span className="text-gray-500">专业领域：</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {viewing.specialization.map((s) => <span key={s} className="px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 text-xs">{s}</span>)}
              </div>
            </div>
            <div>
              <span className="text-gray-500">负责案件 ({getLawyerCases(viewing.id).length})：</span>
              <div className="mt-2 space-y-2">
                {getLawyerCases(viewing.id).map((c) => (
                  <div key={c.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{c.title}</p>
                      <p className="text-xs text-gray-500">{c.clientName}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === '进行中' ? 'bg-blue-50 text-blue-600' : c.status === '已结案' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '编辑律师' : '添加律师'}>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">姓名</label>
              <input value={form.name} onChange={(e) => setField('name', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">职级</label>
              <select value={form.title} onChange={(e) => setField('title', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                <option value="实习律师">实习律师</option>
                <option value="执业律师">执业律师</option>
                <option value="合伙人">合伙人</option>
                <option value="高级合伙人">高级合伙人</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">电话</label>
              <input value={form.phone} onChange={(e) => setField('phone', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">邮箱</label>
              <input value={form.email} onChange={(e) => setField('email', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">执业证号</label>
              <input value={form.barNumber} onChange={(e) => setField('barNumber', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">入职日期</label>
              <input type="date" value={form.joinDate} onChange={(e) => setField('joinDate', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">专业领域（用顿号分隔）</label>
            <input value={specInput} onChange={(e) => setSpecInput(e.target.value)} placeholder="例：知识产权、合同纠纷" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">系统角色</label>
              <select value={form.role} onChange={(e) => setField('role', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                <option value="lawyer">普通律师（仅查看自己案件）</option>
                <option value="admin">管理员（查看全部数据）</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">登录密码</label>
              <input value={form.password} onChange={(e) => setField('password', e.target.value)} placeholder="默认 123456" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">取消</button>
            <button onClick={handleSave} className="px-5 py-2 text-sm text-white bg-primary-800 rounded-lg hover:bg-primary-700">保存</button>
          </div>
        </div>
      </Modal>
    </>
  )
}
