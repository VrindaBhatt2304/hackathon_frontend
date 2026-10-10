import AppLayout from '../../components/AppLayout'
import PageHeader from '../../components/PageHeader'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'
import Spinner from '../../components/Spinner'
import { useRequests } from '../../lib/useRequests'
import { fmtDate, fmtDateTime } from '../../lib/helpers'
import { Link } from 'react-router-dom'

function reqBadge(s) {
  const m = {
    Open: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Acknowledged: 'bg-teal-50 text-teal-800 border-teal-200',
    'In Progress': 'bg-teal-50 text-teal-800 border-teal-200',
    Completed: 'bg-stone-100 text-stone-700 border-stone-200',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    Cancelled: 'bg-stone-100 text-stone-600 border-stone-200'
  }
  return m[s] || 'bg-stone-100 text-stone-700 border-stone-200'
}

export default function MyRequests() {
  const { requests, loading } = useRequests()

  return (
    <AppLayout pageTitle="My Requests">
      <PageHeader 
        title="My Requests" 
        subtitle={`${requests.length} operational requests recorded`} 
      />

      {loading ? (
        <Spinner />
      ) : requests.length === 0 ? (
        <EmptyState 
          title="No requests yet" 
          message="Raise a pickup, retrieval, or destruction request from a carton detail page." 
        />
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  <th className="py-3.5 px-5">Request ID</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Carton</th>
                  <th className="py-3.5 px-4">Raised On</th>
                  <th className="py-3.5 px-4">SLA Due</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {requests.map((r) => (
                  <tr key={r.request_id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-4 px-5 font-bold text-stone-900 tracking-tight">
                      {r.request_id}
                    </td>
                    <td className="py-4 px-4">
                      <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold">
                        {r.request_type}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Link 
                        to={`/app/cartons/${r.carton_id}`}
                        className="font-medium text-emerald-700 hover:text-emerald-900 underline underline-offset-2 decoration-emerald-300"
                      >
                        {r.carton_id}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-stone-600 text-xs">
                      {fmtDateTime(r.raised_on)}
                    </td>
                    <td className="py-4 px-4 text-stone-600 text-xs">
                      {fmtDate(r.sla_due_date)}
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={reqBadge(r.request_status)}>
                        {r.request_status}
                      </Badge>
                    </td>
                    <td className="py-4 px-5 text-stone-500 text-xs">
                      {r.completed_on ? fmtDateTime(r.completed_on) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  )
}