import type { Client, Lawyer, Case, Invoice, CalendarEvent, Document, SealApproval, SealProxy, WorkLog, InvoiceRequest, MeetingRoom, MeetingBooking, DocTemplate, ApprovalFlow, CaseFeeAdjustment } from '../types'

export const lawyers: Lawyer[] = [
  { id: 'L001', name: '张明远', title: '高级合伙人', role: 'admin', phone: '138-0001-0001', email: 'zhang@sdyungen.com', barNumber: '11101200510001001', specialization: ['商事仲裁', '公司法务'], joinDate: '2010-03-15', avatar: '', activeCases: 8, password: '123456', mustChangePassword: true, lastPasswordChange: null },
  { id: 'L002', name: '李思雨', title: '合伙人', role: 'admin', phone: '139-0002-0002', email: 'li@sdyungen.com', barNumber: '11101201210002002', specialization: ['知识产权', '合同纠纷'], joinDate: '2014-07-01', avatar: '', activeCases: 6, password: '123456', mustChangePassword: true, lastPasswordChange: null },
  { id: 'L003', name: '王浩然', title: '执业律师', role: 'lawyer', phone: '136-0003-0003', email: 'wang@sdyungen.com', barNumber: '11101201810003003', specialization: ['刑事辩护', '行政诉讼'], joinDate: '2018-09-10', avatar: '', activeCases: 5, password: '123456', mustChangePassword: true, lastPasswordChange: null },
  { id: 'L004', name: '陈雅琳', title: '执业律师', role: 'lawyer', phone: '137-0004-0004', email: 'chen@sdyungen.com', barNumber: '11101202010004004', specialization: ['婚姻家庭', '劳动争议'], joinDate: '2020-04-20', avatar: '', activeCases: 7, password: '123456', mustChangePassword: true, lastPasswordChange: null },
  { id: 'L005', name: '赵子轩', title: '实习律师', role: 'lawyer', phone: '135-0005-0005', email: 'zhao@sdyungen.com', barNumber: '11101202310005005', specialization: ['民事诉讼'], joinDate: '2023-08-01', avatar: '', activeCases: 3, password: '123456', mustChangePassword: true, lastPasswordChange: null },
]

export const clients: Client[] = [
  { id: 'C001', name: '北京盛达科技有限公司', type: '企业', contact: '刘总', phone: '010-8888-0001', email: 'liu@shengda.com', address: '北京市朝阳区望京SOHO T1', idNumber: '91110105MA01XXXX0X', createdAt: '2023-01-15', notes: '长期合作客户' },
  { id: 'C002', name: '上海锦绣传媒集团', type: '企业', contact: '陈经理', phone: '021-6666-0002', email: 'chen@jinxiu.com', address: '上海市浦东新区陆家嘴环路', idNumber: '91310115MA01YYYY0Y', createdAt: '2023-03-22', notes: '知识产权案件客户' },
  { id: 'C003', name: '周建国', type: '个人', contact: '周建国', phone: '186-1234-5678', email: 'zhou@gmail.com', address: '北京市海淀区中关村大街', idNumber: '110108198501010011', createdAt: '2024-02-10', notes: '' },
  { id: 'C004', name: '深圳创新智能有限公司', type: '企业', contact: '王总监', phone: '0755-2222-0004', email: 'wang@chuangxin.com', address: '深圳市南山区科技园', idNumber: '91440300MA5FZZZZ0Z', createdAt: '2024-05-18', notes: '专利侵权纠纷' },
  { id: 'C005', name: '林小婷', type: '个人', contact: '林小婷', phone: '158-8765-4321', email: 'lin@163.com', address: '广州市天河区体育西路', idNumber: '440106199003030022', createdAt: '2024-08-05', notes: '劳动仲裁案件' },
  { id: 'C006', name: '杭州云水贸易有限公司', type: '企业', contact: '赵副总', phone: '0571-8888-0006', email: 'zhao@yunshui.com', address: '杭州市西湖区文三路', idNumber: '91330106MA2BAAAA0A', createdAt: '2024-11-01', notes: '合同纠纷' },
  { id: 'C007', name: '马强', type: '个人', contact: '马强', phone: '133-9876-5432', email: 'ma@qq.com', address: '成都市武侯区人民南路', idNumber: '510107199205050033', createdAt: '2025-01-20', notes: '刑事辩护' },
  { id: 'C008', name: '天津恒丰房地产开发有限公司', type: '企业', contact: '孙总', phone: '022-5555-0008', email: 'sun@hengfeng.com', address: '天津市和平区南京路', idNumber: '91120101MA06CCCC0C', createdAt: '2025-03-10', notes: '房产纠纷' },
]

