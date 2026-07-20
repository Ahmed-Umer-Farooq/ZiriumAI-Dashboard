import React, { useState } from "react"
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"
import { useAdminAuth } from "./useAdminAuth"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

const MIN_PASSWORD_LENGTH = 13

export function AdminLogin() {
  const { signIn } = useAdminAuth()
  const navigate   = useNavigate()
  const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || 'zr-panel-x7k2'

  const [authEmail,    setAuthEmail]    = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [authLoading,  setAuthLoading]  = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [brandKey,     setBrandKey]     = useState(0)
  const [emailFocus,   setEmailFocus]   = useState(false)
  const [passFocus,    setPassFocus]    = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (authPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    setAuthLoading(true)
    try {
      await signIn(authEmail, authPassword)
      toast.success("Welcome back.")
      navigate(`/${ADMIN_PATH}/dashboard`)
    } catch (err: any) {
      toast.error(err.message || "Authentication failed")
    } finally {
      setAuthLoading(false)
    }
  }

  const inputStyle = (focused: boolean, extraRight = false): React.CSSProperties => ({
    width: "100%",
    padding: extraRight ? "11px 44px 11px 14px" : "11px 14px",
    borderRadius: 12,
    background: focused ? "#FFFFFF" : "#F1F5F9",
    border: `1.5px solid ${focused ? "#41C6F1" : "#DDE3EC"}`,
    color: "#000000",
    fontSize: "0.875rem",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    boxShadow: focused ? "0 0 0 4px rgba(65,198,241,0.10)" : "none",
  })

  return (
    <div style={{
      height: "100vh", width: "100%",
      position: "relative", display: "flex",
      alignItems: "center", justifyContent: "center",
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ── Background video ── */}
      <video autoPlay muted loop playsInline style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        objectFit: "cover", zIndex: 0,
      }}>
        <source src="/Home-Background.mp4" type="video/mp4" />
      </video>

      {/* ── White frost overlay — lets video breathe ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "rgba(232,242,250,0.86)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }} />

      {/* ── Cyan glow top-right ── */}
      <div style={{
        position: "absolute", top: "-20%", right: "-15%",
        width: 650, height: 650, borderRadius: "50%", zIndex: 2, pointerEvents: "none",
        background: "radial-gradient(circle, rgba(65,198,241,0.16) 0%, transparent 65%)",
      }} />

      {/* ── Cyan glow bottom-left ── */}
      <div style={{
        position: "absolute", bottom: "-20%", left: "-15%",
        width: 550, height: 550, borderRadius: "50%", zIndex: 2, pointerEvents: "none",
        background: "radial-gradient(circle, rgba(65,198,241,0.10) 0%, transparent 65%)",
      }} />

      {/* ── Dot grid (fades toward edges) ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, rgba(65,198,241,0.22) 1px, transparent 1px)",
        backgroundSize: "38px 38px",
        maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%)",
        opacity: 0.35,
      }} />

      {/* ══════════════════════ CARD ══════════════════════ */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 450, margin: "0 20px" }}>

        {/* Animated cyan top bar */}
        <div className="zr-top-bar" style={{
          height: 3,
          background: "linear-gradient(90deg, transparent 0%, #41C6F1 35%, #67dcf9 55%, #41C6F1 75%, transparent 100%)",
          backgroundSize: "200% 100%",
          borderRadius: "12px 12px 0 0",
        }} />

        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid rgba(65,198,241,0.16)",
          borderTop: "none",
          borderRadius: "0 0 26px 26px",
          padding: "30px 38px 26px",
          boxShadow: [
            "0 0 0 1px rgba(65,198,241,0.05)",
            "0 4px 6px rgba(0,0,0,0.03)",
            "0 16px 48px rgba(65,198,241,0.09)",
            "0 40px 90px rgba(0,0,0,0.10)",
            "inset 0 1px 0 rgba(255,255,255,1)",
          ].join(", "),
        }}>

          {/* ── Logo + brand ── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 22 }}>

            {/* Logo with pulse ring */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="zr-logo-ring" style={{
                position: "absolute", width: 118, height: 118, borderRadius: "50%",
                border: "1px solid rgba(65,198,241,0.22)",
              }} />
              <div style={{
                position: "absolute", width: 105, height: 105, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(65,198,241,0.13) 0%, transparent 70%)",
                filter: "blur(6px)",
              }} />
              <img src="/logo.png" alt="ZiriumAI"
                style={{ width: 88, height: 88, objectFit: "contain", position: "relative" }} />
            </div>

            {/* Brand name with hover-bounce */}
            <div style={{ textAlign: "center" }}>
              <div
                onMouseEnter={() => setBrandKey(k => k + 1)}
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 900, fontSize: "1.9rem",
                  letterSpacing: "0em", lineHeight: 1,
                  display: "inline-flex", alignItems: "center",
                  cursor: "default",
                }}
              >
                {"Zirium".split("").map((ch, i) => (
                  <span key={`${brandKey}-${i}`} className="zr-letter-bounce"
                    style={{ color: "#0d0d0d", display: "inline-block", animationDelay: `${i * 55}ms` }}>
                    {ch}
                  </span>
                ))}
                <span style={{ display: "inline-block", width: 6 }} />
                <span style={{ color: "#41C6F1", display: "inline-flex", alignItems: "flex-end" }}>
                  <span key={`${brandKey}-A`} className="zr-letter-bounce"
                    style={{ display: "inline-block", animationDelay: "385ms" }}>A</span>
                  <span key={`${brandKey}-I`} className="zr-letter-bounce"
                    style={{ position: "relative", display: "inline-block", transform: "scaleX(0.90)", fontSize: "0.90em", animationDelay: "440ms" }}>
                    I
                    <svg style={{ position: "absolute", top: "-0.14em", left: "64%", transform: "translateX(-50%)" }}
                      width="0.45em" height="0.40em" viewBox="0 0 20 28">
                      <path d="M10 0 C11.5 6 14 8.5 20 10 C14 11.5 11.5 14 10 20 C8.5 14 6 11.5 0 10 C6 8.5 8.5 6 10 0 Z" fill="#41C6F1" />
                    </svg>
                  </span>
                </span>
              </div>

              {/* Subtitle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 7 }}>
                <div style={{ width: 16, height: 1, background: "rgba(65,198,241,0.45)" }} />
                <p style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.6rem", fontWeight: 800,
                  letterSpacing: "0.22em", color: "#0d0d0d",
                  textTransform: "uppercase", margin: 0,
                }}>
                  Admin Command Center
                </p>
                <div style={{ width: 16, height: 1, background: "rgba(65,198,241,0.45)" }} />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(65,198,241,0.2) 30%, rgba(65,198,241,0.2) 70%, transparent)",
            marginBottom: 22,
          }} />

          {/* ── Form ── */}
          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Email */}
            <div>
              <label style={{
                display: "block",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.56rem", fontWeight: 700,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: emailFocus ? "#41C6F1" : "#374151",
                marginBottom: 7, transition: "color 0.2s",
              }}>
                Email Address
              </label>
              <input
                type="email" required
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                placeholder="zirium.info@gmail.com"
                style={inputStyle(emailFocus)}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: "block",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.56rem", fontWeight: 700,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: passFocus ? "#41C6F1" : "#374151",
                marginBottom: 7, transition: "color 0.2s",
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required minLength={MIN_PASSWORD_LENGTH}
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  onFocus={() => setPassFocus(true)}
                  onBlur={() => setPassFocus(false)}
                  placeholder="•••••••••••••"
                  style={inputStyle(passFocus, true)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: "absolute", right: 13, top: "50%",
                    transform: "translateY(-50%)", zIndex: 10,
                    background: "none", border: "none", cursor: "pointer",
                    padding: 4, display: "flex", alignItems: "center",
                    color: showPassword ? "#41C6F1" : "#CBD5E1",
                    transition: "color 0.2s", lineHeight: 0,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#41C6F1")}
                  onMouseLeave={e => (e.currentTarget.style.color = showPassword ? "#41C6F1" : "#CBD5E1")}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                </button>
              </div>
            </div>

            {/* CTA */}
            <button
              type="submit" disabled={authLoading}
              className={authLoading ? "" : "zr-cta-btn"}
              style={{
                marginTop: 4, width: "100%", padding: "13px 24px",
                borderRadius: 12,
                background: authLoading
                  ? "rgba(65,198,241,0.5)"
                  : "linear-gradient(135deg, #67dcf9 0%, #41C6F1 48%, #1fb3de 100%)",
                border: "none", color: "#000",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: "0.76rem",
                letterSpacing: "0.13em", textTransform: "uppercase",
                cursor: authLoading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                boxShadow: authLoading ? "none"
                  : "0 0 0 1.5px rgba(65,198,241,0.28), 0 6px 24px rgba(65,198,241,0.42), inset 0 1px 0 rgba(255,255,255,0.38)",
                transition: "all 0.22s ease",
                position: "relative", overflow: "hidden",
              }}
            >
              {!authLoading && <div className="zr-shimmer" />}
              {authLoading
                ? <Loader2 size={16} style={{ animation: "zr-spin 1s linear infinite" }} />
                : <><span>Authenticate</span><ArrowRight size={15} strokeWidth={2.5} /></>
              }
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(65,198,241,0.35))" }} />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.58rem", fontWeight: 700,
              letterSpacing: "0.16em", color: "#64748B",
              textTransform: "uppercase", whiteSpace: "nowrap",
            }}>
              Restricted Access
            </span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(65,198,241,0.35), transparent)" }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes zr-spin    { to { transform: rotate(360deg); } }
        @keyframes zr-bar     { 0%,100%{ background-position:0% 50%; } 50%{ background-position:100% 50%; } }
        @keyframes zr-ring    { 0%,100%{ transform:scale(1); opacity:0.5; } 50%{ transform:scale(1.07); opacity:1; } }
        @keyframes zr-shimmer { 0%{ left:-80%; } 100%{ left:130%; } }
        @keyframes zr-bounce-in {
          0%  { opacity:0; transform:translateY(18px) scale(0.78); }
          55% { opacity:1; transform:translateY(-5px) scale(1.07); }
          75% { transform:translateY(2px) scale(0.97); }
          90% { transform:translateY(-1px) scale(1.01); }
          100%{ opacity:1; transform:translateY(0) scale(1); }
        }
        .zr-letter-bounce { animation: zr-bounce-in 0.58s cubic-bezier(0.22,1,0.36,1) both; }
        .zr-top-bar       { animation: zr-bar 3s ease infinite; background-size:200% 100%; }
        .zr-logo-ring     { animation: zr-ring 3s ease-in-out infinite; }
        .zr-shimmer {
          position:absolute; top:0; width:55%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.32),transparent);
          animation:zr-shimmer 2.6s ease-in-out infinite;
          pointer-events:none;
        }
        .zr-cta-btn:hover {
          transform:translateY(-2px);
          box-shadow:0 0 0 1.5px rgba(65,198,241,0.38), 0 10px 32px rgba(65,198,241,0.52), inset 0 1px 0 rgba(255,255,255,0.38) !important;
        }
        .zr-cta-btn:active { transform:translateY(0); }
        input::placeholder { color:#C8D5E4; font-weight:400; }
      `}</style>
    </div>
  )
}

export default AdminLogin
