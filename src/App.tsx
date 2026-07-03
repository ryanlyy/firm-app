import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import ChangePassword from './pages/ChangePassword'
import Dashboard from './pages/Dashboard'
import Cases from './pages/Cases'
import Clients from './pages/Clients'
import Lawyers from './pages/Lawyers'
import Finance from './pages/Finance'
import Calendar from './pages/Calendar'
import Documents from './pages/Documents'
import BackupRestore from './pages/BackupRestore'
import Manual from './pages/Manual'
import FirmProfile from './pages/FirmProfile'
import ConflictCheck from './pages/ConflictCheck'
import SealApproval from './pages/SealApproval'
import WorkLogs from './pages/WorkLogs'
import DocTemplates from './pages/DocTemplates'
import MeetingRooms from './pages/MeetingRooms'
import InvoiceManagement from './pages/InvoiceManagement'
import ApprovalCenter from './pages/ApprovalCenter'

function AdminRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useAuthStore((s) => s.currentUser)
  if (currentUser?.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

function ChangePasswordGuard() {
  const { isAuthenticated, mustChangePassword } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!mustChangePassword) return <Navigate to="/" replace />
  return <ChangePassword />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePasswordGuard />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/lawyers" element={<AdminRoute><Lawyers /></AdminRoute>} />
          <Route path="/finance" element={<AdminRoute><Finance /></AdminRoute>} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/conflict-check" element={<ConflictCheck />} />
          <Route path="/seal-approval" element={<SealApproval />} />
          <Route path="/work-logs" element={<WorkLogs />} />
          <Route path="/doc-templates" element={<DocTemplates />} />
          <Route path="/meeting-rooms" element={<MeetingRooms />} />
          <Route path="/invoice-mgmt" element={<InvoiceManagement />} />
          <Route path="/approvals" element={<ApprovalCenter />} />
          <Route path="/firm" element={<FirmProfile />} />
          <Route path="/backup" element={<AdminRoute><BackupRestore /></AdminRoute>} />
          <Route path="/manual" element={<Manual />} />
          <Route path="/settings/password" element={<ChangePassword />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
