import { useState, useMemo } from 'react'
import Header from '../components/Header'
import Modal from '../components/Modal'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/useAuthStore'
import type { SealApproval as SealApprovalType, SealType, SealApprovalStatus } from '../types'
import { Stamp, Plus, Check, X, Eye, Clock, CheckCircle, XCircle, RotateCcw, UserCheck, Users, AlertTriangle } from 'lucide-react'

const sealTypes: SealType[] = ['公章', '合同章', '法人章', '财务章']
const statusLabels: Record<SealApprovalStatus, { color: string; icon: typeof Clock }> = {
  '待审批': { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  '已批准': { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  '已拒绝': { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  '已撤回': { color: 'bg-gray-50 text-gray-600 border-gray-200', icon: RotateCcw },
}

export default function SealApproval() {
  const { currentUser } = useAuthStore()
  const { sealApprovals, sealProxies, lawyers, cases, addSealApproval, updateSealApproval, addSealProxy, removeSealProxy } = useStore()

  const [applyOpen, setApplyOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<SealApprovalType | null>(null)
  const [approveItem, setApproveItem] = useState<SealApprovalType | null>(null)
  const [proxyOpen, setProxyOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<SealApprovalStatus | ''>('')
  const [approveComment, setApproveComment] = useState('')
  const [proxyTargetId, setProxyTargetId] = useState('')
  const [proxyStart, setProxyStart] = useState('')
  const [proxyEnd, setProxyEnd] = useState('')

  const [form, setForm] = useState({
    sealType: '公章' as SealType,
    reason: '',
    caseId: '',
    documentName: '',
    copies: 1,
  })

  const isSeniorPartner = currentUser?.title === '高级合伙人'

  // A user can approve if they are: 1) a senior partner, or 2) an active proxy of a senior partner
  const canApprove = useMemo(() => {
    if (isSeniorPartner) return true
    const now = new Date().toISOString().slice(0, 10)
    return sealProxies.some(
      (p) => p.proxyId === currentUser?.id && p.startDate <= now && p.endDate >= now
    )
  }, [isSeniorPartner, sealProxies, currentUser?.id])

  // Which senior partner delegated to current user (for display)
  const delegatedFrom = useMemo(() => {
    if (isSeniorPartner) return null
    const now = new Date().toISOString().slice(0, 10)
    return sealProxies.find(
      (p) => p.proxyId === currentUser?.id && p.startDate <= now && p.endDate >= now
    )
  }, [isSeniorPartner, sealProxies, currentUser?.id])

  const seniorPartners = lawyers.filter((l) => l.title === '高级合伙人')

  const currentProxies = useMemo(() => {
    if (!isSeniorPartner) return []
    return sealProxies.filter((p) => p.principalId === currentUser?.id)
  }, [isSeniorPartner, sealProxies, currentUser?.id])

  // Non-senior-partner lawyers who can be proxy candidates
  const proxyCandidates = lawyers.filter((l) => l.id !== currentUser?.id && l.title !== '高级合伙人')

  const filteredApprovals = useMemo(() => {
    let list = sealApprovals
    if (statusFilter) list = list.filter((a) => a.status === statusFilter)
    // Non-approvers only see their own
    if (!canApprove && currentUser?.role !== 'admin') {
      list = list.filter((a) => a.applicantId === currentUser?.id)
    }
    return list
  }, [sealApprovals, statusFilter, canApprove, currentUser])

  const pendingCount = sealApprovals.filter((a) => a.status === '待审批').length

  const handleApply = () => {
    if (!currentUser || !form.reason.trim() || !form.documentName.trim()) return
    const selectedCase = form.caseId ? cases.find((c) => c.id === form.caseId) : null
    const newApproval: SealApprovalType = {
      id: `SA${Date.now()}`,
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      sealType: form.sealType,
      reason: form.reason,
      caseId: selectedCase?.id,
      caseTitle: selectedCase?.title,
      documentName: form.documentName,
      copies: form.copies,
      applyDate: new Date().toISOString().slice(0, 10),
      status: '待审批',
    }
    addSealApproval(newApproval)
    setForm({ sealType: '公章', reason: '', caseId: '', documentName: '', copies: 1 })
    setApplyOpen(false)
  }

  const handleApprove = (approved: boolean) => {
    if (!approveItem || !currentUser) return
    updateSealApproval(approveItem.id, {
      status: approved ? '已批准' : '已拒绝',
      approverId: currentUser.id,
      approverName: currentUser.name + (delegatedFrom ? `（代${delegatedFrom.principalName}批）` : ''),
      approveDate: new Date().toISOString().slice(0, 10),
      approveComment: approveComment || (approved ? '同意' : '不同意'),
    })
    setApproveItem(null)
    setApproveComment('')
  }

  const handleWithdraw = (id: string) => {
    updateSealApproval(id, { status: '已撤回' })
  }

  const handleAddProxy = () => {
    if (!currentUser || !proxyTargetId || !proxyStart || !proxyEnd) return
    const target = lawyers.find((l) => l.id === proxyTargetId)
    if (!target) return
    addSealProxy({
      principalId: currentUser.id,
      principalName: currentUser.name,
      proxyId: target.id,
      proxyName: target.name,
      startDate: proxyStart,
      endDate: proxyEnd,
    })
    setProxyTargetId('')
    setProxyStart('')
    setProxyEnd('')
    setProxyOpen(false)
  }

  return (
    <>
      <Header title="印章审批管理" subtitle={canApprove ? (isSeniorPartner ? '高级合伙人审批' : `代理审批（授权自${delegatedFrom?.principalName}）`) : '申请用印'} />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Stats & actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-6 text-sm">
              <span className="text-gray-500">总申请：<span className="font-semibold text-gray-800">{sealApprovals.length}</span></span>
              <span className="text-amber-600">待审批：<span className="font-semibold">{pendingCount}</span></span>
              <span className="text-emerald-600">已批准：<span className="font-semibold">{sealApprovals.filter((a) => a.status === '已批准').length}</span></span>
            </div>
          </div>
          <div className="flex gap-2">
            {isSeniorPartner && (
              <button onClick={() => setProxyOpen(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <UserCheck size={16} /> 代理人管理
              </button>
            )}
            <button onClick={() => setApplyOpen(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary-800 text-white rounded-xl hover:bg-primary-700 transition-colors">
              <Plus size={16} /> 申请用印
            </button>
          </div>
        </div>

        {/* Proxy info banner */}
        {delegatedFrom && !isSeniorPartner && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200 text-sm text-blue-700">
            <UserCheck size={18} className="shrink-0" />
            <span>您已被 <span className="font-semibold">{delegatedFrom.principalName}</span> 授权为印章审批代理人（{delegatedFrom.startDate} 至 {delegatedFrom.endDate}），可代为审批用印申请。</span>
          </div>
        )}

        {/* Proxy management for senior partners */}
        {isSeniorPartner && currentProxies.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h4 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1.5"><Users size={14} /> 当前代理人</h4>
            <div className="flex flex-wrap gap-2">
              {currentProxies.map((p) => (
                <div key={p.proxyId} className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                  <span className="font-medium text-blue-700">{p.proxyName}</span>
                  <span className="text-blue-500 text-xs">({p.startDate} ~ {p.endDate})</span>
                  <button onClick={() => removeSealProxy(p.principalId, p.proxyId)} className="p-0.5 rounded text-blue-400 hover:text-red-500 transition-colors" title="撤销代理">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2">
          <button onClick={() => setStatusFilter('')} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${!statusFilter ? 'bg-primary-800 text-white border-primary-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>全部</button>
          {(Object.keys(statusLabels) as SealApprovalStatus[]).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${statusFilter === s ? 'bg-primary-800 text-white border-primary-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{s}</button>
          ))}
        </div>

        {/* Approvals table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">申请日期</th>
                  <th className="px-4 py-3 font-medium">申请人</th>
                  <th className="px-4 py-3 font-medium">印章类型</th>
                  <th className="px-4 py-3 font-medium">用印文件</th>
                  <th className="px-4 py-3 font-medium">关联案件</th>
                  <th className="px-4 py-3 font-medium">份数</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredApprovals.map((a) => {
                  const cfg = statusLabels[a.status]
                  const StatusIcon = cfg.icon
                  const isOwn = a.applicantId === currentUser?.id
                  return (
                    <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{a.applyDate}</td>
                      <td className="px-4 py-3 text-gray-800 font-medium">{a.applicantName}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          <Stamp size={14} className="text-gray-400" />
                          {a.sealType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{a.documentName}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{a.caseTitle || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{a.copies}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>
                          <StatusIcon size={12} />
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setDetailItem(a)} className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="查看详情">
                            <Eye size={16} />
                          </button>
                          {canApprove && a.status === '待审批' && !isOwn && (
                            <button onClick={() => { setApproveComment(''); setApproveItem(a) }} className="p-1.5 rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors" title="审批">
                              <Check size={16} />
                            </button>
                          )}
                          {isOwn && a.status === '待审批' && (
                            <button onClick={() => handleWithdraw(a.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" title="撤回">
                              <RotateCcw size={16} />
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
          {filteredApprovals.length === 0 && <div className="py-16 text-center text-gray-400 text-sm">暂无记录</div>}
        </div>
      </div>

      {/* Apply modal */}
      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title="申请用印" width="max-w-lg">
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-gray-600 mb-1">印章类型 <span className="text-red-400">*</span></label>
            <select value={form.sealType} onChange={(e) => setForm({ ...form, sealType: e.target.value as SealType })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30">
              {sealTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">用印文件名称 <span className="text-red-400">*</span></label>
            <input type="text" value={form.documentName} onChange={(e) => setForm({ ...form, documentName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="例：委托代理合同.pdf" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">关联案件（可选）</label>
            <select value={form.caseId} onChange={(e) => setForm({ ...form, caseId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30">
              <option value="">无关联案件</option>
              {cases.map((c) => <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">用印份数</label>
            <input type="number" min={1} max={99} value={form.copies} onChange={(e) => setForm({ ...form, copies: Number(e.target.value) || 1 })}
              className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">用印事由 <span className="text-red-400">*</span></label>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none" placeholder="请详细说明用印事由..." />
          </div>
          <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg text-xs text-gray-500">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>用印申请将提交给高级合伙人（或其授权代理人）审批。审批通过后方可用印。</span>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setApplyOpen(false)} className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">取消</button>
            <button onClick={handleApply} disabled={!form.reason.trim() || !form.documentName.trim()}
              className="px-5 py-2 text-white bg-primary-800 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">提交申请</button>
          </div>
        </div>
      </Modal>

      {/* Detail modal */}
      <Modal open={!!detailItem} onClose={() => setDetailItem(null)} title="用印申请详情" width="max-w-lg">
        {detailItem && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-gray-500">申请人：</span><span className="font-medium text-gray-800">{detailItem.applicantName}</span></div>
              <div><span className="text-gray-500">申请日期：</span><span className="text-gray-800">{detailItem.applyDate}</span></div>
              <div><span className="text-gray-500">印章类型：</span><span className="text-gray-800">{detailItem.sealType}</span></div>
              <div><span className="text-gray-500">用印份数：</span><span className="text-gray-800">{detailItem.copies} 份</span></div>
              <div className="col-span-2"><span className="text-gray-500">用印文件：</span><span className="text-gray-800">{detailItem.documentName}</span></div>
              {detailItem.caseTitle && <div className="col-span-2"><span className="text-gray-500">关联案件：</span><span className="text-gray-800">{detailItem.caseTitle}</span></div>}
              <div className="col-span-2"><span className="text-gray-500">用印事由：</span><span className="text-gray-800">{detailItem.reason}</span></div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-gray-500 mb-2">审批信息</p>
              {detailItem.status === '待审批' ? (
                <span className="text-amber-600">等待高级合伙人审批...</span>
              ) : (
                <div className="space-y-1">
                  <div><span className="text-gray-500">审批人：</span><span className="text-gray-800">{detailItem.approverName}</span></div>
                  <div><span className="text-gray-500">审批日期：</span><span className="text-gray-800">{detailItem.approveDate}</span></div>
                  <div><span className="text-gray-500">审批结果：</span>
                    <span className={detailItem.status === '已批准' ? 'text-emerald-600 font-medium' : detailItem.status === '已拒绝' ? 'text-red-600 font-medium' : 'text-gray-600'}>{detailItem.status}</span>
                  </div>
                  {detailItem.approveComment && <div><span className="text-gray-500">审批意见：</span><span className="text-gray-800">{detailItem.approveComment}</span></div>}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Approve modal */}
      <Modal open={!!approveItem} onClose={() => setApproveItem(null)} title="审批用印申请" width="max-w-md">
        {approveItem && (
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
              <p><span className="text-gray-500">申请人：</span>{approveItem.applicantName}</p>
              <p><span className="text-gray-500">印章类型：</span>{approveItem.sealType}</p>
              <p><span className="text-gray-500">文件：</span>{approveItem.documentName}（{approveItem.copies}份）</p>
              <p><span className="text-gray-500">事由：</span>{approveItem.reason}</p>
              {approveItem.caseTitle && <p><span className="text-gray-500">关联案件：</span>{approveItem.caseTitle}</p>}
            </div>
            <div>
              <label className="block text-gray-600 mb-1">审批意见</label>
              <textarea value={approveComment} onChange={(e) => setApproveComment(e.target.value)} rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none" placeholder="可选，填写审批意见..." />
            </div>
            {delegatedFrom && (
              <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg text-xs text-blue-600">
                <UserCheck size={14} />
                <span>您将以 <span className="font-semibold">{delegatedFrom.principalName}</span> 代理人身份审批</span>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => handleApprove(false)} className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50">拒绝</button>
              <button onClick={() => handleApprove(true)} className="px-5 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-500">批准</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Proxy management modal */}
      <Modal open={proxyOpen} onClose={() => setProxyOpen(false)} title="印章审批代理人管理" width="max-w-md">
        <div className="space-y-4 text-sm">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-700 text-xs">
            <p className="font-medium mb-1">代理人说明</p>
            <p>作为高级合伙人，您可以指定代理人在指定时间段内代为审批印章申请。代理人审批时将注明"代批"。</p>
          </div>

          {currentProxies.length > 0 && (
            <div>
              <p className="text-gray-600 mb-2">当前代理人</p>
              <div className="space-y-2">
                {currentProxies.map((p) => (
                  <div key={p.proxyId} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-800">{p.proxyName}</span>
                      <span className="text-gray-400 text-xs ml-2">{p.startDate} ~ {p.endDate}</span>
                    </div>
                    <button onClick={() => removeSealProxy(p.principalId, p.proxyId)} className="text-xs text-red-500 hover:text-red-700">撤销</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-3 space-y-3">
            <p className="text-gray-600">添加代理人</p>
            <div>
              <label className="block text-gray-500 mb-1">选择代理人</label>
              <select value={proxyTargetId} onChange={(e) => setProxyTargetId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                <option value="">请选择...</option>
                {proxyCandidates.map((l) => <option key={l.id} value={l.id}>{l.name}（{l.title}）</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-500 mb-1">开始日期</label>
                <input type="date" value={proxyStart} onChange={(e) => setProxyStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">结束日期</label>
                <input type="date" value={proxyEnd} onChange={(e) => setProxyEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              </div>
            </div>
            <button onClick={handleAddProxy} disabled={!proxyTargetId || !proxyStart || !proxyEnd}
              className="w-full py-2 text-sm text-white bg-primary-800 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">确认授权</button>
          </div>
        </div>
      </Modal>
    </>
  )
}
