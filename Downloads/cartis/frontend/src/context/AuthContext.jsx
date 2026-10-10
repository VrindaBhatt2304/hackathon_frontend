import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize from saved session or Supabase
  useEffect(() => {
    async function initAuth() {
      try {
        const saved = localStorage.getItem('cartis_session')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed?.profile) {
            setUser(parsed.user || { id: parsed.profile.user_id, email: parsed.profile.email })
            setProfile(parsed.profile)
            setLoading(false)
            return
          }
        }
      } catch (err) {
        console.warn('Failed to parse cached session:', err)
      }

      // Check Supabase auth as secondary
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          const { data } = await supabase
            .from('ref_users_roles')
            .select('*')
            .or(`user_id.eq.${session.user.id},email.eq.${session.user.email}`)
            .maybeSingle()
          setProfile(data || {
            user_id: session.user.id,
            email: session.user.email,
            role_id: session.user.user_metadata?.role_id || 'ROLE-BIZ-USER',
            full_name: session.user.user_metadata?.full_name || session.user.email
          })
        }
      } catch (err) {
        console.warn('Supabase getSession check failed:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  async function signIn(identifier, password) {
    const cleanId = (identifier || '').trim()
    if (!cleanId) throw new Error('Please enter your User ID or Email.')

    let foundUser = null

    // 1. Try FastAPI backend /api/auth/login
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanId })
      })
      if (res.ok) {
        const payload = await res.json()
        if (payload?.user) {
          foundUser = payload.user
        }
      }
    } catch (e) {
      console.warn('Backend login endpoint unavailable, falling back to Supabase direct table query:', e)
    }

    // 2. Direct Supabase query against ref_users_roles
    if (!foundUser) {
      const { data, error } = await supabase
        .from('ref_users_roles')
        .select('*')
        .or(`user_id.ilike.${cleanId},email.ilike.${cleanId}`)
        .limit(1)

      if (data && data.length > 0) {
        foundUser = data[0]
      }
    }

    // 3. Role shortcut support ('business', 'vendor', 'compliance', 'facility')
    if (!foundUser) {
      const roleAliasMap = {
        'business': 'ROLE-BIZ-USER',
        'vendor': 'ROLE-VENDOR',
        'compliance': 'ROLE-COMPLIANCE',
        'facility': 'ROLE-FACILITY'
      }
      const targetRole = roleAliasMap[cleanId.toLowerCase()]
      if (targetRole) {
        const { data } = await supabase
          .from('ref_users_roles')
          .select('*')
          .eq('role_id', targetRole)
          .limit(1)
        if (data && data.length > 0) {
          foundUser = data[0]
        }
      }
    }

    // 4. Fallback to Supabase Auth GoTrue (if registered through email/password)
    if (!foundUser && cleanId.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanId,
          password: password || 'Prms@2026'
        })
        if (!error && data?.user) {
          const userObj = data.user
          const profileObj = {
            user_id: userObj.id,
            email: userObj.email,
            full_name: userObj.user_metadata?.full_name || userObj.email,
            role_id: userObj.user_metadata?.role_id || 'ROLE-BIZ-USER'
          }
          setUser(userObj)
          setProfile(profileObj)
          localStorage.setItem('cartis_session', JSON.stringify({ user: userObj, profile: profileObj }))
          return { user: userObj, profile: profileObj }
        }
      } catch (err) {
        // Continue to error throw below
      }
    }

    if (!foundUser) {
      throw new Error(`User "${cleanId}" not found in seeded database. Please check User ID (e.g., USR-0001) or Email.`)
    }

    const sessionUser = {
      id: foundUser.user_id,
      email: foundUser.email,
      user_metadata: { full_name: foundUser.full_name, role_id: foundUser.role_id }
    }

    const sessionProfile = {
      user_id: foundUser.user_id,
      full_name: foundUser.full_name,
      role_id: foundUser.role_id,
      entity_id: foundUser.entity_id || null,
      department_id: foundUser.department_id || null,
      department_name: foundUser.department_name || '',
      vendor_id: foundUser.vendor_id || null,
      status: foundUser.status || 'Active'
    }

    setUser(sessionUser)
    setProfile(sessionProfile)
    localStorage.setItem('cartis_session', JSON.stringify({ user: sessionUser, profile: sessionProfile }))
    return { user: sessionUser, profile: sessionProfile }
  }

  async function signUp(email, password, metadata) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
    if (error) throw error
    return data
  }

  async function signOut() {
    try {
      await supabase.auth.signOut()
    } catch {}
    localStorage.removeItem('cartis_session')
    setUser(null)
    setProfile(null)
  }

  const value = { user, profile, loading, signIn, signUp, signOut }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
