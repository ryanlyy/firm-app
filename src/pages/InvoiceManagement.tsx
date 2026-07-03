import { useState, useMemo } from 'react'
import Header from '../components/Header'
import Modal from '../components/Modal'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/useAuthStore'
import { Receipt, Plus, Eye, Check, Search, FileDown, X } from 'lucide-react'
import type { InvoiceRequest } from '../types'

type InvoiceStatus = InvoiceRequest['status']
type InvoiceType = InvoiceRequest['invoiceType']

const statusConfig: Record<InvoiceStatus, string> = {
  '待开票': 'bg-amber-50 text-amber-700 border-amber-200',
  '已开票': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '已拒绝': 'bg-red-50 text-red-700 border-red-200',
}

const tabs: { label: string; value: InvoiceStatus | '' }[] = [
  { label: '全部', value: '' },
  { label: '待开票', value: '待开票' },
  { label: '已开票', value: '已开票' },
  { label: '已拒绝', value: '已拒绝' },
]

export default function InvoiceManagement() {
  const { currentUser } = useAuthStore()
  const { invoiceRequests, addInvoiceRequest, updateInvoiceRequest, cases } = useStore()

  const isAdmin = currentUser?.role === 'admin'

  const [applyOpen, setApplyOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<InvoiceRequest | null>(null)
  const [processItem, setProcessItem] = useState<InvoiceRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('')
  const [search, setSearch] = useState('')
  const [processAction, setProcessAction] = useState<'approve' | 'reject'>('approve')
  const [invoiceNumber, setInvoiceNumber] = useState('')

  const [form, setForm] = useState({
    caseId: '',
    amount: '',
    invoiceType: '增值税普通发票' as InvoiceType,
    taxNumber: '',
    companyName: '',
  })

  const visibleRequests = useMemo(() => {
    let list = invoiceRequests
    if (!isAdmin) {
      list = list.filter((r) => r.applicantId === currentUser?.id)
    }
    if (statusFilter) {
      list = list.filter((r) => r.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (r) =>
          r.caseTitle.toLowerCase().includes(q) ||
          r.clientName.toLowerCase().includes(q)
      )
    }
    return list
  }, [invoiceRequests, isAdmin, currentUser?.id, statusFilter, search])

  const totalInvoiced = invoiceRequests
    .filter((r) => r.status === '已开票')
    .reduce((sum, r) => sum + r.amount, 0)
  const pendingCount = invoiceRequests.filter((r) => r.status === '待开票').length
  const completedCount = invoiceRequests.filter((r) => r.status === '已开票').length

  const handleApply = () => {
    if (!currentUser || !form.caseId || !form.amount) return
    const selectedCase = cases.find((c) => c.id === form.caseId)
    if (!selectedCase) return
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) return

    const newRequest: InvoiceRequest = {
      id: `IR${Date.now()}`,
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      caseId: selectedCase.id,
      caseTitle: selectedCase.title,
      clientName: selectedCase.clientName,
      amount,
      invoiceType: form.invoiceType,
      taxNumber: form.invoiceType === '增值税专用发票' ? form.taxNumber : undefined,
      companyName: form.invoiceType === '增值税专用发票' ? form.companyName : undefined,
      applyDate: new Date().toISOString().slice(0, 10),
      status: '待开票',
    }
    addInvoiceRequest(newRequest)
    setForm({ caseId: '', amount: '', invoiceType: '增值税普通发票', taxNumber: '', companyName: '' })
    setApplyOpen(false)
  }

  const handleProcess = () => {
    if (!processItem || !currentUser) return
    if (processAction === 'approve' && !invoiceNumber.trim()) return
    updateInvoiceRequest(processItem.id, {
      status: processAction === 'approve' ? '已开票' : '已拒绝',
      invoiceNumber: processAction === 'approve' ? invoiceNumber.trim() : undefined,
      processDate: new Date().toISOString().slice(0, 10),
      processedBy: currentUser.name,
    })
    setProcessItem(null)
    setInvoiceNumber('')
  }

  const myCases = useMemo(() => {
    if (isAdmin) return cases
    return cases.filter((c) => c.lawyerId === currentUser?.id)
  }, [cases, isAdmin, currentUser?.id])

  return (
    <>
      <Header title="发票管理" subtitle="案件开票申请与管理" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Receipt size={22} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">已开票总额</p>
              <p className="text-xl font-bold text-gray-900">¥{totalInvoiced.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <FileDown size={22} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">待开票</p>
              <p className="text-xl font-bold text-amber-700">{pendingCount} <span className="text-sm font-normal text-gray-400">笔</span></p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Check size={22} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">已完成</p>
              <p className="text-xl font-bold text-emerald-700">{completedCount} <span className="text-sm font-normal text-gray-400">笔</span></p>
            </div>
          </div>
        </div>

        {/* Search + Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索案件名称、客户名称..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <button
            onClick={() => setApplyOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary-800 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Plus size={16} /> 申请开票
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                statusFilter === tab.value
                  ? 'bg-primary-800 text-white border-primary-800'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">申请日期</th>
                  <th className="px-4 py-3 font-medium">申请人</th>
                  <th className="px-4 py-3 font-medium">案件名称</th>
                  <th className="px-4 py-3 font-medium">客户</th>
                  <th className="px-4 py-3 font-medium text-right">金额</th>
                  <th className="px-4 py-3 font-medium">发票类型</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">发票号</th>
                  <th className="px-4 py-3 font-medium text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visibleRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.applyDate}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{r.applicantName}</td>
                    <td className="px-4 py-3 text-gray-800 max-w-[200px] truncate">{r.caseTitle}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{r.clientName}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">¥{r.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{r.invoiceType === '增值税专用发票' ? '专票' : '普票'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${statusConfig[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.invoiceNumber || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setDetailItem(r)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="查看详情"
                        >
                          <Eye size={16} />
                        </button>
                        {isAdmin && r.status === '待开票' && (
                          <button
                            onClick={() => { setProcessAction('approve'); setInvoiceNumber(''); setProcessItem(r) }}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                            title="处理"
                          >
                            <Check size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visibleRequests.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">暂无发票申请记录</div>
          )}
        </div>
      </div>

      {/* Apply modal */}
      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title="申请开票" width="max-w-lg">
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-gray-600 mb-1">关联案件 <span className="text-red-400">*</span></label>
            <select
              value={form.caseId}
              onChange={(e) => setForm({ ...form, caseId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              <option value="">请选择案件</option>
              {myCases.map((c) => (
                <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}（{c.clientName}）</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">开票金额（元） <span className="text-red-400">*</span></label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              placeholder="请输入金额"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">发票类型 <span className="text-red-400">*</span></label>
            <select
              value={form.invoiceType}
              onChange={(e) => setForm({ ...form, invoiceType: e.target.value as InvoiceType })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              <option value="增值税普通发票">增值税普通发票</option>
              <option value="增值税专用发票">增值税专用发票</option>
            </select>
          </div>
          {form.invoiceType === '增值税专用发票' && (
            <>
              <div>
                <label className="block text-gray-600 mb-1">纳税人识别号 <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.taxNumber}
                  onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  placeholder="请输入纳税人识别号"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">公司名称 <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  placeholder="请输入公司全称"
                />
              </div>
            </>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setApplyOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleApply}
              disabled={!form.caseId || !form.amount || (form.invoiceType === '增值税专用发票' && (!form.taxNumber.trim() || !form.companyName.trim()))}
              className="px-5 py-2 text-white bg-primary-800 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              提交申请
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail modal */}
      <Modal open={!!detailItem} onClose={() => setDetailItem(null)} title="发票申请详情" width="max-w-lg">
        {detailItem && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-gray-500">申请人：</span><span className="font-medium text-gray-800">{detailItem.applicantName}</span></div>
              <div><span className="text-gray-500">申请日期：</span><span className="text-gray-800">{detailItem.applyDate}</span></div>
              <div><span className="text-gray-500">案件名称：</span><span className="text-gray-800">{detailItem.caseTitle}</span></div>
              <div><span className="text-gray-500">客户名称：</span><span className="text-gray-800">{detailItem.clientName}</span></div>
              <div><span className="text-gray-500">开票金额：</span><span className="font-medium text-gray-800">¥{detailItem.amount.toLocaleString()}</span></div>
              <div><span className="text-gray-500">发票类型：</span><span className="text-gray-800">{detailItem.invoiceType}</span></div>
              {detailItem.companyName && (
                <div className="col-span-2"><span className="text-gray-500">公司名称：</span><span className="text-gray-800">{detailItem.companyName}</span></div>
              )}
              {detailItem.taxNumber && (
                <div className="col-span-2"><span className="text-gray-500">纳税人识别号：</span><span className="font-mono text-gray-800">{detailItem.taxNumber}</span></div>
              )}
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-gray-500 mb-2">处理信息</p>
              {detailItem.status === '待开票' ? (
                <span className="text-amber-600">等待管理员处理...</span>
              ) : (
                <div className="space-y-1">
                  <div>
                    <span className="text-gray-500">状态：</span>
                    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ml-1 ${statusConfig[detailItem.status]}`}>
                      {detailItem.status}
                    </span>
                  </div>
                  {detailItem.invoiceNumber && (
                    <div><span className="text-gray-500">发票号码：</span><span className="font-mono text-gray-800">{detailItem.invoiceNumber}</span></div>
                  )}
                  {detailItem.processDate && (
                    <div><span className="text-gray-500">处理日期：</span><span className="text-gray-800">{detailItem.processDate}</span></div>
                  )}
                  {detailItem.processedBy && (
                    <div><span className="text-gray-500">处理人：</span><span className="text-gray-800">{detailItem.processedBy}</span></div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Process modal (admin only) */}
      <Modal open={!!processItem} onClose={() => setProcessItem(null)} title="处理开票申请" width="max-w-md">
        {processItem && (
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
              <p><span className="text-gray-500">申请人：</span>{processItem.applicantName}</p>
              <p><span className="text-gray-500">案件：</span>{processItem.caseTitle}</p>
              <p><span className="text-gray-500">客户：</span>{processItem.clientName}</p>
              <p><span className="text-gray-500">金额：</span>¥{processItem.amount.toLocaleString()}</p>
              <p><span className="text-gray-500">类型：</span>{processItem.invoiceType}</p>
              {processItem.taxNumber && <p><span className="text-gray-500">税号：</span>{processItem.taxNumber}</p>}
              {processItem.companyName && <p><span className="text-gray-500">公司：</span>{processItem.companyName}</p>}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setProcessAction('approve')}
                className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${
                  processAction === 'approve'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                开票
              </button>
              <button
                onClick={() => setProcessAction('reject')}
                className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${
                  processAction === 'reject'
                    ? 'bg-red-50 text-red-700 border-red-300'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                拒绝
              </button>
            </div>

            {processAction === 'approve' && (
              <div>
                <label className="block text-gray-600 mb-1">发票号码 <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  placeholder="请输入发票号码"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setProcessItem(null)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleProcess}
                disabled={processAction === 'approve' && !invoiceNumber.trim()}
                className={`px-5 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  processAction === 'approve'
                    ? 'text-white bg-emerald-600 hover:bg-emerald-500'
                    : 'text-white bg-red-600 hover:bg-red-500'
                }`}
              >
                {processAction === 'approve' ? '确认开票' : '确认拒绝'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
