import { useState, useMemo } from 'react'
import Header from '../components/Header'
import Modal from '../components/Modal'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/useAuthStore'
import type { ApprovalFlow, ApprovalType } from '../types'
import { CheckSquare, Eye, Check, X, Clock, CheckCircle, XCircle, Filter, ArrowRight } from 'lucide-react'

const approvalTypes: ApprovalType[] = ['收案审批', '用印审批', '发票审批', '费用审批']

const typeBadgeColors: Record<ApprovalType, string> = {
  '收案审批': 'bg-blue-50 text-blue-700 border-blue-200',
  '用印审批': 'bg-purple-50 text-purple-700 border-purple-200',
  '发票审批': 'bg-amber-50 text-amber-700 border-amber-200',
  '费用审批': 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const statusConfig = {
  '审批中': { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  '已通过': { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  '已拒绝': { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  '已撤回': { color: 'bg-gray-50 text-gray-600 border-gray-200', icon: X },
}

type Tab = '待我审批' | '我发起的' | '全部'

export default function ApprovalCenter() {
  const { currentUser } = useAuthStore()
  const { approvalFlows, updateApprovalFlow } = useStore()

  const [activeTab, setActiveTab] = useState<Tab>('待我审批')
  const [typeFilter, setTypeFilter] = useState<ApprovalType | ''>('')
  const [detailItem, setDetailItem] = useState<ApprovalFlow | null>(null)
  const [approveComment, setApproveComment] = useState('')

  const isAdmin = currentUser?.role === 'admin'

  const pendingForMe = useMemo(
    () =>
      approvalFlows.filter(
        (f) =>
          f.status === '审批中' &&
          f.steps[f.currentStep - 1]?.approverId === currentUser?.id &&
          f.steps[f.currentStep - 1]?.status === '待审批'
      ),
    [approvalFlows, currentUser?.id]
  )

  const myApplications = useMemo(
    () => approvalFlows.filter((f) => f.applicantId === currentUser?.id),
    [approvalFlows, currentUser?.id]
  )

  const approvedToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return approvalFlows.filter(
      (f) =>
        f.status === '已通过' &&
        f.steps.some((s) => s.processDate === today && s.status === '已通过')
    ).length
  }, [approvalFlows])

  const filteredFlows = useMemo(() => {
    let list: ApprovalFlow[]
    switch (activeTab) {
      case '待我审批':
        list = pendingForMe
        break
      case '我发起的':
        list = myApplications
        break
      default:
        list = approvalFlows
    }
    if (typeFilter) list = list.filter((f) => f.type === typeFilter)
    return list
  }, [activeTab, typeFilter, pendingForMe, myApplications, approvalFlows])

  const canApproveItem = (flow: ApprovalFlow) => {
    if (flow.status !== '审批中') return false
    const step = flow.steps[flow.currentStep - 1]
    return step?.approverId === currentUser?.id && step?.status === '待审批'
  }

  const handleApprove = (flow: ApprovalFlow, approved: boolean) => {
    const stepIndex = flow.currentStep - 1
    const step = flow.steps[stepIndex]
    if (!step || step.approverId !== currentUser?.id) return

    const updatedSteps = flow.steps.map((s, i) =>
      i === stepIndex
        ? {
            ...s,
            status: approved ? ('已通过' as const) : ('已拒绝' as const),
            comment: approveComment || (approved ? '同意' : '不同意'),
            processDate: new Date().toISOString().slice(0, 10),
          }
        : s
    )

    let newStatus = flow.status
    let newCurrentStep = flow.currentStep

    if (!approved) {
      newStatus = '已拒绝'
    } else if (flow.currentStep < flow.steps.length) {
      newCurrentStep = flow.currentStep + 1
    } else {
      newStatus = '已通过'
    }

    updateApprovalFlow(flow.id, {
      steps: updatedSteps,
      status: newStatus,
      currentStep: newCurrentStep,
    })

    setDetailItem(null)
    setApproveComment('')
  }

  const tabs: { key: Tab; label: string; show: boolean }[] = [
    { key: '待我审批', label: '待我审批', show: true },
    { key: '我发起的', label: '我发起的', show: true },
    { key: '全部', label: '全部', show: !!isAdmin },
  ]

  return (
    <>
      <Header title="审批中心" subtitle="统一管理各类审批流程" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {tabs
              .filter((t) => t.show)
              .map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === t.key
                      ? 'bg-white text-primary-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.label}
                  {t.key === '待我审批' && pendingForMe.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                      {pendingForMe.length}
                    </span>
                  )}
                </button>
              ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-xl">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingForMe.length}</p>
              <p className="text-xs text-gray-500">待我审批</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <CheckCircle size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvedToday}</p>
              <p className="text-xs text-gray-500">今日已通过</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <CheckSquare size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvalFlows.length}</p>
              <p className="text-xs text-gray-500">审批总数</p>
            </div>
          </div>
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <button
            onClick={() => setTypeFilter('')}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              !typeFilter
                ? 'bg-primary-800 text-white border-primary-800'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            全部类型
          </button>
          {approvalTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                typeFilter === t
                  ? 'bg-primary-800 text-white border-primary-800'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Approval list */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">类型</th>
                  <th className="px-4 py-3 font-medium">审批标题</th>
                  <th className="px-4 py-3 font-medium">申请人</th>
                  <th className="px-4 py-3 font-medium">申请日期</th>
                  <th className="px-4 py-3 font-medium">当前步骤</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredFlows.map((flow) => {
                  const cfg = statusConfig[flow.status]
                  const StatusIcon = cfg.icon
                  const currentStepInfo = flow.steps[flow.currentStep - 1]
                  return (
                    <tr key={flow.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${typeBadgeColors[flow.type]}`}
                        >
                          {flow.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-medium max-w-[240px] truncate">
                        {flow.title}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{flow.applicantName}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {flow.applyDate}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {flow.status === '审批中' && currentStepInfo ? (
                          <span className="flex items-center gap-1">
                            第{flow.currentStep}步 ·{' '}
                            <span className="font-medium">{currentStepInfo.approverName}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}
                        >
                          <StatusIcon size={12} />
                          {flow.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setApproveComment('')
                              setDetailItem(flow)
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="查看详情"
                          >
                            <Eye size={16} />
                          </button>
                          {canApproveItem(flow) && (
                            <>
                              <button
                                onClick={() => {
                                  setApproveComment('')
                                  setDetailItem(flow)
                                }}
                                className="p-1.5 rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                title="审批"
                              >
                                <Check size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredFlows.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">暂无审批记录</div>
          )}
        </div>
      </div>

      {/* Detail / Approve modal */}
      <Modal
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        title="审批详情"
        width="max-w-2xl"
      >
        {detailItem && (
          <div className="space-y-5 text-sm">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl">
              <div>
                <span className="text-gray-500">审批类型：</span>
                <span
                  className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ml-1 ${typeBadgeColors[detailItem.type]}`}
                >
                  {detailItem.type}
                </span>
              </div>
              <div>
                <span className="text-gray-500">状态：</span>
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ml-1 ${statusConfig[detailItem.status].color}`}
                >
                  {(() => {
                    const Icon = statusConfig[detailItem.status].icon
                    return <Icon size={12} />
                  })()}
                  {detailItem.status}
                </span>
              </div>
              <div>
                <span className="text-gray-500">申请人：</span>
                <span className="font-medium text-gray-800">{detailItem.applicantName}</span>
              </div>
              <div>
                <span className="text-gray-500">申请日期：</span>
                <span className="text-gray-800">{detailItem.applyDate}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">标题：</span>
                <span className="font-medium text-gray-800">{detailItem.title}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">详情：</span>
                <span className="text-gray-800">{detailItem.detail}</span>
              </div>
            </div>

            {/* Step timeline */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4">审批流程</h4>

              {/* Horizontal step indicator */}
              <div className="flex items-center justify-center mb-6 px-4">
                {detailItem.steps.map((step, i) => {
                  const isPassed = step.status === '已通过'
                  const isRejected = step.status === '已拒绝'
                  const isCurrent =
                    detailItem.status === '审批中' &&
                    i === detailItem.currentStep - 1 &&
                    step.status === '待审批'
                  const isPending = step.status === '待审批' && !isCurrent

                  let circleClass = 'bg-gray-200 text-gray-500'
                  if (isPassed) circleClass = 'bg-emerald-500 text-white'
                  else if (isRejected) circleClass = 'bg-red-500 text-white'
                  else if (isCurrent) circleClass = 'bg-amber-400 text-white ring-4 ring-amber-100'

                  let lineClass = 'bg-gray-200'
                  if (isPassed) lineClass = 'bg-emerald-400'
                  else if (isRejected) lineClass = 'bg-red-300'

                  return (
                    <div key={step.order} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${circleClass} transition-all`}
                        >
                          {isPassed ? (
                            <Check size={16} />
                          ) : isRejected ? (
                            <X size={16} />
                          ) : (
                            step.order
                          )}
                        </div>
                        <span
                          className={`mt-1.5 text-xs whitespace-nowrap ${
                            isCurrent
                              ? 'text-amber-600 font-semibold'
                              : isPassed
                                ? 'text-emerald-600'
                                : isRejected
                                  ? 'text-red-600'
                                  : 'text-gray-400'
                          }`}
                        >
                          {step.approverName}
                        </span>
                      </div>
                      {i < detailItem.steps.length - 1 && (
                        <div className="flex items-center mx-2 -mt-5">
                          <div className={`w-16 h-0.5 ${lineClass} transition-all`} />
                          <ArrowRight
                            size={12}
                            className={
                              isPassed && detailItem.steps[i + 1]?.status !== '待审批'
                                ? 'text-emerald-400 -ml-1'
                                : 'text-gray-300 -ml-1'
                            }
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Step details list */}
              <div className="space-y-3">
                {detailItem.steps.map((step) => {
                  const isPassed = step.status === '已通过'
                  const isRejected = step.status === '已拒绝'
                  const isCurrent =
                    detailItem.status === '审批中' &&
                    step.order === detailItem.currentStep &&
                    step.status === '待审批'

                  return (
                    <div
                      key={step.order}
                      className={`flex items-start gap-3 p-3 rounded-xl border ${
                        isCurrent
                          ? 'border-amber-200 bg-amber-50/50'
                          : isPassed
                            ? 'border-emerald-100 bg-emerald-50/30'
                            : isRejected
                              ? 'border-red-100 bg-red-50/30'
                              : 'border-gray-100 bg-gray-50/50'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isPassed
                            ? 'bg-emerald-100 text-emerald-600'
                            : isRejected
                              ? 'bg-red-100 text-red-600'
                              : isCurrent
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isPassed ? (
                          <CheckCircle size={14} />
                        ) : isRejected ? (
                          <XCircle size={14} />
                        ) : (
                          <Clock size={14} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">
                            第{step.order}步 · {step.approverName}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              isPassed
                                ? 'bg-emerald-100 text-emerald-700'
                                : isRejected
                                  ? 'bg-red-100 text-red-700'
                                  : isCurrent
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {step.status}
                          </span>
                        </div>
                        {step.comment && (
                          <p className="text-gray-600 mt-1">审批意见：{step.comment}</p>
                        )}
                        {step.processDate && (
                          <p className="text-gray-400 text-xs mt-1">
                            处理时间：{step.processDate}
                          </p>
                        )}
                        {isCurrent && (
                          <p className="text-amber-600 text-xs mt-1 font-medium">等待审批中...</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Approve / reject actions */}
            {canApproveItem(detailItem) && (
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div>
                  <label className="block text-gray-600 mb-1">审批意见</label>
                  <textarea
                    value={approveComment}
                    onChange={(e) => setApproveComment(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none text-sm"
                    placeholder="可选，填写审批意见..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleApprove(detailItem, false)}
                    className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <XCircle size={16} />
                      拒绝
                    </span>
                  </button>
                  <button
                    onClick={() => handleApprove(detailItem, true)}
                    className="px-5 py-2 text-white bg-primary-800 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <CheckCircle size={16} />
                      通过
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
