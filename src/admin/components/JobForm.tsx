import { useState, useEffect } from 'react'
import type { Job } from '../types/admin.types'

interface JobFormProps {
  initialData?: Partial<Job>
  onSubmit: (data: Omit<Job, 'id' | 'created_at'>) => void
  loading: boolean
}

export function JobForm({ initialData, onSubmit, loading }: JobFormProps) {
  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState<Job['type']>('full-time')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [experience, setExperience] = useState('')
  const [duration, setDuration] = useState('')
  const [requirementsText, setRequirementsText] = useState('')
  const [responsibilitiesText, setResponsibilitiesText] = useState('')

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setDepartment(initialData.department || '')
      setLocation(initialData.location || '')
      setType(initialData.type || 'full-time')
      setDescription(initialData.description || '')
      setIsActive(initialData.is_active ?? true)
      setExperience(initialData.experience || '')
      setDuration(initialData.duration || '')
      setRequirementsText(initialData.requirements?.join('\n') || '')
      setResponsibilitiesText(initialData.responsibilities?.join('\n') || '')
    }
  }, [initialData])

  const parseLines = (text: string): string[] => {
    return text.split('\n').map(l => l.trim()).filter(Boolean)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title,
      department,
      location,
      type,
      description,
      is_active: isActive,
      experience,
      duration: duration || null,
      requirements: parseLines(requirementsText),
      responsibilities: parseLines(responsibilitiesText)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs max-w-xl bg-card/60 backdrop-blur-xl border border-border/50 p-6 rounded-2xl shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-extrabold uppercase text-muted-foreground font-mono tracking-wider">Job Title</label>
          <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border/60 focus:border-primary focus:bg-background outline-none text-[var(--z-text-primary)]" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase text-muted-foreground font-mono tracking-wider">Type</label>
          <select value={type} onChange={e => setType(e.target.value as Job['type'])} className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border/60 focus:border-primary focus:bg-background outline-none text-[var(--z-text-primary)] cursor-pointer">
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="remote">Remote</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase text-muted-foreground font-mono tracking-wider">Department</label>
          <input type="text" required value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border/60 focus:border-primary focus:bg-background outline-none text-[var(--z-text-primary)]" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase text-muted-foreground font-mono tracking-wider">Location</label>
          <input type="text" required value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border/60 focus:border-primary focus:bg-background outline-none text-[var(--z-text-primary)]" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase text-muted-foreground font-mono tracking-wider">Experience</label>
          <input type="text" required value={experience} onChange={e => setExperience(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border/60 focus:border-primary focus:bg-background outline-none text-[var(--z-text-primary)]" />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-extrabold uppercase text-muted-foreground font-mono tracking-wider">Duration (Optional)</label>
          <input type="text" value={duration} onChange={e => setDuration(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border/60 focus:border-primary focus:bg-background outline-none text-[var(--z-text-primary)]" />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-extrabold uppercase text-muted-foreground font-mono tracking-wider">Description</label>
          <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/60 focus:border-primary focus:bg-background outline-none text-[var(--z-text-primary)] leading-relaxed font-sans" />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-extrabold uppercase text-muted-foreground font-mono tracking-wider">Requirements (One per line)</label>
          <textarea required rows={3} value={requirementsText} onChange={e => setRequirementsText(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/60 focus:border-primary focus:bg-background outline-none text-[var(--z-text-primary)] font-mono leading-relaxed" />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-extrabold uppercase text-muted-foreground font-mono tracking-wider">Responsibilities (One per line)</label>
          <textarea rows={3} value={responsibilitiesText} onChange={e => setResponsibilitiesText(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/60 focus:border-primary focus:bg-background outline-none text-[var(--z-text-primary)] font-mono leading-relaxed" />
        </div>
        <div className="space-y-1 md:col-span-2 flex items-center gap-2">
          <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer" />
          <label htmlFor="isActive" className="text-[10px] font-extrabold uppercase text-muted-foreground font-mono tracking-wider cursor-pointer">Active / Accept Applications</label>
        </div>
      </div>
      <div className="flex justify-end pt-4 gap-3 border-t border-border/60">
        <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.01] hover:shadow-primary/35 active:scale-[0.99] transition-all cursor-pointer">
          {loading ? 'Saving...' : 'Submit'}
        </button>
      </div>
    </form>
  )
}
export default JobForm
