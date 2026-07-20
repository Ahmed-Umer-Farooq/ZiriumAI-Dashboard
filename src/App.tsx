import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import AdminLogin from './admin/auth/AdminLogin'
import ProtectedRoute from './admin/auth/ProtectedRoute'
import AdminLayout from './admin/components/AdminLayout'
import AdminDashboard from './admin/pages/AdminDashboard'
import JobsList from './admin/pages/JobsList'
import JobCreate from './admin/pages/JobCreate'
import JobEdit from './admin/pages/JobEdit'
import ApplicantsList from './admin/pages/ApplicantsList'
import ApplicantDetail from './admin/pages/ApplicantDetail'
import InternsList from './admin/pages/InternsList'
import VerifyCertificate from './admin/pages/VerifyCertificate'

export function App() {
  const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || 'zr-panel-x7k2'

  return (
    <BrowserRouter>
      <Routes>
        <Route path={`/${ADMIN_PATH}`} element={<AdminLogin />} />
        <Route path={`/${ADMIN_PATH}/dashboard`} element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path={`/${ADMIN_PATH}/jobs`} element={
          <ProtectedRoute>
            <AdminLayout>
              <JobsList />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path={`/${ADMIN_PATH}/jobs/create`} element={
          <ProtectedRoute>
            <AdminLayout>
              <JobCreate />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path={`/${ADMIN_PATH}/jobs/:id/edit`} element={
          <ProtectedRoute>
            <AdminLayout>
              <JobEdit />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path={`/${ADMIN_PATH}/applicants`} element={
          <ProtectedRoute>
            <AdminLayout>
              <ApplicantsList />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path={`/${ADMIN_PATH}/applicants/:id`} element={
          <ProtectedRoute>
            <AdminLayout>
              <ApplicantDetail />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path={`/${ADMIN_PATH}/interns`} element={
          <ProtectedRoute>
            <AdminLayout>
              <InternsList />
            </AdminLayout>
          </ProtectedRoute>
        } />

        {/* Public Certificate Verification Page */}
        <Route path="/verify/:token" element={<VerifyCertificate />} />

        {/* All unknown URLs return a blank 404 — admin path is never revealed */}
        <Route path="*" element={<></>} />
      </Routes>
      <Toaster position="bottom-right" theme="light" closeButton richColors />
    </BrowserRouter>
  )
}
export default App
