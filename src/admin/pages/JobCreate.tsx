import { useNavigate } from 'react-router-dom'
import { useJobs } from '../hooks/useJobs'
import { JobForm } from '../components/JobForm'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export function JobCreate() {
  const { createJob, loading } = useJobs()
  const navigate = useNavigate()
  const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || 'zr-panel-x7k2'

  const handleSubmit = async (data: any) => {
    try {
      await createJob(data)
      toast.success("Job opening created successfully!")
      navigate(`/${ADMIN_PATH}/jobs`)
    } catch (err: any) {
      toast.error(err.message || "Failed to create job opening")
    }
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
            Post New Job Opening
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Define requirements and description for a new opening.
          </p>
        </div>
      </div>

      <JobForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
export default JobCreate
