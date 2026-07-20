import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Briefcase, Award, ChevronRight, LogOut } from 'lucide-react'
import { useAdminAuth } from '../auth/useAdminAuth'
import { toast } from 'sonner'

interface AdminSidebarProps {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (c: boolean) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (o: boolean) => void
}

export function AdminSidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen,
}: AdminSidebarProps) {
  const { signOut } = useAdminAuth()
  const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || 'zr-panel-x7k2'

  const handleSignOutClick = async () => {
    try {
      await signOut()
      toast.success("Logged out successfully.")
    } catch (err: any) {
      toast.error(`Sign out error: ${err.message}`)
    }
  }

  const links = [
    { to: `/${ADMIN_PATH}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
    { to: `/${ADMIN_PATH}/jobs`, label: 'Jobs', icon: Briefcase },
    { to: `/${ADMIN_PATH}/applicants`, label: 'Applicants', icon: Users },
    { to: `/${ADMIN_PATH}/interns`, label: 'Interns', icon: Award },
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {(!sidebarCollapsed || mobileMenuOpen) && (
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <img src="/logo.png" alt="ZiriumAI" style={{ height: 42, width: "auto", marginRight: -10, flexShrink: 0, objectFit: "contain" }} />
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: 18, display: "inline-flex", alignItems: "center", letterSpacing: "0em", lineHeight: 1 }}>
              {"Zirium".split("").map((ch, i) => (
                <span key={i} style={{ color: "#0d0d0d" }}>{ch}</span>
              ))}
              <span style={{ display: "inline-block", width: 6 }} />
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
          </div>
        )}
        {(sidebarCollapsed && !mobileMenuOpen) && (
          <img src="/logo.png" alt="ZiriumAI" className="mx-auto" style={{ height: 36, width: "auto", objectFit: "contain" }} />
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer hidden md:block"
        >
          <ChevronRight
            size={18}
            className={`transform transition-transform ${
              sidebarCollapsed ? "" : "rotate-180"
            }`}
          />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              {(!sidebarCollapsed || mobileMenuOpen) && <span className="text-sm">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={handleSignOutClick}
          title="Sign Out"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: (!sidebarCollapsed || mobileMenuOpen) ? "10px 14px" : "10px",
            justifyContent: (!sidebarCollapsed || mobileMenuOpen) ? "flex-start" : "center",
            borderRadius: 12,
            border: "1.5px solid transparent",
            background: "transparent",
            cursor: "pointer",
            transition: "all 0.18s ease",
            color: "#94A3B8",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.background = "rgba(239,68,68,0.08)"
            el.style.borderColor = "rgba(239,68,68,0.25)"
            el.style.color = "#ef4444"
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.background = "transparent"
            el.style.borderColor = "transparent"
            el.style.color = "#94A3B8"
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0, strokeWidth: 2.2 }} />
          {(!sidebarCollapsed || mobileMenuOpen) && (
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Sign Out
            </span>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 bg-card border-r border-border transition-all duration-300 sidebar-glow relative z-30 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-64 bg-card p-6 border-l border-border flex flex-col space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
export default AdminSidebar
