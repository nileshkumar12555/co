import { createContext, useContext, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const stored = localStorage.getItem('auth') || sessionStorage.getItem('auth')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = async ({ identifier, password, rememberMe = true }) => {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      const msg = data.error || data.detail || Object.values(data).flat().join(' ') || 'Login failed'
      throw new Error(msg)
    }
    const payload = { access: data.access, refresh: data.refresh, user: data.user }
    if (rememberMe) localStorage.setItem('auth', JSON.stringify(payload))
    else sessionStorage.setItem('auth', JSON.stringify(payload))
    setAuth(payload)
    return data
  }

  const adminLogin = async ({ identifier, password, rememberMe = true }) => {
    const res = await fetch(`${API_BASE}/auth/admin-login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      const msg = data.error || data.detail || Object.values(data).flat().join(' ') || 'Admin login failed'
      throw new Error(msg)
    }
    const payload = { access: data.access, refresh: data.refresh, user: data.user }
    if (rememberMe) localStorage.setItem('auth', JSON.stringify(payload))
    else sessionStorage.setItem('auth', JSON.stringify(payload))
    setAuth(payload)
    return data
  }

  const register = async (fields) => {
    const res = await fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    const data = await res.json()
    if (!res.ok) {
      const msg = Object.values(data).flat().join(' ') || 'Registration failed'
      throw new Error(msg)
    }
    return data
  }

  const changePassword = async ({ old_password, new_password, confirm_password }) => {
    const stored = auth
    if (!stored?.access) throw new Error('Not authenticated.')
    const res = await fetch(`${API_BASE}/auth/change-password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${stored.access}`,
      },
      body: JSON.stringify({ old_password, new_password, confirm_password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Could not change password.')
    return data
  }

  const authRequest = async (endpoint, options = {}) => {
    let stored = auth
    if (!stored?.access) throw new Error('Not authenticated.')

    const _doFetch = (token) =>
      fetch(`${API_BASE}${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
        body: options.body,
      })

    let res = await _doFetch(stored.access)

    // Token expired — try silent refresh
    if (res.status === 401 && stored.refresh) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: stored.refresh }),
        })
        if (refreshRes.ok) {
          const { access: newAccess } = await refreshRes.json()
          const newAuth = { ...stored, access: newAccess }
          if (localStorage.getItem('auth')) localStorage.setItem('auth', JSON.stringify(newAuth))
          else sessionStorage.setItem('auth', JSON.stringify(newAuth))
          setAuth(newAuth)
          stored = newAuth
          res = await _doFetch(newAccess)
        } else {
          // Refresh token also expired — force logout
          localStorage.removeItem('auth')
          sessionStorage.removeItem('auth')
          setAuth(null)
          throw new Error('Session expired. Please login again.')
        }
      } catch (err) {
        if (err.message === 'Session expired. Please login again.') throw err
        localStorage.removeItem('auth')
        sessionStorage.removeItem('auth')
        setAuth(null)
        throw new Error('Session expired. Please login again.')
      }
    }

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg = data.error || data.detail || 'Request failed'
      throw new Error(msg)
    }
    return data
  }

  const logout = () => {
    localStorage.removeItem('auth')
    sessionStorage.removeItem('auth')
    setAuth(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user: auth?.user ?? null,
        isAuthenticated: !!auth,
        isAdmin: auth?.user?.is_admin ?? false,
        login,
        adminLogin,
        register,
        changePassword,
        authRequest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
