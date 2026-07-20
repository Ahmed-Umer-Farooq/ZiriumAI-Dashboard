import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import type { Application } from '../types/admin.types'

export function useApplicants(jobId?: string) {
  const [applicants, setApplicants] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  const fetchApplicants = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      let query = supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (jobId) {
        query = query.eq('role_id', jobId)
      }

      const { data, error } = await query
      if (error) throw error

      const mappedData: Application[] = (data || []).map((item: any) => ({
        id: item.id,
        job_id: item.role_id,
        full_name: item.name,
        email: item.email,
        phone: item.phone,
        cv_url: item.resume_url,
        status: item.status,
        notes: item.notes || '',
        applied_at: item.created_at,
        jobs: { title: item.role_title },
        linkedin_url: item.linkedin_url,
        portfolio_url: item.portfolio_url,
        message: item.message,
        gender: item.gender,
        gender_role: item.gender_role,
        permanent_address: item.permanent_address,
        university_name: item.university_name,
        semester: item.semester,
        program_name: item.program_name,
      }))

      setApplicants(mappedData)
    } catch (error) {
      console.error('Error fetching applicants:', error)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [jobId])

  const updateStatus = useCallback(async (id: string, status: Application['status']) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      // Note: local state is updated immediately for instant feedback,
      // but realtime event will keep it in sync across multiple dashboard users.
      setApplicants(prev => prev.map(app => app.id === id ? { ...app, status } : app))
    } catch (error) {
      console.error('Error updating status:', error)
      throw error
    }
  }, [])

  const updateNotes = useCallback(async (id: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ notes })
        .eq('id', id)

      if (error) throw error
      // Note: local state is updated immediately for instant feedback,
      // but realtime event will keep it in sync across multiple dashboard users.
      setApplicants(prev => prev.map(app => app.id === id ? { ...app, notes } : app))
    } catch (error) {
      console.error('Error updating notes:', error)
      throw error
    }
  }, [])

  const getCvUrl = useCallback(async (cv_url: string): Promise<string> => {
    try {
      if (!cv_url) return ''
      if (cv_url.startsWith('http://') || cv_url.startsWith('https://')) {
        return cv_url
      }
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(cv_url, 3600)

      if (error) {
        // Fallback to public URL
        const { data: pubData } = supabase.storage.from('resumes').getPublicUrl(cv_url)
        return pubData?.publicUrl || ''
      }
      return data?.signedUrl || ''
    } catch (error) {
      console.error('Error getting CV URL:', error)
      return ''
    }
  }, [])

  const deleteApplicant = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id)

      if (error) throw error
      // Note: local state is updated immediately for instant feedback,
      // but realtime event will keep it in sync across multiple dashboard users.
      setApplicants(prev => prev.filter(app => app.id !== id))
    } catch (error) {
      console.error('Error deleting applicant:', error)
      throw error
    }
  }, [])

  useEffect(() => {
    fetchApplicants()

    const channel = supabase
      .channel('job-applications-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_applications'
        },
        () => {
          fetchApplicants(true)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchApplicants])

  return { applicants, loading, fetchApplicants, updateStatus, updateNotes, getCvUrl, deleteApplicant }
}
export default useApplicants
