import type { Application } from '../types/admin.types'

interface StatusBadgeProps {
  status: Application['status']
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getBadgeClass = (s: Application['status']) => {
    switch (s) {
      case 'pending': return 'bg-amber-100 text-amber-800 border border-amber-200'
      case 'reviewing': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'interview': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'accepted': return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
      case 'rejected': return 'bg-rose-100 text-rose-800 border border-rose-200'
      default: return 'bg-slate-100 text-slate-800 border border-slate-200'
    }
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getBadgeClass(status)}`}>
      {status}
    </span>
  )
}
export default StatusBadge
