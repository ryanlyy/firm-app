import { useState } from 'react'
import Header from '../components/Header'
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react'

interface Section {
  title: string
  content: string[]
}

const sections: Section[] = [
  {
    title: '1. 系统概述',
    content: [
      '山东云根律师事务所业务管理系统是一套基于 Web 的综合管理平台，涵盖案件管理、客户管理、律师团队、财务管理、日程安排、文档管理等核心业务模块。',
      '系统采用角色权限机制：管理员（高级合伙人、合伙人）可查看和管理全部数据；普通律师（执业律师、实习律师）仅可查看自己经手的案件及关联数据。',
      '技术栈：React 19 + TypeScript + Vite + Tailwind CSS v4 + Zustand + React Router + Recharts。',
    ],
  },
  {
    title: '2. 登录与密码管理',
    content: [
      '【登录】在登录页面选择您的账号，输入密码后登录。首次登录默认密码为 123456。',
      '【首次修改密码】所有用户首次登录后系统会强制跳转到"修改密码"页面，必须设置新密码后才能进入系统。新密码不少于6位且不能与原密码相同。',
      '【密码过期】系统默认每 45 天要求修改一次密码（管理员可配置）。密码过期后登录将强制进入修改密码页面。',
      '【主动修改密码】侧边栏底部"修改密码"入口可随时主动修改密码。',
      '【密码策略设置】管理员可通过侧边栏"密码策略"按钮配置密码有效期天数（1～365天）。',
    ],
  },
  {
    title: '3. 工作台（Dashboard）',
    content: [
      '登录后默认进入工作台页面，展示当前用户权限范围内的关键业务指标。',
      '【KPI卡片】显示活跃案件数、客户总数、已收款项和待收款项。普通律师仅显示自己的数据。',
      '【图表区域】案件状态分布（饼图）和案件类型统计（柱状图），直观展示业务结构。',
      '【进行中案件列表】展示正在处理的案件，含案号、名称、负责律师、优先级和下次开庭日期。',
      '【近期日程】显示未来即将到来的开庭、会议、截止日期等日程。',
      '【团队负载】（仅管理员）展示全所律师的在办案件数量。',
    ],
  },
  {
    title: '4. 案件管理',
    content: [
      '管理案件的完整生命周期，支持新建、编辑、查看详情和删除。',
      '【案件列表】以表格形式展示案件信息，支持按关键字搜索和按状态（待受理/进行中/已结案/已归档）筛选。',
      '【新建案件】（仅管理员）点击"新建案件"按钮，填写案号、名称、类型、委托人、负责律师、受理法院、代理费等信息。',
      '【查看详情】点击行内"眼睛"图标查看案件完整信息。',
      '【编辑/删除】（仅管理员）点击编辑或删除图标操作。普通律师仅可查看。',
      '【权限过滤】普通律师仅可看到自己负责的案件。',
    ],
  },
  {
    title: '5. 客户管理',
    content: [
      '管理律所的个人和企业客户信息。',
      '【客户卡片】以卡片形式展示客户信息，支持搜索和按类型筛选。',
      '【客户详情】查看客户完整信息及关联案件列表。',
      '【新增/编辑/删除】（仅管理员）管理客户信息。',
      '【权限过滤】普通律师仅可查看自己案件关联的客户。',
    ],
  },
  {
    title: '6. 律师团队（仅管理员）',
    content: [
      '管理律所律师的档案信息，仅管理员可访问。',
      '【律师卡片】展示姓名、职级、联系方式、执业证号、专业领域和在办案件数。',
      '【添加/编辑律师】支持设置姓名、职级、系统角色（管理员/普通律师）、登录密码、专业领域等。',
      '【律师详情】查看完整信息及该律师负责的所有案件。',
    ],
  },
  {
    title: '7. 财务管理（仅管理员）',
    content: [
      '管理律所的账单与收款情况，仅管理员可访问。',
      '【统计卡片】显示合同总额、已收款、待收款、逾期金额。',
      '【收款分布图】柱状图展示各状态的金额分布。',
      '【账单列表】展示全部账单，支持按状态筛选和关键字搜索。',
      '【账单详情】查看账单的费用明细、已付/待收金额。',
    ],
  },
  {
    title: '8. 日程安排',
    content: [
      '以月历视图管理开庭、会议、截止日期、咨询和调解等日程事件。',
      '【月历视图】按月展示日程，不同类型事件以不同颜色标记。点击事件可查看详情。',
      '【即将到来】右侧面板展示近期待办日程。',
      '【新建日程】点击"新建日程"按钮，设置标题、日期、时间、类型、关联案件和地点。',
      '【权限过滤】普通律师可见自己案件关联的日程及无关联案件的公共日程。',
    ],
  },
  {
    title: '9. 文档管理',
    content: [
      '管理律所的各类法律文档，支持分类统计和筛选。',
      '【分类统计】顶部展示各文档类型的数量，点击可快速筛选。',
      '【文档列表】展示文件名、类型、关联案件、上传日期、大小和上传人。',
      '【上传/删除】通过"上传文档"按钮录入新文档信息。',
      '【权限过滤】普通律师仅可查看自己案件关联的文档。',
    ],
  },
  {
    title: '10. 数据备份与恢复',
    content: [
      '系统提供自动和手动两种备份方式，确保数据安全。',
      '【自动备份】系统按设定间隔（默认24小时）自动备份数据到浏览器本地存储，最多保留10份。',
      '【手动备份】点击"立即备份"按钮可随时创建手动备份。',
      '【导出备份文件】将全量数据导出为 JSON 文件下载到本地，可作为外部备份存储。',
      '【从文件恢复】上传之前导出的 JSON 备份文件，确认后恢复数据。系统会在恢复前自动创建当前数据的备份。',
      '【从历史恢复】在备份历史列表中点击"恢复"按钮，可将数据回滚到该备份时间点。',
      '【备份间隔配置】（仅管理员）可配置自动备份间隔（1～720小时）。',
      '注意：备份数据存储在浏览器 localStorage 中，清除浏览器数据会导致备份丢失。建议定期导出备份文件到本地磁盘。',
    ],
  },
  {
    title: '11. 系统部署说明',
    content: [
      '【开发环境】运行 npm run dev 启动开发服务器，默认端口 5173。',
      '【生产构建】运行 npm run build 生成 dist/ 目录，包含所有静态文件。',
      '【部署方式】将 dist/ 目录部署到任意静态文件服务器（Nginx、Apache、Caddy 等）或 CDN。',
      '【注意事项】本系统为纯前端单页应用（SPA），服务器需配置所有路由回退到 index.html。',
      '详细部署流程请参阅项目根目录下的 DEPLOY.md 文件。',
    ],
  },
]