export const cases: Case[] = [
  { id: 'CA001', caseNumber: '(2025)京0105民初1234号', title: '盛达科技诉华创信息技术侵权案', type: '知识产权', status: '进行中', priority: '高', clientId: 'C001', clientName: '北京盛达科技有限公司', lawyerId: 'L002', lawyerName: '李思雨', courtName: '北京市朝阳区人民法院', filingDate: '2025-01-20', nextHearingDate: '2026-05-15', description: '盛达科技诉华创信息技术公司软件著作权侵权', opponentName: '华创信息技术有限公司', fee: 150000 },
  { id: 'CA002', caseNumber: '(2025)京0108刑初567号', title: '马强涉嫌职务侵占案', type: '刑事辩护', status: '进行中', priority: '高', clientId: 'C007', clientName: '马强', lawyerId: 'L003', lawyerName: '王浩然', courtName: '北京市海淀区人民法院', filingDate: '2025-03-05', nextHearingDate: '2026-05-20', description: '马强涉嫌职务侵占罪辩护', opponentName: '检察机关', fee: 200000 },
  { id: 'CA003', caseNumber: '(2025)沪0115民初890号', title: '锦绣传媒商标侵权纠纷', type: '知识产权', status: '进行中', priority: '中', clientId: 'C002', clientName: '上海锦绣传媒集团', lawyerId: 'L002', lawyerName: '李思雨', courtName: '上海市浦东新区人民法院', filingDate: '2025-04-10', nextHearingDate: '2026-06-01', description: '锦绣传媒集团商标被侵权案', opponentName: '侵权方（待查）', fee: 120000 },
  { id: 'CA004', caseNumber: '(2025)粤0306民初2345号', title: '创新智能专利侵权案', type: '知识产权', status: '待受理', priority: '高', clientId: 'C004', clientName: '深圳创新智能有限公司', lawyerId: 'L001', lawyerName: '张明远', courtName: '深圳市南山区人民法院', filingDate: '2025-09-15', nextHearingDate: '', description: '创新智能公司发明专利被侵权', opponentName: '侵权方（待查）', fee: 300000 },
  { id: 'CA005', caseNumber: '(2024)粤0103劳仲字678号', title: '林小婷劳动仲裁案', type: '劳动争议', status: '已结案', priority: '中', clientId: 'C005', clientName: '林小婷', lawyerId: 'L004', lawyerName: '陈雅琳', courtName: '广州市天河区劳动仲裁委', filingDate: '2024-08-20', nextHearingDate: '', description: '违法解除劳动合同赔偿争议', opponentName: '广州某科技公司', fee: 30000 },
  { id: 'CA006', caseNumber: '(2025)浙0106民初456号', title: '云水贸易合同纠纷案', type: '合同纠纷', status: '进行中', priority: '中', clientId: 'C006', clientName: '杭州云水贸易有限公司', lawyerId: 'L001', lawyerName: '张明远', courtName: '杭州市西湖区人民法院', filingDate: '2025-11-20', nextHearingDate: '2026-05-28', description: '货物买卖合同违约纠纷', opponentName: '供货方张某', fee: 80000 },
  { id: 'CA007', caseNumber: '(2024)京0101民初7890号', title: '周建国离婚财产分割案', type: '婚姻家庭', status: '已结案', priority: '低', clientId: 'C003', clientName: '周建国', lawyerId: 'L004', lawyerName: '陈雅琳', courtName: '北京市东城区人民法院', filingDate: '2024-03-01', nextHearingDate: '', description: '协议离婚后财产分割纠纷', opponentName: '周建国配偶方', fee: 50000 },
  { id: 'CA008', caseNumber: '(2025)津0101民初111号', title: '恒丰房地产商品房买卖纠纷', type: '合同纠纷', status: '进行中', priority: '中', clientId: 'C008', clientName: '天津恒丰房地产开发有限公司', lawyerId: 'L005', lawyerName: '赵子轩', courtName: '天津市和平区人民法院', filingDate: '2025-06-15', nextHearingDate: '2026-06-10', description: '商品房买卖合同质量争议', opponentName: '购房业主方', fee: 60000 },
  { id: 'CA009', caseNumber: '(2025)京仲字第222号', title: '盛达科技与供应商仲裁案', type: '商事仲裁', status: '进行中', priority: '高', clientId: 'C001', clientName: '北京盛达科技有限公司', lawyerId: 'L001', lawyerName: '张明远', courtName: '北京仲裁委员会', filingDate: '2025-08-01', nextHearingDate: '2026-05-10', description: '供应商违约仲裁案', opponentName: '违约供应商', fee: 250000 },
  { id: 'CA010', caseNumber: '(2024)京0105民初9999号', title: '盛达科技股权纠纷', type: '公司法务', status: '已归档', priority: '中', clientId: 'C001', clientName: '北京盛达科技有限公司', lawyerId: 'L001', lawyerName: '张明远', courtName: '北京市朝阳区人民法院', filingDate: '2024-01-10', nextHearingDate: '', description: '股东股权转让纠纷', opponentName: '转让方股东', fee: 180000 },
]

