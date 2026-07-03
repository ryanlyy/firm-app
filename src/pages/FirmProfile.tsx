import { useState } from 'react'
import Header from '../components/Header'
import { useStore } from '../store/useStore'
import { Building2, Award, Phone, Mail, MapPin, Briefcase, ChevronDown, ChevronRight, Users, Scale } from 'lucide-react'

const firmInfo = {
  name: '山东云根律师事务所',
  nameEn: 'Shandong Yungen Law Firm',
  founded: '2010年3月',
  license: '鲁司律字第0001号',
  address: '山东省济南市历下区经十路12345号云根大厦18层',
  phone: '0531-8888-6666',
  fax: '0531-8888-6667',
  email: 'contact@sdyungen.com',
  website: 'www.sdyungen.com',
  intro: [
    '山东云根律师事务所成立于2010年，是经山东省司法厅批准设立的综合性律师事务所。本所秉承"根植法治、服务社会"的宗旨，致力于为客户提供全方位、高质量的法律服务。',
    '本所拥有一支高素质、专业化的律师团队，业务涵盖商事仲裁、公司法务、知识产权、合同纠纷、刑事辩护、劳动争议、婚姻家庭、行政诉讼等多个领域。多年来，本所承办了大量疑难复杂案件，积累了丰富的实务经验，赢得了广大客户的高度认可。',
    '本所注重专业化发展，建立了完善的案件质量管理体系和风险控制机制。同时，本所积极参与法律援助、公益活动和法治宣传，勇于承担社会责任，多次获得上级主管部门和行业协会的表彰。',
  ],
  honors: [
    '山东省优秀律师事务所（2018年）',
    '济南市十佳律师事务所（2020年）',
    '山东省律师协会先进集体（2022年）',
    '全国法律援助先进单位（2023年）',
    '济南市营商环境法律服务先进单位（2024年）',
  ],
  areas: ['商事仲裁', '公司法务', '知识产权', '合同纠纷', '刑事辩护', '劳动争议', '婚姻家庭', '行政诉讼', '房地产与建工', '投融资与并购'],
}

export default function FirmProfile() {
  const { lawyers, cases } = useStore()
  const [expandedLawyer, setExpandedLawyer] = useState<string | null>(null)

  const getLawyerCases = (lawyerId: string) => cases.filter((c) => c.lawyerId === lawyerId)

  return (
    <>
      <Header title="律所与律师简介" subtitle="山东云根律师事务所" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Firm overview card */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-800 to-primary-700 px-6 py-8 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-accent-500 flex items-center justify-center text-primary-900 text-3xl font-bold shrink-0">
                  云
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{firmInfo.name}</h2>
                  <p className="text-primary-200 text-sm mt-1">{firmInfo.nameEn}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <Building2 size={16} className="text-gray-400 shrink-0" />
                  <span className="text-gray-500">成立时间：</span>
                  <span className="text-gray-800 font-medium">{firmInfo.founded}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Award size={16} className="text-gray-400 shrink-0" />
                  <span className="text-gray-500">执业许可证：</span>
                  <span className="text-gray-800 font-medium">{firmInfo.license}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin size={16} className="text-gray-400 shrink-0" />
                  <span className="text-gray-500">地址：</span>
                  <span className="text-gray-800 font-medium">{firmInfo.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-gray-400 shrink-0" />
                  <span className="text-gray-500">电话：</span>
                  <span className="text-gray-800 font-medium">{firmInfo.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-gray-400 shrink-0" />
                  <span className="text-gray-500">邮箱：</span>
                  <span className="text-gray-800 font-medium">{firmInfo.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Scale size={16} className="text-gray-400 shrink-0" />
                  <span className="text-gray-500">律师人数：</span>
                  <span className="text-gray-800 font-medium">{lawyers.length} 人</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">律所简介</h3>
                <div className="space-y-2">
                  {firmInfo.intro.map((p, i) => (
                    <p key={i} className="text-sm text-gray-600 leading-relaxed indent-8">{p}</p>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">业务领域</h3>
                <div className="flex flex-wrap gap-2">
                  {firmInfo.areas.map((area) => (
                    <span key={area} className="px-3 py-1.5 text-xs bg-primary-50 text-primary-700 rounded-full border border-primary-200">{area}</span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">荣誉资质</h3>
                <div className="space-y-2">
                  {firmInfo.honors.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Award size={14} className="text-accent-500 shrink-0" />
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lawyer team */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
              <Users size={18} className="text-primary-600" />
              <h3 className="text-sm font-semibold text-gray-800">律师团队</h3>
              <span className="text-xs text-gray-400">（{lawyers.length}人）</span>
            </div>
            <div className="divide-y divide-gray-50">
              {lawyers.map((lawyer) => {
                const isOpen = expandedLawyer === lawyer.id
                const lCases = getLawyerCases(lawyer.id)
                const titleColor: Record<string, string> = {
                  '高级合伙人': 'bg-amber-50 text-amber-700 border-amber-200',
                  '合伙人': 'bg-purple-50 text-purple-700 border-purple-200',
                  '执业律师': 'bg-blue-50 text-blue-700 border-blue-200',
                  '实习律师': 'bg-gray-50 text-gray-600 border-gray-200',
                }
                return (
                  <div key={lawyer.id}>
                    <button onClick={() => setExpandedLawyer(isOpen ? null : lawyer.id)} className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50/60 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center text-lg font-bold shrink-0">
                        {lawyer.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{lawyer.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${titleColor[lawyer.title] || ''}`}>{lawyer.title}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{lawyer.specialization.join(' / ')}</p>
                      </div>
                      <div className="text-xs text-gray-400 hidden sm:block">在办案件 {lCases.filter((c) => c.status === '进行中').length} 件</div>
                      {isOpen ? <ChevronDown size={16} className="text-gray-400 shrink-0" /> : <ChevronRight size={16} className="text-gray-400 shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pl-[4.75rem] space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div><span className="text-gray-500">执业证号：</span><span className="text-gray-700">{lawyer.barNumber}</span></div>
                          <div><span className="text-gray-500">入所日期：</span><span className="text-gray-700">{lawyer.joinDate}</span></div>
                          <div><span className="text-gray-500">电话：</span><span className="text-gray-700">{lawyer.phone}</span></div>
                          <div><span className="text-gray-500">邮箱：</span><span className="text-gray-700">{lawyer.email}</span></div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">专业领域：</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {lawyer.specialization.map((s) => (
                              <span key={s} className="px-2 py-0.5 text-xs bg-primary-50 text-primary-600 rounded-full">{s}</span>
                            ))}
                          </div>
                        </div>
                        {lCases.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-500">经手案件（{lCases.length}件）：</span>
                            <div className="mt-1 space-y-1">
                              {lCases.map((c) => (
                                <div key={c.id} className="flex items-center gap-2 text-xs">
                                  <Briefcase size={12} className="text-gray-400 shrink-0" />
                                  <span className="text-gray-600 truncate">{c.title}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] border shrink-0 ${c.status === '进行中' ? 'bg-blue-50 text-blue-600 border-blue-200' : c.status === '已结案' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : c.status === '已归档' ? 'bg-gray-50 text-gray-500 border-gray-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>{c.status}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
