import type { Application } from '../types/admin.types'
import { StatusBadge } from './StatusBadge'
import { Eye, Trash2 } from 'lucide-react'

interface ApplicantTableProps {
  applicants: Application[]
  onStatusChange: (id: string, status: Application['status']) => void
  onViewDetail: (id: string) => void
  onDelete: (id: string) => void
}

export function ApplicantTable({ applicants, onStatusChange, onViewDetail, onDelete }: ApplicantTableProps) {
  return (
    <div className="glass-panel rounded-2xl border border-border shadow-md overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/40 text-muted-foreground border-b border-border/40">
              <th className="p-4 text-xs font-bold uppercase font-sans">Applicant</th>
              <th className="p-4 text-xs font-bold uppercase font-sans">Role Title</th>
              <th className="p-4 text-xs font-bold uppercase font-sans">University</th>
              <th className="p-4 text-xs font-bold uppercase font-sans">Date Submitted</th>
              <th className="p-4 text-xs font-bold uppercase font-sans">Status</th>
              <th className="p-4 text-xs font-bold uppercase font-sans text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {applicants.map((app) => (
              <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 uppercase shrink-0">
                      {app.full_name ? app.full_name.slice(0, 2) : "AP"}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-[var(--z-text-primary)]">
                        {app.full_name}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">{app.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-xs font-bold">{app.jobs?.title || 'Unknown Job'}</span>
                </td>
                <td className="p-4">
                  <span className="text-xs text-[var(--z-text-primary)] font-medium">
                    {app.university_name || <span className="text-muted-foreground italic text-[10px]">Not Provided</span>}
                  </span>
                </td>
                <td className="p-4 text-xs text-muted-foreground font-mono">
                  {new Date(app.applied_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="p-4">
                  <StatusBadge status={app.status} />
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <select
                      value={app.status}
                      onChange={(e) => onStatusChange(app.id, e.target.value as Application['status'])}
                      className="px-2 py-1 text-[10px] rounded border border-border bg-card text-[var(--z-text-primary)] focus:outline-none cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="interview">Interview</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button
                      onClick={() => onViewDetail(app.id)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      title="Inspect Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${app.full_name}?`)) {
                          onDelete(app.id)
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                      title="Delete Candidate"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {applicants.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground font-mono">
                  No applicants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default ApplicantTable