export const invoices: Invoice[] = [
  { id: 'INV001', invoiceNumber: 'YG-2025-001', caseId: 'CA001', caseTitle: '盛达科技诉华创信息技术侵权案', clientId: 'C001', clientName: '北京盛达科技有限公司', amount: 150000, paidAmount: 75000, status: '部分付款', issueDate: '2025-02-01', dueDate: '2025-03-01', items: [{ description: '代理费（一审）', amount: 100000 }, { description: '差旅费', amount: 20000 }, { description: '调查取证费', amount: 30000 }] },
  { id: 'INV002', invoiceNumber: 'YG-2025-002', caseId: 'CA002', caseTitle: '马强涉嫌职务侵占案', clientId: 'C007', clientName: '马强', amount: 200000, paidAmount: 200000, status: '已付款', issueDate: '2025-03-10', dueDate: '2025-04-10', items: [{ description: '辩护费', amount: 180000 }, { description: '鉴定费', amount: 20000 }] },
  { id: 'INV003', invoiceNumber: 'YG-2025-003', caseId: 'CA003', caseTitle: '锦绣传媒商标侵权纠纷', clientId: 'C002', clientName: '上海锦绣传媒集团', amount: 120000, paidAmount: 0, status: '待付款', issueDate: '2025-05-01', dueDate: '2025-06-01', items: [{ description: '代理费', amount: 100000 }, { description: '公证费', amount: 20000 }] },
  { id: 'INV004', invoiceNumber: 'YG-2025-004', caseId: 'CA005', caseTitle: '林小婷劳动仲裁案', clientId: 'C005', clientName: '林小婷', amount: 30000, paidAmount: 30000, status: '已付款', issueDate: '2024-09-01', dueDate: '2024-10-01', items: [{ description: '仲裁代理费', amount: 30000 }] },
  { id: 'INV005', invoiceNumber: 'YG-2025-005', caseId: 'CA006', caseTitle: '云水贸易合同纠纷案', clientId: 'C006', clientName: '杭州云水贸易有限公司', amount: 80000, paidAmount: 0, status: '逾期', issueDate: '2025-12-01', dueDate: '2026-01-01', items: [{ description: '代理费', amount: 60000 }, { description: '差旅费', amount: 20000 }] },
  { id: 'INV006', invoiceNumber: 'YG-2025-006', caseId: 'CA009', caseTitle: '盛达科技与供应商仲裁案', clientId: 'C001', clientName: '北京盛达科技有限公司', amount: 250000, paidAmount: 125000, status: '部分付款', issueDate: '2025-08-15', dueDate: '2025-09-15', items: [{ description: '仲裁代理费', amount: 200000 }, { description: '专家顾问费', amount: 50000 }] },
  { id: 'INV007', invoiceNumber: 'YG-2025-007', caseId: 'CA004', caseTitle: '创新智能专利侵权案', clientId: 'C004', clientName: '深圳创新智能有限公司', amount: 300000, paidAmount: 0, status: '待付款', issueDate: '2025-10-01', dueDate: '2025-11-01', items: [{ description: '代理费', amount: 250000 }, { description: '技术鉴定费', amount: 50000 }] },
]

