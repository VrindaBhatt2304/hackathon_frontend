import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCartons } from '../../lib/useCartons'
import { useAuth } from '../../context/AuthContext'
import AppLayout from '../../components/AppLayout'
import PageHeader from '../../components/PageHeader'
import Badge from '../../components/Badge'
import EmptyState from '../../components/EmptyState'
import Spinner from '../../components/Spinner'
import { statusBadge, fmtDate, truncate } from '../../lib/helpers'

const STATUS_OPTIONS = [
  'In Storage','Pickup Requested','Collected','Retrieval Requested',
  'With Business','Return Requested','Destruction Requested','Destruction Approved','Destroyed'
]

export default function CartonList() {
  const { profile } = useAuth()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const { cartons, loading } = useCartons({ search, status })

  const isBiz = profile?.role_id === 'BUSINESS' || profile?.role_id === 'ROLE-BIZ-USER'

  return (
    <AppLayout pageTitle="Carton Inventory">
      <PageHeader title="Carton Inventory" subtitle={`Managing ${cartons.length} indexed record cartons`}>
        {isBiz && (
          <Link 
            to="/app/cartons/new" 
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition shadow-xs"
          >
            + Register Carton
          </Link>
        )}
      </PageHeader>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 min-w-[240px]"
          placeholder="Search carton ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select 
          className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          value={status} 
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : cartons.length === 0 ? (
        <EmptyState title="No cartons found" message="Try adjusting your search criteria." />
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F5] border-b border-stone-200/80 text-[11px] uppercase font-bold text-stone-500">
                <tr>
                  <th className="py-3.5 px-5">Carton ID</th>
                  <th className="py-3.5 px-4">Document Type</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Retention Trigger</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Hold</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {cartons.map(c => (
                  <tr key={c.carton_id} className="hover:bg-stone-50/60 transition">
                    <td className="py-4 px-5 font-bold text-stone-900">{c.carton_id}</td>
                    <td className="py-4 px-4 text-stone-700">{truncate(c.document_type, 28)}</td>
                    <td className="py-4 px-4 text-stone-500 text-xs">{c.department_name || c.department_id}</td>
                    <td className="py-4 px-4"><Badge className={statusBadge(c.current_status)}>{c.current_status}</Badge></td>
                    <td className="py-4 px-4 text-stone-600 text-xs">{fmtDate(c.retention_trigger_date)}</td>
                    <td className={`py-4 px-4 text-xs font-semibold ${c.retention_expired ? 'text-rose-600' : 'text-stone-600'}`}>
                      {c.destruction_due_date ? fmtDate(c.destruction_due_date) : '—'}
                      {c.retention_expired && ' (Due)'}
                    </td>
                    <td className="py-4 px-4">
                      {c.legal_hold_flag === 'Y' ? (
                        <Badge className="bg-rose-50 text-rose-800 border-rose-200 font-bold">HOLD</Badge>
                      ) : '—'}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link 
                        to={`/app/cartons/${c.carton_id}`}
                        className="font-semibold text-emerald-800 hover:text-emerald-950 text-xs py-1.5 px-3 rounded-lg hover:bg-emerald-50 transition"
                      >
                        View Details →
                      </Link>
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