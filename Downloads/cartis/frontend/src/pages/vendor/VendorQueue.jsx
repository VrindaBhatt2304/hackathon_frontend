import { useState } from 'react'
import { useRequests } from '../../lib/useRequests'
import AppLayout from '../../components/AppLayout'
import PageHeader from '../../components/PageHeader'
import Badge from '../../components/Badge'
import Alert from '../../components/Alert'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import { fmtDateTime, fmtDate } from '../../lib/helpers'
import { processVendorAction } from '../../lib/workflowService'

export default function VendorQueue() {
  const { requests, loading, refetch } = useRequests({ statuses: ['Open', 'In Progress', 'Acknowledged'] })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [acting, setActing] = useState(null)

  async function doAction(req, actionKey, label) {
    setActing(req.request_id)
    setError('')
    try {
      await processVendorAction(req, actionKey)
      setSuccess(`Action "${label}" registered.`)
      await refetch()
    } catch (err) {
      setError(err.message)
    } finally {
      setActing(null)
    }
  }

  function getAvailableActions(req) {
    const status = req.request_status
    const type = req.request_type

    if (type === 'PICKUP') {
      if (status === 'Open') return [{ key: 'ACKNOWLEDGE', label: 'Acknowledge' }]
      if (status === 'In Progress') {
        return [
          { key: 'COLLECT', label: 'Confirm Collection' },
          { key: 'RECEIVE', label: 'Confirm Receipt' }
        ]
      }
    }
    if (type === 'RETRIEVAL') {
      if (status === 'Open') return [{ key: 'ACKNOWLEDGE', label: 'Acknowledge' }]
      if (status === 'In Progress') {
        return [
          { key: 'DISPATCH', label: 'Dispatch' },
          { key: 'DELIVER', label: 'Confirm Delivery' }
        ]
      }
    }
    if (type === 'RETURN' || type === 'REFILE') {
      if (status === 'Open') return [{ key: 'ACKNOWLEDGE', label: 'Acknowledge' }]
      if (status === 'In Progress') {
        return [
          { key: 'COLLECT', label: 'Collect' },
          { key: 'RECEIVE', label: 'Confirm Receipt' }
        ]
      }
    }
    if (type === 'DESTRUCTION') {
      return [{ key: 'DESTROY', label: 'Certify Destruction' }]
    }
    return []
  }

  return (
    <AppLayout pageTitle="Vendor Queue">
      <PageHeader title="Warehouse Task Queue" subtitle="Custody actions assigned to your vendor facility" />

      {error && <div className="mb-4"><Alert type="danger">{error}</Alert></div>}
      {success && <div className="mb-4"><Alert type="success">{success}</Alert></div>}

      {loading ? <Spinner /> : requests.length === 0 ? (
        <EmptyState title="Queue clear" message="All tasks have been processed." />
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F5] border-b border-stone-200/80 text-[11px] uppercase font-bold text-stone-500">
                <tr>
                  <th className="py-3.5 px-5">Request ID</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Carton</th>
                  <th className="py-3.5 px-4">SLA Due</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {requests.map(r => {
                  const actions = getAvailableActions(r)
                  return (
                    <tr key={r.request_id} className="hover:bg-stone-50/60 transition">
                      <td className="py-4 px-5 font-bold text-stone-900">{r.request_id}</td>
                      <td className="py-4 px-4 font-semibold text-emerald-800">{r.request_type}</td>
                      <td className="py-4 px-4 text-stone-700 font-semibold">{r.carton_id}</td>
                      <td className="py-4 px-4 text-stone-500 text-xs">{fmtDate(r.sla_due_date)}</td>
                      <td className="py-4 px-4"><Badge className="bg-amber-50 text-amber-800 border-amber-200">{r.request_status}</Badge></td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {actions.map(a => (
                            <button
                              key={a.key}
                              disabled={acting === r.request_id}
                              onClick={() => doAction(r, a.key, a.label)}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs transition"
                            >
                              {a.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  )
}