export const calendarEvents: CalendarEvent[] = [
  { id: 'E001', title: '盛达科技诉华创侵权案开庭', date: '2026-05-15', time: '09:30', type: '开庭', caseId: 'CA001', caseTitle: '盛达科技诉华创信息技术侵权案', location: '北京市朝阳区人民法院第三法庭', notes: '准备证据清单和代理词' },
  { id: 'E002', title: '马强案二次开庭', date: '2026-05-20', time: '14:00', type: '开庭', caseId: 'CA002', caseTitle: '马强涉嫌职务侵占案', location: '北京市海淀区人民法院第五法庭', notes: '带鉴定报告' },
  { id: 'E003', title: '创新智能专利案件讨论会', date: '2026-04-28', time: '10:00', type: '会议', caseId: 'CA004', caseTitle: '创新智能专利侵权案', location: '本所三楼会议室', notes: '讨论诉讼策略' },
  { id: 'E004', title: '锦绣传媒商标案开庭', date: '2026-06-01', time: '09:00', type: '开庭', caseId: 'CA003', caseTitle: '锦绣传媒商标侵权纠纷', location: '上海市浦东新区人民法院', notes: '' },
  { id: 'E005', title: '新客户法律咨询', date: '2026-04-26', time: '15:00', type: '咨询', location: '本所接待室', notes: '房产纠纷咨询' },
  { id: 'E006', title: '云水贸易案证据提交截止', date: '2026-05-28', time: '17:00', type: '截止日期', caseId: 'CA006', caseTitle: '云水贸易合同纠纷案', location: '杭州市西湖区人民法院', notes: '最后提交补充证据' },
  { id: 'E007', title: '盛达仲裁案庭前调解', date: '2026-05-10', time: '10:00', type: '调解', caseId: 'CA009', caseTitle: '盛达科技与供应商仲裁案', location: '北京仲裁委员会调解室', notes: '' },
  { id: 'E008', title: '恒丰房地产案开庭', date: '2026-06-10', time: '09:30', type: '开庭', caseId: 'CA008', caseTitle: '恒丰房地产商品房买卖纠纷', location: '天津市和平区人民法院', notes: '' },
  { id: 'E009', title: '律所季度总结会', date: '2026-04-30', time: '14:00', type: '会议', location: '本所大会议室', notes: '全体合伙人参加' },
  { id: 'E010', title: '周建国案件回访', date: '2026-04-27', time: '11:00', type: '咨询', caseId: 'CA007', caseTitle: '周建国离婚财产分割案', location: '电话回访', notes: '结案后回访' },
]

