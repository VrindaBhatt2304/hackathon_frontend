import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AppLayout from '../../components/AppLayout'
import PageHeader from '../../components/PageHeader'
import Badge from '../../components/Badge'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import { severityBadge, fmtDateTime } from '../../lib/helpers'

export default function Exceptions() {
  const [exceptions, setExceptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('Open')

  async function load() {
    setLoading(true)
    let q = supabase.from('exception_register').select('*').order('created_at', { ascending: false })
    if (statusFilter) q = q.eq('status', statusFilter)
    const { data } = await q
    setExceptions(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [statusFilter])

  async function closeException(id) {
    await supabase.from('exception_register').update({ status: 'Closed', updated_at: new Date().toISOString() }).eq('exception_id', id)
    load()
  }

  return (
    <AppLayout pageTitle="Exceptions Register">
      <PageHeader title="Discrepancy Register" subtitle="Surfaced break logs from audit algorithms">
        <select 
          className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs font-bold"
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Exceptions</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
      </PageHeader>

      {loading ? <Spinner /> : exceptions.length === 0 ? (
        <EmptyState title="No exceptions" message="No discrepancies found matching criteria." />
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F5] border-b border-stone-200/80 text-[11px] uppercase font-bold text-stone-500">
                <tr>
                  <th className="py-3.5 px-5">Break Type</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Carton / Cert</th>
                  <th className="py-3.5 px-4">Details</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {exceptions.map(e => (
                  <tr key={e.exception_id} className="hover:bg-stone-50/60 transition">
                    <td className="py-4 px-5 font-bold text-stone-900">{e.break_type}</td>
                    <td className="py-4 px-4"><Badge className={severityBadge(e.severity)}>{e.severity}</Badge></td>
                    <td className="py-4 px-4 text-stone-700 font-medium">{e.carton_id || e.certificate_id || '—'}</td>
                    <td className="py-4 px-4 text-stone-500 text-xs max-w-xs">{e.detail}</td>
                    <td className="py-4 px-4 text-stone-400 text-xs">{fmtDateTime(e.created_at)}</td>
                    <td className="py-4 px-5 text-right">
                      {e.status === 'Open' && (
                        <button 
                          onClick={() => closeException(e.exception_id)} 
                          className="text-xs font-bold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition"
                        >
                          Close Break
                        </button>
                      )}
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