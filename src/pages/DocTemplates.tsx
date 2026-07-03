import { useState } from 'react'
import Header from '../components/Header'
import Modal from '../components/Modal'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/useAuthStore'
import { FileText, Plus, Download, Search, FolderOpen, Eye, Upload } from 'lucide-react'
import type { DocTemplate } from '../types'

const categories: DocTemplate['category'][] = [
  '诉讼文书', '合同模板', '律师函', '法律意见书', '尽职调查', '公司治理', '其他',
]

const categoryColors: Record<DocTemplate['category'], string> = {
  '诉讼文书': 'bg-red-50 text-red-700 border-red-200',
  '合同模板': 'bg-blue-50 text-blue-700 border-blue-200',
  '律师函': 'bg-amber-50 text-amber-700 border-amber-200',
  '法律意见书': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '尽职调查': 'bg-purple-50 text-purple-700 border-purple-200',
  '公司治理': 'bg-sky-50 text-sky-700 border-sky-200',
  '其他': 'bg-gray-100 text-gray-600 border-gray-200',
}

const categoryIcons: Record<DocTemplate['category'], string> = {
  '诉讼文书': 'bg-red-100 text-red-600',
  '合同模板': 'bg-blue-100 text-blue-600',
  '律师函': 'bg-amber-100 text-amber-600',
  '法律意见书': 'bg-emerald-100 text-emerald-600',
  '尽职调查': 'bg-purple-100 text-purple-600',
  '公司治理': 'bg-sky-100 text-sky-600',
  '其他': 'bg-gray-100 text-gray-600',
}

interface FormState {
  name: string
  category: DocTemplate['category']
  description: string
}

const defaultForm: FormState = { name: '', category: '诉讼文书', description: '' }

export default function DocTemplates() {
  const { docTemplates, addDocTemplate } = useStore()
  const { currentUser } = useAuthStore()
  const isAdmin = currentUser?.role === 'admin'

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<DocTemplate['category'] | ''>('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<DocTemplate | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)

  const categoryStats = new Map<DocTemplate['category'], number>()
  docTemplates.forEach((t) => categoryStats.set(t.category, (categoryStats.get(t.category) || 0) + 1))

  const filtered = docTemplates.filter((t) => {
    const matchSearch = !search || t.name.includes(search)
    const matchCategory = !categoryFilter || t.category === categoryFilter
    return matchSearch && matchCategory
  })

  const handleDownload = (template: DocTemplate) => {
    const updated: DocTemplate = { ...template, downloadCount: template.downloadCount + 1 }
    const idx = docTemplates.findIndex((t) => t.id === template.id)
    if (idx !== -1) {
      const newList = [...docTemplates]
      newList[idx] = updated
      useStore.setState({ docTemplates: newList })
    }
  }

  const handleUpload = () => {
    if (!form.name.trim() || !form.description.trim() || !currentUser) return
    const newTemplate: DocTemplate = {
      id: `DT${Date.now()}`,
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      uploadDate: new Date().toISOString().slice(0, 10),
      uploadedBy: currentUser.name,
      downloadCount: 0,
      isShared: true,
    }
    addDocTemplate(newTemplate)
    setForm(defaultForm)
    setUploadOpen(false)
  }

  return (
    <>
      <Header title="知识文库" subtitle="统一文书模板，共享专业知识" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Category stats bar */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {categories.map((cat) => {
            const count = categoryStats.get(cat) || 0
            const active = categoryFilter === cat
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(active ? '' : cat)}
                className={`p-3 rounded-xl border text-center transition-colors ${active ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
              >
                <div className={`w-10 h-10 rounded-lg ${categoryIcons[cat]} flex items-center justify-center mx-auto mb-2`}>
                  <FileText size={20} />
                </div>
                <p className="text-xs font-medium text-gray-700 truncate">{cat}</p>
                <p className="text-lg font-bold text-gray-900">{count}</p>
              </button>
            )
          })}
        </div>

        {/* Search & actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索模板名称..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as DocTemplate['category'] | '')}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            <option value="">全部分类</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {isAdmin && (
            <button
              onClick={() => { setForm(defaultForm); setUploadOpen(true) }}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Upload size={16} /> 上传模板
            </button>
          )}
        </div>

        {/* Template cards grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${categoryIcons[t.category]}`}>
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-gray-800 truncate">{t.name}</h4>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border mt-1 ${categoryColors[t.category]}`}>
                      {t.category}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{t.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span>{t.uploadDate} · {t.uploadedBy}</span>
                  <span className="flex items-center gap-1">
                    <Download size={12} />
                    {t.downloadCount} 次下载
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDetailItem(t)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Eye size={14} /> 查看
                  </button>
                  <button
                    onClick={() => handleDownload(t)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-white bg-primary-800 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Download size={14} /> 下载模板
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400">
            <FolderOpen size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm">暂无符合条件的文书模板</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Modal open={!!detailItem} onClose={() => setDetailItem(null)} title="模板详情">
        {detailItem && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${categoryIcons[detailItem.category]}`}>
                <FileText size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{detailItem.name}</h4>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full border mt-1 ${categoryColors[detailItem.category]}`}>
                  {detailItem.category}
                </span>
              </div>
            </div>
            <div>
              <p className="text-gray-500 mb-1">模板描述</p>
              <p className="text-gray-800">{detailItem.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-gray-500">上传日期：</span><span className="text-gray-800">{detailItem.uploadDate}</span></div>
              <div><span className="text-gray-500">上传人：</span><span className="text-gray-800">{detailItem.uploadedBy}</span></div>
              <div><span className="text-gray-500">下载次数：</span><span className="text-gray-800 font-medium">{detailItem.downloadCount} 次</span></div>
              <div><span className="text-gray-500">共享状态：</span><span className="text-gray-800">{detailItem.isShared ? '已共享' : '未共享'}</span></div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => { handleDownload(detailItem); setDetailItem({ ...detailItem, downloadCount: detailItem.downloadCount + 1 }) }}
                className="flex items-center gap-2 px-5 py-2 text-sm text-white bg-primary-800 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Download size={16} /> 下载模板
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload modal (admin only) */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="上传文书模板" width="max-w-lg">
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-gray-600 mb-1">模板名称 <span className="text-red-400">*</span></label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="例：民事起诉状模板"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">模板分类 <span className="text-red-400">*</span></label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as DocTemplate['category'] })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">模板描述 <span className="text-red-400">*</span></label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="请简要描述模板内容和适用场景..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setUploadOpen(false)} className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">取消</button>
            <button
              onClick={handleUpload}
              disabled={!form.name.trim() || !form.description.trim()}
              className="px-5 py-2 text-white bg-primary-800 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认上传
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
