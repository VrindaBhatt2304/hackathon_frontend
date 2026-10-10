import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AppLayout from '../../components/AppLayout'
import PageHeader from '../../components/PageHeader'
import Badge from '../../components/Badge'
import Modal from '../../components/Modal'
import Alert from '../../components/Alert'
import Spinner from '../../components/Spinner'
import EmptyState from '../../components/EmptyState'
import { roleName } from '../../lib/helpers'

const ROLE_COLORS = {
  'ROLE-BIZ-USER': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'ROLE-VENDOR': 'bg-teal-50 text-teal-800 border-teal-200',
  'ROLE-COMPLIANCE': 'bg-amber-50 text-amber-800 border-amber-200',
  'ROLE-FACILITY': 'bg-stone-100 text-stone-700 border-stone-200'
}

export default function UserAdmin() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [newUser, setNewUser] = useState({
    user_id: '',
    full_name: '',
    email: '',
    role_id: 'ROLE-BIZ-USER',
    entity_id: 'ENT-BRN',
    department_id: 'DEP-BRN-DEL',
    vendor_id: '',
    status: 'Active'
  })

  async function load() {
    setLoading(true)
    let q = supabase.from('ref_users_roles').select('*').order('user_id', { ascending: true })
    if (roleFilter) q = q.eq('role_id', roleFilter)
    if (search) q = q.or(`full_name.ilike.%${search}%,user_id.ilike.%${search}%,email.ilike.%${search}%`)
    const { data } = await q
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [search, roleFilter])

  async function toggleStatus(u) {
    const newStatus = u.status === 'Active' ? 'Inactive' : 'Active'
    await supabase.from('ref_users_roles').update({ status: newStatus }).eq('user_id', u.user_id)
    setSuccess(`User ${u.user_id} set to ${newStatus}.`)
    load()
  }

  async function handleCreateUser(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const userId = newUser.user_id || `USR-${Date.now().toString().slice(-4)}`
    const record = {
      ...newUser,
      user_id: userId,
      vendor_id: newUser.role_id === 'ROLE-VENDOR' ? newUser.vendor_id || 'VND-001' : null
    }

    const { error: err } = await supabase.from('ref_users_roles').insert([record])
    if (err) { setError(err.message); setSubmitting(false); return }

    setSuccess(`User ${userId} created.`)
    setShowCreateModal(false)
    setSubmitting(false)
    load()
  }

  return (
    <AppLayout pageTitle="User Directory">
      <PageHeader title="Access Governance" subtitle={`Managing ${users.length} authorized user accounts`}>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition shadow-xs"
        >
          + Create User
        </button>
      </PageHeader>

      {error && <div className="mb-4"><Alert type="danger">{error}</Alert></div>}
      {success && <div className="mb-4"><Alert type="success">{success}</Alert></div>}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 min-w-[240px]"
          placeholder="Search name, ID, or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select 
          className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          value={roleFilter} 
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="ROLE-BIZ-USER">Business User</option>
          <option value="ROLE-VENDOR">Vendor User</option>
          <option value="ROLE-COMPLIANCE">Compliance Officer</option>
          <option value="ROLE-FACILITY">Facilities Team</option>
        </select>
      </div>

      {loading ? <Spinner /> : users.length === 0 ? (
        <EmptyState title="No users found" message="Try adjusting search or role filters." />
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F5] border-b border-stone-200/80 text-[11px] uppercase font-bold text-stone-500">
                <tr>
                  <th className="py-3.5 px-5">User ID</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Dept / Vendor</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map(u => (
                  <tr key={u.user_id} className="hover:bg-stone-50/60 transition">
                    <td className="py-4 px-5 font-bold text-stone-900">{u.user_id}</td>
                    <td className="py-4 px-4 font-semibold text-stone-800">{u.full_name}</td>
                    <td className="py-4 px-4 text-stone-500 text-xs">{u.email}</td>
                    <td className="py-4 px-4"><Badge className={ROLE_COLORS[u.role_id] || 'bg-stone-100'}>{roleName(u.role_id)}</Badge></td>
                    <td className="py-4 px-4 text-stone-600 text-xs">{u.department_id || u.vendor_id || '—'}</td>
                    <td className="py-4 px-4">
                      <Badge className={u.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-stone-100 text-stone-600 border-stone-200'}>
                        {u.status || 'Active'}
                      </Badge>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => toggleStatus(u)}
                        className="text-xs font-bold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition"
                      >
                        {u.status === 'Active' ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreateModal && (
        <Modal title="Create User Account" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Full Name *</label>
              <input required className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm" value={newUser.full_name} onChange={e => setNewUser({ ...newUser, full_name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Email *</label>
              <input type="email" required className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Role *</label>
              <select className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm" value={newUser.role_id} onChange={e => setNewUser({ ...newUser, role_id: e.target.value })}>
                <option value="ROLE-BIZ-USER">Business User</option>
                <option value="ROLE-VENDOR">Vendor User</option>
                <option value="ROLE-COMPLIANCE">Compliance Officer</option>
                <option value="ROLE-FACILITY">Facilities Team</option>
              </select>
            </div>
            <button type="submit" disabled={submitting} className="w-full py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-bold mt-2">
              Save Account
            </button>
          </form>
        </Modal>
      )}
    </AppLayout>
  )
}