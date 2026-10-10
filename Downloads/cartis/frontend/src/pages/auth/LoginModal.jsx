import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

const DEMO_ACCOUNTS = [
  { role: 'Business User', id: 'USR-0001', name: 'Ishita Joshi', dept: 'Delhi Branch' },
  { role: 'Vendor Ops', id: 'USR-0059', name: 'Suresh Das', dept: 'Warehouse VND-001' },
  { role: 'Compliance Officer', id: 'USR-0057', name: 'Neha Joshi', dept: 'Corporate Legal' },
  { role: 'Facilities Team', id: 'USR-0053', name: 'Suresh Sinha', dept: 'Central Admin' },
]

export default function LoginModal({ isOpen = true, onClose, onSwitchToSignup }) {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ userId: '', password: 'Password@2026' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleLogin(userId, password) {
    setError('')
    setLoading(true)
    try {
      await signIn(userId, password)
      if (onClose) onClose()
      navigate('/app/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    await handleLogin(form.userId, form.password)
  }

  function pickDemo(acc) {
    setForm({ userId: acc.id, password: 'Password@2026' })
    handleLogin(acc.id, 'Password@2026')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Strip */}
        <div className="bg-[#082821] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <img 
  src="/logo.png" 
  alt="PapierTrace Logo" 
  className="h-10 w-auto object-contain shrink-0" 
/>
            </Link>
            <div>
              <h3 className="font-bold text-base leading-tight">PapierTrace</h3>
              <p className="text-xs text-emerald-300/80">Physical Records Management System</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 bg-[#FAF8F5]">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Welcome back</h2>
            <p className="text-sm text-stone-600 mt-1">Sign in with your User ID, Email, or role shortcut.</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                User ID or Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="userId"
                value={form.userId}
                onChange={onChange}
                placeholder="e.g. USR-0001 or ishita.joshi1@..."
                required
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] disabled:opacity-60 transition shadow-sm"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-stone-200">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2.5">
              Instant Demo Logins
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => pickDemo(acc)}
                  disabled={loading}
                  className="p-2.5 rounded-xl text-left border border-stone-200 bg-white hover:border-emerald-600 hover:bg-emerald-50/50 transition group"
                >
                  <div className="font-semibold text-xs text-stone-900 group-hover:text-emerald-800">
                    {acc.role}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5 truncate">
                    {acc.id} · {acc.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center mt-6 text-xs text-stone-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="font-bold text-emerald-800 hover:text-emerald-900 underline ml-1"
            >
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}