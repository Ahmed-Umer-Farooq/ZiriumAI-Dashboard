import React, { useState, useEffect } from 'react'
import { useInterns } from '../hooks/useInterns'
import {
  Award,
  Plus,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Download,
  X,
  User,
  Check,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

interface ConfirmModal {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
}

export function InternsList() {
  const {
    interns,
    loading,
    fetchInterns,
    addIntern,
    updateInternStatus,
    generateCertificate,
    revokeCertificate,
    deleteIntern
  } = useInterns()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    open: false, title: '', message: '', confirmLabel: 'Confirm', onConfirm: () => {}
  })

  // Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleAddIntern = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !role || !startDate || !endDate) {
      toast.error("Please fill in all required fields.")
      return
    }

    try {
      await addIntern({
        full_name: fullName,
        email,
        role,
        start_date: startDate,
        end_date: endDate,
        status: 'active'
      })
      toast.success("Intern added successfully.")
      setIsModalOpen(false)
      // Reset form
      setFullName('')
      setEmail('')
      setRole('')
      setStartDate('')
      setEndDate('')
    } catch (err: any) {
      toast.error(`Failed to add intern: ${err.message || err}`)
    }
  }

  const handleMarkCompleted = async (id: string) => {
    try {
      await updateInternStatus(id, 'completed')
      toast.success("Intern status updated to Completed.")
    } catch (err: any) {
      toast.error(`Error updating status: ${err.message || err}`)
    }
  }

  const handleGenerateCertificate = async (id: string) => {
    setGeneratingId(id)
    try {
      await generateCertificate(id)
      toast.success("Certificate generated and uploaded successfully!")
    } catch (err: any) {
      toast.error(`Generation failed: ${err.message || err}`)
    } finally {
      setGeneratingId(null)
    }
  }

  const handleRevokeCertificate = (certId: string) => {
    setConfirmModal({
      open: true,
      title: 'Revoke Certificate',
      message: 'This is irreversible. The QR code will show "REVOKED" to anyone who scans it. Are you sure?',
      confirmLabel: 'Yes, Revoke',
      onConfirm: async () => {
        setConfirmModal(m => ({ ...m, open: false }))
        setRevokingId(certId)
        try {
          await revokeCertificate(certId)
          toast.success("Certificate revoked successfully.")
        } catch (err: any) {
          toast.error(`Revoke failed: ${err.message || err}`)
        } finally {
          setRevokingId(null)
        }
      }
    })
  }

  const handleDeleteIntern = (id: string, name: string) => {
    setConfirmModal({
      open: true,
      title: 'Delete Intern',
      message: `Permanently delete "${name}" and all their records? This cannot be undone.`,
      confirmLabel: 'Yes, Delete',
      onConfirm: async () => {
        setConfirmModal(m => ({ ...m, open: false }))
        try {
          await deleteIntern(id)
          toast.success("Intern deleted successfully.")
        } catch (err: any) {
          toast.error(`Delete failed: ${err.message || err}`)
        }
      }
    })
  }

  const filteredInterns = interns.filter(intern => {
    const matchesSearch =
      intern.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intern.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intern.role?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      intern.status === statusFilter ||
      (statusFilter === 'certified' && intern.certificates && intern.certificates.length > 0)

    return matchesSearch && matchesStatus
  })

  // Pagination State & Logic
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // Reset to first page when search queries or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const totalPages = Math.ceil(filteredInterns.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedInterns = filteredInterns.slice(startIndex, endIndex)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-[var(--z-text-primary)] flex items-center gap-2">
            <Award className="text-primary" size={20} /> Intern Certificates Management
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Manage interns, update completion logs, and issue secure verification certificates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchInterns()}
            className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center justify-center cursor-pointer shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-primary" : ""} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-primary/25"
          >
            <Plus size={16} /> Add Intern
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm text-xs">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search interns by name, email, or role..."
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
            className="w-full pl-8 pr-4 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none transition-all cursor-pointer text-[var(--z-text-primary)] appearance-none"
          >
            <option value="all">All Interns</option>
            <option value="active">Active</option>
            <option value="completed">Completed (Pending Cert)</option>
            <option value="certified">Certified</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Interns Table */}
      <div className="glass-panel rounded-2xl border border-border shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground font-mono flex flex-col items-center gap-3">
            <RefreshCw size={24} className="animate-spin text-primary" />
            Synchronizing intern records...
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 text-muted-foreground border-b border-border/40">
                  <th className="p-4 text-xs font-bold uppercase font-sans">Intern</th>
                  <th className="p-4 text-xs font-bold uppercase font-sans">Role / Program</th>
                  <th className="p-4 text-xs font-bold uppercase font-sans">Tenure Duration</th>
                  <th className="p-4 text-xs font-bold uppercase font-sans">Status</th>
                  <th className="p-4 text-xs font-bold uppercase font-sans">Certificate</th>
                  <th className="p-4 text-xs font-bold uppercase font-sans text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {paginatedInterns.map((intern) => {
                  const certificate = intern.certificates?.[0]
                  const hasCertificate = !!certificate

                  return (
                    <tr key={intern.id} className="hover:bg-muted/20 transition-colors">
                      {/* Name / Email */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 uppercase">
                            {intern.full_name ? intern.full_name.slice(0, 2) : "IN"}
                          </div>
                          <div>
                            <div className="text-xs font-extrabold text-[var(--z-text-primary)]">
                              {intern.full_name}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {intern.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <span className="text-xs font-bold text-[var(--z-text-primary)]">
                          {intern.role || 'General Intern'}
                        </span>
                      </td>

                      {/* Tenure */}
                      <td className="p-4">
                        <div className="text-xs text-muted-foreground flex flex-col font-mono">
                          <span>{formatDate(intern.start_date)}</span>
                          <span className="text-[10px] text-muted-foreground/60">to</span>
                          <span>{formatDate(intern.end_date)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            intern.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : intern.status === 'completed'
                              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          }`}
                        >
                          {intern.status}
                        </span>
                      </td>

                      {/* Certificate Verification State */}
                      <td className="p-4">
                        {hasCertificate ? (
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase ${
                                certificate.status === 'valid'
                                  ? 'text-emerald-500'
                                  : 'text-rose-500'
                              }`}
                            >
                              {certificate.status === 'valid' ? (
                                <>
                                  <CheckCircle2 size={12} /> {certificate.certificate_code}
                                </>
                              ) : (
                                <>
                                  <AlertTriangle size={12} /> Revoked
                                </>
                              )}
                            </span>
                            <span className="text-[9px] text-muted-foreground/60 font-mono">
                              Issued: {formatDate(certificate.issued_at)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">None Issued</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* If Active, allow marking completed */}
                          {intern.status === 'active' && (
                            <button
                              onClick={() => handleMarkCompleted(intern.id)}
                              className="px-2.5 py-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all text-[10px] font-bold rounded-lg cursor-pointer"
                            >
                              Complete Tenure
                            </button>
                          )}

                          {/* If Completed and no certificate, allow generation */}
                          {intern.status === 'completed' && !hasCertificate && (
                            <button
                              onClick={() => handleGenerateCertificate(intern.id)}
                              disabled={generatingId === intern.id}
                              className="px-2.5 py-1 bg-primary text-primary-foreground hover:bg-primary/95 disabled:bg-muted disabled:text-muted-foreground transition-all text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              {generatingId === intern.id ? (
                                <>
                                  <RefreshCw size={10} className="animate-spin" /> Generating...
                                </>
                              ) : (
                                <>
                                  <FileText size={10} /> Issue Certificate
                                </>
                              )}
                            </button>
                          )}

                          {/* If Certificate generated */}
                          {hasCertificate && (
                            <div className="flex items-center gap-1.5">
                              {/* Open Verification Link */}
                              <a
                                href={`/verify/${certificate.verification_token}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 bg-muted hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                                title="Open Verification Page"
                              >
                                <ExternalLink size={14} />
                              </a>

                              {/* Download PDF */}
                              {certificate.pdf_url && (
                                <a
                                  href={certificate.pdf_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary rounded-lg transition-colors cursor-pointer"
                                  title="Download PDF"
                                >
                                  <Download size={14} />
                                </a>
                              )}

                              {/* Revoke Certificate */}
                              {certificate.status === 'valid' && (
                                <button
                                  onClick={() => handleRevokeCertificate(certificate.id)}
                                  disabled={revokingId === certificate.id}
                                  className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors cursor-pointer"
                                  title="Revoke Certificate"
                                >
                                  {revokingId === certificate.id ? (
                                    <RefreshCw size={14} className="animate-spin" />
                                  ) : (
                                    <AlertTriangle size={14} />
                                  )}
                                </button>
                              )}
                            </div>
                          )}

                          {/* Delete Intern */}
                          <button
                            onClick={() => handleDeleteIntern(intern.id, intern.full_name)}
                            className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete Intern"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {filteredInterns.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground font-mono">
                      No interns match the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-muted/20 border-t border-border/40 text-xs">
              <div className="text-muted-foreground font-medium">
                Showing <span className="font-bold text-[var(--z-text-primary)]">{startIndex + 1}</span> to{' '}
                <span className="font-bold text-[var(--z-text-primary)]">
                  {Math.min(endIndex, filteredInterns.length)}
                </span>{' '}
                of <span className="font-bold text-[var(--z-text-primary)]">{filteredInterns.length}</span> interns
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
                      currentPage === page
                        ? 'bg-primary text-primary-foreground border-primary shadow-primary/25'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>

      {/* Confirm Action Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
              <h3 className="text-sm font-extrabold text-[var(--z-text-primary)]">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{confirmModal.message}</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmModal(m => ({ ...m, open: false }))}
                className="px-4 py-2 border border-border hover:bg-muted text-muted-foreground rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-rose-500/25"
              >
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Intern Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl relative bg-card text-xs animate-scale-up">
            {/* Modal Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                <User size={16} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[var(--z-text-primary)]">Add New Intern</h3>
                <p className="text-[10px] text-muted-foreground">Register intern tenure details to the database.</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAddIntern} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border focus:border-primary focus:bg-background outline-none transition-all text-[var(--z-text-primary)]"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. johndoe@zirium.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border focus:border-primary focus:bg-background outline-none transition-all text-[var(--z-text-primary)]"
                />
              </div>

              {/* Role Title */}
              <div className="space-y-1">
                <label className="font-extrabold text-muted-foreground">Role / Program Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend Development Intern"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border focus:border-primary focus:bg-background outline-none transition-all text-[var(--z-text-primary)]"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-extrabold text-muted-foreground">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border focus:border-primary focus:bg-background outline-none transition-all text-[var(--z-text-primary)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-muted-foreground">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border focus:border-primary focus:bg-background outline-none transition-all text-[var(--z-text-primary)]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border hover:bg-muted text-muted-foreground rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-primary/25 cursor-pointer"
                >
                  <Check size={14} /> Save Intern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default InternsList
