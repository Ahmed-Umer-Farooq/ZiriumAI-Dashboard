import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { VerificationResult } from '../types/certificate.types'
import {
  AlertOctagon,
  Calendar,
  ShieldCheck,
  Loader2,
  Building2,
  Award,
  Clock,
  User,
  Briefcase,
  Download
} from 'lucide-react'

export function VerifyCertificate() {
  const { token } = useParams<{ token: string }>()
  const [loading, setLoading] = useState(true)
  const [certInfo, setCertInfo] = useState<VerificationResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [pdfSignedUrl, setPdfSignedUrl] = useState<string | null>(null)

  // Update browser tab title based on verification result
  useEffect(() => {
    if (loading) {
      document.title = 'Verifying Certificate… | Zirium AI'
    } else if (errorMsg) {
      document.title = 'Invalid Certificate | Zirium AI'
    } else if (certInfo?.status === 'revoked') {
      document.title = 'Certificate Revoked | Zirium AI'
    } else if (certInfo) {
      document.title = `${certInfo.full_name} — Verified Certificate | Zirium AI`
    }
    return () => { document.title = 'Zirium AI | Command Dashboard' }
  }, [loading, errorMsg, certInfo])

  useEffect(() => {
    const runVerification = async () => {
      if (!token) {
        setErrorMsg("No verification token provided.")
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase.rpc('verify_certificate', {
          p_token: token
        })

        if (error) throw error

        if (data && data.length > 0) {
          const cert: VerificationResult = data[0]
          setCertInfo(cert)

          // Generate a 1-hour signed URL from the stored file path
          if (cert.pdf_url && cert.status === 'valid') {
            const isFullUrl = cert.pdf_url.startsWith('http')
            if (isFullUrl) {
              // Legacy records that stored the full public URL — use as-is
              setPdfSignedUrl(cert.pdf_url)
            } else {
              const { data: signed } = await supabase.storage
                .from('certificates')
                .createSignedUrl(cert.pdf_url, 3600) // expires in 1 hour
              if (signed?.signedUrl) setPdfSignedUrl(signed.signedUrl)
            }
          }
        } else {
          setErrorMsg("No authentic certificate was found matching this verification code.")
        }
      } catch (err: any) {
        console.error('Verification query failed:', err)
        setErrorMsg("System error checking verification signature. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    runVerification()
  }, [token])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }



  return (
    <div className="min-h-screen flex flex-col justify-between font-sans selection:bg-primary/30 selection:text-slate-900 relative overflow-hidden bg-white text-slate-800">
      {/* Premium Ambient Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[25%] h-[25%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      {/* Logo Watermark Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden select-none">
        <img 
          src="/logo.png" 
          alt="ZiriumAI Logo Watermark" 
          className="w-[450px] h-[450px] sm:w-[700px] sm:h-[700px] md:w-[1000px] md:h-[1000px] opacity-[0.07] object-contain" 
        />
      </div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-100 relative z-10">
        <a href="https://ziriumai.com" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 0, textDecoration: "none" }}>
          <img src="/logo.png" alt="ZiriumAI" style={{ height: 38, width: "auto", marginRight: -8, flexShrink: 0, objectFit: "contain" }} />
          <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: 17, display: "inline-flex", alignItems: "center", letterSpacing: "0em", lineHeight: 1 }}>
            {"Zirium".split("").map((ch, i) => (
              <span key={i} style={{ color: "#0d0d0d" }}>{ch}</span>
            ))}
            <span style={{ display: "inline-block", width: 5 }} />
            <span style={{ color: "#41C6F1", display: "inline-flex", alignItems: "flex-end" }}>
              <span>A</span>
              <span style={{ position: "relative", display: "inline-block", transform: "scaleX(0.90)", fontSize: "0.90em" }}>
                I
                <svg style={{ position: "absolute", top: "-0.14em", left: "64%", transform: "translateX(-50%)" }} width="0.45em" height="0.40em" viewBox="0 0 20 28">
                  <path d="M10 0 C11.5 6 14 8.5 20 10 C14 11.5 11.5 14 10 20 C8.5 14 6 11.5 0 10 C6 8.5 8.5 6 10 0 Z" fill="#41C6F1" />
                </svg>
              </span>
            </span>
          </span>
        </a>
        <a
          href="https://ziriumai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:border-cyan-400 hover:text-cyan-600 transition-all"
        >
          Visit ziriumai.com
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </header>

      {/* Main Verification Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col justify-center relative z-10">
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-sm text-slate-500 font-mono tracking-wide">Validating digital credentials...</p>
          </div>
        ) : errorMsg ? (
          /* Error State: Invalid / Not Found */
          <div className="bg-transparent border border-slate-200/80 p-8 md:p-12 rounded-3xl text-center space-y-6 shadow-xl relative overflow-hidden max-w-xl mx-auto w-full">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 to-red-600" />
            <div className="mx-auto w-20 h-20 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center animate-pulse shadow-lg shadow-rose-500/5">
              <AlertOctagon size={36} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-rose-600 uppercase tracking-tight">Not Verified</h2>
              <p className="text-xs text-slate-400 font-mono">CODE EXPIRED OR SIGNATURE INVALID</p>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-600 leading-relaxed font-sans">{errorMsg}</p>
            </div>
            <div className="pt-2 text-slate-400 text-[10px] font-sans">
              If this certificate is genuine, please contact Zirium AI support to resolve this issue.
            </div>
          </div>
        ) : certInfo?.status === 'revoked' ? (
          /* Revoked State */
          <div className="bg-transparent border border-slate-200/80 p-8 md:p-12 rounded-3xl text-center space-y-6 shadow-xl relative overflow-hidden max-w-xl mx-auto w-full">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 to-amber-600" />
            <div className="mx-auto w-20 h-20 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/5">
              <AlertOctagon size={36} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Certificate Revoked</h2>
              <p className="text-xs text-amber-600 font-mono uppercase tracking-wider font-semibold">Invalidated Document</p>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                This certificate (ID: <strong className="font-mono text-slate-800">{certInfo.certificate_code}</strong>) was generated by Zirium AI but has since been **revoked** and is no longer recognized as valid.
              </p>
              <p className="text-[10px] text-slate-500">
                Issued to: <strong className="text-slate-700">{certInfo.full_name}</strong>
                <br />
                Role: <strong className="text-slate-700">{certInfo.role}</strong>
              </p>
            </div>
            <p className="text-slate-500 text-xs font-sans">
              This credential should not be accepted as valid proof of employment or internship completion.
            </p>
          </div>
        ) : (
          /* Valid State: SUCCESS (Polished 2-Column Dashboard View) */
          <div className="bg-transparent border border-slate-200/80 rounded-3xl shadow-xl hover:shadow-2xl hover:border-slate-300/80 relative overflow-hidden transition-all duration-300">
            {/* Emerald Top Accent Line */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

            <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-200/80 pt-1.5">
              
              {/* Left Column: Verification Badge & Recipient (2/5 Width) */}
              <div className="md:col-span-2 p-8 flex flex-col justify-between items-center text-center bg-transparent">
                
                {/* Shield Icon & Glow */}
                <div className="relative flex items-center justify-center py-6 w-full">
                  <div className="absolute w-24 h-24 rounded-full bg-emerald-500/10 blur-xl animate-pulse" />
                  <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-500/20 flex items-center justify-center shadow-md shrink-0">
                    <ShieldCheck size={44} className="animate-bounce-subtle" />
                  </div>
                </div>

                {/* Status Badge */}
                <div className="space-y-4 w-full">
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border border-emerald-500/20 tracking-wider shadow-sm">
                      VERIFIED ORIGINAL
                    </div>
                    <h3 className="text-xs text-slate-500 font-mono tracking-widest mt-3 uppercase">Recipient</h3>
                  </div>

                  {/* Recipient Large Name */}
                  <h2 className="text-2xl font-black tracking-tight leading-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent px-2">
                    {certInfo?.full_name}
                  </h2>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[240px] mx-auto">
                    This document is officially registered and verified by Zirium AI's digital credentials database.
                  </p>
                </div>

                <div className="pt-6 w-full">
                  <div className="text-[9px] text-slate-400 font-mono uppercase tracking-widest mb-1">Certificate ID</div>
                  <div className="text-sm font-black text-cyan-600 font-mono tracking-widest bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-center">
                    {certInfo?.certificate_code}
                  </div>
                </div>
              </div>

              {/* Right Column: Key Details & Download (3/5 Width) */}
              <div className="md:col-span-3 p-8 md:p-10 flex flex-col justify-between space-y-8 bg-transparent">
                
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
                    <Briefcase size={14} className="text-cyan-600" /> Internship Credentials Info
                  </h3>

                  {/* Details Grid */}
                  <div className="space-y-5">
                    {/* Organization */}
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 mt-0.5">
                        <Building2 size={16} />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Issuing Authority</div>
                        <div className="text-sm font-bold text-slate-700">Zirium AI</div>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 mt-0.5">
                        <User size={16} />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Completed Program / Role</div>
                        <div className="text-sm font-bold text-slate-700">{certInfo?.role}</div>
                      </div>
                    </div>

                    {/* Tenure */}
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 mt-0.5">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Internship Duration</div>
                        <div className="text-sm font-bold text-slate-700 font-mono">
                          {formatDate(certInfo?.start_date || '')} – {formatDate(certInfo?.end_date || '')}
                        </div>
                      </div>
                    </div>

                    {/* Certificate ID */}
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 mt-0.5">
                        <Award size={16} />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Certificate Code</div>
                        <div className="text-sm font-bold text-cyan-600 font-mono tracking-wider">
                          {certInfo?.certificate_code}
                        </div>
                      </div>
                    </div>

                    {/* Issued Date */}
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 mt-0.5">
                        <Clock size={16} />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Date Issued</div>
                        <div className="text-sm font-bold text-slate-700 font-mono">
                          {formatDate(certInfo?.issued_at || '')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {/* PDF Download — signed URL, expires in 1 hour */}
                  {pdfSignedUrl && (
                    <a
                      href={pdfSignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer"
                      style={{
                        background: "linear-gradient(135deg, #67dcf9 0%, #41C6F1 48%, #1fb3de 100%)",
                        color: "#fff",
                        boxShadow: "0 4px 18px rgba(65,198,241,0.30)"
                      }}
                    >
                      <Download size={14} />
                      Download Certificate PDF
                    </a>
                  )}

                  {/* Website CTA */}
                  <a
                    href="https://ziriumai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider border border-slate-200 text-slate-500 hover:border-cyan-400 hover:text-cyan-600 transition-all duration-200"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    Explore Zirium AI — ziriumai.com
                  </a>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 text-[10px] text-slate-400 font-medium">
        <p>© {new Date().getFullYear()} Zirium AI. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="https://ziriumai.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-500 transition-colors">
            ziriumai.com
          </a>
          <p className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-500" /> Secure digital verification system.
          </p>
        </div>
      </footer>
    </div>
  )
}
export default VerifyCertificate