export default function Manual() {
  const [expandedIdx, setExpandedIdx] = useState<Set<number>>(new Set([0]))

  const toggle = (idx: number) => {
    setExpandedIdx((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const expandAll = () => setExpandedIdx(new Set(sections.map((_, i) => i)))
  const collapseAll = () => setExpandedIdx(new Set())

  return (
    <>
      <Header title="系统使用手册" subtitle="山东云根律师事务所业务管理系统 v1.0" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary-700">
              <BookOpen size={20} />
              <span className="text-sm font-medium">共 {sections.length} 章节</span>
            </div>
            <div className="flex gap-2">
              <button onClick={expandAll} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">全部展开</button>
              <button onClick={collapseAll} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">全部折叠</button>
            </div>
          </div>

          {sections.map((sec, i) => {
            const isOpen = expandedIdx.has(i)
            return (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50/60 transition-colors"
                >
                  {isOpen ? <ChevronDown size={18} className="text-primary-500 shrink-0" /> : <ChevronRight size={18} className="text-gray-400 shrink-0" />}
                  <h3 className={`text-sm font-semibold ${isOpen ? 'text-primary-800' : 'text-gray-700'}`}>{sec.title}</h3>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pl-12 space-y-2.5">
                    {sec.content.map((line, j) => {
                      const hasBracket = line.startsWith('【')
                      return (
                        <p key={j} className="text-sm text-gray-600 leading-relaxed">
                          {hasBracket ? (
                            <>
                              <span className="font-medium text-gray-800">{line.slice(0, line.indexOf('】') + 1)}</span>
                              {line.slice(line.indexOf('】') + 1)}
                            </>
                          ) : line}
                        </p>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
