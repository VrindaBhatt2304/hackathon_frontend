import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { useAuth } from '../context/AuthContext'

export function useRequests({ statuses = null, limit = 100 } = {}) {
  const { profile } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchRequests() {
    setLoading(true)
    let q = supabase.from('requests').select(`
      *,
      carton_inventory (
        carton_id,
        current_status,
        current_location_id,
        barcode
      )
    `)

    const isBiz = profile?.role_id === 'BUSINESS' || profile?.role_id === 'ROLE-BIZ-USER'
    const isVendor = profile?.role_id === 'VENDOR' || profile?.role_id === 'ROLE-VENDOR'

    if (isBiz && profile.department_id) {
      q = q.eq('department_id', profile.department_id)
    } else if (isVendor && profile.vendor_id) {
      q = q.eq('vendor_id', profile.vendor_id)
    }

    if (statuses && statuses.length > 0) {
      q = q.in('request_status', statuses)
    }

    q = q.order('raised_on', { ascending: false }).limit(limit)

    const { data, error } = await q
    if (!error && data) {
      setRequests(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [profile])

  return { requests, loading, refetch: fetchRequests }
}
