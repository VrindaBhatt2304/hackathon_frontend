import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import AppLayout from '../../components/AppLayout'
import PageHeader from '../../components/PageHeader'
import Alert from '../../components/Alert'

const DOC_TYPES = [
  'Client KYC', 'Loan Agreements', 'Other Agreements and Vendor Data',
  'Vendor Onboarding', 'Audit Reports', 'Invoices', 'Misc Documents'
]
const ARCHIVAL = ['Standard', 'Country Specific', 'Banking']

export default function RegisterCarton() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    document_type: 'Client KYC',
    archival_policy: 'Standard',
    retention_trigger_date: '',
    vendor_id: '',
    location_id: '',
    remarks: ''
  })
  const [vendors, setVendors] = useState([])
  const [locations, setLocations] = useState([])
  const [dueDate, setDueDate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('ref_vendors').select('vendor_id,vendor_name').eq('status', 'Active')
      .then(({ data }) => setVendors(data || []))
  }, [])

  useEffect(() => {
    if (!form.vendor_id) { setLocations([]); return }
    supabase.from('ref_warehouse_locations').select('location_id,location_name')
      .eq('vendor_id', form.vendor_id).then(({ data }) => setLocations(data || []))
  }, [form.vendor_id])

  useEffect(() => {
    async function computeDue() {
      if (!form.retention_trigger_date || !form.document_type || !form.archival_policy) {
        setDueDate(null)
        return
      }
      const { data } = await supabase.from('ref_retention_policy')
        .select('retention_years')
        .eq('document_type', form.document_type)
        .eq('archival_policy', form.archival_policy)
        .single()
      if (data) {
        const trigger = new Date(form.retention_trigger_date)
        trigger.setFullYear(trigger.getFullYear() + data.retention_years)
        setDueDate(trigger.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }))
      } else {
        setDueDate(null)
      }
    }
    computeDue()
  }, [form.retention_trigger_date, form.document_type, form.archival_policy])

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const cartonId = `CTN-${Date.now()}`
    const now = new Date().toISOString()

    const { error: err } = await supabase.from('carton_inventory').insert({
      carton_id: cartonId,
      entity_id: profile.entity_id,
      department_id: profile.department_id,
      department_name: profile.department_name || '',
      owner_user_id: profile.user_id,
      document_type: form.document_type,
      archival_policy: form.archival_policy,
      carton_created_date: now.split('T')[0],
      retention_trigger_date: form.retention_trigger_date || null,
      assigned_vendor_id: form.vendor_id || null,
      current_location_id: null,
      current_status: 'Created',
      legal_hold_flag: 'N',
      barcode: `BAR-${cartonId}`,
      remarks: form.remarks,
    })

    if (err) { 
      setError(err.message)
      setLoading(false)
      return 
    }

    await supabase.from('event_log').insert({
      event_id: `EVT-${Date.now()}`,
      carton_id: cartonId,
      event_timestamp: now,
      event_type: 'CARTON_CREATED',
      actor_type: 'BUSINESS',
      actor_id: profile.user_id,
      resulting_status: 'Created',
    })

    navigate(`/app/cartons/${cartonId}`)
  }

  return (
    <AppLayout pageTitle="Register Carton">
      <div className="max-w-2xl">
        <PageHeader 
          title="Register New Carton" 
          subtitle="Register an indexed record carton into departmental physical inventory." 
        />

        {error && (
          <div className="mb-6">
            <Alert type="danger">{error}</Alert>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-7 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Document Type & Archival Policy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Document Type <span className="text-rose-500">*</span>
                </label>
                <select 
                  name="document_type" 
                  value={form.document_type} 
                  onChange={onChange} 
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                >
                  {DOC_TYPES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Archival Policy <span className="text-rose-500">*</span>
                </label>
                <select 
                  name="archival_policy" 
                  value={form.archival_policy} 
                  onChange={onChange} 
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                >
                  {ARCHIVAL.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>

            {/* Retention Trigger Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Retention Trigger Date <span className="text-rose-500">*</span>
              </label>
              <input 
                type="date" 
                name="retention_trigger_date" 
                value={form.retention_trigger_date} 
                onChange={onChange} 
                required 
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
              />
              {dueDate && (
                <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 flex items-center justify-between">
                  <span>Computed destruction due date:</span>
                  <span className="font-bold text-emerald-800">{dueDate}</span>
                </div>
              )}
            </div>

            {/* Vendor & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Storage Vendor
                </label>
                <select 
                  name="vendor_id" 
                  value={form.vendor_id} 
                  onChange={onChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                >
                  <option value="">Select vendor (optional)</option>
                  {vendors.map(v => <option key={v.vendor_id} value={v.vendor_id}>{v.vendor_name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Initial Location
                </label>
                <select 
                  name="location_id" 
                  value={form.location_id} 
                  onChange={onChange} 
                  disabled={!form.vendor_id}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed transition"
                >
                  <option value="">Select location</option>
                  {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.location_name}</option>)}
                </select>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Remarks
              </label>
              <textarea 
                name="remarks" 
                rows={3} 
                value={form.remarks} 
                onChange={onChange}
                placeholder="Optional notes or carton descriptor details…"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
              <button 
                type="button" 
                onClick={() => navigate('/app/cartons')}
                className="py-2.5 px-5 rounded-xl font-bold text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="py-2.5 px-6 rounded-xl font-bold text-sm text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 transition shadow-sm"
              >
                {loading ? 'Registering…' : 'Register Carton'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}