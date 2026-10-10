import { useState } from 'react'
import AppLayout from '../../components/AppLayout'
import PageHeader from '../../components/PageHeader'
import Alert from '../../components/Alert'
import Badge from '../../components/Badge'
import { severityBadge } from '../../lib/helpers'

const RUN_TYPES = [
  { value: 'RECERT', label: 'Run 1: Vendor Recertification Feed Reconciliation' },
  { value: 'INVOICE', label: 'Run 2: Monthly Invoice Two-Pass Verification' },
  { value: 'CERT', label: 'Run 3: Destruction Certificate Compliance Audit' },
]

export default function Reconciliation() {
  const [runType, setRunType] = useState('RECERT')
  const [param, setParam] = useState('Q3-2025')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function handleRunTypeChange(type) {
    setRunType(type)
    setResult(null)
    setError('')
    if (type === 'RECERT') setParam('Q3-2025')
    if (type === 'INVOICE') setParam('INV-202601-001')
    if (type === 'CERT') setParam('All Active Certificates')
  }

  async function runReconciliation() {
    setRunning(true)
    setError('')
    setResult(null)

    try {
      let url = ''
      if (runType === 'RECERT') url = `http://localhost:8000/api/reconciliation/run-recertification?cycle=${encodeURIComponent(param)}`
      else if (runType === 'INVOICE') url = `http://localhost:8000/api/reconciliation/run-invoice?invoice_id=${encodeURIComponent(param)}`
      else if (runType === 'CERT') url = `http://localhost:8000/api/reconciliation/run-destruction-compliance`

      const res = await fetch(url, { method: 'POST' })
      if (!res.ok) throw new Error(`Reconciliation returned error ${res.status}`)
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <AppLayout pageTitle="Reconciliation Engine">
      <PageHeader 
        title="Three-Way Reconciliation Engine" 
        subtitle="Cross-verify vendor inventory feeds, contracted pricing cards, and certificates" 
      />

      {error && <div className="mb-4"><Alert type="danger">{error}</Alert></div>}

      {/* Config Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-xs mb-8">
        <h2 className="text-base font-bold text-stone-900 mb-4">Run Audit Cycle</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Reconciliation Mode</label>
            <select
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium"
              value={runType}
              onChange={e => handleRunTypeChange(e.target.value)}
            >
              {RUN_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-stone-500 mb-1">Parameter</label>
            <input
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium disabled:bg-stone-100"
              value={param}
              onChange={e => setParam(e.target.value)}
              disabled={runType === 'CERT'}
            />
          </div>
        </div>

        <button
          onClick={runReconciliation}
          disabled={running}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-6 py-3 rounded-xl transition shadow-xs disabled:opacity-50"
        >
          {running ? 'Executing Audit…' : 'Execute Reconciliation'}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900">{result.run_type} Results</h2>
              <p className="text-xs text-stone-400">Parameter: {param}</p>
            </div>
            <Badge className={result.exceptions?.length > 0 ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}>
              {result.exceptions?.length || 0} Breaks Identified
            </Badge>
          </div>

          {result.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/60 mb-6">
              {Object.entries(result.summary).map(([k, v]) => (
                <div key={k}>
                  <div className="text-[10px] uppercase font-bold text-stone-400">{k.replace(/_/g, ' ')}</div>
                  <div className="text-lg font-extrabold text-stone-900 mt-1">
                    {typeof v === 'boolean' ? (v ? 'MATCH' : 'DISCREPANCY') : (typeof v === 'number' && v > 1000 ? v.toLocaleString() : v)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(!result.exceptions || result.exceptions.length === 0) ? (
            <Alert type="success">Audit verified 100% with zero discrepancies.</Alert>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF8F5] border-b border-stone-200/80 text-[11px] uppercase font-bold text-stone-500">
                  <tr>
                    <th className="py-3 px-4">Break Type</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Carton</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {result.exceptions.slice(0, 100).map((b, i) => (
                    <tr key={b.exception_id || i}>
                      <td className="py-3 px-4 font-bold text-stone-900 text-xs">{b.break_type}</td>
                      <td className="py-3 px-4"><Badge className={severityBadge(b.severity)}>{b.severity}</Badge></td>
                      <td className="py-3 px-4 text-stone-700 text-xs">{b.carton_id || '—'}</td>
                      <td className="py-3 px-4 text-stone-500 text-xs">{b.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  )
}