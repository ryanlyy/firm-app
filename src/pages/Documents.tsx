import { useState } from 'react'
import Header from '../components/Header'
import Modal from '../components/Modal'
import { useStore } from '../store/useStore'
import { usePermissions } from '../hooks/usePermissions'
import { Plus, Search, FileText, Download, Trash2, Eye, File, FolderOpen } from 'lucide-react'
import type { Document as DocType } from '../types'

const typeIcons: Record<string, string> = {
  '合同': 'bg-blue-50 text-blue-600',
  '起诉状': 'bg-red-50 text-red-600',
  '答辩状': 'bg-amber-50 text-amber-600',
  '证据材料': 'bg-emerald-50 text-emerald-600',
  '判决书': 'bg-purple-50 text-purple-600',
  '律师函': 'bg-sky-50 text-sky-600',
  '授权委托书': 'bg-pink-50 text-pink-600',
  '其他': 'bg-gray-100 text-gray-600',
}

const defaultDoc: Omit<DocType, 'id'> = {
  name: '', type: '其他', caseId: '', caseTitle: '', uploadDate: new Date().toISOString().slice(0, 10), size: '0 KB', uploadedBy: '',
}

export default function Documents() {
  const { addDocument, deleteDocument } = useStore()
  const { documents, cases } = usePermissions()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [viewing, setViewing] = useState<DocType | null>(null)
  const [form, setForm] = useState(defaultDoc)

  const filtered = documents.filter((d) => {
    const match = d.name.includes(search) || (d.caseTitle || '').includes(search) || d.uploadedBy.includes(search)
    const matchType = !typeFilter || d.type === typeFilter
    return match && matchType
  })

  const typeStats = new Map<string, number>()
  documents.forEach((d) => typeStats.set(d.type, (typeStats.get(d.type) || 0) + 1))

  const handleCreate = () => {
    addDocument({ ...form, id: `D${Date.now()}` } as DocType)
    setModalOpen(false)
    setForm(defaultDoc)
  }

  const handleDelete = (id: string) => { if (confirm('确定要删除此文档吗？')) deleteDocument(id) }

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

  return (
    <>
      <Header title="文档管理" subtitle={`共 ${documents.length} 份文档`} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
          {Array.from(typeStats.entries()).map(([type, count]) => (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? '' : type)}
              className={`p-3 rounded-xl border text-center transition-colors ${typeFilter === type ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
            >
              <div className={`w-10 h-10 rounded-lg ${typeIcons[type] || 'bg-gray-100 text-gray-600'} flex items-center justify-center mx-auto mb-2`}>
                <FileText size={20} />
              </div>
              <p className="text-xs font-medium text-gray-700">{type}</p>
              <p className="text-lg font-bold text-gray-900">{count}</p>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索文档名称、案件、上传人..." className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30">
            <option value="">全部类型</option>
            {['合同','起诉状','答辩状','证据材料','判决书','律师函','授权委托书','其他'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={() => { setForm(defaultDoc); setModalOpen(true) }} className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
            <Plus size={16} /> 上传文档
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">文件名</th>
                  <th className="px-4 py-3 font-medium">类型</th>
                  <th className="px-4 py-3 font-medium">关联案件</th>
                  <th className="px-4 py-3 font-medium">上传日期</th>
                  <th className="px-4 py-3 font-medium">大小</th>
                  <th className="px-4 py-3 font-medium">上传人</th>
                  <th className="px-4 py-3 font-medium text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeIcons[d.type] || 'bg-gray-100 text-gray-600'}`}>
                          <File size={16} />
                        </div>
                        <span className="font-medium text-gray-800">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{d.type}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{d.caseTitle || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{d.uploadDate}</td>
                    <td className="px-4 py-3 text-gray-500">{d.size}</td>
                    <td className="px-4 py-3 text-gray-600">{d.uploadedBy}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setViewing(d); setDetailOpen(true) }} className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600"><Eye size={16} /></button>
                        <button className="p-1.5 rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"><Download size={16} /></button>
                        <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <FolderOpen size={40} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">暂无符合条件的文档</p>
            </div>
          )}
        </div>
      </div>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="文档详情">
        {viewing && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeIcons[viewing.type]}`}>
                <FileText size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{viewing.name}</h4>
                <p className="text-xs text-gray-500">{viewing.type} · {viewing.size}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-gray-500">上传日期：</span><span>{viewing.uploadDate}</span></div>
              <div><span className="text-gray-500">上传人：</span><span>{viewing.uploadedBy}</span></div>
              {viewing.caseTitle && <div className="col-span-2"><span className="text-gray-500">关联案件：</span><span>{viewing.caseTitle}</span></div>}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="上传文档">
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-gray-600 mb-1">文件名</label>
            <input value={form.name} onChange={(e) => setField('name', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">文档类型</label>
              <select value={form.type} onChange={(e) => setField('type', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                {['合同','起诉状','答辩状','证据材料','判决书','律师函','授权委托书','其他'].map((t) => <option key={t} value={t}>{t}</option>)}
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
            <label className="block text-gray-600 mb-1">上传人</label>
            <input value={form.uploadedBy} onChange={(e) => setField('uploadedBy', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
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
