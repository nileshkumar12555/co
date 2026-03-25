import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaEye, FaEyeSlash, FaLock, FaShieldAlt, FaUser, FaUserCircle } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import zencodeLogo from '../assets/zencode-logo.svg'

const orbs = [
  { style: { left: '8%', top: '12%', width: 220, height: 220 }, color: 'rgba(14,165,233,0.18)', dur: 14 },
  { style: { right: '10%', top: '20%', width: 280, height: 280 }, color: 'rgba(99,102,241,0.16)', dur: 18 },
  { style: { left: '25%', bottom: '10%', width: 200, height: 200 }, color: 'rgba(56,189,248,0.14)', dur: 16 },
]

function LoginForm({ tab }) {
  const navigate = useNavigate()
  const { login, adminLogin } = useAuth()
  const isAdmin = tab === 'admin'
  const [form, setForm] = useState({ identifier: '', password: '', rememberMe: true })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isAdmin) {
        await adminLogin({ identifier: form.identifier, password: form.password, rememberMe: form.rememberMe })
        navigate('/admin/dashboard')
      } else {
        await login({ identifier: form.identifier, password: form.password, rememberMe: form.rememberMe })
        navigate('/')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const accentFrom = isAdmin ? 'from-violet-600' : 'from-cyan-500'
  const accentTo = isAdmin ? 'to-indigo-700' : 'to-blue-600'
  const focusRing = isAdmin ? 'focus:ring-2 focus:ring-violet-500' : 'focus:ring-2 focus:ring-cyan-500'

  return (
    <motion.div
      key={tab}
      initial={{ opacity: 0, x: isAdmin ? 30 : -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isAdmin ? -30 : 30 }}
      transition={{ duration: 0.3 }}
    >
      {isAdmin && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-violet-300/50 bg-violet-50/60 px-4 py-2.5 dark:border-violet-700/40 dark:bg-violet-950/30">
          <FaShieldAlt className="text-violet-500" />
          <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">
            Admin access only — staff accounts permitted
          </p>
        </div>
      )}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-5 rounded-xl border border-rose-300/60 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300"
        >
          {error}
        </motion.div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
          {isAdmin ? 'Admin Username or Email' : 'Username or Email'}
          <div className="relative mt-2">
            {isAdmin
              ? <FaShieldAlt className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" />
              : <FaUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            }
            <input name="identifier" type="text" value={form.identifier} onChange={handleChange} required
              autoComplete="username" placeholder={isAdmin ? 'Admin username or email' : 'Enter username or email'}
              className={`w-full rounded-xl border border-slate-300 bg-white/70 py-3 pl-11 pr-4 text-slate-900 outline-none transition ${focusRing} dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100`} />
          </div>
        </label>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Password
          <div className="relative mt-2">
            <FaLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange}
              required autoComplete="current-password" placeholder="Enter password"
              className={`w-full rounded-xl border border-slate-300 bg-white/70 py-3 pl-11 pr-12 text-slate-900 outline-none transition ${focusRing} dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100`} />
            <button type="button" onClick={() => setShowPw((p) => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500"
              aria-label={showPw ? 'Hide password' : 'Show password'}>
              {showPw ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <input name="rememberMe" type="checkbox" checked={form.rememberMe} onChange={handleChange}
            className={`h-4 w-4 ${isAdmin ? 'accent-violet-500' : 'accent-cyan-500'}`} />
          Remember me
        </label>
        <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className={`btn-shine w-full rounded-xl bg-gradient-to-r ${accentFrom} ${accentTo} py-3 text-sm font-bold text-white shadow-lg transition disabled:opacity-60 ${isAdmin ? 'shadow-violet-500/30' : 'shadow-cyan-500/30'}`}>
          {loading ? 'Signing in...' : isAdmin ? 'Sign In as Admin' : 'Sign In'}
        </motion.button>
      </form>
    </motion.div>
  )
}

export default function LoginPage() {
  const [tab, setTab] = useState('user')
  const tabs = [
    { id: 'user', label: 'User Login', icon: <FaUserCircle /> },
    { id: 'admin', label: 'Admin Login', icon: <FaShieldAlt /> },
  ]
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 dark:bg-slate-950">
      {orbs.map((o, i) => (
        <motion.div key={i} className="pointer-events-none absolute rounded-full blur-3xl"
          style={{ ...o.style, background: o.color }}
          animate={{ y: [0, -20, 0], x: [0, 12, 0], scale: [1, 1.07, 1] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
        className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <img
              src={zencodeLogo}
              alt="Zencode Tech Solutions"
              className="h-16 w-16 rounded-full object-contain ring-1 ring-slate-300/80 dark:ring-slate-600"
            />
            <span className="section-title text-xl font-bold text-slate-900 transition hover:text-cyan-500 dark:text-white">
              Zencode Tech Solutions
            </span>
          </Link>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to continue</p>
        </div>
        <div className="glass rounded-3xl p-8 shadow-2xl">
          <div className="mb-6 flex rounded-2xl border border-slate-200/80 bg-slate-100/60 p-1 dark:border-slate-700/60 dark:bg-slate-800/40">
            {tabs.map((t) => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                className="relative flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition">
                {tab === t.id && (
                  <motion.span layoutId="tab-pill"
                    className={`absolute inset-0 rounded-xl shadow-sm ${t.id === 'admin' ? 'bg-gradient-to-r from-violet-600 to-indigo-700' : 'bg-gradient-to-r from-cyan-500 to-blue-600'}`}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <span className={`relative z-10 flex items-center gap-1.5 ${tab === t.id ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  {t.icon} {t.label}
                </span>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <LoginForm key={tab} tab={tab} />
          </AnimatePresence>
          {tab === 'user' && (
            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-cyan-600 hover:underline dark:text-cyan-400">Register</Link>
            </p>
          )}
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-cyan-500 hover:underline">Back to portfolio</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
