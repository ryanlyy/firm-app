import { useState } from 'react'
import Header from '../components/Header'
import Modal from '../components/Modal'
import { useStore } from '../store/useStore'
import { usePermissions } from '../hooks/usePermissions'
import { Plus, Search, Eye, Edit2, Trash2, Building2, User } from 'lucide-react'
import type { Client } from '../types'

const defaultClient: Omit<Client, 'id'> = {
  name: '', type: '个人', contact: '', phone: '', email: '', address: '', idNumber: '', createdAt: new Date().toISOString().slice(0, 10), notes: '',
}

export default function Clients() {
  const { addClient, updateClient, deleteClient } = useStore()
  const { clients, cases, isAdmin } = usePermissions()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'个人' | '企业' | ''>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [viewing, setViewing] = useState<Client | null>(null)
  const [form, setForm] = useState(defaultClient)

  const filtered = clients.filter((c) => {
    const match = c.name.includes(search) || c.contact.includes(search) || c.phone.includes(search)
    const matchType = !typeFilter || c.type === typeFilter
    return match && matchType
  })

  const openCreate = () => { setEditing(null); setForm(defaultClient); setModalOpen(true) }
  const openEdit = (c: Client) => { setEditing(c); setForm(c); setModalOpen(true) }

  const handleSave = () => {
    if (editing) updateClient(editing.id, form)
    else addClient({ ...form, id: `C${Date.now()}` } as Client)
    setModalOpen(false)
  }

  const handleDelete = (id: string) => { if (confirm('确定要删除此客户吗？')) deleteClient(id) }
  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }))
  const getClientCases = (clientId: string) => cases.filter((c) => c.clientId === clientId)

  return (
    <>
      <Header title="客户管理" subtitle={`${isAdmin ? '全部' : '我的'}客户 · 共 ${clients.length} 位`} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索客户名称、联系人、电话..." className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30">
            <option value="">全部类型</option>
            <option value="个人">个人</option>
            <option value="企业">企业</option>
          </select>
          {isAdmin && (
            <button onClick={openCreate} className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
              <Plus size={16} /> 新增客户
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const clientCases = getClientCases(c.id)
            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.type === '企业' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      {c.type === '企业' ? <Building2 size={22} /> : <User size={22} />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{c.name.length > 14 ? c.name.slice(0, 14) + '…' : c.name}</h4>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${c.type === '企业' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{c.type}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setViewing(c); setDetailOpen(true) }} className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600"><Eye size={15} /></button>
                    {isAdmin && <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600"><Edit2 size={15} /></button>}
                    {isAdmin && <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>}
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 text-sm text-gray-600">
                  <p>联系人：{c.contact} · {c.phone}</p>
                  <p className="truncate">邮箱：{c.email}</p>
                  <p className="text-xs text-gray-400">建档日期：{c.createdAt} · 关联案件 {clientCases.length} 件</p>
                </div>
              </div>
            )
          })}
        </div>
        {filtered.length === 0 && <div className="py-16 text-center text-gray-400 text-sm">暂无符合条件的客户</div>}
      </div>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="客户详情">
        {viewing && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-gray-500">客户名称：</span><span className="font-medium">{viewing.name}</span></div>
              <div><span className="text-gray-500">客户类型：</span><span>{viewing.type}</span></div>
              <div><span className="text-gray-500">联系人：</span><span>{viewing.contact}</span></div>
              <div><span className="text-gray-500">电话：</span><span>{viewing.phone}</span></div>
              <div><span className="text-gray-500">邮箱：</span><span>{viewing.email}</span></div>
              <div><span className="text-gray-500">证件号：</span><span className="font-mono text-xs">{viewing.idNumber}</span></div>
            </div>
            <div><span className="text-gray-500">地址：</span><p className="mt-1">{viewing.address}</p></div>
            {viewing.notes && <div><span className="text-gray-500">备注：</span><p className="mt-1">{viewing.notes}</p></div>}
            <div>
              <span className="text-gray-500">关联案件：</span>
              <div className="mt-2 space-y-2">
                {getClientCases(viewing.id).map((c) => (
                  <div key={c.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{c.title}</p>
                      <p className="text-xs text-gray-500">{c.caseNumber}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === '进行中' ? 'bg-blue-50 text-blue-600' : c.status === '已结案' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{c.status}</span>
                  </div>
                ))}
                {getClientCases(viewing.id).length === 0 && <p className="text-gray-400">暂无关联案件</p>}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? '编辑客户' : '新增客户'}>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">客户名称</label>
              <input value={form.name} onChange={(e) => setField('name', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">客户类型</label>
              <select value={form.type} onChange={(e) => setField('type', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                <option value="个人">个人</option>
                <option value="企业">企业</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">联系人</label>
              <input value={form.contact} onChange={(e) => setField('contact', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">电话</label>
              <input value={form.phone} onChange={(e) => setField('phone', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">邮箱</label>
              <input value={form.email} onChange={(e) => setField('email', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">证件号码</label>
              <input value={form.idNumber} onChange={(e) => setField('idNumber', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">地址</label>
            <input value={form.address} onChange={(e) => setField('address', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">备注</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setField('notes', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none" />
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
