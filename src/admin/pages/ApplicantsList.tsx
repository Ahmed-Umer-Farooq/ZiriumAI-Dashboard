import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApplicants } from '../hooks/useApplicants'
import { ApplicantTable } from '../components/ApplicantTable'
import { Search, Filter, Briefcase, ChevronDown, RefreshCw } from 'lucide-react'
import type { Application } from '../types/admin.types'
import { toast } from 'sonner'

export function ApplicantsList() {
  const { applicants, loading, updateStatus, fetchApplicants, deleteApplicant } = useApplicants()
  const navigate = useNavigate()
  const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || 'zr-panel-x7k2'

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')

  const handleStatusChange = async (id: string, status: Application['status']) => {
    try {
      await updateStatus(id, status)
      toast.success("Application status updated.")
    } catch (err: any) {
      toast.error(`Failed to update status: ${err.message || err}`)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteApplicant(id)
      toast.success("Candidate application deleted successfully.")
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message || err}`)
    }
  }

  const handleViewDetail = (id: string) => {
    navigate(`/${ADMIN_PATH}/applicants/${id}`)
  }

  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch =
      app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.university_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobs?.title?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    const matchesRole = roleFilter === 'all' || app.jobs?.title === roleFilter

    return matchesSearch && matchesStatus && matchesRole
  })

  // Get unique roles for filter
  const uniqueRoles = Array.from(new Set(applicants.map(app => app.jobs?.title).filter(Boolean)))

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-[var(--z-text-primary)]">
            Job Applications
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Review resumes, modify status logs, and manage candidates.
          </p>
        </div>
        <button
          onClick={() => fetchApplicants()}
          className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center justify-center cursor-pointer shadow-sm"
          title="Refresh Data"
        >
          <RefreshCw size={16} className={loading ? "animate-spin text-primary" : ""} />
        </button>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm text-xs">
        {/* Search Bar */}
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search candidates, emails, universities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary focus:bg-background outline-none transition-all placeholder:text-muted-foreground/60 text-[var(--z-text-primary)]"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 text-muted-foreground" size={14} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-8 pr-8 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none transition-all cursor-pointer text-[var(--z-text-primary)] appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="interview">Interview</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown className="absolute right-3 top-3 text-muted-foreground pointer-events-none" size={14} />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <Briefcase className="absolute left-3 top-2.5 text-muted-foreground" size={14} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-8 pr-8 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none transition-all cursor-pointer text-[var(--z-text-primary)] appearance-none"
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map((roleTitle) => (
              <option key={roleTitle} value={roleTitle}>
                {roleTitle}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 text-muted-foreground pointer-events-none" size={14} />
        </div>
      </div>

      {loading ? (
        <div className="text-xs text-muted-foreground font-mono">Loading candidates...</div>
      ) : (
        <ApplicantTable
          applicants={filteredApplicants}
          onStatusChange={handleStatusChange}
          onViewDetail={handleViewDetail}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
export default ApplicantsList
