import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/store'
import LoginPage from './pages/LoginPage'
import MainLayout from './layouts/MainLayout'
import DashboardPage from './pages/DashboardPage'
import ApprovalsPage from './pages/ApprovalsPage'
import TasksPage from './pages/TasksPage'
import SchedulesPage from './pages/SchedulesPage'
import NoticesPage from './pages/NoticesPage'

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="schedules" element={<SchedulesPage />} />
        <Route path="notices" element={<NoticesPage />} />
      </Route>
    </Routes>
  )
}
