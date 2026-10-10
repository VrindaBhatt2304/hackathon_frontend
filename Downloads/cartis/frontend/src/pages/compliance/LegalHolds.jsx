import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import AppLayout from '../../components/AppLayout'
import PageHeader from '../../components/PageHeader'
import Badge from '../../components/Badge'
import Alert from '../../components/Alert'
import Modal from '../../components/Modal'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import { fmtDateTime } from '../../lib/helpers'

export default function LegalHolds() {
  const { profile } = useAuth()
  const [holds, setHolds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [applyForm, setApplyForm] = useState({ carton_id: '', matter_reference: '', hold_reason: '' })

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('legal_holds').select('*').eq('is_active', true).order('applied_on', { ascending: false })
    setHolds(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function applyHold() {
    if (!applyForm.carton_id || !applyForm.matter_reference) { 
      setError('Carton ID and Matter Reference required.')
      return 
    }
    const { error: err } = await supabase.from('legal_holds').insert({
      carton_id: applyForm.carton_id,
      matter_reference: applyForm.matter_reference,
      hold_reason: applyForm.hold_reason,
      applied_by: profile.user_id,
      applied_on: new Date().toISOString(),
      is_active: true
    })
    if (err) { setError(err.message); return }
    await supabase.from('carton_inventory').update({ legal_hold_flag: 'Y' }).eq('carton_id', applyForm.carton_id)
    setSuccess('Legal hold locked.')
    setShowApplyModal(false)
    setApplyForm({ carton_id: '', matter_reference: '', hold_reason: '' })
    load()
  }

  async function releaseHold(hold) {
    const reason = prompt('Release reason:')
    if (!reason) return
    const now = new Date().toISOString()
    await supabase.from('legal_holds').update({ is_active: false, released_by: profile.user_id, released_on: now, release_reason: reason }).eq('id', hold.id)
    const { data: remaining } = await supabase.from('legal_holds').select('id').eq('carton_id', hold.carton_id).eq('is_active', true)
    if (!remaining || remaining.length === 0) {
      await supabase.from('carton_inventory').update({ legal_hold_flag: 'N' }).eq('carton_id', hold.carton_id)
    }
    setSuccess('Hold released.')
    load()
  }

  return (
    <AppLayout pageTitle="Legal Holds">
      <PageHeader title="Legal Hold Management" subtitle="Lock cartons under active legal matters">
        <button 
          onClick={() => setShowApplyModal(true)} 
          className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition shadow-xs"
        >
          + Apply Legal Hold
        </button>
      </PageHeader>

      {error && <div className="mb-4"><Alert type="danger">{error}</Alert></div>}
      {success && <div className="mb-4"><Alert type="success">{success}</Alert></div>}

      {loading ? <Spinner /> : holds.length === 0 ? (
        <EmptyState title="No active legal holds" message="All cartons are currently clear of litigation locks." />
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F5] border-b border-stone-200/80 text-[11px] uppercase font-bold text-stone-500">
                <tr>
                  <th className="py-3.5 px-5">Carton ID</th>
                  <th className="py-3.5 px-4">Matter Reference</th>
                  <th className="py-3.5 px-4">Hold Reason</th>
                  <th className="py-3.5 px-4">Applied By</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {holds.map(h => (
                  <tr key={h.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-4 px-5 font-bold text-stone-900">{h.carton_id}</td>
                    <td className="py-4 px-4">
                      <Badge className="bg-rose-50 text-rose-800 border-rose-200 font-bold">{h.matter_reference}</Badge>
                    </td>
                    <td className="py-4 px-4 text-stone-600 text-xs">{h.hold_reason || '—'}</td>
                    <td className="py-4 px-4 text-stone-500 text-xs">{h.applied_by}</td>
                    <td className="py-4 px-4 text-stone-500 text-xs">{fmtDateTime(h.applied_on)}</td>
                    <td className="py-4 px-5 text-right">
                      <button 
                        onClick={() => releaseHold(h)} 
                        className="text-xs font-bold text-rose-700 hover:text-rose-900 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition"
                      >
                        Release
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showApplyModal && (
        <Modal title="Apply Legal Hold" onClose={() => setShowApplyModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Carton ID *</label>
              <input 
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                value={applyForm.carton_id} 
                onChange={e => setApplyForm(f => ({ ...f, carton_id: e.target.value }))}
                placeholder="CTN-…" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Matter Reference *</label>
              <input 
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                value={applyForm.matter_reference} 
                onChange={e => setApplyForm(f => ({ ...f, matter_reference: e.target.value }))}
                placeholder="LEGAL-2026-001" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Reason</label>
              <textarea 
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                value={applyForm.hold_reason} 
                onChange={e => setApplyForm(f => ({ ...f, hold_reason: e.target.value }))}
              />
            </div>
            <button onClick={applyHold} className="w-full py-2.5 bg-rose-700 text-white rounded-xl text-sm font-bold mt-2">
              Apply Legal Hold
            </button>
          </div>
        </Modal>
      )}
    </AppLayout>
  )
}