import { useState } from 'react'
import { Link } from 'react-router-dom'
import LoginModal from '../auth/LoginModal'
import SignupModal from '../auth/SignupModal'

const FEATURES = [
  {
    title: 'Carton Lifecycle Tracking',
    desc: 'Track every carton from creation through pickup, storage, retrieval, and destruction. Every state transition is stamped with actor, timestamp, and request reference — fully auditable.',
  },
  {
    title: 'Legal Hold Guard',
    desc: 'Destruction is automatically blocked the moment a carton falls under an active legal hold. The system surfaces the matter reference and prevents any approval from proceeding.',
  },
  {
    title: 'Dynamic Retention Engine',
    desc: 'Destruction due dates are derived live from policy rules — never hardcoded. Change one row in the retention policy table and every affected carton\'s due date updates instantly.',
  },
  {
    title: 'Vendor Workflow Accountability',
    desc: 'End-to-end pickup, retrieval, and return workflows with separate events for collection and warehouse receipt, creating a precise gap for lost-in-transit identification.',
  },
  {
    title: 'Three-Way Reconciliation',
    desc: 'Automated reconciliation of quarterly vendor inventory feeds, monthly invoices against contracted rate cards, and destruction certificates against legal hold status.',
  },
  {
    title: 'SLA & Cost Intelligence',
    desc: 'Business-day SLA tracking using a live holiday calendar. Invoice verification computes expected cost from rate cards (including 18% tax) and flags billing discrepancies automatically.',
  },
]

const ROLES = [
  {
    border: 'border-emerald-600',
    badge: 'bg-emerald-50 text-emerald-800',
    role: 'Business User',
    desc: 'Register cartons and index files. Raise pickup, retrieval, return and destruction requests. Acknowledge physical receipt. Data is strictly scoped to your department.',
  },
  {
    border: 'border-teal-600',
    badge: 'bg-teal-50 text-teal-800',
    role: 'Vendor User',
    desc: 'Acknowledge requests, confirm collection, log warehouse receipt, confirm delivery and destruction. Queue is scoped to your vendor — no cost or content data visible.',
  },
  {
    border: 'border-amber-600',
    badge: 'bg-amber-50 text-amber-800',
    role: 'Compliance Officer',
    desc: 'Apply and release legal holds with matter references. Approve or reject destruction requests. Read full carton history across all entities.',
  },
  {
    border: 'border-rose-600',
    badge: 'bg-rose-50 text-rose-800',
    role: 'Facilities Team',
    desc: 'Run reconciliation cycles, monitor SLA breaches, verify vendor invoices, administer users. Global view across all entities, locations and vendors.',
  },
]

const STATS = [
  { n: '50,000+', label: 'Cartons Managed' },
  { n: '6', label: 'Warehouse Locations' },
  { n: '3', label: 'Storage Vendors' },
  { n: '13', label: 'Departments' },
  { n: '57,000+', label: 'Seeded Data Rows' },
]

const LIFECYCLE = [
  { step: '01', title: 'Register', desc: 'Business user creates a carton, indexes files, and the system derives the destruction due date from policy.' },
  { step: '02', title: 'Pickup', desc: 'Vendor acknowledges the request, confirms physical collection, then logs warehouse receipt — two separate events for precise loss detection.' },
  { step: '03', title: 'Storage', desc: 'Carton sits in storage. Quarterly vendor recertification feeds are reconciled against system state. Billing is verified monthly.' },
  { step: '04', title: 'Retrieval', desc: 'Business raises a retrieval request. Vendor delivers within the contracted SLA window, tracked in business days with holiday exclusions.' },
  { step: '05', title: 'Compliance Review', desc: 'Compliance officer checks for legal holds. If the hold is active, destruction is blocked server-side regardless of retention status.' },
  { step: '06', title: 'Destruction', desc: 'Once retention has expired, no active holds exist, and compliance approves — vendor destroys and uploads a certificate.' },
]

export default function Home() {
  const [modal, setModal] = useState(null) // 'login' | 'signup' | null

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ── Top Header Bar ── */}
      <header className="sticky top-0 z-40 bg-[#092b22] px-6 sm:px-12 h-16 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <img 
  src="/logo.png" 
  alt="PapierTrace Logo" 
  className="h-10 w-auto object-contain shrink-0" 
