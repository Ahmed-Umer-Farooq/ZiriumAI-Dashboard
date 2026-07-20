import { useJobs } from "../hooks/useJobs"
import { useApplicants } from "../hooks/useApplicants"
import { StatusBadge } from "../components/StatusBadge"
import { Users, Clock, Award, TrendingUp, RefreshCw, Eye, ChevronRight } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useNavigate } from "react-router-dom"

export function AdminDashboard() {
  const { jobs, loading: jobsLoading, fetchJobs } = useJobs()
  const { applicants, loading: applicantsLoading, fetchApplicants } = useApplicants()
  const navigate = useNavigate()
  const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || 'zr-panel-x7k2'

  const loading = jobsLoading || applicantsLoading

  const handleRefresh = async () => {
    await Promise.all([fetchJobs(), fetchApplicants()])
  }

  // Calculate statistics
  const totalActiveJobs = jobs.filter((j) => j.is_active).length
  const totalApplications = applicants.length
  const pendingCount = applicants.filter((a) => a.status === "pending").length
  const interviewCount = applicants.filter((a) => a.status === "interview").length

  const getTimelineChartData = () => {
    const timelineMap: Record<string, number> = {}
    const sortedApps = [...applicants].sort(
      (a, b) => new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime()
    )

    sortedApps.forEach((app) => {
      const date = new Date(app.applied_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      timelineMap[date] = (timelineMap[date] || 0) + 1
    })

    return Object.keys(timelineMap).map((date) => ({
      date,
      Applications: timelineMap[date],
    }))
  }

  const chartData = getTimelineChartData()

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-[var(--z-text-primary)]">Admin Dashboard</h2>
          <p className="text-xs text-muted-foreground font-medium">Executive overview of system metrics and candidates.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center justify-center cursor-pointer shadow-sm"
          title="Refresh Data"
        >
          <RefreshCw size={16} className={loading ? "animate-spin text-primary" : ""} />
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Active Jobs", value: totalActiveJobs, icon: BriefcaseIcon, style: "border-primary/20 shadow-primary/5 text-primary bg-primary/5" },
          { label: "Total Applicants", value: totalApplications, icon: Users, style: "border-cyan-500/20 shadow-cyan-500/5 text-cyan-500 bg-cyan-500/5" },
          { label: "Pending Review", value: pendingCount, icon: Clock, style: "border-amber-500/20 shadow-amber-500/5 text-amber-500 bg-amber-500/5" },
          { label: "Interviews Logged", value: interviewCount, icon: Award, style: "border-blue-500/20 shadow-blue-500/5 text-blue-500 bg-blue-500/5" },
        ].map((card, idx) => {
          const CardIcon = card.icon
          return (
            <div key={idx} className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] shadow-lg ${card.style}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">{card.label}</span>
                <CardIcon size={18} />
              </div>
              <div className="mt-4">
                <span className="text-3xl md:text-4xl font-black font-sans tracking-tight">{card.value}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Trajectory Chart */}
      <div className="glass-panel p-6 rounded-2xl border flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-extrabold tracking-tight">Application Trajectory</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Submissions logged chronologically</p>
          </div>
          <div className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-[10px] px-2 py-0.5 rounded font-bold uppercase font-mono">
            <TrendingUp size={12} /> Live Metrics
          </div>
        </div>

        <div className="h-64 w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground font-mono">No submission logs recorded yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#41C6F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#41C6F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0B0F19", border: "1px solid rgba(65, 198, 241, 0.2)", borderRadius: "8px", fontSize: "12px", color: "#FFFFFF" }} />
                <Area type="monotone" dataKey="Applications" stroke="#41C6F1" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Logs Table */}
      <div className="glass-panel rounded-2xl border border-border shadow-md overflow-hidden">
        <div className="p-6 border-b border-border/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold tracking-tight">Recent Application Logs</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Review recent submissions logged into the server</p>
          </div>
          <button
            onClick={() => navigate(`/${ADMIN_PATH}/applicants`)}
            className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            View All Logs <ChevronRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 text-muted-foreground border-b border-border/40">
                <th className="p-4 text-xs font-bold uppercase font-sans">Applicant</th>
                <th className="p-4 text-xs font-bold uppercase font-sans">Role Title</th>
                <th className="p-4 text-xs font-bold uppercase font-sans">Date Submitted</th>
                <th className="p-4 text-xs font-bold uppercase font-sans">Status</th>
                <th className="p-4 text-xs font-bold uppercase font-sans text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {applicants.slice(0, 5).map((app) => (
                <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 uppercase">
                        {app.full_name ? app.full_name.slice(0, 2) : "AP"}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-[var(--z-text-primary)]">{app.full_name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{app.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold">{app.jobs?.title || "Unknown Role"}</span>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground font-mono">
                    {new Date(app.applied_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => navigate(`/${ADMIN_PATH}/applicants/${app.id}`)}
                      className="p-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      title="Inspect Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {applicants.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-muted-foreground font-mono">No submissions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  )
}
export default AdminDashboard
