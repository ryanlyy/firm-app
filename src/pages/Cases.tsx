import { useState } from 'react'
import Header from '../components/Header'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { useStore } from '../store/useStore'
import { usePermissions } from '../hooks/usePermissions'
import { Plus, Search, Eye, Edit2, Trash2, Filter } from 'lucide-react'
import type { Case, CaseStatus, CaseType, CasePriority } from '../types'

const defaultCase: Omit<Case, 'id'> = {
  caseNumber: '', title: '', type: '民事诉讼', status: '待受理', priority: '中',
  clientId: '', clientName: '', lawyerId: '', lawyerName: '',
  courtName: '', filingDate: '', nextHearingDate: '', description: '', fee: 0,
}

export default function Cases() {
  const { clients, lawyers, addCase, updateCase, deleteCase } = useStore()
  const { cases, isAdmin } = usePermissions()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CaseStatus | ''>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editing, setEditing] = useState<Case | null>(null)
  const [viewing, setViewing] = useState<Case | null>(null)
  const [form, setForm] = useState(defaultCase)

  const filtered = cases.filter((c) => {
    const matchSearch = c.title.includes(search) || c.caseNumber.includes(search) || c.clientName.includes(search) || c.lawyerName.includes(search)
    const matchStatus = !statusFilter || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const openCreate = () => {
    setEditing(null)
    setForm(defaultCase)
    setModalOpen(true)
  }

  const openEdit = (c: Case) => {
    setEditing(c)
    setForm(c)
    setModalOpen(true)
  }

  const handleSave = () => {
    if (editing) {
      updateCase(editing.id, form)
    } else {
      addCase({ ...form, id: `CA${Date.now()}` } as Case)
    }
    setModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此案件吗？')) deleteCase(id)
  }

  const setField = (key: string, value: string | number) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value }
      if (key === 'clientId') {
        const client = clients.find((c) => c.id === value)
        if (client) updated.clientName = client.name
      }
      if (key === 'lawyerId') {
        const lawyer = lawyers.find((l) => l.id === value)
        if (lawyer) updated.lawyerName = lawyer.name
      }
      return updated
    })
  }

  return (
    <>
      <Header title="案件管理" subtitle={`${isAdmin ? '全部' : '我的'}案件 · 共 ${cases.length} 个`} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索案号、名称、客户、律师..." className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Filter size={14} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as CaseStatus | '')} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30">
              <option value="">全部状态</option>
              <option value="待受理">待受理</option>
              <option value="进行中">进行中</option>
              <option value="已结案">已结案</option>
              <option value="已归档">已归档</option>
            </select>
          </div>
          {isAdmin && (
            <button onClick={openCreate} className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
              <Plus size={16} /> 新建案件
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">案号</th>
                  <th className="px-4 py-3 font-medium">案件名称</th>
                  <th className="px-4 py-3 font-medium">类型</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">优先级</th>
                  <th className="px-4 py-3 font-medium">委托人</th>
                  <th className="px-4 py-3 font-medium">负责律师</th>
                  <th className="px-4 py-3 font-medium">代理费</th>
                  <th className="px-4 py-3 font-medium text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{c.caseNumber.length > 22 ? c.caseNumber.slice(0, 22) + '…' : c.caseNumber}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[220px] truncate">{c.title}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.type}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3"><StatusBadge status={c.priority} /></td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.clientName.length > 10 ? c.clientName.slice(0, 10) + '…' : c.clientName}</td>
                    <td className="px-4 py-3 text-gray-600">{c.lawyerName}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">¥{c.fee.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setViewing(c); setDetailOpen(true) }} className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"><Eye size={16} /></button>
                        {isAdmin && <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"><Edit2 size={16} /></button>}
                        {isAdmin && <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="py-16 text-center text-gray-400 text-sm">暂无符合条件的案件</div>}
        </div>
      </div>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="案件详情">
        {viewing && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-gray-500">案号：</span><span className="font-medium">{viewing.caseNumber}</span></div>
              <div><span className="text-gray-500">类型：</span><span>{viewing.type}</span></div>
              <div><span className="text-gray-500">状态：</span><StatusBadge status={viewing.status} /></div>
              <div><span className="text-gray-500">优先级：</span><StatusBadge status={viewing.priority} /></div>
              <div><span className="text-gray-500">委托人：</span><span>{viewing.clientName}</span></div>
              <div><span className="text-gray-500">负责律师：</span><span>{viewing.lawyerName}</span></div>
              <div><span className="text-gray-500">受理法院：</span><span>{viewing.courtName}</span></div>
              <div><span className="text-gray-500">代理费：</span><span className="font-medium">¥{viewing.fee.toLocaleString()}</span></div>
              <div><span className="text-gray-500">立案日期：</span><span>{viewing.filingDate}</span></div>
              <div><span className="text-gray-500">下次开庭：</span><span>{viewing.nextHearingDate || '暂无'}</span></div>
            </div>
            <div>
              <span className="text-gray-500">案件名称：</span>
              <p className="mt-1 font-medium">{viewing.title}</p>
            </div>
            <div>
              <span className="text-gray-500">案件描述：</span>
              <p className="mt-1 text-gray-700">{viewing.description}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '编辑案件' : '新建案件'}>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">案号</label>
              <input value={form.caseNumber} onChange={(e) => setField('caseNumber', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">案件类型</label>
              <select value={form.type} onChange={(e) => setField('type', e.target.value as CaseType)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                {(['民事诉讼','刑事辩护','商事仲裁','知识产权','劳动争议','行政诉讼','婚姻家庭','合同纠纷','公司法务','其他'] as CaseType[]).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">案件名称</label>
            <input value={form.title} onChange={(e) => setField('title', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">状态</label>
              <select value={form.status} onChange={(e) => setField('status', e.target.value as CaseStatus)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                {(['待受理','进行中','已结案','已归档'] as CaseStatus[]).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">优先级</label>
              <select value={form.priority} onChange={(e) => setField('priority', e.target.value as CasePriority)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                {(['高','中','低'] as CasePriority[]).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">委托人</label>
              <select value={form.clientId} onChange={(e) => setField('clientId', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                <option value="">请选择</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">负责律师</label>
              <select value={form.lawyerId} onChange={(e) => setField('lawyerId', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                <option value="">请选择</option>
                {lawyers.map((l) => <option key={l.id} value={l.id}>{l.name} - {l.title}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">受理法院</label>
              <input value={form.courtName} onChange={(e) => setField('courtName', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">代理费 (¥)</label>
              <input type="number" value={form.fee} onChange={(e) => setField('fee', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">立案日期</label>
              <input type="date" value={form.filingDate} onChange={(e) => setField('filingDate', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">下次开庭日期</label>
              <input type="date" value={form.nextHearingDate} onChange={(e) => setField('nextHearingDate', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">案件描述</label>
            <textarea rows={3} value={form.description} onChange={(e) => setField('description', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">取消</button>
            <button onClick={handleSave} className="px-5 py-2 text-sm text-white bg-primary-800 rounded-lg hover:bg-primary-700 transition-colors">保存</button>
          </div>
        </div>
      </Modal>
    </>
  )
}