/>
          <span className="font-extrabold text-lg text-white tracking-tight">PapierTrace</span>
        </div>

        <button
          onClick={() => setModal('login')}
          className="bg-[#107e54] hover:bg-[#0e6b47] text-white text-sm font-semibold px-5 py-2 rounded-xl transition shadow-xs"
        >
          Sign In
        </button>
      </header>

      {/* ── Main Banner Showcase ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-10 pb-16">
        <div className="w-full relative rounded-3xl overflow-hidden shadow-xl border border-stone-200/60 aspect-[16/6] min-h-[300px] flex items-end">
          {/* Banner Graphic Background */}
          <img
            src="/bannner.png"
            alt="PapierTrace Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Soft Left Shadow for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/70 via-emerald-950/25 to-transparent pointer-events-none" />

          {/* Banner Floating Overlay Text */}
          <div className="relative z-10 p-6 sm:p-10 text-white max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-[#0a382c]/90 text-emerald-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-500/30">
              BUILT FOR INNOVERSITE
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-2 leading-none drop-shadow-sm">
              PapierTrace
            </h1>
            <p className="text-xs sm:text-sm text-stone-200/90 font-medium drop-shadow-sm leading-relaxed">
              Transparent, auditable physical record management and retention verification platform.
            </p>
          </div>
        </div>

        {/* Action Buttons Under Banner */}
        <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
          <button
            onClick={() => setModal('login')}
            className="bg-[#107e54] hover:bg-[#0e6b47] text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-sm transition active:scale-95"
          >
            Sign In with Modal
          </button>
          <Link
            to="/login"
            className="bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 font-bold text-sm px-6 py-3 rounded-2xl shadow-xs transition"
          >
            Go to Dedicated Login Page →
          </Link>
        </div>

        {/* ── Stats Ribbon ── */}
        <div className="mt-16 bg-[#092b22] rounded-3xl text-white py-8 px-6 shadow-md">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-300">{s.n}</div>
                <div className="text-[11px] uppercase font-semibold text-stone-300 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Lifecycle Stages ── */}
        <section id="lifecycle" className="mt-20">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Audit-Enforced Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">End-to-End Carton Journey</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LIFECYCLE.map(l => (
              <div key={l.step} className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">{l.step}</span>
                  <h3 className="text-base font-bold text-stone-900 mt-2 mb-2">{l.title}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Core Capabilities ── */}
        <section id="features" className="mt-20">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Enterprise Controls</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">Platform Capabilities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs hover:border-emerald-600 transition">
                <h3 className="font-bold text-base text-stone-900 mb-2">{f.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Role Scope Breakdown ── */}
        <section id="roles" className="mt-20">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Access Governance</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">Role-Based Access</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROLES.map(r => (
              <div key={r.role} className={`bg-white p-6 rounded-3xl border-t-4 ${r.border} border-stone-200/80 shadow-xs`}>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mb-3 ${r.badge}`}>
                  {r.role}
                </span>
                <p className="text-xs text-stone-600 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Dark Green Bottom Footer ── */}
      <footer className="bg-[#092b22] text-white px-6 sm:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
        <div className="flex items-center gap-3">
          <img 
  src="/logo.png" 
  alt="PapierTrace Logo" 
  className="h-10 w-auto object-contain shrink-0" 
/>
          <span className="font-bold text-base text-white tracking-tight">PapierTrace</span>
        </div>

        <div className="inline-block px-3.5 py-1 rounded-full bg-[#0e3b2e] text-emerald-300 text-[11px] font-bold uppercase tracking-wider border border-emerald-600/30">
          BUILT FOR INNOVERSITE
        </div>

        <p className="text-xs text-stone-400">
          © 2026 PapierTrace. All rights reserved.
        </p>
      </footer>

      {/* Auth Modals */}
      <LoginModal 
        isOpen={modal === 'login'} 
        onClose={() => setModal(null)} 
        onSwitchToSignup={() => setModal('signup')} 
      />
      <SignupModal 
        isOpen={modal === 'signup'} 
        onClose={() => setModal(null)} 
        onSwitchToLogin={() => setModal('login')} 
      />
    </div>
  )
}