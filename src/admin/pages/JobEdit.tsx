import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useJobs } from '../hooks/useJobs'
import { JobForm } from '../components/JobForm'
import type { Job } from '../types/admin.types'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export function JobEdit() {
  const { id } = useParams<{ id: string }>()
  const { jobs, updateJob, loading } = useJobs()
  const navigate = useNavigate()
  const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || 'zr-panel-x7k2'
  const [job, setJob] = useState<Job | undefined>(undefined)

  useEffect(() => {
    if (id && jobs.length > 0) {
      const found = jobs.find(j => j.id === id)
      setJob(found)
    }
  }, [id, jobs])

  const handleSubmit = async (data: any) => {
    if (!id) return
    try {
      await updateJob(id, data)
      toast.success("Job opening updated successfully!")
      navigate(`/${ADMIN_PATH}/jobs`)
    } catch (err: any) {
      toast.error(err.message || "Failed to update job opening")
    }
  }

  if (loading && !job) {
    return <div className="text-xs text-muted-foreground font-mono">Loading details...</div>
  }

  if (!job) {
    return <div className="text-xs text-muted-foreground font-mono">Job not found.</div>
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-border/40">
        <button
          onClick={() => navigate(`/${ADMIN_PATH}/jobs`)}
          className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center justify-center cursor-pointer shadow-sm"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-base font-extrabold text-[var(--z-text-primary)]">
            Edit Job Opening
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Modify details for "{job.title}".
          </p>
        </div>
      </div>

      <JobForm initialData={job} onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
export default JobEdit
