import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FaArrowRight,
  FaBars,
  FaBrain,
  FaCamera,
  FaCode,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaKey,
  FaLaptopCode,
  FaLinkedin,
  FaMapMarkerAlt,
  FaMoon,
  FaPhone,
  FaRobot,
  FaShoppingBag,
  FaSignOutAlt,
  FaStar,
  FaSun,
  FaTimes,
  FaTwitter,
  FaUserCircle,
  FaUserTie,
  FaWhatsapp,
} from 'react-icons/fa'
import {
  MdEmail,
  MdManageAccounts,
  MdOutlineDomainVerification,
} from 'react-icons/md'
import { useAuth } from './context/AuthContext'
import zencodeLogo from './assets/zencode-logo.svg'

const fallbackProjects = [
  {
    title: 'Client Interaction System',
    description: 'A polished client communication interface with lead capture and smart follow-up workflows.',
    category: 'Web',
    stack: ['React', 'Tailwind', 'REST API'],
    image:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=500&q=60',
    github: 'https://github.com/',
    demo: 'https://example.com/',
  },
  {
    title: 'Business Interaction Website',
    description: 'Marketing-focused interaction website for service discovery, inquiries, and conversion optimization.',
    category: 'Web',
    stack: ['React', 'Framer Motion', 'Node API'],
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=60',
    github: 'https://github.com/',
    demo: 'https://example.com/',
  },
  {
    title: 'Client Management Portal',
    description: 'Secure backend-driven portal for managing clients, permissions, projects, and lifecycle activities.',
    category: 'Backend',
    stack: ['Django', 'PostgreSQL', 'JWT Auth'],
    image:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=500&q=60',
    github: 'https://github.com/',
    demo: 'https://example.com/',
  },
  {
    title: 'Customer Interaction Platform',
    description: 'Interactive customer touchpoint platform with rich UI, forms, and engagement tracking.',
    category: 'Web',
    stack: ['React', 'TypeScript', 'Analytics'],
    image:
      'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=500&q=60',
    github: 'https://github.com/',
    demo: 'https://example.com/',
  },
  {
    title: 'Business Communication System',
    description: 'Real-time communication engine for teams with notification pipelines and role-based access.',
    category: 'Backend',
    stack: ['Django', 'WebSockets', 'Redis'],
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=60',
    github: 'https://github.com/',
    demo: 'https://example.com/',
  },
  {
    title: 'Client Service Website',
    description: 'Service showcase website with interactive sections, testimonials, and lead-gen contact journeys.',
    category: 'Web',
    stack: ['Vite', 'React', 'CSS'],
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=500&q=60',
    github: 'https://github.com/',
    demo: 'https://example.com/',
  },
  {
    title: 'Customer Support Portal',
    description: 'AI-assisted support portal with chatbot guidance and intelligent ticket routing.',
    category: 'AI',
    stack: ['Python', 'NLP', 'FastAPI'],
    image:
      'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=500&q=60',
    github: 'https://github.com/',
    demo: 'https://example.com/',
  },
  {
    title: 'Business Connect System',
    description: 'Backend integration layer connecting CRM, communication, and reporting services in one system.',
    category: 'Backend',
    stack: ['Node.js', 'PostgreSQL', 'Queue Worker'],
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=500&q=60',
    github: 'https://github.com/',
    demo: 'https://example.com/',
  },
  {
    title: 'Client Handling System',
    description: 'Operational client handling dashboard with workflow automation and status intelligence.',
    category: 'Backend',
    stack: ['Django', 'Celery', 'PostgreSQL'],
    image:
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=500&q=60',
    github: 'https://github.com/',
    demo: 'https://example.com/',
  },
  {
    title: 'Customer Engagement Website',
    description: 'AI-driven engagement website with personalization, recommendations, and behavior analytics.',
    category: 'AI',
    stack: ['React', 'Python', 'Recommendation Engine'],
    image:
      'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=500&q=60',
    github: 'https://github.com/',
    demo: 'https://example.com/',
  },
]

const backgroundOrbs = [
  { className: 'left-[8%] top-[10%] h-56 w-56 bg-cyan-400/20 dark:bg-cyan-500/15', duration: 14 },
  { className: 'right-[10%] top-[18%] h-72 w-72 bg-indigo-400/20 dark:bg-blue-500/15', duration: 18 },
  { className: 'left-[22%] bottom-[8%] h-64 w-64 bg-sky-400/15 dark:bg-cyan-400/12', duration: 16 },
]

const serviceGridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
}

const serviceCardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
}

const sectionStaggerVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: 'easeOut',
      staggerChildren: 0.12,
      delayChildren: 0.04,
    },
  },
}

const sectionStaggerItemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

