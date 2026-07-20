import { Link, useNavigate } from 'react-router-dom'
import { useJobs } from '../hooks/useJobs'
import { useApplicants } from '../hooks/useApplicants'
import { Plus, Pencil, Trash2, MapPin, Briefcase, Award, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export function JobsList() {
  const { jobs, loading, deleteJob, fetchJobs } = useJobs()
  const { applicants } = useApplicants()
  const navigate = useNavigate()
  const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || 'zr-panel-x7k2'

  const handleDelete = async (id: string, title: string) => {
    const confirmed = window.confirm(`Permanently delete "${title}"? This cannot be undone and will remove it from the website immediately.`)
    if (!confirmed) return
    try {
      await deleteJob(id)
      toast.success(`Job deleted successfully`)
    } catch (err: any) {
      toast.error(`Failed to delete job: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <h2 className="text-base font-extrabold text-[var(--z-text-primary)]">
            Job & Internship Openings
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Manage current open roles and select candidate requirements.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => fetchJobs()}
            className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center justify-center cursor-pointer shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-primary" : ""} />
          </button>
          <Link
            to={`/${ADMIN_PATH}/jobs/create`}
            className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] hover:shadow-primary/35 active:scale-[0.99] transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={14} />
            Post New Opening
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-xs text-muted-foreground font-mono">Loading job openings...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-xs text-muted-foreground font-mono">
              No jobs posted yet.
            </div>
          ) : (
            jobs.map((role) => {
              const applicantCount = applicants.filter(
                (app) => app.job_id === role.id
              ).length
              return (
                <div
                  key={role.id}
                  className={`glass-panel p-6 rounded-2xl border flex flex-col justify-between shadow-md ${!role.is_active ? 'opacity-60 border-dashed border-border/40' : 'border-border'}`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono tracking-wider bg-primary/10 text-primary border border-primary/20">
                          {role.type}
                        </span>
                        <h3 className="text-base font-extrabold mt-1 text-[var(--z-text-primary)]">
                          {role.title} {!role.is_active && <span className="text-[10px] text-muted-foreground italic font-medium font-sans ml-1">(Archived)</span>}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-primary">{applicantCount}</span>
                        <p className="text-[9px] uppercase font-bold text-muted-foreground font-mono tracking-wide">
                          Applicants
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase size={14} className="text-primary shrink-0" />
                        <span>{role.department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin size={14} className="text-primary shrink-0" />
                        <span>{role.location}</span>
                      </div>
                      {role.duration && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Briefcase size={14} className="text-primary shrink-0" />
                          <span>{role.duration}</span>
                        </div>
                      )}
                      {role.experience && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Award size={14} className="text-primary shrink-0" />
                          <span>Experience: {role.experience}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground leading-relaxed mt-2 italic">
                        {role.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="border-t border-border/40 pt-4 flex items-end justify-between gap-4">
                    <div className="flex-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
                        Core Requirements:
                      </span>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        {role.requirements && role.requirements.slice(0, 2).map((req, idx) => (
                          <li key={idx} className="text-[11px] text-muted-foreground">
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => navigate(`/${ADMIN_PATH}/jobs/${role.id}/edit`)}
                        className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                        title="Edit Job Opening"
                      >
                        <Pencil size={12} />
                      </button>
                      {role.is_active && (
                        <button
                          onClick={() => handleDelete(role.id, role.title)}
                          className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                          title="Delete Job"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
export default JobsList
