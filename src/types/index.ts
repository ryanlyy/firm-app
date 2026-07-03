export type CaseStatus = '待受理' | '进行中' | '已结案' | '已归档'
export type CasePriority = '高' | '中' | '低'
export type CaseType = '民事诉讼' | '刑事辩护' | '商事仲裁' | '知识产权' | '劳动争议' | '行政诉讼' | '婚姻家庭' | '合同纠纷' | '公司法务' | '其他'
export type PaymentStatus = '已付款' | '待付款' | '逾期' | '部分付款'

export interface Client {
  id: string
  name: string
  type: '个人' | '企业'
  contact: string
  phone: string
  email: string
  address: string
  idNumber: string
  createdAt: string
  notes: string
}

export type LawyerRole = 'admin' | 'lawyer'

export interface Lawyer {
  id: string
  name: string
  title: '实习律师' | '执业律师' | '合伙人' | '高级合伙人'
  role: LawyerRole
  phone: string
  email: string
  barNumber: string
  specialization: string[]
  joinDate: string
  avatar: string
  activeCases: number
  password: string
  mustChangePassword: boolean
  lastPasswordChange: string | null
}

export interface Case {
  id: string
  caseNumber: string
  title: string
  type: CaseType
  status: CaseStatus
  priority: CasePriority
  clientId: string
  clientName: string
  lawyerId: string
  lawyerName: string
  courtName: string
  filingDate: string
  nextHearingDate: string
  description: string
  opponentName: string
  fee: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  caseId: string
  caseTitle: string
  clientId: string
  clientName: string
  amount: number
  paidAmount: number
  status: PaymentStatus
  issueDate: string
  dueDate: string
  items: { description: string; amount: number }[]
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  type: '开庭' | '会议' | '截止日期' | '咨询' | '调解'
  caseId?: string
  caseTitle?: string
  location: string
  notes: string
}

export interface Document {
  id: string
  name: string
  type: '合同' | '起诉状' | '答辩状' | '证据材料' | '判决书' | '律师函' | '授权委托书' | '其他'
  caseId?: string
  caseTitle?: string
  uploadDate: string
  size: string
  uploadedBy: string
}

export type SealType = '公章' | '合同章' | '法人章' | '财务章'
export type SealApprovalStatus = '待审批' | '已批准' | '已拒绝' | '已撤回'

export interface SealApproval {
  id: string
  applicantId: string
  applicantName: string
  sealType: SealType
  reason: string
  caseId?: string
  caseTitle?: string
  documentName: string
  copies: number
  applyDate: string
  status: SealApprovalStatus
  approverId?: string
  approverName?: string
  approveDate?: string
  approveComment?: string
}

export interface SealProxy {
  principalId: string
  principalName: string
  proxyId: string
  proxyName: string
  startDate: string
  endDate: string
}

// Work Log
export interface WorkLog {
  id: string
  lawyerId: string
  lawyerName: string
  caseId?: string
  caseTitle?: string
  clientId?: string
  clientName?: string
  date: string
  hours: number
  content: string
  type: '案件工作' | '法律咨询' | '文书起草' | '会议' | '调查取证' | '法律研究' | '行政事务' | '其他'
}

// Invoice Request (发票申请)
export interface InvoiceRequest {
  id: string
  applicantId: string
  applicantName: string
  caseId: string
  caseTitle: string
  clientName: string
  amount: number
  invoiceType: '增值税专用发票' | '增值税普通发票'
  taxNumber?: string
  companyName?: string
  applyDate: string
  status: '待开票' | '已开票' | '已拒绝'
  invoiceNumber?: string
  processDate?: string
  processedBy?: string
}

// Meeting Room
export interface MeetingRoom {
  id: string
  name: string
  capacity: number
  equipment: string[]
  location: string
}

// Meeting Booking
export interface MeetingBooking {
  id: string
  roomId: string
  roomName: string
  bookerId: string
  bookerName: string
  title: string
  date: string
  startTime: string
  endTime: string
  attendees: string[]
  notes: string
  status: '已预约' | '进行中' | '已结束' | '已取消'
}

// Document Template (文书模板)
export interface DocTemplate {
  id: string
  name: string
  category: '诉讼文书' | '合同模板' | '律师函' | '法律意见书' | '尽职调查' | '公司治理' | '其他'
  description: string
  uploadDate: string
  uploadedBy: string
  downloadCount: number
  isShared: boolean
}

// Approval Flow
export type ApprovalType = '收案审批' | '用印审批' | '发票审批' | '费用审批'
export type ApprovalStepStatus = '待审批' | '已通过' | '已拒绝'

export interface ApprovalFlow {
  id: string
  type: ApprovalType
  title: string
  applicantId: string
  applicantName: string
  applyDate: string
  currentStep: number
  steps: ApprovalStep[]
  status: '审批中' | '已通过' | '已拒绝' | '已撤回'
  relatedId?: string
  detail: string
}

export interface ApprovalStep {
  order: number
  approverId: string
  approverName: string
  status: ApprovalStepStatus
  comment?: string
  processDate?: string
}

// Case with enhanced fields (add to existing Case interface)
export interface CaseFeeAdjustment {
  id: string
  caseId: string
  type: '减免' | '退费'
  amount: number
  reason: string
  applyDate: string
  approvedBy?: string
  status: '待审批' | '已批准' | '已拒绝'
}
