import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import zencodeLogo from '../assets/zencode-logo.svg'

const orbs = [
  { style: { left: '6%', top: '8%', width: 240, height: 240 }, color: 'rgba(14,165,233,0.16)', dur: 15 },
  { style: { right: '8%', top: '15%', width: 300, height: 300 }, color: 'rgba(99,102,241,0.14)', dur: 19 },
  { style: { left: '30%', bottom: '8%', width: 200, height: 200 }, color: 'rgba(56,189,248,0.12)', dur: 17 },
]

function getStrength(pw) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^a-zA-Z0-9]/.test(pw)) score++
  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  const colors = ['bg-rose-500', 'bg-amber-400', 'bg-lime-500', 'bg-emerald-500']
  return { value: (score / 4) * 100, label: labels[score - 1] || '', color: colors[score - 1] || 'bg-slate-300' }
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [form, setForm] = useState({ name: '', email: '', username: '', password: '', confirm_password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const strength = getStrength(form.password)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await register(form)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 dark:bg-slate-950">
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute rounded-full blur-3xl"
          style={{ ...o.style, background: o.color }}
          animate={{ y: [0, -20, 0], x: [0, 12, 0], scale: [1, 1.07, 1] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="inline-flex flex-col items-center gap-2"
          >
            <img
              src={zencodeLogo}
              alt="Zencode Tech Solutions"
              className="h-16 w-16 rounded-full object-contain ring-1 ring-slate-300/80 dark:ring-slate-600"
            />
            <span className="section-title text-xl font-bold text-slate-900 transition hover:text-cyan-500 dark:text-white">
              Zencode Tech Solutions
            </span>
          </Link>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create your account</p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-6 text-center"
            >
              <FaCheckCircle className="text-5xl text-emerald-500" />
              <p className="text-lg font-bold text-slate-800 dark:text-white">Account created!</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Redirecting to login…</p>
            </motion.div>
          ) : (
            <>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-5 rounded-xl border border-rose-300/60 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Full Name
                  <div className="relative mt-2">
                    <FaUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-slate-300 bg-white/70 py-3 pl-11 pr-4 text-slate-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100"
                    />
                  </div>
                </label>

                {/* Email */}
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Email
                  <div className="relative mt-2">
                    <FaEnvelope className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-300 bg-white/70 py-3 pl-11 pr-4 text-slate-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100"
                    />
                  </div>
                </label>

                {/* Username */}
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Username
                  <div className="relative mt-2">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                    <input
                      name="username"
                      type="text"
                      value={form.username}
                      onChange={handleChange}
                      required
                      placeholder="Choose a username"
                      className="w-full rounded-xl border border-slate-300 bg-white/70 py-3 pl-11 pr-4 text-slate-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100"
                    />
                  </div>
                </label>

                {/* Password */}
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Password
                  <div className="relative mt-2">
                    <FaLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="password"
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      placeholder="Min. 8 characters"
                      className="w-full rounded-xl border border-slate-300 bg-white/70 py-3 pl-11 pr-12 text-slate-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500"
                    >
                      {showPw ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                        <motion.div
                          className={`h-1.5 rounded-full transition-all ${strength.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${strength.value}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{strength.label}</p>
                    </div>
                  )}
                </label>

                {/* Confirm Password */}
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Confirm Password
                  <div className="relative mt-2">
                    <FaLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="confirm_password"
                      type={showPw ? 'text' : 'password'}
                      value={form.confirm_password}
                      onChange={handleChange}
                      required
                      placeholder="Repeat password"
                      className="w-full rounded-xl border border-slate-300 bg-white/70 py-3 pl-11 pr-4 text-slate-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100"
                    />
                  </div>
                </label>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-shine mt-1 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition disabled:opacity-60"
                >
                  {loading ? 'Creating account…' : 'Create Account'}
                </motion.button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-cyan-600 hover:underline dark:text-cyan-400">
                  Sign In
                </Link>
              </p>
              <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                <Link to="/" className="hover:text-cyan-500 hover:underline">
                  ← Back to portfolio
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
