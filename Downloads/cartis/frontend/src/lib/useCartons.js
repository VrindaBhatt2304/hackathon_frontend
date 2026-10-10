import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { useAuth } from '../context/AuthContext'

export function useCartons({ search = '', status = '', limit = 100 } = {}) {
  const { profile } = useAuth()
  const [cartons, setCartons] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchCartons() {
    setLoading(true)
    let q = supabase.from('carton_inventory').select('*')

    // Role-based scoping
    const isBiz = profile?.role_id === 'BUSINESS' || profile?.role_id === 'ROLE-BIZ-USER'
    const isVendor = profile?.role_id === 'VENDOR' || profile?.role_id === 'ROLE-VENDOR'

    if (isBiz && profile.department_id) {
      q = q.eq('department_id', profile.department_id)
    } else if (isVendor && profile.vendor_id) {
      q = q.eq('assigned_vendor_id', profile.vendor_id)
    }

    if (status) {
      q = q.eq('current_status', status)
    }

    if (search) {
      q = q.ilike('carton_id', `%${search}%`)
    }

    q = q.order('carton_id', { ascending: true }).limit(limit)

    const [{ data, error }, { data: policies }] = await Promise.all([
      q,
      supabase.from('ref_retention_policy').select('document_type, archival_policy, retention_years')
    ])

    if (!error && data) {
      const policyMap = {}
      ;(policies || []).forEach(p => {
        policyMap[`${p.document_type}::${p.archival_policy}`] = p.retention_years
      })
      const todayStr = new Date().toISOString().split('T')[0]

      const augmented = data.map(c => {
        let dueDate = null
        let expired = false
        if (c.retention_trigger_date) {
          const years = policyMap[`${c.document_type}::${c.archival_policy}`] || 8
          const d = new Date(c.retention_trigger_date)
          d.setFullYear(d.getFullYear() + years)
          dueDate = d.toISOString().split('T')[0]
          expired = dueDate <= todayStr
        }
        return {
          ...c,
          destruction_due_date: dueDate,
          retention_expired: expired
        }
      })
      setCartons(augmented)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCartons()
  }, [search, status, profile])

  return { cartons, loading, refetch: fetchCartons }
}
