import { useState, useMemo } from 'react'
import Header from '../components/Header'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/useAuthStore'
import { Search, AlertTriangle, CheckCircle, Info, ShieldAlert, User, Building2, FileText } from 'lucide-react'

interface ConflictResult {
  type: 'client' | 'opponent' | 'case'
  severity: 'high' | 'medium' | 'info'
  title: string
  detail: string
  caseNumber?: string
  lawyerName?: string
  clientName?: string
}

export default function ConflictCheck() {
  const { cases, clients } = useStore()
  const { currentUser } = useAuthStore()
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(false)

  const results = useMemo<ConflictResult[]>(() => {
    if (!query.trim()) return []
    const q = query.trim().toLowerCase()

    const found: ConflictResult[] = []

    // Check against existing clients
    clients.forEach((client) => {
      if (client.name.toLowerCase().includes(q) || client.contact.toLowerCase().includes(q) || client.idNumber.includes(q)) {
        const relatedCases = cases.filter((c) => c.clientId === client.id)
        if (relatedCases.length > 0) {
          relatedCases.forEach((rc) => {
            found.push({
              type: 'client',
              severity: rc.status === '进行中' || rc.status === '待受理' ? 'high' : 'medium',
              title: `"${client.name}" 是本所现有客户`,
              detail: `该当事人作为委托人参与案件"${rc.title}"（${rc.caseNumber}），负责律师：${rc.lawyerName}，案件状态：${rc.status}`,
              caseNumber: rc.caseNumber,
              lawyerName: rc.lawyerName,
              clientName: client.name,
            })
          })
        } else {
          found.push({
            type: 'client',
            severity: 'info',
            title: `"${client.name}" 是本所客户（无在办案件）`,
            detail: `该当事人在本所客户库中，但目前无关联案件。`,
            clientName: client.name,
          })
        }
      }
    })

    // Check against case titles, opponents (from case description and title)
    cases.forEach((c) => {
      const inTitle = c.title.toLowerCase().includes(q)
      const inDesc = c.description.toLowerCase().includes(q)
      const inCourt = c.courtName.toLowerCase().includes(q)

      if (inTitle || inDesc) {
        const alreadyByClient = found.some((f) => f.caseNumber === c.caseNumber && f.type === 'client')
        if (!alreadyByClient) {
          found.push({
            type: 'case',
            severity: c.status === '进行中' || c.status === '待受理' ? 'high' : 'medium',
            title: `案件信息中包含"${query.trim()}"`,
            detail: `案件"${c.title}"（${c.caseNumber}）中出现相关信息。委托人：${c.clientName}，律师：${c.lawyerName}，状态：${c.status}`,
            caseNumber: c.caseNumber,
            lawyerName: c.lawyerName,
            clientName: c.clientName,
          })
        }
      }

      // Check against explicit opponentName field
      if (c.opponentName && c.opponentName.toLowerCase().includes(q)) {
        found.push({
          type: 'opponent',
          severity: c.status === '进行中' || c.status === '待受理' ? 'high' : 'medium',
          title: `"${query.trim()}" 是案件对方当事人`,
          detail: `在案件"${c.title}"（${c.caseNumber}）中，对方当事人为"${c.opponentName}"。本所代理委托人：${c.clientName}，律师：${c.lawyerName}，状态：${c.status}`,
          caseNumber: c.caseNumber,
          lawyerName: c.lawyerName,
          clientName: c.clientName,
        })
      } else {
        // Fallback: parse from title pattern
        const vsMatch = c.title.match(/(?:诉|与|v\.?\s*|vs\.?\s*)(.+?)(?:案|纠纷|争议|$)/i)
        if (vsMatch) {
          const opponent = vsMatch[1].trim()
          if (opponent.toLowerCase().includes(q)) {
            found.push({
              type: 'opponent',
              severity: 'high',
              title: `"${query.trim()}" 可能是案件对方当事人`,
              detail: `在案件"${c.title}"（${c.caseNumber}）中，"${opponent}" 疑似对方当事人。本所代理委托人：${c.clientName}，律师：${c.lawyerName}`,
              caseNumber: c.caseNumber,
              lawyerName: c.lawyerName,
              clientName: c.clientName,
            })
          }
        }
      }
    })

    return found
  }, [query, cases, clients])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearched(true)
  }

  const severityConfig = {
    high: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, iconColor: 'text-red-500', badge: 'bg-red-100 text-red-700', label: '高风险' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', icon: ShieldAlert, iconColor: 'text-amber-500', badge: 'bg-amber-100 text-amber-700', label: '需关注' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Info, iconColor: 'text-blue-500', badge: 'bg-blue-100 text-blue-700', label: '信息' },
  }

  return (
    <>
      <Header title="利益冲突查询" subtitle="新案受理前利冲审查" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Search */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-start gap-3 mb-5 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium mb-1">利冲查询说明</p>
                <p>在受理新案件之前，请输入当事人姓名（或公司名称、身份证号等关键信息），系统将自动检索本所现有客户、案件及对方当事人信息，判断是否存在利益冲突。</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSearched(false) }}
                  placeholder="输入当事人名称、公司名称或身份证号..."
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
                />
              </div>
              <button type="submit" className="px-6 py-3 bg-primary-800 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors shrink-0">
                查询
              </button>
            </form>
          </div>

          {/* Results */}
          {searched && query.trim() && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">
                  查询结果
                  <span className="text-gray-400 font-normal ml-2">
                    关键词："{query.trim()}" · 查询人：{currentUser?.name} · {new Date().toLocaleString('zh-CN')}
                  </span>
                </h3>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${results.length > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {results.length > 0 ? `发现 ${results.length} 条潜在冲突` : '未发现冲突'}
                </span>
              </div>

              {results.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                  <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-800 mb-1">未发现利益冲突</h4>
                  <p className="text-sm text-gray-500">在本所现有客户和案件中未检索到与 "{query.trim()}" 相关的利冲信息。</p>
                  <p className="text-xs text-gray-400 mt-3">建议：结果仅基于系统已有数据，请结合实际情况综合判断。</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((r, i) => {
                    const cfg = severityConfig[r.severity]
                    const Icon = cfg.icon
                    return (
                      <div key={i} className={`${cfg.bg} rounded-xl border ${cfg.border} p-4`}>
                        <div className="flex items-start gap-3">
                          <Icon size={20} className={`${cfg.iconColor} shrink-0 mt-0.5`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>{cfg.label}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                {r.type === 'client' ? '现有客户匹配' : r.type === 'opponent' ? '对方当事人匹配' : '案件信息匹配'}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-800 text-sm">{r.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{r.detail}</p>
                            <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                              {r.clientName && (
                                <span className="flex items-center gap-1">
                                  {r.type === 'client' ? <User size={12} /> : <Building2 size={12} />}
                                  {r.clientName}
                                </span>
                              )}
                              {r.caseNumber && (
                                <span className="flex items-center gap-1">
                                  <FileText size={12} />
                                  {r.caseNumber}
                                </span>
                              )}
                              {r.lawyerName && (
                                <span className="flex items-center gap-1">
                                  <User size={12} />
                                  负责律师：{r.lawyerName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-start gap-3">
                      <Info size={18} className="text-gray-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-gray-500 space-y-1">
                        <p className="font-medium text-gray-600">利冲查询提示</p>
                        <p>1. 高风险：查询对象是本所正在代理案件的当事人或对方当事人，存在明确利益冲突，原则上不应受理。</p>
                        <p>2. 需关注：查询对象出现在已结案/已归档案件中，需进一步评估是否构成利冲。</p>
                        <p>3. 信息：仅在客户库中匹配到，无案件关联，风险较低但仍需注意。</p>
                        <p>4. 本查询结果仅供参考，最终利冲判定需由合伙人审批确认。</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
