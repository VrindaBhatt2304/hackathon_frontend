import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { initials, roleName } from '../lib/helpers'
import { Link } from 'react-router-dom'

const Icons = {
  dashboard: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  cartons: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  requests: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  register: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  queue: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),
  approvals: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  holds: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  reconciliation: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  exceptions: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  logout: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function getNavLinks(role) {
  const base = [
    { to: '/app/dashboard', icon: Icons.dashboard, label: 'Dashboard' },
    { to: '/app/cartons', icon: Icons.cartons, label: 'My Cartons' },
  ]
  const isBiz = role === 'BUSINESS' || role === 'ROLE-BIZ-USER'
  const isVendor = role === 'VENDOR' || role === 'ROLE-VENDOR'
  const isCompliance = role === 'COMPLIANCE' || role === 'ROLE-COMPLIANCE'
  const isFacility = role === 'FACILITY' || role === 'ROLE-FACILITY'

  if (isBiz) {
    base.push({ to: '/app/cartons/new', icon: Icons.register, label: 'Create Carton' })
    base.push({ to: '/app/requests', icon: Icons.requests, label: 'My Requests' })
  }
  if (isVendor) {
    base.push({ to: '/app/vendor/queue', icon: Icons.queue, label: 'Request Queue' })
  }
  if (isCompliance) {
    base.push({ to: '/app/compliance/destructions', icon: Icons.approvals, label: 'Pending Approvals' })
    base.push({ to: '/app/compliance/holds', icon: Icons.holds, label: 'Legal Holds' })
  }
  if (isFacility) {
    base.push({ to: '/app/facility/reconciliation', icon: Icons.reconciliation, label: 'Reconciliation' })
    base.push({ to: '/app/facility/exceptions', icon: Icons.exceptions, label: 'Exceptions' })
    base.push({ to: '/app/facility/users', icon: Icons.users, label: 'User Admin' })
  }
  return base
}

export default function AppLayout({ children }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const navLinks = getNavLinks(profile?.role_id)

  return (
    <div className="min-h-screen flex bg-[#FAF8F5]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#082821] text-stone-200 flex flex-col justify-between shrink-0 shadow-lg border-r border-emerald-950/40">
        <div>
          {/* Brand Logo Header */}
          <div className="p-6 flex items-center gap-3">
            <Link to="/" className="flex items-cover gap-3">
              <img 
  src="/logo.png" 
  alt="PapierTrace Logo" 
  className="h-10 w-auto object-contain shrink-0" 
/>
            </Link>
            <div>
              <div className="font-extrabold text-base tracking-tight text-white leading-tight">PapierTrace</div>
              <div className="text-[11px] font-medium text-emerald-400/80">Records Management</div>
            </div>
          </div>

          {/* Nav Section */}
          <div className="px-3 py-2">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-500/80">
              Business Workspace
            </div>
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/app/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-stone-300 hover:text-white hover:bg-emerald-900/40'
                    }`
                  }
                >
                  <span className="shrink-0">{link.icon}</span>
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-emerald-900/50 bg-[#06201a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-700/80 text-white text-xs font-bold flex items-center justify-center border border-emerald-500/30">
              {initials(profile?.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {profile?.full_name || 'User'}
              </div>
              <div className="text-[11px] text-emerald-300/70 truncate">
                {roleName(profile?.role_id)}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800/40 rounded-lg transition-colors"
              title="Sign out"
            >
              {Icons.logout}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}