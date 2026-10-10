import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'

const ROLES = [
  { value: 'BUSINESS', label: 'Business User' },
  { value: 'VENDOR', label: 'Vendor User' },
  { value: 'COMPLIANCE', label: 'Compliance Officer' },
  { value: 'FACILITY', label: 'Facilities Team' },
]

export default function SignupModal({ isOpen = true, onClose, onSwitchToLogin }) {
  const { signUp } = useAuth()
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirm_password: '',
    role_id: 'BUSINESS', entity_id: '', department_id: '', vendor_id: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [entities, setEntities] = useState([])
  const [departments, setDepartments] = useState([])
  const [vendors, setVendors] = useState([])

  useEffect(() => {
    supabase.from('ref_entities_departments').select('entity_id,entity_name').then(({ data }) => {
      const unique = [...new Map((data || []).map(r => [r.entity_id, r])).values()]
      setEntities(unique)
    })
    supabase.from('ref_vendors').select('vendor_id,vendor_name').eq('status', 'Active').then(({ data }) => setVendors(data || []))
  }, [])

  useEffect(() => {
    if (!form.entity_id) { setDepartments([]); return }
    supabase.from('ref_entities_departments').select('department_id,department_name')
      .eq('entity_id', form.entity_id).then(({ data }) => setDepartments(data || []))
  }, [form.entity_id])

  if (!isOpen) return null

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm_password) { 
      setError('Passwords do not match.')
      return 
    }
    if (form.password.length < 8) { 
      setError('Password must be at least 8 characters.')
      return 
    }
    setLoading(true)
    try {
      const meta = {
        full_name: form.full_name,
        role_id: form.role_id,
        entity_id: form.role_id === 'VENDOR' ? 'EXTERNAL' : form.entity_id,
        department_id: form.role_id === 'BUSINESS' ? form.department_id : '',
        vendor_id: form.role_id === 'VENDOR' ? form.vendor_id : ''
      }
      await signUp(form.email, form.password, meta)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  const needsEntity = ['BUSINESS', 'COMPLIANCE', 'FACILITY'].includes(form.role_id)
  const needsDept = form.role_id === 'BUSINESS'
  const needsVendor = form.role_id === 'VENDOR'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200/80 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Strip */}
        <div className="bg-[#082821] px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
             <img 
  src="/logo.png" 
  alt="PapierTrace Logo" 
  className="h-10 w-auto object-contain shrink-0" 
/>
            </Link>
            <div>
              <h3 className="font-bold text-base leading-tight">Create Account</h3>
              <p className="text-xs text-emerald-300/80">PapierTrace System Access</p>
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
        <div className="p-6 sm:p-8 bg-[#FAF8F5] overflow-y-auto">
          {success ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                ✓
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Account Created!</h3>
              <p className="text-sm text-stone-600 mb-6 max-w-sm mx-auto">
                Your account is ready. Please proceed to sign in with your credentials.
              </p>
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="py-2.5 px-6 rounded-xl font-bold text-sm text-white bg-emerald-700 hover:bg-emerald-800 transition"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={onChange}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={onChange}
                      required
                      minLength={8}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Confirm <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={form.confirm_password}
                      onChange={onChange}
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="role_id"
                    value={form.role_id}
                    onChange={onChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {needsEntity && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Entity <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="entity_id"
                      value={form.entity_id}
                      onChange={onChange}
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="">Select entity…</option>
                      {entities.map(e => (
                        <option key={e.entity_id} value={e.entity_id}>{e.entity_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {needsDept && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Department <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="department_id"
                      value={form.department_id}
                      onChange={onChange}
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="">Select department…</option>
                      {departments.map(d => (
                        <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {needsVendor && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Vendor <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="vendor_id"
                      value={form.vendor_id}
                      onChange={onChange}
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="">Select vendor…</option>
                      {vendors.map(v => (
                        <option key={v.vendor_id} value={v.vendor_id}>{v.vendor_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 py-3 px-4 rounded-xl font-bold text-sm text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 transition shadow-sm"
                >
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>

              <div className="text-center mt-5 text-xs text-stone-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="font-bold text-emerald-800 hover:text-emerald-900 underline ml-1"
                >
                  Sign in
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}