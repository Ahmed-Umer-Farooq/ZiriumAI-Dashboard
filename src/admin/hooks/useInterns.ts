import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import type { Intern } from '../types/certificate.types'
import { generateCertificatePdf } from '../utils/certificateGenerator'

export function useInterns() {
  const [interns, setInterns] = useState<Intern[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInterns = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const { data, error } = await supabase
        .from('interns')
        .select('*, certificates(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInterns(data || [])
    } catch (error) {
      console.error('Error fetching interns:', error)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  const addIntern = useCallback(async (internData: Omit<Intern, 'id' | 'created_at' | 'certificates'>) => {
    try {
      const { data, error } = await supabase
        .from('interns')
        .insert([internData])
        .select()

      if (error) throw error
      if (data && data.length > 0) {
        setInterns(prev => [data[0], ...prev])
      }
      return data?.[0]
    } catch (error) {
      console.error('Error adding intern:', error)
      throw error
    }
  }, [])

  const updateInternStatus = useCallback(async (id: string, status: Intern['status']) => {
    try {
      const { error } = await supabase
        .from('interns')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      setInterns(prev =>
        prev.map(intern => (intern.id === id ? { ...intern, status } : intern))
      )
    } catch (error) {
      console.error('Error updating intern status:', error)
      throw error
    }
  }, [])

  const generateCertificate = useCallback(async (internId: string) => {
    try {
      const intern = interns.find(i => i.id === internId)
      if (!intern) throw new Error('Intern not found')
      if (intern.status !== 'completed') {
        throw new Error('Certificates can only be generated for completed interns')
      }

      // 1. Generate unique verification token
      const verificationToken = crypto.randomUUID()

      // 2. Generate sequential certificate code (e.g. ZIR-2026-0001)
      const currentYear = new Date().getFullYear()
      const { data: lastCert, error: certFetchError } = await supabase
        .from('certificates')
        .select('certificate_code')
        .order('created_at', { ascending: false })
        .limit(1)

      if (certFetchError) throw certFetchError

      let nextNumber = 1
      if (lastCert && lastCert.length > 0) {
        const lastCode = lastCert[0].certificate_code
        // Expected format: ZIR-YYYY-XXXX where XXXX is sequential digits
        const codeParts = lastCode.split('-')
        if (codeParts.length === 3 && codeParts[1] === String(currentYear)) {
          const lastNum = parseInt(codeParts[2], 10)
          if (!isNaN(lastNum)) {
            nextNumber = lastNum + 1
          }
        }
      }
      const certificateCode = `ZIR-${currentYear}-${String(nextNumber).padStart(4, '0')}`

      // 3. Build file name early so it's available for download
      const safeName = intern.full_name.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')
      const filePath = `${safeName}-${certificateCode}.pdf`

      // 4. Generate PDF client-side
      const pdfBlob = await generateCertificatePdf({
        internName: intern.full_name,
        role: intern.role,
        startDate: intern.start_date,
        endDate: intern.end_date,
        certificateCode,
        verificationToken
      })

      // 5. Trigger immediate browser download
      const downloadUrl = URL.createObjectURL(pdfBlob)
      const anchor = document.createElement('a')
      anchor.href = downloadUrl
      anchor.download = filePath
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(downloadUrl)

      // 6. Try to upload to storage (optional — download already happened above)
      let storedFilePath = ''
      try {
        const { error: uploadError } = await supabase.storage
          .from('certificates')
          .upload(filePath, pdfBlob, {
            contentType: 'application/pdf',
            cacheControl: '3600',
            upsert: true
          })
        if (!uploadError) storedFilePath = filePath
      } catch {
        // Storage upload failed — PDF was already downloaded, cert record still saves
      }

      // 7. Get issuing admin credentials
      const { data: { session } } = await supabase.auth.getSession()
      const issuedBy = session?.user?.email || 'System Admin'

      // 8. Save certificate record — pdf_url is file path if upload succeeded, empty otherwise
      const { data: newCert, error: insertError } = await supabase
        .from('certificates')
        .insert([
          {
            intern_id: internId,
            certificate_code: certificateCode,
            verification_token: verificationToken,
            issued_by: issuedBy,
            pdf_url: storedFilePath,
            status: 'valid'
          }
        ])
        .select()

      if (insertError) throw insertError

      // Refresh list of interns to include the generated certificate
      await fetchInterns(true)

      return newCert?.[0]
    } catch (error) {
      console.error('Error generating certificate:', error)
      throw error
    }
  }, [interns, fetchInterns])

  const deleteIntern = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('interns')
        .delete()
        .eq('id', id)
      if (error) throw error
      await fetchInterns(true)
    } catch (error) {
      console.error('Error deleting intern:', error)
      throw error
    }
  }, [fetchInterns])

  const revokeCertificate = useCallback(async (certificateId: string) => {
    try {
      const { error } = await supabase
        .from('certificates')
        .update({ status: 'revoked' })
        .eq('id', certificateId)

      if (error) throw error

      // Refresh list
      await fetchInterns(true)
    } catch (error) {
      console.error('Error revoking certificate:', error)
      throw error
    }
  }, [fetchInterns])

  useEffect(() => {
    fetchInterns()
  }, [fetchInterns])

  return {
    interns,
    loading,
    fetchInterns,
    addIntern,
    updateInternStatus,
    generateCertificate,
    revokeCertificate,
    deleteIntern
  }
}