export const documents: Document[] = [
  { id: 'D001', name: '盛达科技诉状.docx', type: '起诉状', caseId: 'CA001', caseTitle: '盛达科技诉华创信息技术侵权案', uploadDate: '2025-01-18', size: '245 KB', uploadedBy: '李思雨' },
  { id: 'D002', name: '软件著作权登记证书.pdf', type: '证据材料', caseId: 'CA001', caseTitle: '盛达科技诉华创信息技术侵权案', uploadDate: '2025-01-18', size: '1.2 MB', uploadedBy: '李思雨' },
  { id: 'D003', name: '马强辩护词.docx', type: '答辩状', caseId: 'CA002', caseTitle: '马强涉嫌职务侵占案', uploadDate: '2025-03-10', size: '180 KB', uploadedBy: '王浩然' },
  { id: 'D004', name: '锦绣传媒商标注册证.pdf', type: '证据材料', caseId: 'CA003', caseTitle: '锦绣传媒商标侵权纠纷', uploadDate: '2025-04-15', size: '890 KB', uploadedBy: '李思雨' },
  { id: 'D005', name: '委托代理合同-盛达科技.pdf', type: '合同', caseId: 'CA001', caseTitle: '盛达科技诉华创信息技术侵权案', uploadDate: '2025-01-15', size: '320 KB', uploadedBy: '张明远' },
  { id: 'D006', name: '劳动合同副本.pdf', type: '证据材料', caseId: 'CA005', caseTitle: '林小婷劳动仲裁案', uploadDate: '2024-08-22', size: '560 KB', uploadedBy: '陈雅琳' },
  { id: 'D007', name: '仲裁裁决书-林小婷.pdf', type: '判决书', caseId: 'CA005', caseTitle: '林小婷劳动仲裁案', uploadDate: '2025-01-10', size: '420 KB', uploadedBy: '陈雅琳' },
  { id: 'D008', name: '云水贸易买卖合同.pdf', type: '合同', caseId: 'CA006', caseTitle: '云水贸易合同纠纷案', uploadDate: '2025-11-25', size: '780 KB', uploadedBy: '张明远' },
  { id: 'D009', name: '创新智能专利证书.pdf', type: '证据材料', caseId: 'CA004', caseTitle: '创新智能专利侵权案', uploadDate: '2025-09-20', size: '1.5 MB', uploadedBy: '张明远' },
  { id: 'D010', name: '授权委托书-马强.pdf', type: '授权委托书', caseId: 'CA002', caseTitle: '马强涉嫌职务侵占案', uploadDate: '2025-03-08', size: '150 KB', uploadedBy: '王浩然' },
  { id: 'D011', name: '律师函-供应商违约.docx', type: '律师函', caseId: 'CA009', caseTitle: '盛达科技与供应商仲裁案', uploadDate: '2025-07-20', size: '200 KB', uploadedBy: '张明远' },
  { id: 'D012', name: '恒丰房产质量检测报告.pdf', type: '证据材料', caseId: 'CA008', caseTitle: '恒丰房地产商品房买卖纠纷', uploadDate: '2025-06-20', size: '2.3 MB', uploadedBy: '赵子轩' },
]

export const sealApprovals: SealApproval[] = [
  { id: 'SA001', applicantId: 'L003', applicantName: '王浩然', sealType: '公章', reason: '马强案辩护词需盖章提交法院', caseId: 'CA002', caseTitle: '马强涉嫌职务侵占案', documentName: '马强辩护词.docx', copies: 2, applyDate: '2026-04-20', status: '已批准', approverId: 'L001', approverName: '张明远', approveDate: '2026-04-20', approveComment: '同意' },
  { id: 'SA002', applicantId: 'L004', applicantName: '陈雅琳', sealType: '合同章', reason: '新客户委托代理合同盖章', documentName: '委托代理合同-新客户.pdf', copies: 3, applyDate: '2026-04-22', status: '待审批' },
  { id: 'SA003', applicantId: 'L005', applicantName: '赵子轩', sealType: '公章', reason: '恒丰案律师函需用印', caseId: 'CA008', caseTitle: '恒丰房地产商品房买卖纠纷', documentName: '律师函-恒丰房产.docx', copies: 1, applyDate: '2026-04-23', status: '待审批' },
  { id: 'SA004', applicantId: 'L002', applicantName: '李思雨', sealType: '法人章', reason: '盛达案仲裁申请书需法人章', caseId: 'CA001', caseTitle: '盛达科技诉华创信息技术侵权案', documentName: '仲裁申请补充材料.pdf', copies: 1, applyDate: '2026-04-18', status: '已批准', approverId: 'L001', approverName: '张明远', approveDate: '2026-04-18', approveComment: '已核实，同意用印' },
  { id: 'SA005', applicantId: 'L003', applicantName: '王浩然', sealType: '公章', reason: '出具律师见证书', documentName: '律师见证书.docx', copies: 2, applyDate: '2026-04-15', status: '已拒绝', approverId: 'L001', approverName: '张明远', approveDate: '2026-04-16', approveComment: '文件内容需修改后重新申请' },
]

export const sealProxies: SealProxy[] = []

