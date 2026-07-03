import Header from '../components/Header'
import StatsCard from '../components/StatsCard'
import StatusBadge from '../components/StatusBadge'
import { useStore } from '../store/useStore'
import { usePermissions } from '../hooks/usePermissions'
import { Briefcase, Users, DollarSign, Scale, TrendingUp, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#6b7280']
const TYPE_COLORS = ['#3b82f6', '#ef4444', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#84cc16']

export default function Dashboard() {
  const { lawyers } = useStore()
  const { cases, clients, invoices, events, isAdmin, currentUser } = usePermissions()

  const activeCases = cases.filter((c) => c.status === '进行中').length
  const totalRevenue = invoices.reduce((s, i) => s + i.paidAmount, 0)
  const pendingAmount = invoices.reduce((s, i) => s + (i.amount - i.paidAmount), 0)

  const statusData = [
    { name: '待受理', value: cases.filter((c) => c.status === '待受理').length },
    { name: '进行中', value: cases.filter((c) => c.status === '进行中').length },
    { name: '已结案', value: cases.filter((c) => c.status === '已结案').length },
    { name: '已归档', value: cases.filter((c) => c.status === '已归档').length },
  ]

  const typeCount = new Map<string, number>()
  cases.forEach((c) => typeCount.set(c.type, (typeCount.get(c.type) || 0) + 1))
  const typeData = Array.from(typeCount.entries()).map(([name, value]) => ({ name, value }))

  const upcomingEvents = [...events]
    .filter((e) => e.date >= '2026-04-25')
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 6)

  const recentCases = [...cases]
    .filter((c) => c.status === '进行中')
    .sort((a, b) => b.filingDate.localeCompare(a.filingDate))
    .slice(0, 5)

  const greeting = `欢迎回来，${currentUser?.name}，今天是 ${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}`

  return (
    <>
      <Header title="工作台" subtitle={greeting} />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {!isAdmin && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
            当前以 <span className="font-semibold">{currentUser?.name}</span>（{currentUser?.title}）身份登录，仅显示您经手的案件及相关数据。
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard title={isAdmin ? '活跃案件' : '我的活跃案件'} value={activeCases} subtitle={`共 ${cases.length} 件`} icon={Briefcase} color="blue" />
          <StatsCard title={isAdmin ? '客户总数' : '我的客户'} value={clients.length} subtitle="企业 & 个人" icon={Users} color="green" />
          <StatsCard title="已收款项" value={`¥${(totalRevenue / 10000).toFixed(1)}万`} subtitle={isAdmin ? '全所累计' : '我的案件'} icon={DollarSign} color="amber" />
          <StatsCard title="待收款项" value={`¥${(pendingAmount / 10000).toFixed(1)}万`} subtitle="含逾期账单" icon={TrendingUp} color="red" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">案件状态分布</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">案件类型统计</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={typeData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                  {typeData.map((_, i) => (
                    <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">{isAdmin ? '进行中的案件' : '我的进行中案件'}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">案号</th>
                    <th className="pb-3 font-medium">案件名称</th>
                    <th className="pb-3 font-medium">负责律师</th>
                    <th className="pb-3 font-medium">优先级</th>
                    <th className="pb-3 font-medium">下次开庭</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentCases.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/60">
                      <td className="py-3 text-xs text-gray-500 font-mono">{c.caseNumber.slice(0, 20)}</td>
                      <td className="py-3 font-medium text-gray-800 max-w-[200px] truncate">{c.title}</td>
                      <td className="py-3 text-gray-600">{c.lawyerName}</td>
                      <td className="py-3"><StatusBadge status={c.priority} /></td>
                      <td className="py-3 text-gray-600">{c.nextHearingDate || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">近期日程</h3>
            <div className="space-y-3">
              {upcomingEvents.map((e) => (
                <div key={e.id} className="flex gap-3 p-3 rounded-lg bg-gray-50/80 hover:bg-gray-100/80 transition-colors">
                  <div className="flex flex-col items-center justify-center min-w-[44px] text-center">
                    <span className="text-xs text-gray-500">{e.date.slice(5, 7)}月</span>
                    <span className="text-lg font-bold text-primary-800">{e.date.slice(8)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{e.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={e.type} />
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} /> {e.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">律师团队工作负载</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {lawyers.map((l) => (
                <div key={l.id} className="flex flex-col items-center p-4 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center text-lg font-bold">
                    {l.name[0]}
                  </div>
                  <p className="mt-2 font-medium text-sm text-gray-800">{l.name}</p>
                  <p className="text-xs text-gray-500">{l.title}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <Scale size={14} className="text-primary-500" />
                    <span className="text-sm font-semibold text-primary-700">{l.activeCases}</span>
                    <span className="text-xs text-gray-400">件</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
