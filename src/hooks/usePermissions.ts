import { useMemo } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useStore } from '../store/useStore'

export function usePermissions() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const { cases, clients, invoices, events, documents } = useStore()
  const isAdmin = currentUser?.role === 'admin'

  const myCaseIds = useMemo(() => {
    if (isAdmin) return null
    return new Set(cases.filter((c) => c.lawyerId === currentUser?.id).map((c) => c.id))
  }, [cases, currentUser?.id, isAdmin])

  const myClientIds = useMemo(() => {
    if (isAdmin) return null
    return new Set(cases.filter((c) => c.lawyerId === currentUser?.id).map((c) => c.clientId))
  }, [cases, currentUser?.id, isAdmin])

  const filteredCases = useMemo(() => {
    if (isAdmin) return cases
    return cases.filter((c) => c.lawyerId === currentUser?.id)
  }, [cases, currentUser?.id, isAdmin])

  const filteredClients = useMemo(() => {
    if (isAdmin) return clients
    return clients.filter((c) => myClientIds!.has(c.id))
  }, [clients, myClientIds, isAdmin])

  const filteredInvoices = useMemo(() => {
    if (isAdmin) return invoices
    return invoices.filter((inv) => myCaseIds!.has(inv.caseId))
  }, [invoices, myCaseIds, isAdmin])

  const filteredEvents = useMemo(() => {
    if (isAdmin) return events
    return events.filter((e) => !e.caseId || myCaseIds!.has(e.caseId))
  }, [events, myCaseIds, isAdmin])

  const filteredDocuments = useMemo(() => {
    if (isAdmin) return documents
    return documents.filter((d) => !d.caseId || myCaseIds!.has(d.caseId))
  }, [documents, myCaseIds, isAdmin])

  return {
    isAdmin,
    currentUser,
    cases: filteredCases,
    clients: filteredClients,
    invoices: filteredInvoices,
    events: filteredEvents,
    documents: filteredDocuments,
  }
}