export const workLogs: WorkLog[] = [
  { id: 'WL001', lawyerId: 'L001', lawyerName: '张明远', caseId: 'CA009', caseTitle: '盛达科技与供应商仲裁案', clientId: 'C001', clientName: '北京盛达科技有限公司', date: '2026-04-24', hours: 3, content: '研究仲裁案相关法律条文，准备庭前证据材料清单', type: '法律研究' },
  { id: 'WL002', lawyerId: 'L001', lawyerName: '张明远', caseId: 'CA006', caseTitle: '云水贸易合同纠纷案', clientId: 'C006', clientName: '杭州云水贸易有限公司', date: '2026-04-24', hours: 2, content: '与云水贸易赵副总电话沟通案件进展，确认补充证据', type: '案件工作' },
  { id: 'WL003', lawyerId: 'L002', lawyerName: '李思雨', caseId: 'CA001', caseTitle: '盛达科技诉华创信息技术侵权案', clientId: 'C001', clientName: '北京盛达科技有限公司', date: '2026-04-23', hours: 4, content: '起草软件著作权侵权代理词初稿，整理技术鉴定报告', type: '文书起草' },
  { id: 'WL004', lawyerId: 'L003', lawyerName: '王浩然', caseId: 'CA002', caseTitle: '马强涉嫌职务侵占案', clientId: 'C007', clientName: '马强', date: '2026-04-23', hours: 2.5, content: '会见当事人马强，了解案件新情况', type: '案件工作' },
  { id: 'WL005', lawyerId: 'L004', lawyerName: '陈雅琳', date: '2026-04-22', hours: 1.5, content: '接待新客户法律咨询，关于劳动合同解除赔偿问题', type: '法律咨询' },
  { id: 'WL006', lawyerId: 'L005', lawyerName: '赵子轩', caseId: 'CA008', caseTitle: '恒丰房地产商品房买卖纠纷', clientId: 'C008', clientName: '天津恒丰房地产开发有限公司', date: '2026-04-22', hours: 3, content: '前往质量检测机构获取房屋质量检测补充材料', type: '调查取证' },
  { id: 'WL007', lawyerId: 'L001', lawyerName: '张明远', date: '2026-04-21', hours: 2, content: '参加律所季度业务研讨会，讨论商事仲裁新规', type: '会议' },
  { id: 'WL008', lawyerId: 'L002', lawyerName: '李思雨', caseId: 'CA003', caseTitle: '锦绣传媒商标侵权纠纷', clientId: 'C002', clientName: '上海锦绣传媒集团', date: '2026-04-21', hours: 2, content: '收集商标侵权对比证据，整理公证材料', type: '调查取证' },
]

export const invoiceRequests: InvoiceRequest[] = [
  { id: 'IR001', applicantId: 'L002', applicantName: '李思雨', caseId: 'CA001', caseTitle: '盛达科技诉华创信息技术侵权案', clientName: '北京盛达科技有限公司', amount: 75000, invoiceType: '增值税专用发票', taxNumber: '91110105MA01XXXX0X', companyName: '北京盛达科技有限公司', applyDate: '2026-04-20', status: '已开票', invoiceNumber: 'YG-FP-2026-001', processDate: '2026-04-21', processedBy: '财务部' },
  { id: 'IR002', applicantId: 'L001', applicantName: '张明远', caseId: 'CA009', caseTitle: '盛达科技与供应商仲裁案', clientName: '北京盛达科技有限公司', amount: 125000, invoiceType: '增值税专用发票', taxNumber: '91110105MA01XXXX0X', companyName: '北京盛达科技有限公司', applyDate: '2026-04-22', status: '待开票' },
  { id: 'IR003', applicantId: 'L004', applicantName: '陈雅琳', caseId: 'CA005', caseTitle: '林小婷劳动仲裁案', clientName: '林小婷', amount: 30000, invoiceType: '增值税普通发票', applyDate: '2026-04-15', status: '已开票', invoiceNumber: 'YG-FP-2026-002', processDate: '2026-04-16', processedBy: '财务部' },
]

export const meetingRooms: MeetingRoom[] = [
  { id: 'MR001', name: '第一会议室', capacity: 20, equipment: ['投影仪', '白板', '视频会议系统'], location: '18层A区' },
  { id: 'MR002', name: '第二会议室', capacity: 10, equipment: ['投影仪', '白板'], location: '18层B区' },
  { id: 'MR003', name: '洽谈室', capacity: 6, equipment: ['电视屏幕'], location: '18层接待区' },
  { id: 'MR004', name: '培训室', capacity: 40, equipment: ['投影仪', '音响系统', '白板', '视频会议系统'], location: '19层' },
]