function InteractiveBackground() {
  return (
    <div className="interactive-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {backgroundOrbs.map((orb) => (
        <motion.div
          key={orb.className}
          className={`mesh-orb absolute rounded-full blur-3xl ${orb.className}`}
          animate={{ y: [0, -20, 0], x: [0, 14, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: orb.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <div className="absolute inset-0 opacity-70 dark:opacity-60">
        <div className="absolute left-[10%] top-[30%] h-px w-40 rotate-12 bg-gradient-to-r from-cyan-500/0 via-cyan-500/45 to-cyan-500/0" />
        <div className="absolute right-[14%] top-[62%] h-px w-48 -rotate-12 bg-gradient-to-r from-blue-500/0 via-blue-500/45 to-blue-500/0" />
      </div>
      <div className="interactive-spotlight absolute inset-0" />
    </div>
  )
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

// ── Change Password Modal ────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }) {
  const { changePassword } = useAuth()
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await changePassword(form)
      setSuccess(true)
      setTimeout(onClose, 1600)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.25 }}
        className="glass w-full max-w-sm rounded-3xl p-7 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="section-title text-lg font-bold text-slate-900 dark:text-white">Change Password</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <FaTimes />
          </button>
        </div>

        {success ? (
          <p className="py-4 text-center text-sm font-semibold text-emerald-500">Password changed successfully!</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </p>
            )}
            {[
              { name: 'old_password', label: 'Current Password' },
              { name: 'new_password', label: 'New Password' },
              { name: 'confirm_password', label: 'Confirm New Password' },
            ].map(({ name, label }) => (
              <label key={name} className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                {label}
                <input
                  name={name}
                  type="password"
                  value={form[name]}
                  onChange={handleChange}
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white/70 px-4 py-2.5 text-slate-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100"
                />
              </label>
            ))}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-bold text-white shadow-md disabled:opacity-60"
            >
              {loading ? 'Updating…' : 'Update Password'}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

// ── User Avatar Dropdown ──────────────────────────────────────────────────────
function UserAvatarDropdown({ user, logout, onChangePassword, onUploadPhoto }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = (user?.name || user?.username || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const menuItems = [
    {
      icon: <FaCamera className="text-cyan-500" />,
      label: 'Change Profile Photo',
      onClick: () => { onUploadPhoto(); setOpen(false) },
    },
    {
      icon: <FaKey className="text-indigo-500" />,
      label: 'Change Password',
      onClick: () => { onChangePassword(); setOpen(false) },
    },
    {
      icon: <FaSignOutAlt className="text-rose-500" />,
      label: 'Logout',
      onClick: () => { logout(); setOpen(false) },
      danger: true,
    },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2.5 rounded-full border border-slate-300/80 py-1.5 pl-2 pr-3.5 transition hover:border-cyan-500 dark:border-slate-600"
        aria-label="User menu"
      >
        {/* Avatar circle */}
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white shadow">
          {initials}
        </span>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {user?.name || user?.username}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-slate-400"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.18 }}
            className="glass absolute right-0 top-full mt-2 w-52 origin-top-right overflow-hidden rounded-2xl border border-slate-200/70 shadow-xl dark:border-slate-700/70"
          >
            {/* Header */}
            <div className="border-b border-slate-200/70 px-4 py-3 dark:border-slate-700/70">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">My Account</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-slate-800 dark:text-white">
                {user?.name || user?.username}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-100/80 dark:hover:bg-slate-800/60 ${
                    item.danger ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Profile Photo Upload Modal ────────────────────────────────────────────────
function ProfilePhotoModal({ onClose }) {
  const [preview, setPreview] = useState(null)
  const inputRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.25 }}
        className="glass w-full max-w-sm rounded-3xl p-7 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="section-title text-lg font-bold text-slate-900 dark:text-white">Profile Photo</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <FaTimes />
          </button>
        </div>

        <div className="flex flex-col items-center gap-5">
          {preview ? (
            <img src={preview} alt="Preview" className="h-28 w-28 rounded-full object-cover shadow-lg ring-4 ring-cyan-500/40" />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30">
              <FaUserCircle className="text-6xl text-slate-400" />
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="btn-shine rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-500 hover:text-cyan-600 dark:border-slate-600 dark:text-slate-200"
          >
            Choose Photo
          </button>
          {preview && (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-bold text-white shadow-md"
            >
              Save Photo
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function ServiceDetailModal({ service, onClose }) {
  if (!service) return null

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.22 }}
        className="glass w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/70 shadow-2xl dark:border-slate-700/60"
      >
        <div className={`relative bg-gradient-to-r px-6 pb-5 pt-6 ${service.accent}`}>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full border border-white/40 bg-white/40 p-2 text-slate-700 transition hover:bg-white/70 dark:text-white"
            aria-label="Close service details"
          >
            <FaTimes />
          </button>
          <div className="inline-flex rounded-2xl border border-white/40 bg-white/60 p-3 text-cyan-700 dark:bg-slate-900/55 dark:text-cyan-300">
            {service.icon}
          </div>
          <h3 className="section-title mt-4 text-2xl font-bold text-slate-900 dark:text-white">{service.title}</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-700 dark:text-slate-200">{service.description}</p>
        </div>

        <div className="px-6 py-6">
          <div className="relative mb-5 overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
            <img
              src={service.image}
              alt={`${service.title} visual`}
              className="h-52 w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Included Services</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {service.offerings.map((item) => (
              <div
                key={`${service.title}-modal-${item}`}
                className="rounded-xl border border-slate-200/70 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#contact"
              onClick={onClose}
              className="btn-shine rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-bold text-white"
            >
              Discuss This Service
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-500 hover:text-cyan-600 dark:border-slate-600 dark:text-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── Login Required Modal ────────────────────────────────────────────────────
function LoginRequiredModal({ onClose, onLoginClick }) {
  const [isHovering, setIsHovering] = useState(false)
  const [loginAttempt, setLoginAttempt] = useState(false)

  const benefits = [
    { icon: '🔍', text: 'View premium project details' },
    { icon: '📥', text: 'Download project case studies' },
    { icon: '💬', text: 'Direct contact with team' },
    { icon: '⭐', text: 'Exclusive updates & offers' },
  ]

  const handleLoginClick = () => {
    setLoginAttempt(true)
    setTimeout(() => onLoginClick(), 600)
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
        className="glass relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl"
      >
        {/* Animated Background Gradient */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/10"
        />

        <div className="relative p-7">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-6 text-center"
          >
            {/* Animated Icon */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative flex h-full w-full items-center justify-center"
              >
                {/* Outer glow ring */}
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-2 border-cyan-400/60"
                />
                {/* Inner circle */}
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30">
                  <FaUserTie className="text-3xl text-cyan-600 dark:text-cyan-300" />
                </div>
              </motion.div>
            </div>

            {/* Title */}
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="section-title text-2xl font-bold text-slate-900 dark:text-white"
            >
              Login Required
            </motion.h3>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-2 text-sm text-slate-600 dark:text-slate-300"
            >
              Unlock full access to premium project features and exclusive content
            </motion.p>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mb-7 rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-cyan-500/8 to-blue-500/8 p-5"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-300"
            >
              <span>✨</span> Unlock These Benefits
            </motion.p>
            <div className="space-y-2.5">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.08, duration: 0.3 }}
                  className="flex items-center gap-3 group"
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ delay: 0.5 + idx * 0.08, duration: 0.6 }}
                    className="text-lg"
                  >
                    {benefit.icon}
                  </motion.span>
                  <span className="text-xs text-slate-700 font-medium darktext-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition">
                    {benefit.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="mb-6 flex items-center justify-around gap-3 rounded-xl border border-slate-200/50 bg-white/40 p-3.5 dark:border-slate-700/50 dark:bg-slate-900/30"
          >
            <div className="text-center">
              <p className="text-lg font-bold text-cyan-600 dark:text-cyan-300">40+</p>
              <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Projects</p>
            </div>
            <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent dark:via-slate-700" />
            <div className="text-center">
              <p className="text-lg font-bold text-cyan-600 dark:text-cyan-300">98%</p>
              <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Satisfaction</p>
            </div>
            <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent dark:via-slate-700" />
            <div className="text-center">
              <p className="text-lg font-bold text-cyan-600 dark:text-cyan-300">500+</p>
              <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Members</p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="flex gap-3"
          >
            <motion.button
              type="button"
              onClick={onClose}
              onMouseEnter={() => setIsHovering('browse')}
              onMouseLeave={() => setIsHovering(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 rounded-full border-2 border-slate-300 bg-white/50 px-4 py-2.5 text-sm font-bold text-slate-700 transition dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-200"
            >
              <motion.span
                animate={{ x: isHovering === 'browse' ? 4 : 0 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                Continue Browsing
              </motion.span>
            </motion.button>

            <motion.button
              type="button"
              onClick={handleLoginClick}
              disabled={loginAttempt}
              onMouseEnter={() => setIsHovering('login')}
              onMouseLeave={() => setIsHovering(false)}
              whileHover={{ scale: loginAttempt ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-shine group relative flex-1 overflow-hidden rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition disabled:opacity-75"
            >
              <motion.div
                animate={{
                  opacity: loginAttempt ? 1 : 0,
                  scale: loginAttempt ? 1 : 0.5,
                }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                />
              </motion.div>

              <motion.span
                animate={{
                  opacity: loginAttempt ? 0 : 1,
                  scale: loginAttempt ? 0.5 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2"
              >
                Login Now
                <motion.span
                  animate={{ x: isHovering === 'login' ? 3 : 0 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  →
                </motion.span>
              </motion.span>
            </motion.button>
          </motion.div>

          {/* Footer Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.4 }}
            className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400"
          >
            No credit card required • Takes 2 minutes
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}

function App() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const prefersReducedMotion = useReducedMotion()
  const [isDark, setIsDark] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  )
  const [mobileMenu, setMobileMenu] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [heroRoleIndex, setHeroRoleIndex] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [projectFilter, setProjectFilter] = useState('All')
  const [projectSearch, setProjectSearch] = useState('')
  const [featuredProjectIndex, setFeaturedProjectIndex] = useState(0)
  const [isProjectSliderPaused, setIsProjectSliderPaused] = useState(false)
  const [projects, setProjects] = useState(fallbackProjects)
  const [isProjectsLoading, setIsProjectsLoading] = useState(true)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [spotlight, setSpotlight] = useState({ x: 50, y: 26 })
  const [showChangePw, setShowChangePw] = useState(false)
  const [showUploadPhoto, setShowUploadPhoto] = useState(false)
  const [showLoginRequired, setShowLoginRequired] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [activeServiceIndex, setActiveServiceIndex] = useState(0)
  const [isServiceSliderPaused, setIsServiceSliderPaused] = useState(false)
  const [partnerCountersStarted, setPartnerCountersStarted] = useState(false)
  const [partnerCounters, setPartnerCounters] = useState({ clients: 0, satisfaction: 0, projects: 0 })
  const scrollProgressRef = useRef(0)
  const serviceTouchStartXRef = useRef(null)
  const serviceTouchDeltaXRef = useRef(0)
  const projectTouchStartXRef = useRef(null)
  const projectTouchDeltaXRef = useRef(0)

  const useLightMotion = prefersReducedMotion || isMobileViewport

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const shouldDark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(shouldDark)
    document.documentElement.classList.toggle('dark', shouldDark)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const roleTimer = setInterval(() => {
      setHeroRoleIndex((prev) => (prev + 1) % heroRoles.length)
    }, 2600)
    return () => clearInterval(roleTimer)
  }, [])

  useEffect(() => {
    if (!partnerCountersStarted) {
      return
    }

    const targets = {
      clients: 500,
      satisfaction: 99,
      projects: 1200,
    }
    const duration = 1700
    const startTime = performance.now()
    let rafId = null

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)

      setPartnerCounters({
        clients: Math.round(targets.clients * eased),
        satisfaction: Math.round(targets.satisfaction * eased),
        projects: Math.round(targets.projects * eased),
      })

      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      }
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [partnerCountersStarted])

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (rafIdRef.current !== null) {
        return
      }

      rafIdRef.current = window.requestAnimationFrame(() => {
        const doc = document.documentElement
        const total = doc.scrollHeight - doc.clientHeight
        const progress = total > 0 ? (doc.scrollTop / total) * 100 : 0

        if (Math.abs(progress - scrollProgressRef.current) >= 0.25) {
          scrollProgressRef.current = progress
          setScrollProgress(progress)
        }

        rafIdRef.current = null
      })
    }

    const rafIdRef = { current: null }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current)
      }
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/projects/`)
        if (!response.ok) {
          throw new Error('Could not load project data')
        }
        const data = await response.json()
        if (isMounted && Array.isArray(data) && data.length > 0) {
          // Keep curated featured projects always visible, then append unique API projects.
          const mergedByTitle = [...fallbackProjects]
          const titleSet = new Set(fallbackProjects.map((project) => (project.title || '').trim().toLowerCase()))

          data.forEach((project) => {
            const titleKey = (project?.title || '').trim().toLowerCase()
            if (!titleKey || titleSet.has(titleKey)) {
              return
            }
            titleSet.add(titleKey)
            mergedByTitle.push(project)
          })

          setProjects(mergedByTitle)
        }
      } catch {
        if (isMounted) {
          setProjects(fallbackProjects)
        }
      } finally {
        if (isMounted) {
          setIsProjectsLoading(false)
        }
      }
    }

    loadProjects()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const deviceType = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    fetch(`${API_BASE_URL}/analytics/track-visit/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: window.location.pathname,
        referrer: document.referrer || '',
        device_type: deviceType,
      }),
    }).catch(() => {})
  }, [])

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  const handlePointerMove = useCallback((event) => {
    if (window.innerWidth < 768) {
      return
    }
    
    // Throttle updates to every ~16ms (60fps) using RAF
    requestAnimationFrame(() => {
      const x = (event.clientX / window.innerWidth) * 100
      const y = (event.clientY / window.innerHeight) * 100
      setSpotlight({ x, y })
    })
  }, [])

  const handleInteractiveCardMove = useCallback((event) => {
    if (useLightMotion) {
      return
    }

    requestAnimationFrame(() => {
      const card = event.currentTarget
      if (!card) return
      const rect = card.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const percentX = (x / rect.width) * 100
      const percentY = (y / rect.height) * 100

      card.style.setProperty('--mx', `${percentX}%`)
      card.style.setProperty('--my', `${percentY}%`)
    })
  }, [useLightMotion])

  const handleInteractiveCardLeave = useCallback((event) => {
    const card = event.currentTarget
    card.style.setProperty('--mx', '50%')
    card.style.setProperty('--my', '50%')
  }, [])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setContactForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleContactSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: '', message: '' })

    try {
      const response = await fetch(`${API_BASE_URL}/contacts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      })

      if (!response.ok) {
        throw new Error('Failed to submit contact form')
      }

      setSubmitStatus({ type: 'success', message: 'Message sent successfully. I will connect with you soon.' })
      setContactForm({ name: '', email: '', message: '' })
    } catch {
      setSubmitStatus({ type: 'error', message: 'Could not send message. Please try again later.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNavItemClick = useCallback(
    (href, closeMobile = false) => (event) => {
      const navigateToSection = () => {
        if (!href.startsWith('#')) return
        const target = document.querySelector(href)
        if (target) {
          target.scrollIntoView({ behavior: useLightMotion ? 'auto' : 'smooth', block: 'start' })
          window.history.replaceState(null, '', href)
          return
        }
        // Fallback for older mobile browsers if element query misses momentarily
        window.location.hash = href
      }

      if (href.startsWith('#')) {
        event.preventDefault()
      }

      if (closeMobile) {
        setMobileMenu(false)
        // Close animation ke baad scroll start karo for reliable mobile behavior
        setTimeout(navigateToSection, 50)
      } else {
        navigateToSection()
      }
    },
    [useLightMotion],
  )

  const navItems = useMemo(
    () => [
      { label: 'Home', href: '#home' },
      { label: 'About', href: '#about' },
      { label: 'Services', href: '#services' },
      { label: 'Projects', href: '#projects' },
      { label: 'Why Us', href: '#why-partner' },
      { label: 'Testimonials', href: '#testimonials' },
      { label: 'Contact', href: '#contact' },
    ],
    [],
  )

  const services = [
    {
      icon: <FaLaptopCode className="text-xl" />,
      title: 'Web Development',
      description: 'Modern websites engineered for conversion, speed, and scalable growth.',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=60',
      offerings: [
        'Website Design',
        'Full-Stack Web Development',
        'Landing Page Development',
        'Portfolio Website Creation',
      ],
      accent: 'from-cyan-500/35 to-blue-600/20',
    },
    {
      icon: <MdManageAccounts className="text-xl" />,
      title: 'Backend / System Development',
      description: 'Robust backend foundations with secure APIs and reliable data architecture.',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=60',
      offerings: [
        'API Development',
        'Database Design & Management',
        'Admin Dashboard Development',
      ],
      accent: 'from-indigo-500/35 to-violet-600/20',
    },
    {
      icon: <FaBrain className="text-xl" />,
      title: 'AI & Automation',
      description: 'Intelligent automation and ML systems that reduce manual effort and improve outcomes.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=60',
      offerings: [
        'Chatbot Development',
        'Machine Learning Solutions',
      ],
      accent: 'from-fuchsia-500/35 to-violet-600/20',
    },
    {
      icon: <FaGlobe className="text-xl" />,
      title: 'Data & Analytics',
      description: 'Data-driven insights and dashboards for smarter, faster strategic decisions.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=60',
      offerings: [
        'Data Analysis',
        'Data Science Solutions',
        'Data Visualization & Reporting',
      ],
      accent: 'from-emerald-500/35 to-cyan-600/20',
    },
    {
      icon: <FaShoppingBag className="text-xl" />,
      title: 'Digital Marketing',
      description: 'Visibility and performance improvements to attract quality traffic and leads.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=60',
      offerings: [
        'Search Engine Optimization (SEO)',
        'Website Performance Optimization',
      ],
      accent: 'from-amber-500/35 to-orange-600/20',
    },
    {
      icon: <MdOutlineDomainVerification className="text-xl" />,
      title: 'Website Support',
      description: 'Proactive maintenance and security operations to keep your site always healthy.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=60',
      offerings: [
        'Website Maintenance',
        'Website Updates & Bug Fixing',
        'Security Monitoring & Backup',
      ],
      accent: 'from-rose-500/35 to-pink-600/20',
    },
  ]

  const partnerBenefits = [
    {
      icon: <FaKey className="text-cyan-700 dark:text-cyan-300" />,
      title: 'Enterprise Grade Security',
      description: 'Secure architecture, protected data flow, and role-based access across your platform.',
    },
    {
      icon: <FaLaptopCode className="text-cyan-700 dark:text-cyan-300" />,
      title: 'High Performance Delivery',
      description: 'Fast, optimized, and stable digital products that are built for long-term scale.',
    },
    {
      icon: <FaGlobe className="text-cyan-700 dark:text-cyan-300" />,
      title: 'Cross Device Experience',
      description: 'Smooth UX on desktop, tablet, and mobile with clean responsive behavior.',
    },
    {
      icon: <FaRobot className="text-cyan-700 dark:text-cyan-300" />,
      title: 'Automation Ready Workflows',
      description: 'We integrate smart automation to reduce repetitive effort and save team time.',
    },
    {
      icon: <FaCode className="text-cyan-700 dark:text-cyan-300" />,
      title: 'Clean Maintainable Code',
      description: 'Modern implementation standards for easier scaling, updates, and lower maintenance risk.',
    },
    {
      icon: <FaUserTie className="text-cyan-700 dark:text-cyan-300" />,
      title: 'Reliable Partnership',
      description: 'From planning to post-launch, our team supports your growth with proactive guidance.',
    },
  ]

  const testimonials = [
    {
      name: 'Ritika Sharma',
      role: 'Startup Founder',
      text: 'Zencode Tech Solutions delivered a premium web platform with clean architecture and impressive speed.',
    },
    {
      name: 'Arjun Verma',
      role: 'EdTech Manager',
      text: 'Our exam system migration was smooth and scalable. Communication and execution were top-class.',
    },
    {
      name: 'Sohail Khan',
      role: 'Business Consultant',
      text: 'From UI polish to backend reliability, everything felt enterprise ready. Highly recommended partner.',
    },
  ]

  const stats = [
    { label: 'Projects Completed', value: '40+' },
    { label: 'Technologies Used', value: '20+' },
    { label: 'Client Satisfaction', value: '98%' },
  ]

  const aboutHighlights = [
    {
      icon: <FaCode className="text-cyan-300" />,
      title: 'Engineering Excellence',
      text: 'Web development solutions built with modern architecture, security, and scalability in mind.',
    },
    {
      icon: <FaBrain className="text-violet-300" />,
      title: 'AI & ML Innovation',
      text: 'Machine learning and intelligent automation designed to improve business efficiency and outcomes.',
    },
    {
      icon: <FaGlobe className="text-emerald-300" />,
      title: 'Growth-Focused Delivery',
      text: 'Digital products and platforms tailored to help startups and organizations grow faster online.',
    },
  ]

  const heroRoles = ['Web Products', 'AI Workflows', 'Backend Systems', 'Data Dashboards']

  const capabilityBadges = ['Fast Delivery', 'Scalable Architecture', 'Modern UX', 'Business Automation', 'Production Ready']

  const heroParallaxX = (spotlight.x - 50) / 6
  const heroParallaxY = (spotlight.y - 45) / 9

  const projectFilters = ['All', 'Web', 'AI', 'Backend']

  const filteredProjects = useMemo(() => {
    if (projectFilter === 'All') {
      return projects
    }

    const normalizedFilter = projectFilter.toLowerCase()

    const categoryMatched = projects.filter(
      (project) => typeof project.category === 'string' && project.category.toLowerCase() === normalizedFilter,
    )

    if (categoryMatched.length > 0) {
      return categoryMatched
    }

    const keywords = {
      Web: ['react', 'javascript', 'frontend', 'tailwind', 'web'],
      AI: ['ai', 'ml', 'machine learning', 'scikit', 'prediction'],
      Backend: ['django', 'flask', 'api', 'postgres', 'database', 'backend'],
    }

    return projects.filter((project) => {
      const stack = Array.isArray(project.stack) ? project.stack.join(' ').toLowerCase() : ''
      const text = `${project.title || ''} ${project.description || ''} ${stack}`.toLowerCase()
      return keywords[projectFilter].some((keyword) => text.includes(keyword))
    })
  }, [projectFilter, projects])

  const visibleProjects = useMemo(() => {
    const query = projectSearch.trim().toLowerCase()
    if (!query) {
      return filteredProjects
    }

    return filteredProjects.filter((project) => {
      const stack = Array.isArray(project.stack) ? project.stack.join(' ').toLowerCase() : ''
      const category = typeof project.category === 'string' ? project.category.toLowerCase() : ''
      const text = `${project.title || ''} ${project.description || ''} ${stack} ${category}`.toLowerCase()
      return text.includes(query)
    })
  }, [filteredProjects, projectSearch])

  useEffect(() => {
    setFeaturedProjectIndex(0)
  }, [projectFilter, projectSearch])

  useEffect(() => {
    if (visibleProjects.length <= 1 || isProjectSliderPaused) {
      return
    }

    const spotlightTimer = setInterval(() => {
      setFeaturedProjectIndex((prev) => (prev + 1) % visibleProjects.length)
    }, 4200)

    return () => clearInterval(spotlightTimer)
  }, [visibleProjects, isProjectSliderPaused])

  const projectCountByFilter = useMemo(() => {
    const counts = { All: projects.length, Web: 0, AI: 0, Backend: 0 }

    projects.forEach((project) => {
      const category = typeof project.category === 'string' ? project.category : ''
      if (category in counts) {
        counts[category] += 1
      }
    })

    return counts
  }, [projects])

  const goToNextProject = useCallback(() => {
    if (visibleProjects.length <= 1) {
      return
    }
    setFeaturedProjectIndex((prev) => (prev + 1) % visibleProjects.length)
  }, [visibleProjects.length])

  const goToPrevProject = useCallback(() => {
    if (visibleProjects.length <= 1) {
      return
    }
    setFeaturedProjectIndex((prev) => (prev - 1 + visibleProjects.length) % visibleProjects.length)
  }, [visibleProjects.length])

  const goToProject = useCallback((index) => {
    setFeaturedProjectIndex(index)
  }, [])

  const handleProjectTouchStart = useCallback((event) => {
    if (event.touches.length !== 1) {
      return
    }
    projectTouchStartXRef.current = event.touches[0].clientX
    projectTouchDeltaXRef.current = 0
    setIsProjectSliderPaused(true)
  }, [])

  const handleProjectTouchMove = useCallback((event) => {
    if (projectTouchStartXRef.current === null || event.touches.length !== 1) {
      return
    }
    projectTouchDeltaXRef.current = event.touches[0].clientX - projectTouchStartXRef.current
  }, [])

  const handleProjectTouchEnd = useCallback(() => {
    const delta = projectTouchDeltaXRef.current
    const swipeThreshold = 42

    if (Math.abs(delta) > swipeThreshold) {
      if (delta < 0) {
        goToNextProject()
      } else {
        goToPrevProject()
      }
    }

    projectTouchStartXRef.current = null
    projectTouchDeltaXRef.current = 0
    setIsProjectSliderPaused(false)
  }, [goToNextProject, goToPrevProject])

  const goToNextService = useCallback(() => {
    setActiveServiceIndex((prev) => (prev + 1) % services.length)
  }, [services.length])

  const goToPrevService = useCallback(() => {
    setActiveServiceIndex((prev) => (prev - 1 + services.length) % services.length)
  }, [services.length])

  const goToService = useCallback((index) => {
    setActiveServiceIndex(index)
  }, [])

  const handleServiceTouchStart = useCallback((event) => {
    if (event.touches.length !== 1) {
      return
    }
    serviceTouchStartXRef.current = event.touches[0].clientX
    serviceTouchDeltaXRef.current = 0
    setIsServiceSliderPaused(true)
  }, [])

  const handleServiceTouchMove = useCallback((event) => {
    if (serviceTouchStartXRef.current === null || event.touches.length !== 1) {
      return
    }
    serviceTouchDeltaXRef.current = event.touches[0].clientX - serviceTouchStartXRef.current
  }, [])

  const handleServiceTouchEnd = useCallback(() => {
    const delta = serviceTouchDeltaXRef.current
    const swipeThreshold = 42

    if (Math.abs(delta) > swipeThreshold) {
      if (delta < 0) {
        goToNextService()
      } else {
        goToPrevService()
      }
    }

    serviceTouchStartXRef.current = null
    serviceTouchDeltaXRef.current = 0
    setIsServiceSliderPaused(false)
  }, [goToNextService, goToPrevService])

  useEffect(() => {
    if (services.length <= 1 || isServiceSliderPaused) {
      return
    }

    const serviceTimer = setInterval(() => {
      setActiveServiceIndex((prev) => (prev + 1) % services.length)
    }, 4300)

    return () => clearInterval(serviceTimer)
  }, [services.length, isServiceSliderPaused])

  const featuredTransition = useLightMotion ? { duration: 0.2 } : { duration: 0.4 }
  const featuredInitial = useLightMotion ? { opacity: 0 } : { opacity: 0, x: 14 }
  const featuredAnimate = useLightMotion ? { opacity: 1 } : { opacity: 1, x: 0 }
  const featuredExit = useLightMotion ? { opacity: 0 } : { opacity: 0, x: -14 }

  return (
    <div
      className="relative isolate overflow-x-hidden text-slate-800 dark:text-slate-100"
      style={{ '--spot-x': `${spotlight.x}%`, '--spot-y': `${spotlight.y}%` }}
      onMouseMove={handlePointerMove}
    >
      <div
        className="fixed left-0 top-0 z-[130] h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 shadow-[0_0_20px_rgba(34,211,238,0.45)]"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-lg focus:bg-cyan-600 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to main content
      </a>
      <InteractiveBackground />
      <header className="glass sticky top-0 z-50 border-b border-slate-200/70 dark:border-slate-700/70">
        <nav aria-label="Primary navigation" className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
          <a
            href="#home"
            className="group flex min-w-0 flex-1 items-center gap-2 rounded-full px-1 py-1 pr-2 transition hover:bg-slate-100/70 dark:hover:bg-slate-800/60 sm:gap-3"
          >
            <motion.img
              src={zencodeLogo}
              alt="Zencode Tech Solutions"
              className="h-[clamp(2.35rem,5vw,3rem)] w-[clamp(2.35rem,5vw,3rem)] shrink-0 rounded-full object-contain ring-1 ring-slate-300/80 shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_8px_20px_rgba(8,47,73,0.18)] dark:ring-slate-600"
              animate={
                useLightMotion
                  ? { opacity: 1 }
                  : { scale: [1, 1.03, 1], rotate: [0, -2, 0, 2, 0] }
              }
              transition={
                useLightMotion
                  ? { duration: 0.25 }
                  : { duration: 8, repeat: Infinity, ease: 'easeInOut' }
              }
            />
            <span className="min-w-0 leading-tight">
              <span className="section-title block text-[clamp(0.68rem,3.35vw,1rem)] font-bold tracking-[0.08em] text-slate-900 transition group-hover:text-cyan-600 dark:text-white dark:group-hover:text-cyan-300 sm:tracking-[0.14em]">
                Zencode Tech Solutions
              </span>
            </span>
          </a>
          <div className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={handleNavItemClick(item.href)}
                className="link-animated text-sm font-semibold text-slate-700 transition hover:text-cyan-500 dark:text-slate-200"
              >
                {item.label}
              </a>
            ))}
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="btn-shine rounded-full bg-gradient-to-r from-violet-600 to-indigo-700 px-4 py-1.5 text-sm font-bold text-white shadow-md shadow-violet-500/25 transition hover:-translate-y-0.5"
                  >
                    Go to Admin Panel
                  </Link>
                )}
                <UserAvatarDropdown
                  user={user}
                  logout={logout}
                  onChangePassword={() => setShowChangePw(true)}
                  onUploadPhoto={() => setShowUploadPhoto(true)}
                />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-full border border-slate-300/80 px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-500 hover:text-cyan-600 dark:border-slate-600 dark:text-slate-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-shine rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1.5 text-sm font-bold text-white shadow-md shadow-cyan-500/25 transition hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full border border-slate-300/80 p-2 text-slate-700 transition hover:scale-105 hover:border-cyan-500 dark:border-slate-600 dark:text-slate-100"
              aria-label="Toggle theme"
            >
              {isDark ? <FaSun /> : <FaMoon />}
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-300/80 p-2 md:hidden dark:border-slate-600"
              onClick={() => setMobileMenu((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileMenu ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </nav>
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative z-[60] border-t border-slate-200/70 px-4 py-3 md:hidden dark:border-slate-700/70"
            >
              <div className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="link-animated w-full text-left text-sm font-semibold text-slate-700 dark:text-slate-100"
                    onClick={handleNavItemClick(item.href, true)}
                  >
                    {item.label}
                  </button>
                ))}
                {isAuthenticated ? (
                  <div className="space-y-2 border-t border-slate-200/60 pt-3 dark:border-slate-700/60">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {user?.name || user?.username}
                    </p>
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setMobileMenu(false)}
                          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-700 px-4 py-1.5 text-sm font-bold text-white"
                        >
                          <MdManageAccounts /> Go to Admin Panel
                        </Link>
                      )}
                    <button
                      type="button"
                      onClick={() => { setShowUploadPhoto(true); setMobileMenu(false) }}
                      className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-cyan-500 dark:text-slate-200"
                    >
                      <FaCamera className="text-cyan-500" /> Change Profile Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowChangePw(true); setMobileMenu(false) }}
                      className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-indigo-500 dark:text-slate-200"
                    >
                      <FaKey className="text-indigo-500" /> Change Password
                    </button>
                    <button
                      type="button"
                      onClick={() => { logout(); setMobileMenu(false) }}
                      className="flex items-center gap-2 text-sm font-semibold text-rose-500 hover:underline"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 pt-1">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenu(false)}
                      className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-700 hover:border-cyan-500 dark:border-slate-600 dark:text-slate-200"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenu(false)}
                      className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1.5 text-sm font-bold text-white"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="main-content">
        <section id="home" className="soft-grid relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <FaCode className="floating absolute left-[8%] top-[14%] text-4xl text-cyan-400/50" />
            <FaRobot className="floating-alt absolute right-[9%] top-[22%] text-4xl text-indigo-400/50" />
            <FaGlobe className="floating absolute bottom-[20%] left-[16%] text-4xl text-sky-400/50" />
          </div>

          <motion.div
            style={{ x: heroParallaxX, y: heroParallaxY }}
            className="pointer-events-none absolute right-[8%] top-[22%] hidden rounded-2xl border border-cyan-300/45 bg-white/70 px-4 py-2.5 shadow-lg backdrop-blur lg:block dark:border-cyan-400/35 dark:bg-slate-900/60"
            animate={{ y: [heroParallaxY, heroParallaxY - 8, heroParallaxY] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">Live Projects</p>
            <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">12 Active Builds</p>
          </motion.div>
          <motion.div
            style={{ x: -heroParallaxX * 1.2, y: -heroParallaxY * 0.7 }}
            className="pointer-events-none absolute left-[8%] top-[58%] hidden rounded-2xl border border-indigo-300/45 bg-white/70 px-4 py-2.5 shadow-lg backdrop-blur lg:block dark:border-indigo-400/35 dark:bg-slate-900/60"
            animate={{ y: [-heroParallaxY * 0.7, -heroParallaxY * 0.7 - 10, -heroParallaxY * 0.7] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300">Avg Delivery</p>
            <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">2.6 Weeks</p>
          </motion.div>

          <div className="relative mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mx-auto max-w-4xl text-center"
            >
              <p className="mb-4 inline-flex rounded-full border border-cyan-400/35 bg-cyan-500/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200">
                Web Development | AI Solutions | Software Development
              </p>
              <h1 className="section-title text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                Building Modern Web Applications &amp; AI Solutions
              </h1>
              <div className="mt-4 flex min-h-9 items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={heroRoles[heroRoleIndex]}
                    initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
                    transition={{ duration: 0.35 }}
                    className="hero-gradient-text text-base font-bold uppercase tracking-[0.2em]"
                  >
                    {heroRoles[heroRoleIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
                Zencode Tech Solutions helps businesses launch powerful digital products, automate workflows,
                and scale with robust software engineering.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="#contact"
                  className="btn-shine rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5"
                >
                  Hire Me
                </a>
                <a
                  href="#projects"
                  className="btn-shine inline-flex items-center gap-2 rounded-full border border-slate-300 px-7 py-3 text-sm font-bold text-slate-700 transition hover:border-cyan-500 hover:text-cyan-600 dark:border-slate-600 dark:text-slate-100"
                >
                  View Projects <FaArrowRight />
                </a>
              </div>

              <div className="marquee-shell mt-8" aria-label="Core capabilities">
                <div className="marquee-track">
                  {[...capabilityBadges, ...capabilityBadges].map((badge, idx) => (
                    <span key={`${badge}-${idx}`} className="capability-chip">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="about" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="glass rounded-3xl p-7"
            >
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">
                About
              </p>
              <h2 className="section-title text-3xl font-bold text-slate-900 dark:text-white">Who We Are</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300">
                We are the team behind <span className="font-semibold text-cyan-600 dark:text-cyan-300">Zencode Tech Solutions</span>,
                a group of passionate developers, engineers, and technology enthusiasts focused on
                <span className="font-semibold"> Web Development, Machine Learning, and Artificial Intelligence</span>.
              </p>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Our team is dedicated to building secure, modern, and scalable digital solutions that help startups,
                professionals, and organizations grow in the digital world. With strong technical expertise and
                innovative thinking, we deliver high-quality websites, intelligent systems, and powerful digital platforms.
              </p>

              <div className="mt-5 rounded-2xl border border-cyan-500/25 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 p-4">
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  <span className="font-bold text-cyan-700 dark:text-cyan-300">Our Mission:</span> To empower businesses with technology,
                  transforming ideas into impactful digital products that drive real business growth.
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {aboutHighlights.map((item) => (
                  <motion.div
                    key={item.title}
                    whileHover={{ y: -4 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/65 p-3.5 transition dark:border-slate-700 dark:bg-slate-900/45"
                  >
                    <div className="mb-2 inline-flex rounded-xl border border-slate-200/70 bg-slate-900/90 p-2 dark:border-slate-700 dark:bg-slate-950">
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{item.text}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-900/45">
                    <p className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-300">{item.value}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-300">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="relative mx-auto w-full max-w-md"
            >
              <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-tr from-cyan-500/35 to-blue-600/30 blur-xl" />
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=60"
                alt="Founder profile"
                loading="lazy"
                decoding="async"
                className="relative h-[470px] w-full rounded-[2rem] object-cover shadow-2xl"
              />
            </motion.div>
          </div>
        </section>

        <section id="services" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">Services</p>
              <h2 className="section-title mt-2 text-3xl font-bold text-slate-900 dark:text-white">Services – Solutions Designed for Real Business Growth.</h2>
              <p className="mx-auto mt-4 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
                End-to-end solutions crafted for founders, businesses, and professionals who need reliable execution, premium user experience, and measurable outcomes.
              </p>
            </div>

            <motion.div
              className="mx-auto max-w-5xl"
              variants={serviceGridVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
            >
              <div
                className="relative"
                onMouseEnter={() => setIsServiceSliderPaused(true)}
                onMouseLeave={() => setIsServiceSliderPaused(false)}
                onTouchStart={handleServiceTouchStart}
                onTouchMove={handleServiceTouchMove}
                onTouchEnd={handleServiceTouchEnd}
                onTouchCancel={handleServiceTouchEnd}
              >
                <AnimatePresence mode="wait">
                  <motion.article
                    key={services[activeServiceIndex].title}
                    variants={serviceCardVariants}
                    initial={{ opacity: 0, y: 20, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -14, scale: 0.985 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    whileHover={{ y: -8, scale: 1.01, rotateX: 2.5, rotateY: -2.5 }}
                    onMouseMove={handleInteractiveCardMove}
                    onMouseLeave={handleInteractiveCardLeave}
                    className="interactive-card glass group relative overflow-hidden rounded-3xl p-6 transition hover:shadow-2xl"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${services[activeServiceIndex].accent} opacity-70 blur-2xl transition group-hover:opacity-100`} />

                    <div className="relative mb-4 h-52 overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/70 sm:h-60">
                      <img
                        src={services[activeServiceIndex].image}
                        alt={`${services[activeServiceIndex].title} illustration`}
                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-900/5 to-transparent" />
                      <motion.div
                        aria-hidden
                        className="absolute -right-5 -top-6 h-20 w-20 rounded-full bg-cyan-400/25 blur-2xl"
                        animate={{ x: [0, 6, 0], y: [0, -8, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <div className="absolute bottom-3 left-3 rounded-full border border-white/30 bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/90 backdrop-blur-sm">
                        Premium Visual
                      </div>
                    </div>

                    <div className="relative mb-4 inline-flex rounded-2xl border border-slate-200/60 bg-white/70 p-3 text-cyan-600 transition duration-300 group-hover:scale-110 group-hover:rotate-3 dark:border-slate-700/70 dark:bg-slate-900/50 dark:text-cyan-300">
                      {services[activeServiceIndex].icon}
                    </div>

                    <h3 className="section-title relative text-xl font-bold text-slate-900 dark:text-white">{services[activeServiceIndex].title}</h3>
                    <p className="relative mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{services[activeServiceIndex].description}</p>

                    <ul className="relative mt-5 grid gap-2.5 sm:grid-cols-2">
                      {services[activeServiceIndex].offerings.map((item, itemIndex) => (
                        <motion.li
                          key={`${services[activeServiceIndex].title}-${item}`}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.03 * itemIndex, duration: 0.25 }}
                          className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>

                    <div className="mt-6 h-px w-full bg-gradient-to-r from-cyan-500/30 via-slate-300/40 to-transparent dark:via-slate-700/40" />
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Modern SaaS Delivery
                      </p>

                      <button
                        type="button"
                        onClick={() => setSelectedService(services[activeServiceIndex])}
                        className="relative inline-flex items-center gap-2 rounded-full border border-cyan-500/35 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold text-cyan-700 transition hover:bg-cyan-500/20 dark:text-cyan-300"
                      >
                        View Details <FaArrowRight className="text-[11px]" />
                      </button>
                    </div>
                  </motion.article>
                </AnimatePresence>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Previous service"
                      onClick={goToPrevService}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-white/80 text-slate-700 transition hover:border-cyan-500/40 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:text-cyan-300"
                    >
                      <FaArrowRight className="-rotate-180 text-sm" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next service"
                      onClick={goToNextService}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-white/80 text-slate-700 transition hover:border-cyan-500/40 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:text-cyan-300"
                    >
                      <FaArrowRight className="text-sm" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {services.map((service, index) => (
                      <button
                        key={`service-dot-${service.title}`}
                        type="button"
                        aria-label={`Go to ${service.title}`}
                        onClick={() => goToService(index)}
                        className={`h-2.5 rounded-full transition ${index === activeServiceIndex
                          ? 'w-7 bg-cyan-500'
                          : 'w-2.5 bg-slate-400/60 hover:bg-slate-500/80 dark:bg-slate-600 dark:hover:bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45 }}
              className="glass mt-8 rounded-3xl border border-slate-200/70 px-6 py-6 dark:border-slate-700/70"
            >
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-300">Need Custom Scope?</p>
                  <h3 className="section-title mt-1 text-2xl font-bold text-slate-900 dark:text-white">Book A Free Consultation For Your Business</h3>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">Get a tailored roadmap for design, development, AI automation, and growth optimization in one plan.</p>
                </div>
                <a
                  href="#contact"
                  className="btn-shine inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25"
                >
                  Start Free Strategy Call <FaArrowRight />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="projects" className="px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-7xl"
            variants={sectionStaggerVariants}
            initial={useLightMotion ? 'show' : 'hidden'}
            animate={useLightMotion ? 'show' : undefined}
            whileInView={useLightMotion ? undefined : 'show'}
            viewport={useLightMotion ? undefined : { once: true, amount: 0.15 }}
          >
            <motion.div variants={sectionStaggerItemVariants} className="mb-12 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">Portfolio</p>
              <h2 className="section-title mt-2 text-3xl font-bold text-slate-900 dark:text-white">Featured Projects</h2>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {projectFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setProjectFilter(filter)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] transition ${
                      projectFilter === filter
                        ? 'border-cyan-500 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                        : 'border-slate-300 text-slate-600 hover:border-cyan-500 hover:text-cyan-700 dark:border-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {filter} ({projectCountByFilter[filter] ?? 0})
                  </button>
                ))}
              </div>

              <div className="mx-auto mt-5 max-w-xl">
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(event) => setProjectSearch(event.target.value)}
                  placeholder="Search projects by name, stack, or category"
                  className="w-full rounded-2xl border border-slate-300/90 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none ring-cyan-500 transition placeholder:text-slate-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
                />
              </div>

              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Showing {visibleProjects.length} project{visibleProjects.length === 1 ? '' : 's'}
              </p>
            </motion.div>

            {!isProjectsLoading && visibleProjects.length > 0 && (
              <motion.div
                variants={sectionStaggerItemVariants}
                className="glass mb-7 overflow-hidden rounded-3xl border border-cyan-300/25 bg-gradient-to-br from-cyan-50/30 to-blue-50/20 dark:border-cyan-700/35 dark:from-cyan-950/20 dark:to-blue-950/15"
                onMouseEnter={() => setIsProjectSliderPaused(true)}
                onMouseLeave={() => setIsProjectSliderPaused(false)}
                onTouchStart={handleProjectTouchStart}
                onTouchMove={handleProjectTouchMove}
                onTouchEnd={handleProjectTouchEnd}
                onTouchCancel={handleProjectTouchEnd}
              >
                {/* Live Update Badge */}
                <div className="flex items-center justify-between border-b border-cyan-300/20 px-5 py-3.5 dark:border-cyan-700/30">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-2.5 w-2.5 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-red-500/80" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-600" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-red-600/90 dark:text-red-400">Live Spotlight</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {featuredProjectIndex + 1} / {visibleProjects.length}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${visibleProjects[featuredProjectIndex]?.title}-${featuredProjectIndex}`}
                    initial={featuredInitial}
                    animate={featuredAnimate}
                    exit={featuredExit}
                    transition={featuredTransition}
                    className="grid gap-5 p-5 md:grid-cols-[1.2fr_1fr]"
                  >
                    {/* Featured Project Image */}
                    <div className="group relative cursor-pointer overflow-hidden rounded-2xl">
                      <img
                        src={visibleProjects[featuredProjectIndex]?.image}
                        alt={visibleProjects[featuredProjectIndex]?.title || 'Featured project'}
                        className="h-56 w-full object-cover transition duration-500 group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/20 to-transparent" />
                      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-cyan-300/45 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]" />
                      
                      {/* Category Badge */}
                      <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute left-3 top-3 rounded-full border border-white/40 bg-black/45 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/95 backdrop-blur-md"
                      >
                        🔥 Featured
                      </motion.span>

                      {/* Category Label */}
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-3 left-3 rounded-full border border-cyan-300/50 bg-cyan-500/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100 backdrop-blur-sm"
                      >
                        {visibleProjects[featuredProjectIndex]?.category || 'Web'}
                      </motion.span>
                    </div>

                    {/* Featured Project Info */}
                    <div className="flex flex-col justify-center gap-3">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">
                          Featured This Week
                        </p>
                      </motion.div>

                      <motion.h3
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="section-title text-2xl font-bold text-slate-900 dark:text-white lg:text-3xl"
                      >
                        {visibleProjects[featuredProjectIndex]?.title}
                      </motion.h3>

                      <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                      >
                        {visibleProjects[featuredProjectIndex]?.description}
                      </motion.p>

                      {/* Tech Stack */}
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="mt-2 flex flex-wrap gap-2"
                      >
                        {(Array.isArray(visibleProjects[featuredProjectIndex]?.stack)
                          ? visibleProjects[featuredProjectIndex].stack.slice(0, 4)
                          : []
                        ).map((tech) => (
                          <span
                            key={`featured-${visibleProjects[featuredProjectIndex]?.title}-${tech}`}
                            className="rounded-full border border-cyan-300/40 bg-gradient-to-r from-cyan-500/15 to-blue-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-400/30 dark:text-cyan-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-3 inline-flex items-center gap-2 self-start rounded-full border border-cyan-300/45 bg-cyan-500/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-cyan-700 dark:border-cyan-400/30 dark:text-cyan-300"
                      >
                        Premium Case Study
                        <FaArrowRight className="text-[10px]" />
                      </motion.div>

                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Progress Indicators */}
                {visibleProjects.length > 1 && (
                  <div className="flex items-center justify-between gap-3 border-t border-cyan-300/20 px-5 py-4 dark:border-cyan-700/30">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Previous project"
                        onClick={goToPrevProject}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-white/80 text-slate-700 transition hover:border-cyan-500/40 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:text-cyan-300"
                      >
                        <FaArrowRight className="-rotate-180 text-sm" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next project"
                        onClick={goToNextProject}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-white/80 text-slate-700 transition hover:border-cyan-500/40 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:text-cyan-300"
                      >
                        <FaArrowRight className="text-sm" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {visibleProjects.map((project, idx) => (
                        <button
                          key={`project-dot-${project.title}-${idx}`}
                          type="button"
                          onClick={() => goToProject(idx)}
                          className={`h-2.5 rounded-full transition ${
                            idx === featuredProjectIndex
                              ? 'w-7 bg-cyan-500'
                              : 'w-2.5 bg-slate-400/60 hover:bg-slate-500/80 dark:bg-slate-600 dark:hover:bg-slate-400'
                          }`}
                          aria-label={`Go to project ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            <motion.div variants={sectionStaggerItemVariants} className="mt-2">
              {isProjectsLoading && (
                <div className="text-center text-sm font-semibold text-slate-500 dark:text-slate-300">
                  Loading projects...
                </div>
              )}
              {!isProjectsLoading && visibleProjects.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300/90 px-6 py-10 text-center text-sm font-semibold text-slate-500 dark:border-slate-600 dark:text-slate-300">
                  No projects found for this category yet.
                </div>
              )}
            </motion.div>
          </motion.div>
        </section>

        <section id="why-partner" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <motion.div
            className={`mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] border p-5 sm:rounded-[2rem] sm:p-8 lg:p-10 ${
              isDark
                ? 'border-cyan-300/25 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white shadow-[0_30px_80px_rgba(2,8,23,0.45)]'
                : 'border-cyan-200/80 bg-gradient-to-br from-white via-cyan-50 to-blue-50 text-slate-900 shadow-[0_20px_60px_rgba(14,116,144,0.16)]'
            }`}
            initial={useLightMotion ? false : { opacity: 0, y: 24 }}
            whileInView={useLightMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            onViewportEnter={() => setPartnerCountersStarted(true)}
          >
            <div className="relative grid gap-8 lg:grid-cols-[1.05fr_1fr]">
              <div className={`pointer-events-none absolute -left-20 -top-16 h-56 w-56 rounded-full blur-3xl ${isDark ? 'bg-cyan-400/20' : 'bg-cyan-400/30'}`} />
              <div className={`pointer-events-none absolute -bottom-28 -right-16 h-72 w-72 rounded-full blur-3xl ${isDark ? 'bg-indigo-400/20' : 'bg-blue-300/30'}`} />

              <div className="relative z-10">
                <p className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] sm:text-sm ${
                  isDark
                    ? 'border-cyan-300/35 bg-cyan-500/10 text-cyan-100'
                    : 'border-cyan-400/35 bg-cyan-500/10 text-cyan-700'
                }`}>
                  Why Partner With Us
                </p>
                <h2 className={`section-title mt-3 text-2xl font-bold leading-tight sm:text-4xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  We Build Reliable Digital Solutions That Grow With Your Business
                </h2>
                <p className={`mt-4 max-w-2xl text-sm leading-relaxed sm:text-base ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  We do not just ship websites and move on. We engineer dependable systems that stay secure,
                  scalable, and performance-ready while your business grows step by step.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <motion.div
                    initial={useLightMotion ? false : { opacity: 0, y: 10 }}
                    whileInView={useLightMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.35, delay: 0.05 }}
                    className={`rounded-2xl border p-4 backdrop-blur-sm ${
                      isDark ? 'border-white/15 bg-white/10' : 'border-cyan-200/80 bg-white/75'
                    }`}
                  >
                    <p className={`text-3xl font-extrabold ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>{partnerCounters.clients}+</p>
                    <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.12em] ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>Clients Served</p>
                  </motion.div>
                  <motion.div
                    initial={useLightMotion ? false : { opacity: 0, y: 10 }}
                    whileInView={useLightMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.35, delay: 0.12 }}
                    className={`rounded-2xl border p-4 backdrop-blur-sm ${
                      isDark ? 'border-white/15 bg-white/10' : 'border-cyan-200/80 bg-white/75'
                    }`}
                  >
                    <p className={`text-3xl font-extrabold ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>{partnerCounters.satisfaction}%</p>
                    <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.12em] ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>Satisfaction</p>
                  </motion.div>
                  <motion.div
                    initial={useLightMotion ? false : { opacity: 0, y: 10 }}
                    whileInView={useLightMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.35, delay: 0.18 }}
                    className={`rounded-2xl border p-4 backdrop-blur-sm ${
                      isDark ? 'border-white/15 bg-white/10' : 'border-cyan-200/80 bg-white/75'
                    }`}
                  >
                    <p className={`text-3xl font-extrabold ${isDark ? 'text-cyan-200' : 'text-cyan-700'}`}>{partnerCounters.projects}+</p>
                    <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.12em] ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>Milestones Delivered</p>
                  </motion.div>
                </div>

                <a
                  href="#testimonials"
                  onClick={handleNavItemClick('#testimonials')}
                  className="btn-shine mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30"
                >
                  See Client Testimonials <FaArrowRight />
                </a>
              </div>

              <motion.div
                className="relative z-10 grid gap-4 sm:grid-cols-2"
                variants={sectionStaggerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
              >
                {partnerBenefits.map((item) => (
                  <motion.article
                    key={item.title}
                    variants={sectionStaggerItemVariants}
                    whileHover={useLightMotion ? undefined : { y: -8, scale: 1.02 }}
                    whileTap={useLightMotion ? { scale: 0.995 } : undefined}
                    className={`rounded-2xl border p-4 shadow-lg backdrop-blur-md transition ${
                      isDark
                        ? 'border-white/15 bg-white/10 hover:border-cyan-300/35'
                        : 'border-cyan-200/80 bg-white/75 hover:border-cyan-400/60'
                    }`}
                  >
                    <div className="mb-3 inline-flex rounded-xl border border-cyan-300/35 bg-cyan-500/10 p-2.5">{item.icon}</div>
                    <h3 className={`section-title text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                    <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{item.description}</p>
                  </motion.article>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section>

        <section id="testimonials" className="px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            variants={sectionStaggerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            <motion.p variants={sectionStaggerItemVariants} className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">Testimonials</motion.p>
            <motion.h2 variants={sectionStaggerItemVariants} className="section-title mt-2 text-3xl font-bold text-slate-900 dark:text-white">What Clients Say</motion.h2>

            <motion.div variants={sectionStaggerItemVariants} className="glass mt-8 rounded-3xl p-8">
              <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/70">
                <motion.div
                  key={activeTestimonial}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                />
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonials[activeTestimonial].name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="mb-4 flex justify-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <p className="text-lg text-slate-700 dark:text-slate-200">"{testimonials[activeTestimonial].text}"</p>
                  <p className="mt-5 section-title text-lg font-bold text-slate-900 dark:text-white">
                    {testimonials[activeTestimonial].name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-300">{testimonials[activeTestimonial].role}</p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <motion.div variants={sectionStaggerItemVariants} className="mt-5 flex justify-center gap-2">
              {testimonials.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setActiveTestimonial(index)}
                  className={`h-2.5 rounded-full transition ${
                    activeTestimonial === index
                      ? 'w-8 bg-cyan-500'
                      : 'w-2.5 bg-slate-300 dark:bg-slate-600'
                  }`}
                  aria-label={`Show testimonial ${index + 1}`}
                />
              ))}
            </motion.div>
          </motion.div>
        </section>

        <section id="contact" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
            <div className="glass rounded-3xl p-7">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">Contact</p>
              <h2 className="section-title mt-2 text-3xl font-bold text-slate-900 dark:text-white">Let's Build Something Great</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300">
                Share your idea and I will help you turn it into a robust web or AI-powered solution.
              </p>

              <div className="mt-7 space-y-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <a href="mailto:zencodetechsolutions@gmail.com" className="flex items-center gap-3 hover:text-cyan-500">
                  <MdEmail /> zencodetechsolutions@gmail.com
                </a>
                <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="link-animated flex items-center gap-3 hover:text-cyan-500">
                  <FaLinkedin /> LinkedIn Profile
                </a>
                <a href="tel:+917488088352" className="link-animated flex items-center gap-3 hover:text-cyan-500">
                  <FaPhone /> +91 7488 088 352,+91 7903412283
                </a>
                <a href="https://wa.me/7488088352" target="_blank" rel="noreferrer" className="link-animated flex items-center gap-3 hover:text-cyan-500">
                  <FaWhatsapp /> WhatsApp Chat
                </a>
              </div>
            </div>

            <form className="glass rounded-3xl p-7" onSubmit={handleContactSubmit}>
              <div className="grid gap-4">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Name
                  <input
                    name="name"
                    type="text"
                    value={contactForm.name}
                    onChange={handleInputChange}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white/70 px-4 py-3 text-slate-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100"
                    placeholder="Your Name"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Email
                  <input
                    name="email"
                    type="email"
                    value={contactForm.email}
                    onChange={handleInputChange}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white/70 px-4 py-3 text-slate-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100"
                    placeholder="you@example.com"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Message
                  <textarea
                    name="message"
                    rows="5"
                    value={contactForm.message}
                    onChange={handleInputChange}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white/70 px-4 py-3 text-slate-900 outline-none ring-cyan-500 transition focus:ring-2 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100"
                    placeholder="Tell me about your project"
                  />
                </label>
                {submitStatus.message && (
                  <p
                    className={`text-sm font-semibold ${
                      submitStatus.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {submitStatus.message}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-shine rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:-translate-y-0.5"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="relative overflow-hidden border-t border-slate-800/80 bg-[#030814] px-4 pb-8 pt-14 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-24 top-0 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-8 border-b border-slate-800/90 pb-10 sm:grid-cols-2 lg:grid-cols-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-2"
            >
              <h3 className="section-title text-xl font-bold text-white">Zencode Tech Solutions</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
                Professional web, backend, and AI engineering services focused on performance, scalability, and business growth.
              </p>

              <div className="mt-6 flex items-center gap-3 text-lg">
                {[
                  { href: 'https://www.linkedin.com/', icon: <FaLinkedin />, label: 'LinkedIn' },
                  { href: 'https://twitter.com/', icon: <FaTwitter />, label: 'Twitter' },
                  { href: 'https://www.instagram.com/zen_code79?igsh=eXYxYjhjMTVza3Zr', icon: <FaInstagram />, label: 'Instagram' },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="group rounded-xl border border-slate-700 bg-slate-900/60 p-2.5 text-slate-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-500/60 hover:text-cyan-300"
                  >
                    <span className="transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
                  </a>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-300">Quick Links</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {[
                  { label: 'Home', href: '#home' },
                  { label: 'About', href: '#about' },
                  { label: 'Services', href: '#services' },
                  { label: 'Projects', href: '#projects' },
                  { label: 'Contact', href: '#contact' },
                ].map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-slate-400 transition hover:pl-1 hover:text-cyan-300">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-300">Services</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                <li className="transition hover:text-cyan-300">Web Development</li>
                <li className="transition hover:text-cyan-300">Backend Development</li>
                <li className="transition hover:text-cyan-300">AI &amp; Chatbot Development</li>
                <li className="transition hover:text-cyan-300">Data Analytics</li>
                <li className="transition hover:text-cyan-300">Website Maintenance</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-cyan-300">Contact Information</h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <MdEmail className="mt-0.5 text-cyan-300" />
                  <span className="break-all">zencodetechsolutions@gmail.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaPhone className="mt-0.5 text-cyan-300" />
                  <a href="tel:+917903412283" className="transition hover:text-cyan-300">+91 7903412283</a>
                </li>
                <li className="flex items-start gap-2">
                  <FaPhone className="mt-0.5 text-cyan-300" />
                  <a href="tel:+917488088352" className="transition hover:text-cyan-300">+91 7488 088 352</a>
                </li>
                <li className="flex items-start gap-2">
                  <FaMapMarkerAlt className="mt-0.5 text-cyan-300" />
                  <span>Patna, Bihar, India</span>
                </li>
              </ul>
            </motion.div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 pt-6 text-xs text-slate-500 sm:flex-row">
            <p>© {new Date().getFullYear()} Zencode Tech Solutions. All rights reserved.</p>
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-slate-700 to-transparent sm:hidden" />
            <p>Built with modern UI, clean code, and growth-focused design.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showUploadPhoto && <ProfilePhotoModal onClose={() => setShowUploadPhoto(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedService && <ServiceDetailModal service={selectedService} onClose={() => setSelectedService(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showLoginRequired && (
          <LoginRequiredModal
            onClose={() => setShowLoginRequired(false)}
            onLoginClick={() => {
              setShowLoginRequired(false)
              window.location.href = '/login'
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
