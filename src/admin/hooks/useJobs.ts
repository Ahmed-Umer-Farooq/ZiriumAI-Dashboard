import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import type { Job } from '../types/admin.types'

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  const fetchJobs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  const createJob = useCallback(async (data: Omit<Job, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .insert([data])

      if (error) throw error
      await fetchJobs(true)
    } catch (error) {
      console.error('Error creating job:', error)
      throw error
    }
  }, [fetchJobs])

  const updateJob = useCallback(async (id: string, data: Partial<Job>) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update(data)
        .eq('id', id)

      if (error) throw error
      await fetchJobs(true)
    } catch (error) {
      console.error('Error updating job:', error)
      throw error
    }
  }, [fetchJobs])

  const deleteJob = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchJobs(true)
    } catch (error) {
      console.error('Error deleting job:', error)
      throw error
    }
  }, [fetchJobs])

  useEffect(() => {
    fetchJobs()

    const channel = supabase
      .channel('jobs-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        () => {
          fetchJobs(true)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchJobs])

  return { jobs, loading, fetchJobs, createJob, updateJob, deleteJob }
}

