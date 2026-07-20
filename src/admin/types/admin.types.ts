export interface Job {
  id: string
  title: string
  department: string
  location: string
  type: 'full-time' | 'part-time' | 'remote'
  description: string
  is_active: boolean
  created_at: string
  experience?: string
  requirements?: string[]
  responsibilities?: string[]
  duration?: string | null
}

export interface Application {
  id: string
  job_id: string
  full_name: string
  email: string
  phone: string
  cv_url: string
  status: 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected'
  notes: string
  applied_at: string
  jobs?: Pick<Job, 'title'>   // joined from jobs table
  linkedin_url?: string
  portfolio_url?: string
  message?: string
  gender?: string
  gender_role?: string
  permanent_address?: string
  university_name?: string
  semester?: string
  program_name?: string
}
