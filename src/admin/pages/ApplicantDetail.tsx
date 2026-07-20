import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApplicants } from '../hooks/useApplicants'
import type { Application } from '../types/admin.types'
import { Mail, Phone, User, MapPin, ExternalLink, BookOpen, ChevronLeft, RefreshCw, Check } from 'lucide-react'
import { toast } from 'sonner'
import { StatusBadge } from '../components/StatusBadge'

export function ApplicantDetail() {
  const { id } = useParams<{ id: string }>()
  const { applicants, updateStatus, updateNotes, getCvUrl, loading } = useApplicants()
  const navigate = useNavigate()
  const [applicant, setApplicant] = useState<Application | undefined>(undefined)
  const [resumeUrl, setResumeUrl] = useState('')
  const [loadingResume, setLoadingResume] = useState(false)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || 'zr-panel-x7k2'

  useEffect(() => {
    if (id && applicants.length > 0) {
      const found = applicants.find(a => a.id === id)
      if (found) {
        setApplicant(found)
        setNotes(found.notes || '')
        
        setLoadingResume(true)
        getCvUrl(found.cv_url)
          .then(url => {
            setResumeUrl(url)
            setLoadingResume(false)
          })
          .catch(() => setLoadingResume(false))
      }
    }
  }, [id, applicants, getCvUrl])

  const handleStatusUpdate = async (status: Application['status']) => {
    if (!id) return
    try {
      await updateStatus(id, status)
      toast.success(`Status updated to ${status}`)
      if (applicant) setApplicant({ ...applicant, status })
    } catch (error) {
      console.error("Failed to update status:", error)
      toast.error("Failed to update status")
    }
  }

  const handleNotesSave = async () => {
    if (!id) return
    setSavingNotes(true)
    try {
      await updateNotes(id, notes)
      toast.success("Notes saved successfully")
      if (applicant) setApplicant({ ...applicant, notes })
    } catch (error) {
      console.error("Failed to save notes:", error)
      toast.error("Failed to save notes")
    } finally {
      setSavingNotes(false)
    }
  }

  if (loading && !applicant) {
    return <div className="text-xs text-muted-foreground font-mono p-8">Loading details...</div>
  }

  if (!applicant) {
    return <div className="text-xs text-muted-foreground font-mono p-8">Applicant not found.</div>
  }

  const hasResume = !!applicant.cv_url

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/${ADMIN_PATH}/applicants`)}
            className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center justify-center cursor-pointer shadow-sm"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h2 className="text-base font-extrabold text-[var(--z-text-primary)]">{applicant.full_name}</h2>
            <p className="text-xs text-primary font-bold">{applicant.jobs?.title || 'Unknown Job'}</p>
          </div>
        </div>
        <StatusBadge status={applicant.status} />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Info */}
        <div className={`space-y-6 ${hasResume ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
          {/* Personal Details */}
          <div className="glass-panel p-5 rounded-2xl border border-border/60 space-y-4">
            <h3 className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider font-mono">Personal Details</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail size={14} className="text-primary shrink-0" />
                <span className="font-mono text-[11px] text-[var(--z-text-primary)] select-all">{applicant.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={14} className="text-primary shrink-0" />
                <span className="font-mono text-[11px] text-[var(--z-text-primary)] select-all">{applicant.phone}</span>
              </div>
              {applicant.gender && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User size={14} className="text-primary shrink-0" />
                  <span className="font-medium text-[var(--z-text-primary)] capitalize">
                    Gender: {applicant.gender} {applicant.gender_role ? `(${applicant.gender_role})` : ""}
                  </span>
                </div>
              )}
              {applicant.permanent_address && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                  <span className="font-medium text-[var(--z-text-primary)]">{applicant.permanent_address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Academic Background */}
          {applicant.university_name && (
            <div className="glass-panel p-5 rounded-2xl border border-border/60 space-y-4">
              <h3 className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider font-mono">Academic Background</h3>
              <div className="p-3 bg-muted/30 border border-border rounded-xl space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <BookOpen size={13} className="text-primary" />
                  {applicant.university_name}
                </div>
                <div className="text-muted-foreground font-medium">{applicant.program_name || "Program not listed"}</div>
                {applicant.semester && (
                  <div className="text-[10px] text-muted-foreground font-mono">Current Semester: {applicant.semester}</div>
                )}
              </div>
            </div>
          )}

          {/* Links & Cover Letter */}
          <div className="glass-panel p-5 rounded-2xl border border-border/60 space-y-4">
            <h3 className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider font-mono">Links & Covered Message</h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                {applicant.linkedin_url && (
                  <a href={applicant.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline font-semibold">
                    <ExternalLink size={14} /> LinkedIn
                  </a>
                )}
                {applicant.portfolio_url && (
                  <a href={applicant.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline font-semibold">
                    <ExternalLink size={14} /> Portfolio / GitHub
                  </a>
                )}
              </div>
              <div className="p-3 bg-muted/30 border border-border rounded-xl text-muted-foreground italic leading-relaxed whitespace-pre-line">
                {applicant.message ? `"${applicant.message}"` : "No cover message provided."}
              </div>
            </div>
          </div>

          {/* Reviewer Notes & Status */}
          <div className="glass-panel p-5 rounded-2xl border border-border/60 space-y-4">
            <h3 className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider font-mono">Reviewer Log</h3>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { status: "pending", label: "Pending", color: "hover:bg-amber-500/10 text-amber-500" },
                  { status: "reviewing", label: "Review", color: "hover:bg-blue-500/10 text-blue-500" },
                  { status: "interview", label: "Interview", color: "hover:bg-yellow-500/10 text-yellow-500" },
                  { status: "accepted", label: "Accept", color: "hover:bg-emerald-500/10 text-emerald-500" },
                  { status: "rejected", label: "Reject", color: "hover:bg-rose-500/10 text-rose-500" },
                ].map((act) => {
                  const isActive = applicant.status === act.status
                  return (
                    <button
                      key={act.status}
                      onClick={() => handleStatusUpdate(act.status as any)}
                      className={`px-3 py-1.5 rounded-lg border border-border text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                        act.color
                      } ${isActive ? "bg-muted/80 border-primary" : "bg-card"}`}
                    >
                      {isActive && <Check size={10} />}
                      {act.label}
                    </button>
                  )
                })}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider font-mono block">Reviewer Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record interview notes or applicant review feedback..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/60 focus:border-primary focus:bg-background outline-none transition-all placeholder:text-muted-foreground/40 text-[var(--z-text-primary)] font-medium resize-y leading-relaxed font-sans"
                />
                <button
                  onClick={handleNotesSave}
                  disabled={savingNotes}
                  className="px-4 py-2 bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-md hover:opacity-90 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingNotes && <RefreshCw size={10} className="animate-spin" />}
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Resume Preview */}
        {hasResume && (
          <div className="lg:col-span-6 flex flex-col h-[65vh] border border-border/60 rounded-2xl overflow-hidden bg-muted/10">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-card">
              <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider font-mono">Resume Document Preview</span>
              {resumeUrl && (
                <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-extrabold text-[10px] flex items-center gap-1">
                  <ExternalLink size={10} /> Open Direct
                </a>
              )}
            </div>
            <div className="flex-1 bg-neutral-900 flex items-center justify-center relative">
              {loadingResume ? (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <RefreshCw className="animate-spin text-primary" size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Generating Secure Link...</span>
                </div>
              ) : (
                <iframe src={`${resumeUrl}#view=FitH&toolbar=0`} className="w-full h-full border-none" title="Candidate Resume Preview" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default ApplicantDetail
