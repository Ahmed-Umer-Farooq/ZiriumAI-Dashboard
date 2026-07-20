import { Menu } from 'lucide-react'

interface AdminNavbarProps {
  setMobileMenuOpen: (o: boolean) => void
}

export function AdminNavbar({ setMobileMenuOpen }: AdminNavbarProps) {
  return (
    <header className="md:hidden h-16 bg-card border-b border-border px-4 flex items-center justify-between z-40 shrink-0">
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="ZiriumAI Logo" className="w-15 h-15 rounded-lg object-contain" />
        <span className="font-extrabold text-sm tracking-widest text-[var(--z-text-primary)]">
          ZiriumAI
        </span>
      </div>
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
      >
        <Menu size={22} />
      </button>
    </header>
  )
}
export default AdminNavbar
