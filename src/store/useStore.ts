import { create } from 'zustand'
import type { Client, Lawyer, Case, Invoice, CalendarEvent, Document, SealApproval, SealProxy, MeetingRoom, MeetingBooking, InvoiceRequest, ApprovalFlow, WorkLog, DocTemplate } from '../types'
import { clients as mockClients, lawyers as mockLawyers, cases as mockCases, invoices as mockInvoices, calendarEvents as mockEvents, documents as mockDocuments, sealApprovals as mockSealApprovals, sealProxies as mockSealProxies, meetingRooms as mockMeetingRooms, meetingBookings as mockMeetingBookings, invoiceRequests as mockInvoiceRequests, approvalFlows as mockApprovalFlows, workLogs as mockWorkLogs, docTemplates as mockDocTemplates } from '../data/mockData'

interface AppState {
  clients: Client[]
  lawyers: Lawyer[]
  cases: Case[]
  invoices: Invoice[]
  events: CalendarEvent[]
  documents: Document[]
  sealApprovals: SealApproval[]
  sealProxies: SealProxy[]

  addCase: (c: Case) => void
  updateCase: (id: string, c: Partial<Case>) => void
  deleteCase: (id: string) => void

  addClient: (c: Client) => void
  updateClient: (id: string, c: Partial<Client>) => void
  deleteClient: (id: string) => void

  addLawyer: (l: Lawyer) => void
  updateLawyer: (id: string, l: Partial<Lawyer>) => void
  deleteLawyer: (id: string) => void

  addInvoice: (i: Invoice) => void
  updateInvoice: (id: string, i: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void

  addEvent: (e: CalendarEvent) => void
  updateEvent: (id: string, e: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void

  addDocument: (d: Document) => void
  deleteDocument: (id: string) => void

  addSealApproval: (s: SealApproval) => void
  updateSealApproval: (id: string, s: Partial<SealApproval>) => void

  addSealProxy: (p: SealProxy) => void
  removeSealProxy: (principalId: string, proxyId: string) => void

  meetingRooms: MeetingRoom[]
  meetingBookings: MeetingBooking[]
  addMeetingBooking: (b: MeetingBooking) => void
  updateMeetingBooking: (id: string, b: Partial<MeetingBooking>) => void

  invoiceRequests: InvoiceRequest[]
  addInvoiceRequest: (r: InvoiceRequest) => void
  updateInvoiceRequest: (id: string, r: Partial<InvoiceRequest>) => void

  approvalFlows: ApprovalFlow[]
  updateApprovalFlow: (id: string, f: Partial<ApprovalFlow>) => void

  workLogs: WorkLog[]
  addWorkLog: (w: WorkLog) => void

  docTemplates: DocTemplate[]
  addDocTemplate: (t: DocTemplate) => void
  updateDocTemplate: (id: string, t: Partial<DocTemplate>) => void
}

export const useStore = create<AppState>((set) => ({
  clients: mockClients,
  lawyers: mockLawyers,
  cases: mockCases,
  invoices: mockInvoices,
  events: mockEvents,
  documents: mockDocuments,
  sealApprovals: mockSealApprovals,
  sealProxies: mockSealProxies,

  addCase: (c) => set((s) => ({ cases: [...s.cases, c] })),
  updateCase: (id, c) => set((s) => ({ cases: s.cases.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
  deleteCase: (id) => set((s) => ({ cases: s.cases.filter((x) => x.id !== id) })),

  addClient: (c) => set((s) => ({ clients: [...s.clients, c] })),
  updateClient: (id, c) => set((s) => ({ clients: s.clients.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
  deleteClient: (id) => set((s) => ({ clients: s.clients.filter((x) => x.id !== id) })),

  addLawyer: (l) => set((s) => ({ lawyers: [...s.lawyers, l] })),
  updateLawyer: (id, l) => set((s) => ({ lawyers: s.lawyers.map((x) => (x.id === id ? { ...x, ...l } : x)) })),
  deleteLawyer: (id) => set((s) => ({ lawyers: s.lawyers.filter((x) => x.id !== id) })),

  addInvoice: (i) => set((s) => ({ invoices: [...s.invoices, i] })),
  updateInvoice: (id, i) => set((s) => ({ invoices: s.invoices.map((x) => (x.id === id ? { ...x, ...i } : x)) })),
  deleteInvoice: (id) => set((s) => ({ invoices: s.invoices.filter((x) => x.id !== id) })),

  addEvent: (e) => set((s) => ({ events: [...s.events, e] })),
  updateEvent: (id, e) => set((s) => ({ events: s.events.map((x) => (x.id === id ? { ...x, ...e } : x)) })),
  deleteEvent: (id) => set((s) => ({ events: s.events.filter((x) => x.id !== id) })),

  addDocument: (d) => set((s) => ({ documents: [...s.documents, d] })),
  deleteDocument: (id) => set((s) => ({ documents: s.documents.filter((x) => x.id !== id) })),

  addSealApproval: (sa) => set((s) => ({ sealApprovals: [sa, ...s.sealApprovals] })),
  updateSealApproval: (id, sa) => set((s) => ({ sealApprovals: s.sealApprovals.map((x) => (x.id === id ? { ...x, ...sa } : x)) })),

  addSealProxy: (p) => set((s) => ({ sealProxies: [...s.sealProxies, p] })),
  removeSealProxy: (principalId, proxyId) => set((s) => ({ sealProxies: s.sealProxies.filter((x) => !(x.principalId === principalId && x.proxyId === proxyId)) })),

  meetingRooms: mockMeetingRooms,
  meetingBookings: mockMeetingBookings,
  addMeetingBooking: (b) => set((s) => ({ meetingBookings: [...s.meetingBookings, b] })),
  updateMeetingBooking: (id, b) => set((s) => ({ meetingBookings: s.meetingBookings.map((x) => (x.id === id ? { ...x, ...b } : x)) })),

  invoiceRequests: mockInvoiceRequests,
  addInvoiceRequest: (r) => set((s) => ({ invoiceRequests: [r, ...s.invoiceRequests] })),
  updateInvoiceRequest: (id, r) => set((s) => ({ invoiceRequests: s.invoiceRequests.map((x) => (x.id === id ? { ...x, ...r } : x)) })),

  approvalFlows: mockApprovalFlows,
  updateApprovalFlow: (id, f) => set((s) => ({ approvalFlows: s.approvalFlows.map((x) => (x.id === id ? { ...x, ...f } : x)) })),

  workLogs: mockWorkLogs,
  addWorkLog: (w) => set((s) => ({ workLogs: [w, ...s.workLogs] })),

  docTemplates: mockDocTemplates,
  addDocTemplate: (t) => set((s) => ({ docTemplates: [t, ...s.docTemplates] })),
  updateDocTemplate: (id, t) => set((s) => ({ docTemplates: s.docTemplates.map((x) => (x.id === id ? { ...x, ...t } : x)) })),
}))
