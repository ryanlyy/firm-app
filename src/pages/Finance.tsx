import { useState } from 'react'
import Header from '../components/Header'
import StatsCard from '../components/StatsCard'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { usePermissions } from '../hooks/usePermissions'
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle, Eye, Search, Filter } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { PaymentStatus } from '../types'

export default function Finance() {
  const { invoices } = usePermissions()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [viewing, setViewing] = useState<(typeof invoices)[0] | null>(null)

  const totalAmount = invoices.reduce((s, i) => s + i.amount, 0)
  const paidAmount = invoices.reduce((s, i) => s + i.paidAmount, 0)
  const pendingAmount = totalAmount - paidAmount
  const overdueAmount = invoices.filter((i) => i.status === '逾期').reduce((s, i) => s + (i.amount - i.paidAmount), 0)
  const paidCount = invoices.filter((i) => i.status === '已付款').length

  const chartData = [
    { name: '已付款', 金额: invoices.filter((i) => i.status === '已付款').reduce((s, i) => s + i.amount, 0) / 10000 },
    { name: '部分付款', 金额: invoices.filter((i) => i.status === '部分付款').reduce((s, i) => s + i.paidAmount, 0) / 10000 },
    { name: '待付款', 金额: invoices.filter((i) => i.status === '待付款').reduce((s, i) => s + i.amount, 0) / 10000 },
    { name: '逾期', 金额: invoices.filter((i) => i.status === '逾期').reduce((s, i) => s + (i.amount - i.paidAmount), 0) / 10000 },
  ]

  const filtered = invoices.filter((inv) => {
    const match = inv.invoiceNumber.includes(search) || inv.caseTitle.includes(search) || inv.clientName.includes(search)
    const matchStatus = !statusFilter || inv.status === statusFilter
    return match && matchStatus
  })

  return (
    <>
      <Header title="财务管理" subtitle="账单与收款概览" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard title="合同总额" value={`¥${(totalAmount / 10000).toFixed(1)}万`} icon={DollarSign} color="blue" />
          <StatsCard title="已收款" value={`¥${(paidAmount / 10000).toFixed(1)}万`} subtitle={`${paidCount} 笔已结清`} icon={CheckCircle} color="green" />
          <StatsCard title="待收款" value={`¥${(pendingAmount / 10000).toFixed(1)}万`} icon={TrendingUp} color="amber" />
          <StatsCard title="逾期金额" value={`¥${(overdueAmount / 10000).toFixed(1)}万`} icon={AlertTriangle} color="red" />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">收款状态分布（万元）</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(val) => `${Number(val).toFixed(1)} 万`} />
              <Legend />
              <Bar dataKey="金额" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索账单号、案件、客户..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Filter size={14} className="text-gray-400" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | '')} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                <option value="">全部状态</option>
                <option value="已付款">已付款</option>
                <option value="待付款">待付款</option>
                <option value="逾期">逾期</option>
                <option value="部分付款">部分付款</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">账单号</th>
                  <th className="px-4 py-3 font-medium">案件</th>
                  <th className="px-4 py-3 font-medium">客户</th>
                  <th className="px-4 py-3 font-medium text-right">应收金额</th>
                  <th className="px-4 py-3 font-medium text-right">已收金额</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">开票日期</th>
                  <th className="px-4 py-3 font-medium">到期日</th>
                  <th className="px-4 py-3 font-medium text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-gray-800 max-w-[180px] truncate">{inv.caseTitle}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{inv.clientName.length > 10 ? inv.clientName.slice(0, 10) + '…' : inv.clientName}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">¥{inv.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">¥{inv.paidAmount.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                    <td className="px-4 py-3 text-gray-500">{inv.issueDate}</td>
                    <td className="px-4 py-3 text-gray-500">{inv.dueDate}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => { setViewing(inv); setDetailOpen(true) }} className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"><Eye size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="py-16 text-center text-gray-400 text-sm">暂无符合条件的账单</div>}
        </div>
      </div>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="账单详情">
        {viewing && (
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-gray-500">账单号：</span><span className="font-mono">{viewing.invoiceNumber}</span></div>
              <div><span className="text-gray-500">状态：</span><StatusBadge status={viewing.status} /></div>
              <div><span className="text-gray-500">客户：</span><span>{viewing.clientName}</span></div>
              <div><span className="text-gray-500">案件：</span><span>{viewing.caseTitle}</span></div>
              <div><span className="text-gray-500">开票日期：</span><span>{viewing.issueDate}</span></div>
              <div><span className="text-gray-500">到期日期：</span><span>{viewing.dueDate}</span></div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">费用明细</h4>
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50"><th className="px-4 py-2 text-left text-gray-500 font-medium">项目</th><th className="px-4 py-2 text-right text-gray-500 font-medium">金额</th></tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {viewing.items.map((item, i) => (
                      <tr key={i}><td className="px-4 py-2">{item.description}</td><td className="px-4 py-2 text-right font-medium">¥{item.amount.toLocaleString()}</td></tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold"><td className="px-4 py-2">合计</td><td className="px-4 py-2 text-right">¥{viewing.amount.toLocaleString()}</td></tr>
                    <tr className="font-semibold text-emerald-600"><td className="px-4 py-2">已付</td><td className="px-4 py-2 text-right">¥{viewing.paidAmount.toLocaleString()}</td></tr>
                    <tr className="font-semibold text-amber-600"><td className="px-4 py-2">待收</td><td className="px-4 py-2 text-right">¥{(viewing.amount - viewing.paidAmount).toLocaleString()}</td></tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