export const meetingBookings: MeetingBooking[] = [
  { id: 'MB001', roomId: 'MR001', roomName: '第一会议室', bookerId: 'L001', bookerName: '张明远', title: '创新智能专利案件讨论会', date: '2026-04-28', startTime: '10:00', endTime: '12:00', attendees: ['张明远', '李思雨', '王浩然'], notes: '讨论诉讼策略', status: '已预约' },
  { id: 'MB002', roomId: 'MR003', roomName: '洽谈室', bookerId: 'L004', bookerName: '陈雅琳', title: '新客户法律咨询', date: '2026-04-26', startTime: '15:00', endTime: '16:30', attendees: ['陈雅琳'], notes: '房产纠纷咨询', status: '已预约' },
  { id: 'MB003', roomId: 'MR004', roomName: '培训室', bookerId: 'L001', bookerName: '张明远', title: '律所季度总结会', date: '2026-04-30', startTime: '14:00', endTime: '17:00', attendees: ['张明远', '李思雨', '王浩然', '陈雅琳', '赵子轩'], notes: '全体合伙人参加', status: '已预约' },
]

export const docTemplates: DocTemplate[] = [
  { id: 'DT001', name: '民事起诉状（通用）', category: '诉讼文书', description: '适用于一般民事案件的起诉状模板', uploadDate: '2025-01-10', uploadedBy: '张明远', downloadCount: 45, isShared: true },
  { id: 'DT002', name: '委托代理合同（标准版）', category: '合同模板', description: '律所标准委托代理合同', uploadDate: '2025-01-10', uploadedBy: '张明远', downloadCount: 68, isShared: true },
  { id: 'DT003', name: '律师函（催告函）', category: '律师函', description: '用于催告履行合同义务的律师函模板', uploadDate: '2025-03-15', uploadedBy: '李思雨', downloadCount: 32, isShared: true },
  { id: 'DT004', name: '法律意见书（投融资）', category: '法律意见书', description: '适用于投融资项目的法律意见书模板', uploadDate: '2025-05-20', uploadedBy: '张明远', downloadCount: 18, isShared: true },
  { id: 'DT005', name: '尽职调查报告（公司并购）', category: '尽职调查', description: '公司并购项目尽职调查报告标准格式', uploadDate: '2025-06-01', uploadedBy: '李思雨', downloadCount: 12, isShared: true },
  { id: 'DT006', name: '公司章程（有限责任公司）', category: '公司治理', description: '有限责任公司章程范本', uploadDate: '2025-07-10', uploadedBy: '张明远', downloadCount: 25, isShared: true },
  { id: 'DT007', name: '答辩状（民事）', category: '诉讼文书', description: '民事诉讼答辩状标准模板', uploadDate: '2025-02-20', uploadedBy: '王浩然', downloadCount: 38, isShared: true },
  { id: 'DT008', name: '刑事辩护词', category: '诉讼文书', description: '刑事辩护词标准模板', uploadDate: '2025-04-10', uploadedBy: '王浩然', downloadCount: 22, isShared: true },
  { id: 'DT009', name: '劳动合同解除通知', category: '其他', description: '劳动合同解除通知函模板', uploadDate: '2025-08-15', uploadedBy: '陈雅琳', downloadCount: 15, isShared: true },
  { id: 'DT010', name: '授权委托书（诉讼用）', category: '诉讼文书', description: '诉讼案件授权委托书模板', uploadDate: '2025-01-15', uploadedBy: '张明远', downloadCount: 55, isShared: true },
]

