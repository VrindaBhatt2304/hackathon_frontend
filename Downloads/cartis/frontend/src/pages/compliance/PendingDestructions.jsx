import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useRequests } from '../../lib/useRequests'
import AppLayout from '../../components/AppLayout'
import PageHeader from '../../components/PageHeader'
import Alert from '../../components/Alert'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import { fmtDateTime } from '../../lib/helpers'

export default function PendingDestructions() {
  const { profile } = useAuth()
  const { requests, loading, refetch } = useRequests({ type: 'DESTRUCTION', status: 'Open' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [acting, setActing] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingId, setRejectingId] = useState(null)

  async function approve(req) {
    if (req.raised_by === profile.user_id) {
      setError('Four-eyes violation: You cannot approve your own destruction request.')
      return
    }
    setActing(req.request_id)
    setError('')
    const now = new Date().toISOString()
    await supabase.from('requests').update({ approved_by: profile.user_id, approved_on: now, request_status: 'Acknowledged' }).eq('request_id', req.request_id)
    await supabase.from('carton_inventory').update({ current_status: 'Destruction Approved' }).eq('carton_id', req.carton_id)
    await supabase.from('event_log').insert({
      event_id: `EVT-${Date.now()}`, carton_id: req.carton_id,
      event_timestamp: now, event_type: 'DESTRUCTION_APPROVED',
      actor_type: 'COMPLIANCE', actor_id: profile.user_id,
      request_id: req.request_id, resulting_status: 'Destruction Approved'
    })
    setSuccess('Destruction approved and routed to vendor.')
    setActing(null)
    refetch()
  }

  async function reject(req) {
    setActing(req.request_id)
    setError('')
    const now = new Date().toISOString()
    await supabase.from('requests').update({ request_status: 'Rejected', remarks: rejectReason }).eq('request_id', req.request_id)
    await supabase.from('carton_inventory').update({ current_status: 'In Storage' }).eq('carton_id', req.carton_id)
    await supabase.from('event_log').insert({
      event_id: `EVT-${Date.now()}`, carton_id: req.carton_id,
      event_timestamp: now, event_type: 'DESTRUCTION_REJECTED',
      actor_type: 'COMPLIANCE', actor_id: profile.user_id,
      request_id: req.request_id, resulting_status: 'In Storage', remarks: rejectReason
    })
    setSuccess('Destruction request rejected.')
    setRejectingId(null)
    setRejectReason('')
    setActing(null)
    refetch()
  }

  return (
    <AppLayout pageTitle="Pending Destructions">
      <PageHeader title="Destruction Authorizations" subtitle="Dual-key approvals for physical carton disposal" />

      {error && <div className="mb-4"><Alert type="danger">{error}</Alert></div>}
      {success && <div className="mb-4"><Alert type="success">{success}</Alert></div>}

      {loading ? <Spinner /> : requests.length === 0 ? (
        <EmptyState title="No pending destructions" message="All destruction authorizations processed." />
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-stone-200/80 text-[11px] uppercase font-bold text-stone-500">
              <tr>
                <th className="py-3.5 px-5">Request ID</th>
                <th className="py-3.5 px-4">Carton</th>
                <th className="py-3.5 px-4">Raised By</th>
                <th className="py-3.5 px-4">Raised Date</th>
                <th className="py-3.5 px-5 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {requests.map(r => (
                <tr key={r.request_id} className="hover:bg-stone-50/60 transition">
                  <td className="py-4 px-5 font-bold text-stone-900">{r.request_id}</td>
                  <td className="py-4 px-4 font-semibold text-emerald-800">{r.carton_id}</td>
                  <td className="py-4 px-4 text-stone-600">{r.raised_by}</td>
                  <td className="py-4 px-4 text-stone-500 text-xs">{fmtDateTime(r.raised_on)}</td>
                  <td className="py-4 px-5 text-right">
                    {rejectingId === r.request_id ? (
                      <div className="flex items-center justify-end gap-2">
                        <input
                          className="px-2.5 py-1 text-xs border rounded-lg"
                          placeholder="Rejection reason…"
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                        />
                        <button onClick={() => reject(r)} disabled={!rejectReason} className="bg-rose-700 text-white text-xs px-2.5 py-1 rounded-lg">Confirm</button>
                        <button onClick={() => setRejectingId(null)} className="text-stone-500 text-xs px-1">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => approve(r)} disabled={acting === r.request_id} className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs transition">
                          Approve
                        </button>
                        <button onClick={() => setRejectingId(r.request_id)} className="bg-stone-100 hover:bg-stone-200 text-rose-700 font-bold text-xs px-3 py-1.5 rounded-lg transition">
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  )
}