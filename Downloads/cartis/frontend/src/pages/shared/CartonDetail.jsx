import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import AppLayout from '../../components/AppLayout'
import Badge from '../../components/Badge'
import Alert from '../../components/Alert'
import EventTimeline from '../../components/EventTimeline'
import Spinner from '../../components/Spinner'
import Modal from '../../components/Modal'
import { statusBadge, fmtDate } from '../../lib/helpers'
import { raisePickupRequest } from '../../lib/pickupFlow'

export default function CartonDetail() {
  const { id } = useParams()
  const { profile } = useAuth()
  const [carton, setCarton] = useState(null)
  const [events, setEvents] = useState([])
  const [files, setFiles] = useState([])
  const [holds, setHolds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tab, setTab] = useState('overview')
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showIndexFileModal, setShowIndexFileModal] = useState(false)
  const [requestType, setRequestType] = useState('PICKUP')
  const [submitting, setSubmitting] = useState(false)

  const [fileForm, setFileForm] = useState({
    file_id: '',
    file_description: '',
    document_year: new Date().getFullYear(),
    contains_pii: 'N'
  })

  async function load() {
    setLoading(true)
    const [{ data: c }, { data: ev }, { data: fi }, { data: h }, { data: policies }] = await Promise.all([
      supabase.from('carton_inventory').select('*').eq('carton_id', id).single(),
      supabase.from('event_log').select('*').eq('carton_id', id).order('event_timestamp', { ascending: false }),
      supabase.from('file_index').select('*').eq('carton_id', id),
      supabase.from('legal_holds').select('*').eq('carton_id', id).eq('hold_status', 'Active'),
      supabase.from('ref_retention_policy').select('document_type, archival_policy, retention_years')
    ])

    let enhancedCarton = c
    if (c) {
      const matchPolicy = (policies || []).find(p => 
        p.document_type === c.document_type && 
        (p.archival_policy === (c.archival_policy || 'Standard') || !c.archival_policy)
      )
      const years = matchPolicy ? matchPolicy.retention_years : 8
      if (c.retention_trigger_date) {
        const trig = new Date(c.retention_trigger_date)
        trig.setFullYear(trig.getFullYear() + years)
        const dueDateStr = trig.toISOString().split('T')[0]
        const todayStr = new Date().toISOString().split('T')[0]
        enhancedCarton = {
          ...c,
          retention_years: years,
          destruction_due_date: dueDateStr,
          retention_expired: dueDateStr <= todayStr
        }
      } else {
        enhancedCarton = { ...c, retention_years: years, destruction_due_date: null, retention_expired: false }
      }
    }

    setCarton(enhancedCarton)
    setEvents(ev || [])
    setFiles(fi || [])
    setHolds(h || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function handleIndexFile(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const fileId = fileForm.file_id || `FIL-${id.slice(-4)}-${Date.now().toString().slice(-4)}`
    const now = new Date().toISOString()

    const { error: err } = await supabase.from('file_index').insert([{
      file_id: fileId,
      carton_id: id,
      document_type: carton.document_type,
      file_description: fileForm.file_description,
      document_year: parseInt(fileForm.document_year) || new Date().getFullYear(),
      contains_pii: fileForm.contains_pii,
      entity_id: carton.entity_id,
      department_id: carton.department_id,
      created_date: now.split('T')[0]
    }])

    if (err) { setError(err.message); setSubmitting(false); return }

    await supabase.from('carton_inventory').update({ declared_file_count: (carton.declared_file_count || 0) + 1 }).eq('carton_id', id)
    await supabase.from('event_log').insert({
      event_id: `EVT-${Date.now()}`,
      carton_id: id,
      event_timestamp: now,
      event_type: 'FILE_INDEXED',
      actor_type: 'BUSINESS',
      actor_id: profile?.user_id || 'BUSINESS',
      resulting_status: carton.current_status,
      remarks: `Indexed file ${fileId}`
    })

    setSuccess(`File ${fileId} successfully indexed.`)
    setShowIndexFileModal(false)
    setFileForm({ file_id: '', file_description: '', document_year: new Date().getFullYear(), contains_pii: 'N' })
    setSubmitting(false)
    load()
  }

  async function raiseRequest() {
    if (!carton) return
    setSubmitting(true)
    setError('')

    if (carton.current_status === 'Destroyed') {
      setError('Cannot operate on a destroyed carton.')
      setSubmitting(false)
      return
    }

    if (requestType === 'PICKUP') {
      try {
        await raisePickupRequest(id, carton.current_location_id, carton.remarks)
        setSuccess('Pickup request raised.')
        setShowRequestModal(false)
        await load()
      } catch (err) {
        setError(err.message)
      } finally {
        setSubmitting(false)
      }
      return
    }

    if (requestType === 'RETRIEVAL' && carton.current_status !== 'In Storage') {
      setError("Must be 'In Storage' to retrieve.")
      setSubmitting(false)
      return
    }

    if (requestType === 'RETURN' && carton.current_status !== 'With Business') {
      setError("Must be 'With Business' to return.")
      setSubmitting(false)
      return
    }

    if (requestType === 'DESTRUCTION') {
      if (holds.length > 0 || !carton.retention_expired || carton.current_status !== 'In Storage') {
        setError('Destruction gate blocked by retention or legal hold.')
        setSubmitting(false)
        return
      }
    }

    const reqId = `REQ-${Date.now()}`
    const now = new Date().toISOString()
    const { error: err } = await supabase.from('requests').insert({
      request_id: reqId,
      request_type: requestType,
      carton_id: id,
      entity_id: carton.entity_id,
      department_id: carton.department_id,
      raised_by: profile?.user_id || 'BUSINESS',
      raised_on: now,
      vendor_id: carton.assigned_vendor_id,
      request_status: 'Open',
    })

    if (err) { setError(err.message); setSubmitting(false); return }

    const newStatus = { RETRIEVAL: 'Retrieval Requested', RETURN: 'Return Requested', DESTRUCTION: 'Pending Destruction' }[requestType] || carton.current_status
    await supabase.from('carton_inventory').update({ current_status: newStatus }).eq('carton_id', id)
    setSuccess(`${requestType} request submitted.`)
    setShowRequestModal(false)
    setSubmitting(false)
    load()
  }

  if (loading) return <AppLayout><Spinner /></AppLayout>
  if (!carton) return <AppLayout><Alert type="danger">Carton not found.</Alert></AppLayout>

  const isBiz = profile?.role_id === 'BUSINESS' || profile?.role_id === 'ROLE-BIZ-USER'

  return (
    <AppLayout pageTitle={`Carton ${carton.carton_id}`}>
      {error && <div className="mb-4"><Alert type="danger">{error}</Alert></div>}
      {success && <div className="mb-4"><Alert type="success">{success}</Alert></div>}

      {/* Header Info Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-stone-900">{carton.carton_id}</h1>
            <Badge className={statusBadge(carton.current_status)}>{carton.current_status}</Badge>
            {carton.legal_hold_flag === 'Y' && (
              <Badge className="bg-rose-100 text-rose-800 border-rose-300 font-bold">LEGAL HOLD</Badge>
            )}
          </div>
          {isBiz && carton.current_status !== 'Destroyed' && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowIndexFileModal(true)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold px-3.5 py-2 rounded-xl transition"
              >
                + Index File
              </button>
              <button 
                onClick={() => setShowRequestModal(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs"
              >
                + Raise Request
              </button>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 text-sm">
          <div>
            <div className="text-[11px] font-bold uppercase text-stone-400">Document Type</div>
            <div className="font-semibold text-stone-800 mt-0.5">{carton.document_type}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-stone-400">Archival Policy</div>
            <div className="font-semibold text-stone-800 mt-0.5">{carton.archival_policy}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-stone-400">Department</div>
            <div className="font-semibold text-stone-800 mt-0.5">{carton.department_name || carton.department_id}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-stone-400">Location</div>
            <div className="font-semibold text-stone-800 mt-0.5">{carton.current_location_id || '—'}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-stone-400">Retention Trigger</div>
            <div className="font-semibold text-stone-800 mt-0.5">{fmtDate(carton.retention_trigger_date)}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-stone-400">Destruction Due</div>
            <div className={`font-semibold mt-0.5 ${carton.retention_expired ? 'text-rose-600' : 'text-stone-800'}`}>
              {carton.destruction_due_date ? fmtDate(carton.destruction_due_date) : '—'}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-stone-400">Barcode</div>
            <div className="font-semibold text-stone-800 mt-0.5 font-mono">{carton.barcode || '—'}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase text-stone-400">Indexed Files</div>
            <div className="font-semibold text-stone-800 mt-0.5">{files.length} Files</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-stone-200 pb-3">
        {['overview', 'events', 'files'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
              tab === t ? 'bg-emerald-700 text-white' : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            {t} {t === 'events' ? `(${events.length})` : t === 'files' ? `(${files.length})` : ''}
          </button>
        ))}
      </div>

      {tab === 'events' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs">
          <h2 className="text-base font-bold text-stone-900 mb-6">Custody Handover Chain</h2>
          <EventTimeline events={events} />
        </div>
      )}

      {tab === 'files' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs">
          <h2 className="text-base font-bold text-stone-900 mb-4">Indexed Document Files</h2>
          {files.length === 0 ? (
            <p className="text-stone-500 text-sm">No files indexed yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] uppercase font-bold text-stone-400 border-b border-stone-100">
                  <tr>
                    <th className="py-2.5">File ID</th>
                    <th className="py-2.5">Description</th>
                    <th className="py-2.5">Year</th>
                    <th className="py-2.5">PII</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {files.map(f => (
                    <tr key={f.file_id}>
                      <td className="py-3 font-bold text-stone-900">{f.file_id}</td>
                      <td className="py-3 text-stone-700">{f.file_description}</td>
                      <td className="py-3 text-stone-500">{f.document_year}</td>
                      <td className="py-3">{f.contains_pii === 'Y' ? <Badge className="bg-amber-100 text-amber-800">PII</Badge> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'overview' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs">
          <h2 className="text-base font-bold text-stone-900 mb-2">Remarks & Details</h2>
          <p className="text-sm text-stone-600 leading-relaxed">{carton.remarks || 'No additional notes provided.'}</p>
        </div>
      )}

      {/* Index File Modal */}
      {showIndexFileModal && (
        <Modal title={`Index File into ${carton.carton_id}`} onClose={() => setShowIndexFileModal(false)}>
          <form onSubmit={handleIndexFile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Description *</label>
              <input 
                type="text" 
                required 
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                value={fileForm.file_description}
                onChange={e => setFileForm({...fileForm, file_description: e.target.value})}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Year</label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                  value={fileForm.document_year}
                  onChange={e => setFileForm({...fileForm, document_year: e.target.value})}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase text-stone-600 mb-1">PII?</label>
                <select 
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                  value={fileForm.contains_pii}
                  onChange={e => setFileForm({...fileForm, contains_pii: e.target.value})}
                >
                  <option value="N">No</option>
                  <option value="Y">Yes</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={submitting} className="w-full py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-bold mt-2">
              Confirm Indexing
            </button>
          </form>
        </Modal>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <Modal title="Raise Request" onClose={() => setShowRequestModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Request Type</label>
              <select 
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm"
                value={requestType} 
                onChange={e => setRequestType(e.target.value)}
              >
                <option value="PICKUP">Pickup (To Warehouse)</option>
                <option value="RETRIEVAL">Retrieval (To Branch)</option>
                <option value="RETURN">Return (Back to Storage)</option>
                <option value="DESTRUCTION">Destruction (Compliance review)</option>
              </select>
            </div>
            <button 
              onClick={raiseRequest} 
              disabled={submitting} 
              className="w-full py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-bold mt-2"
            >
              Submit Request
            </button>
          </div>
        </Modal>
      )}
    </AppLayout>
  )
}