import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuth } from './useAdminAuth'
import { RefreshCw } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean)

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, signOut } = useAdminAuth()
  const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || 'zr-panel-x7k2'

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <RefreshCw className="animate-spin text-primary" size={32} />
        <p className="text-sm text-muted-foreground font-mono">Synchronizing secure session...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={`/${ADMIN_PATH}`} replace />
  }

  // Email allowlist: if VITE_ADMIN_EMAILS is set, reject anyone not on the list
  if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
    signOut()
    return <Navigate to={`/${ADMIN_PATH}`} replace />
  }

  return <>{children}</>
}
export default ProtectedRoute
