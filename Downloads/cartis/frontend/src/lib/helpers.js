export function roleName(role_id) {
  const map = {
    'ROLE-BIZ-USER': 'Business User',
    'BUSINESS': 'Business User',
    'ROLE-VENDOR': 'Vendor User',
    'VENDOR': 'Vendor User',
    'ROLE-COMPLIANCE': 'Compliance Officer',
    'COMPLIANCE': 'Compliance Officer',
    'ROLE-FACILITY': 'Facilities Team',
    'FACILITY': 'Facilities Team'
  }
  return map[role_id] || role_id || 'User'
}

export function fmtDate(val) {
  if (!val) return '—'
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return val
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return val
  }
}

export function fmtDateTime(val) {
  if (!val) return '—'
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return val
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return val
  }
}

export function initials(name) {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function severityBadge(sev) {
  const map = {
    'Critical': 'bg-rose-50 text-rose-700 border-rose-200',
    'High': 'bg-rose-50 text-rose-700 border-rose-200',
    'Medium': 'bg-amber-50 text-amber-800 border-amber-200',
    'Low': 'bg-emerald-50 text-emerald-800 border-emerald-200'
  }
  return map[sev] || 'bg-stone-100 text-stone-700 border-stone-200'
}

export function statusBadge(status) {
  const map = {
    'In Storage': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'Created': 'bg-stone-100 text-stone-700 border-stone-200',
    'Pickup Requested': 'bg-amber-50 text-amber-800 border-amber-200',
    'In Transit to Vendor': 'bg-teal-50 text-teal-800 border-teal-200',
    'With Business': 'bg-teal-50 text-teal-800 border-teal-200',
    'Retrieval Requested': 'bg-amber-50 text-amber-800 border-amber-200',
    'Refile Requested': 'bg-amber-50 text-amber-800 border-amber-200',
    'Pending Destruction': 'bg-rose-50 text-rose-700 border-rose-200',
    'Destruction Requested': 'bg-rose-50 text-rose-700 border-rose-200',
    'Destruction Approved': 'bg-amber-50 text-amber-800 border-amber-200',
    'Destroyed': 'bg-stone-200 text-stone-800 border-stone-300'
  }
  return map[status] || 'bg-stone-100 text-stone-700 border-stone-200'
}

export function truncate(str, max = 25) {
  if (!str) return ''
  return str.length > max ? str.substring(0, max) + '…' : str
}