export const approvalFlows: ApprovalFlow[] = [
  { id: 'AF001', type: '收案审批', title: '新收案件审批 — 恒丰房地产', applicantId: 'L005', applicantName: '赵子轩', applyDate: '2025-06-10', currentStep: 2, steps: [{ order: 1, approverId: 'L002', approverName: '李思雨', status: '已通过', comment: '同意', processDate: '2025-06-10' }, { order: 2, approverId: 'L001', approverName: '张明远', status: '已通过', comment: '同意收案', processDate: '2025-06-11' }], status: '已通过', relatedId: 'CA008', detail: '恒丰房地产商品房买卖纠纷案收案审批' },
  { id: 'AF002', type: '发票审批', title: '开票申请 — 盛达科技', applicantId: 'L002', applicantName: '李思雨', applyDate: '2026-04-20', currentStep: 1, steps: [{ order: 1, approverId: 'L001', approverName: '张明远', status: '已通过', comment: '同意开票', processDate: '2026-04-20' }], status: '已通过', relatedId: 'IR001', detail: '盛达科技诉华创信息技术侵权案代理费开票' },
  { id: 'AF003', type: '发票审批', title: '开票申请 — 创新智能科技', applicantId: 'L002', applicantName: '李思雨', applyDate: '2026-04-23', currentStep: 1, steps: [{ order: 1, approverId: 'L001', approverName: '张明远', status: '待审批' }, { order: 2, approverId: 'L004', approverName: '陈雅琳', status: '待审批' }], status: '审批中', relatedId: 'IR005', detail: '创新智能科技专利侵权案开具增值税专用发票，金额12万元。' },
  { id: 'AF004', type: '费用审批', title: '差旅费报销 — 恒丰案出差', applicantId: 'L005', applicantName: '赵子轩', applyDate: '2026-04-22', currentStep: 1, steps: [{ order: 1, approverId: 'L001', approverName: '张明远', status: '待审批' }], status: '审批中', detail: '恒丰房产案出差至项目现场取证，差旅费合计3,200元。' },
  { id: 'AF005', type: '收案审批', title: '新收案件审批 — 周丽华劳动争议', applicantId: 'L004', applicantName: '陈雅琳', applyDate: '2026-04-18', currentStep: 2, steps: [{ order: 1, approverId: 'L001', approverName: '张明远', status: '已通过', comment: '同意收案', processDate: '2026-04-18' }, { order: 2, approverId: 'L002', approverName: '李思雨', status: '已通过', comment: '无利冲', processDate: '2026-04-19' }], status: '已通过', relatedId: 'CA005', detail: '周丽华因劳动合同纠纷申请仲裁，标的额8万元。' },
  { id: 'AF006', type: '用印审批', title: '新客户委托合同用印', applicantId: 'L004', applicantName: '陈雅琳', applyDate: '2026-04-22', currentStep: 1, steps: [{ order: 1, approverId: 'L001', approverName: '张明远', status: '待审批' }], status: '审批中', relatedId: 'SA002', detail: '新客户委托代理合同需合同章，3份。' },
  { id: 'AF007', type: '费用审批', title: '证据公证费 — 盛达案', applicantId: 'L002', applicantName: '李思雨', applyDate: '2026-04-15', currentStep: 2, steps: [{ order: 1, approverId: 'L001', approverName: '张明远', status: '已通过', comment: '费用合理', processDate: '2026-04-15' }, { order: 2, approverId: 'L004', approverName: '陈雅琳', status: '已拒绝', comment: '缺少公证处发票原件', processDate: '2026-04-16' }], status: '已拒绝', detail: '盛达科技案电子证据公证保全费用，合计1,500元。' },
  { id: 'AF008', type: '发票审批', title: '开票申请 — 恒丰房产', applicantId: 'L005', applicantName: '赵子轩', applyDate: '2026-04-24', currentStep: 1, steps: [{ order: 1, approverId: 'L001', approverName: '张明远', status: '待审批' }, { order: 2, approverId: 'L004', approverName: '陈雅琳', status: '待审批' }], status: '审批中', relatedId: 'IR004', detail: '恒丰房地产商品房买卖纠纷案开具增值税专用发票，金额8万元。' },
  { id: 'AF009', type: '用印审批', title: '马强案辩护词用印', applicantId: 'L003', applicantName: '王浩然', applyDate: '2026-04-25', currentStep: 1, steps: [{ order: 1, approverId: 'L001', approverName: '张明远', status: '待审批' }, { order: 2, approverId: 'L002', approverName: '李思雨', status: '待审批' }], status: '审批中', relatedId: 'SA001', detail: '马强案辩护词需加盖公章提交法院，共2份。' },
]

export const caseFeeAdjustments: CaseFeeAdjustment[] = []
