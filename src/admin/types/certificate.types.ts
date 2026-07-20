export interface Intern {
  id: string
  full_name: string
  email: string
  role: string
  start_date: string
  end_date: string
  status: 'active' | 'completed' | 'terminated'
  created_at: string
  certificates?: Certificate[]
}

export interface Certificate {
  id: string
  intern_id: string
  certificate_code: string
  verification_token: string
  issued_at: string
  issued_by: string
  pdf_url: string | null
  status: 'valid' | 'revoked'
  created_at: string
  interns?: Intern
}

export interface VerificationResult {
  full_name: string
  role: string
  start_date: string
  end_date: string
  certificate_code: string
  issued_at: string
  status: 'valid' | 'revoked'
  pdf_url: string | null
}
