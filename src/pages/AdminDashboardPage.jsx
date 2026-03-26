import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import {
  FaBars,
  FaBoxOpen,
  FaCheckCircle,
  FaChevronDown,
  FaCopy,
  FaDesktop,
  FaDownload,
  FaEnvelope,
  FaGlobe,
  FaHome,
  FaMobileAlt,
  FaMoneyBillWave,
  FaRegClock,
  FaSearch,
  FaShareAlt,
  FaSignOutAlt,
  FaTimes,
  FaTruck,
  FaUndo,
  FaUsers,
  FaUserShield,
  FaPrint,
} from 'react-icons/fa'
import {
  MdDashboard,
  MdInsights,
  MdManageAccounts,
  MdOutlineTravelExplore,
  MdMarkEmailRead,
} from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import zencodeLogo from '../assets/zencode-logo.svg'
import ModernInvoice from '../components/ModernInvoice'

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;')

/* ------------------------------------------------------------------ */
/*  Small reusable pieces                                               */
/* ------------------------------------------------------------------ */

const TOOLTIP_STYLE = {
  background: '#0f172a',
  border: '1px solid rgba(148,163,184,0.18)',
  borderRadius: '14px',
  color: '#e2e8f0',
  fontSize: 13,
}

function OverviewCard({ icon, title, value, hint, tone = 'cyan' }) {
  const toneMap = {
    cyan: 'from-cyan-500/20 via-cyan-500/6 to-transparent border-cyan-400/20',
    violet: 'from-violet-500/20 via-violet-500/6 to-transparent border-violet-400/20',
    emerald: 'from-emerald-500/20 via-emerald-500/6 to-transparent border-emerald-400/20',
    amber: 'from-amber-500/20 via-amber-500/6 to-transparent border-amber-400/20',
    rose: 'from-rose-500/20 via-rose-500/6 to-transparent border-rose-400/20',
  }
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`rounded-3xl border bg-gradient-to-br p-5 shadow-xl shadow-black/20 ${toneMap[tone] || toneMap.cyan}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-extrabold text-white">{value}</p>
          <p className="mt-2 truncate text-xs text-slate-500">{hint}</p>
        </div>
        <div className="shrink-0 rounded-2xl border border-white/8 bg-white/5 p-3 text-xl text-white/80">
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

function Panel({ title, subtitle, action, children, className = '' }) {
  return (
    <section
      className={`rounded-3xl border border-slate-800 bg-[#0e1425]/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl ${className}`}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function ToggleBlock({ title, subtitle, defaultOpen = true, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="rounded-2xl border border-slate-800 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</p>
          {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          className="text-slate-500"
        >
          <FaChevronDown size={11} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-800 px-3 pb-3 pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.total_pages <= 1) return null
  return (
    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
      <span>
        Page {pagination.page} / {pagination.total_pages} &nbsp;·&nbsp; {pagination.total_items} total
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!pagination.has_previous}
          onClick={() => onPage(pagination.page - 1)}
          className="rounded-xl border border-slate-700 px-3 py-1.5 transition hover:border-slate-500 disabled:opacity-40"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={!pagination.has_next}
          onClick={() => onPage(pagination.page + 1)}
          className="rounded-xl border border-slate-700 px-3 py-1.5 transition hover:border-slate-500 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}

function DayFilter({ days, active, onChange }) {
  return (
    <div className="flex items-center gap-1 rounded-2xl border border-slate-700/60 bg-slate-950/60 p-1">
      {days.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => onChange(d)}
          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
            active === d
              ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {d}d
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Visitor / Login panel helpers                                       */
/* ------------------------------------------------------------------ */

function parseUA(ua = '') {
  const s = ua.toLowerCase()
  let browser = 'Unknown'
  if (s.includes('edg/') || s.includes('edgea/')) browser = 'Edge'
  else if (s.includes('samsungbrowser')) browser = 'Samsung Browser'
  else if (s.includes('chromium')) browser = 'Chromium'
  else if (s.includes('chrome')) browser = 'Chrome'
  else if (s.includes('firefox')) browser = 'Firefox'
  else if (s.includes('opr/') || s.includes('opera')) browser = 'Opera'
  else if (s.includes('safari')) browser = 'Safari'

  let os = 'Unknown OS'
  if (s.includes('windows nt 10') || s.includes('windows nt 11')) os = 'Windows 10/11'
  else if (s.includes('windows nt 6.1')) os = 'Windows 7'
  else if (s.includes('windows')) os = 'Windows'
  else if (s.includes('mac os x') || s.includes('macos')) os = 'macOS'
  else if (s.includes('android')) {
    const m = ua.match(/Android\s([\d.]+)/)
    os = m ? `Android ${m[1]}` : 'Android'
  } else if (s.includes('iphone')) os = 'iOS (iPhone)'
  else if (s.includes('ipad')) os = 'iOS (iPad)'
  else if (s.includes('linux')) os = 'Linux'

  const isMobile = /mobile|android|iphone|ipad/.test(s)
  return { browser, os, isMobile }
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-white/[0.04] px-3 py-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        <span className="text-slate-600">{icon}</span>
        {label}
      </div>
      <p className="truncate text-sm font-semibold text-slate-200">{value || '—'}</p>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-800/60 bg-white/[0.015] py-12 text-center">
      <span className="text-3xl opacity-20">🔍</span>
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  )
}

function LoginCard({ log, expanded, onToggle }) {
  const { browser, os, isMobile } = parseUA(log.user_agent)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`overflow-hidden rounded-2xl border transition-colors duration-200 ${
        expanded
          ? log.success
            ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
            : 'border-rose-500/30 bg-rose-500/[0.04]'
          : 'border-slate-800/80 bg-white/[0.02] hover:border-slate-700 hover:bg-white/[0.04]'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <div
          className={`h-2.5 w-2.5 shrink-0 rounded-full shadow-lg ${
            log.success ? 'bg-emerald-400 shadow-emerald-500/40' : 'bg-rose-400 shadow-rose-500/40'
          }`}
        />
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div className="min-w-0">
            <span className="font-bold text-white">
              {log.identifier || log.user_username || 'Unknown'}
            </span>
            <span className="ml-2 text-[11px] text-slate-500">{log.ip_address || 'N/A'}</span>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                log.success ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
              }`}
            >
              {log.success ? '✓ Success' : '✗ Failed'}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                log.login_type === 'admin'
                  ? 'bg-violet-500/15 text-violet-300'
                  : 'bg-slate-500/15 text-slate-300'
              }`}
            >
              {log.login_type}
            </span>
            <span className="hidden text-xs text-slate-500 sm:inline">
              {new Date(log.created_at).toLocaleString()}
            </span>
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-slate-500"
            >
              <FaChevronDown size={11} />
            </motion.span>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-800/60 px-4 pb-4 pt-3">
              <p className="mb-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                Full Details
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <DetailItem icon={<FaGlobe size={10} />} label="IP Address" value={log.ip_address} />
                <DetailItem icon={<FaDesktop size={10} />} label="Browser" value={browser} />
                <DetailItem icon={<FaDesktop size={10} />} label="OS" value={os} />
                <DetailItem
                  icon={isMobile ? <FaMobileAlt size={10} /> : <FaDesktop size={10} />}
                  label="Device"
                  value={isMobile ? 'Mobile' : 'Desktop'}
                />
                <DetailItem
                  icon={<FaUserShield size={10} />}
                  label="Login Type"
                  value={log.login_type?.toUpperCase()}
                />
                <DetailItem
                  icon={<FaUsers size={10} />}
                  label="Username"
                  value={log.user_username || log.identifier}
                />
                <DetailItem
                  icon={<FaGlobe size={10} />}
                  label="Location"
                  value="Unknown"
                />
              </div>
              {log.user_agent && (
                <div className="mt-3 rounded-xl border border-slate-800/60 bg-black/20 px-3 py-2.5">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    User Agent
                  </p>
                  <p className="break-all text-[11px] leading-relaxed text-slate-500">
                    {log.user_agent}
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={onToggle}
                className="mt-3 flex items-center gap-1.5 rounded-xl border border-slate-700/60 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
              >
                <FaTimes size={10} /> Hide details
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function VisitorCard({ visitor: v, expanded, onToggle }) {
  const { browser, os, isMobile } = parseUA(v.user_agent)
  const visitTime = new Date(v.created_at)
  const timeAgo = Math.floor((Date.now() - visitTime.getTime()) / 1000)
  
  let timeStr = ''
  if (timeAgo < 60) timeStr = `${timeAgo}s ago`
  else if (timeAgo < 3600) timeStr = `${Math.floor(timeAgo / 60)}m ago`
  else if (timeAgo < 86400) timeStr = `${Math.floor(timeAgo / 3600)}h ago`
  else timeStr = `${Math.floor(timeAgo / 86400)}d ago`

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
        expanded
          ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-500/[0.08] to-blue-500/[0.04]'
          : 'border-slate-800/40 bg-white/[0.02] hover:border-cyan-500/30 hover:bg-white/[0.04]'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-4 text-left transition hover:bg-white/[0.02]"
      >
        <div className="flex gap-3">
          {/* Status Indicator */}
          <div className="flex flex-col items-center gap-1">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`h-3 w-3 rounded-full shadow-lg ${
                isMobile ? 'bg-amber-400 shadow-amber-500/60' : 'bg-cyan-400 shadow-cyan-500/60'
              }`}
            />
            <span className={`text-[9px] font-bold ${
              isMobile ? 'text-amber-400' : 'text-cyan-400'
            }`}>
              {isMobile ? 'MOB' : 'DES'}
            </span>
          </div>

          {/* Main Info */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div>
              <p className="font-bold text-white leading-tight">{v.path}</p>
              <p className="text-xs text-slate-400 mt-0.5">{v.ip_address || '0.0.0.0'}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isMobile
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-cyan-500/20 text-cyan-300'
              }`}>
                {browser}
              </span>
              <span className="rounded-full bg-slate-700/40 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                {os}
              </span>
              <span className="rounded-full bg-slate-700/30 px-2 py-0.5 text-[10px] text-slate-400">
                {timeStr}
              </span>
            </div>
          </div>

          {/* Expand Icon */}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center text-slate-500"
          >
            <FaChevronDown size={12} />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-cyan-500/20 px-4 py-3 space-y-3">
              {/* Header Stats */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <InfoBox icon="🌐" label="IP Address" value={v.ip_address} copyable />
                <InfoBox icon="🔧" label="Browser" value={browser} />
                <InfoBox icon="💻" label="OS" value={os} />
                <InfoBox icon="📱" label="Device" value={isMobile ? 'Mobile' : 'Desktop'} />
              </div>

              {/* Page & Referrer */}
              <div className="grid sm:grid-cols-2 gap-2">
                <InfoBox icon="📄" label="Page" value={v.path} copyable />
                {v.referrer ? (
                  <InfoBox icon="🔗" label="Referrer" value={new URL(v.referrer).hostname} copyable={v.referrer} />
                ) : (
                  <InfoBox icon="🔗" label="Referrer" value="Direct" />
                )}
              </div>

              {/* Timestamp Details */}
              <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/[0.03] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-2">
                  📅 Visit Timestamp
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>
                    <p className="text-slate-500 text-[10px] mb-0.5">Date & Time</p>
                    <p className="font-mono">{visitTime.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] mb-0.5">Time Ago</p>
                    <p className="font-mono">{timeStr}</p>
                  </div>
                </div>
              </div>

              {/* User Agent */}
              {v.user_agent && (
                <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-3">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    🔍 User Agent
                  </p>
                  <p className="break-all text-[10px] leading-relaxed text-slate-500 font-mono">
                    {v.user_agent}
                  </p>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={onToggle}
                className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-900/30 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-slate-600 hover:bg-slate-900/50 hover:text-slate-200"
              >
                <FaTimes size={10} /> Hide Details
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Helper component for info display
function InfoBox({ icon, label, value, copyable }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(copyable || value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-2.5">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
        {icon} {label}
      </p>
      <div className="group flex items-center gap-1.5">
        <p className="text-xs font-mono text-slate-200 break-all">{value}</p>
        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded p-1 hover:bg-slate-700/50 transition opacity-0 group-hover:opacity-100"
          >
            <FaCopy size={9} className={copied ? 'text-cyan-400' : 'text-slate-500'} />
          </button>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */

const SECTIONS = ['overview', 'analytics', 'users', 'messages', 'orders', 'visitors']

const SIDEBAR_ITEMS = [
  { key: 'overview', label: 'Overview', icon: <MdDashboard /> },
  { key: 'analytics', label: 'Analytics', icon: <MdInsights /> },
  { key: 'users', label: 'Users', icon: <MdManageAccounts /> },
  { key: 'messages', label: 'Messages', icon: <FaEnvelope /> },
  {
    key: 'orders',
    label: 'Orders',
    icon: <FaBoxOpen />,
    subMenu: [
      { key: 'orders-list', label: 'Order List', icon: <FaBoxOpen /> },
      { key: 'orders-invoice', label: 'Invoice', icon: <FaDownload /> },
      { key: 'orders-refunds', label: 'Refunds', icon: <FaUndo /> },
      { key: 'orders-timeline', label: 'Timeline', icon: <FaRegClock /> },
    ],
  },
  { key: 'visitors', label: 'Visitors / Logins', icon: <MdOutlineTravelExplore /> },
]

export default function AdminDashboardPage() {
  const { user, isAdmin, logout, authRequest } = useAuth()
  const navigate = useNavigate()

  /* layout */
  const [section, setSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  /* data */
  const [summary, setSummary] = useState(null)
  const [chartDays, setChartDays] = useState(14)
  const [chartData, setChartData] = useState([])
  const [usersData, setUsersData] = useState({ results: [], pagination: null })
  const [messagesData, setMessagesData] = useState({ results: [], pagination: null })
  const [ordersData, setOrdersData] = useState({ results: [], pagination: null })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loginData, setLoginData] = useState({ results: [], pagination: null })
  const [visitorData, setVisitorData] = useState({ results: [], pagination: null })
  const [usersPage, setUsersPage] = useState(1)
  const [messagesPage, setMessagesPage] = useState(1)
  const [ordersPage, setOrdersPage] = useState(1)
  const [loginPage, setLoginPage] = useState(1)
  const [visitorPage, setVisitorPage] = useState(1)
  const [userSearch, setUserSearch] = useState('')
  const [messageSearch, setMessageSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [messageFilter, setMessageFilter] = useState('all')
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('all')
  const [refundForm, setRefundForm] = useState({ amount: '', reason: '' })
  const [invoiceForm, setInvoiceForm] = useState({ recipient_name: '', recipient_email: '', company_name: 'ZenCode Digital', extra_note: '' })
  const [generatedInvoice, setGeneratedInvoice] = useState(null)
  const [logoDataUri, setLogoDataUri] = useState('')
  const [expandedMessageIds, setExpandedMessageIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [error, setError] = useState('')

  /* visitors panel */
  const [vlTab, setVlTab] = useState('logins')
  const [vlSearch, setVlSearch] = useState('')
  const [loginFilter, setLoginFilter] = useState('all')
  const [visitorFilter, setVisitorFilter] = useState('all')
  const [expandedIds, setExpandedIds] = useState(new Set())

  useEffect(() => {
    if (!user || !isAdmin) navigate('/login', { replace: true })
  }, [user, isAdmin, navigate])

  useEffect(() => {
    let mounted = true
    fetch(zencodeLogo)
      .then((res) => res.text())
      .then((svgText) => {
        if (mounted) {
          setLogoDataUri(`data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`)
        }
      })
      .catch(() => {
        if (mounted) setLogoDataUri('')
      })

    return () => {
      mounted = false
    }
  }, [])

  /* ---- initial full load ---- */
  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [summaryRes, usersRes, messagesRes, ordersRes, loginsRes, visitorsRes, chartRes] = await Promise.all([
        authRequest('/admin/summary/'),
        authRequest(`/admin/users/?page=${usersPage}&page_size=10&q=${encodeURIComponent(userSearch)}`),
        authRequest(`/admin/messages/?page=${messagesPage}&page_size=10&q=${encodeURIComponent(messageSearch)}&status=${messageFilter}`),
        authRequest(
          `/admin/orders/?page=${ordersPage}&page_size=10&q=${encodeURIComponent(orderSearch)}&status=${orderStatusFilter}&payment=${orderPaymentFilter}`,
        ),
        authRequest(`/admin/login-activity/?page=${loginPage}&page_size=10`),
        authRequest(`/admin/visitors/?page=${visitorPage}&page_size=10`),
        authRequest(`/admin/analytics/chart/?days=${chartDays}`),
      ])
      setSummary(summaryRes)
      setUsersData(usersRes)
      setMessagesData(messagesRes)
      setOrdersData(ordersRes)
      setLoginData(loginsRes)
      setVisitorData(visitorsRes)
      setChartData(chartRes.series ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [
    isAdmin,
    usersPage,
    messagesPage,
    ordersPage,
    loginPage,
    visitorPage,
    userSearch,
    messageSearch,
    orderSearch,
    messageFilter,
    orderStatusFilter,
    orderPaymentFilter,
    chartDays,
  ])

  useEffect(() => {
    if (isAdmin) loadDashboard()
  }, [isAdmin, usersPage, messagesPage, ordersPage, messageFilter, orderStatusFilter, orderPaymentFilter, loginPage, visitorPage])

  /* ---- chart-only reload when days filter changes ---- */
  useEffect(() => {
    if (!isAdmin) return
    setChartLoading(true)
    authRequest(`/admin/analytics/chart/?days=${chartDays}`)
      .then((res) => setChartData(res.series ?? []))
      .catch(() => {})
      .finally(() => setChartLoading(false))
  }, [chartDays, isAdmin])

  const handleSearchUsers = (event) => {
    event.preventDefault()
    setUsersPage(1)
    loadDashboard()
  }

  const handleSearchMessages = (event) => {
    event.preventDefault()
    setMessagesPage(1)
    loadDashboard()
  }

  const handleSearchOrders = (event) => {
    event.preventDefault()
    setOrdersPage(1)
    loadDashboard()
  }

  const loadOrderDetail = useCallback(async (orderId) => {
    try {
      const detail = await authRequest(`/admin/orders/${orderId}/`)
      setSelectedOrder(detail)
      setGeneratedInvoice(null)
      setInvoiceForm({
        recipient_name: detail.customer_name || '',
        recipient_email: detail.customer_email || '',
        company_name: 'ZenCode Digital',
        extra_note: '',
      })
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    if (!selectedOrder && ordersData.results?.length) {
      loadOrderDetail(ordersData.results[0].id)
    }
  }, [ordersData.results, selectedOrder, loadOrderDetail])

  const updateOrder = async (orderId, payload) => {
    try {
      const detail = await authRequest(`/admin/orders/${orderId}/update/`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      setSelectedOrder(detail)
      loadDashboard()
    } catch (err) {
      setError(err.message)
    }
  }

  const downloadInvoice = async (orderId, customPayload = null) => {
    try {
      const data = await authRequest(`/admin/orders/${orderId}/invoice/`, customPayload
        ? {
            method: 'POST',
            body: JSON.stringify(customPayload),
          }
        : undefined)

      setGeneratedInvoice(data)
      const orderRecord = selectedOrder?.id === orderId ? selectedOrder : null
      const html = buildInvoiceHtml(data, orderRecord)
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = (data.filename || `invoice-${orderId}.txt`).replace(/\.txt$/i, '.html')
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    }
  }

  const generateInteractiveInvoice = async (orderId) => {
    try {
      const data = await authRequest(`/admin/orders/${orderId}/invoice/`, {
        method: 'POST',
        body: JSON.stringify(invoiceForm),
      })
      setGeneratedInvoice(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const copyInvoiceForShare = async () => {
    try {
      const textToCopy = generatedInvoice?.invoice_text || generatedInvoice?.share_text
      if (!textToCopy) {
        setError('Generate invoice first, then copy/share it.')
        return
      }
      await navigator.clipboard.writeText(textToCopy)
    } catch {
      setError('Could not copy invoice text. Please try again.')
    }
  }

  const buildInvoiceHtml = useCallback((invoiceData, orderRecord) => {
    const items = Array.isArray(orderRecord?.items) ? orderRecord.items : []
    const currency = orderRecord?.currency || 'INR'
    const rowsHtml = items.length
      ? items.map((item, idx) => {
          const qty = Number(item.qty || 1)
          const unit = Number(item.price || 0)
          const lineTotal = qty * unit
          return `
            <tr>
              <td>${idx + 1}</td>
              <td>${escapeHtml(item.name || 'Item')}</td>
              <td>${qty}</td>
              <td>${currency} ${unit.toFixed(2)}</td>
              <td>${currency} ${lineTotal.toFixed(2)}</td>
            </tr>`
        }).join('')
      : '<tr><td colspan="5">No items listed</td></tr>'

    const note = escapeHtml(invoiceData?.meta?.extra_note || 'Thank you for your business.')
    const logoMarkup = logoDataUri
      ? `<img src="${logoDataUri}" alt="ZenCode Logo" style="width:96px;height:96px;object-fit:contain;border-radius:14px;border:1px solid #dbeafe;background:#ffffff;" />`
      : '<div style="width:96px;height:96px;border-radius:14px;border:1px solid #dbeafe;display:flex;align-items:center;justify-content:center;font-weight:700;color:#1e3a8a;">ZEN</div>'

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${escapeHtml(invoiceData?.order_number || '')}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .card { max-width: 900px; margin: 0 auto; background: white; border: 1px solid #cbd5e1; border-radius: 18px; overflow: hidden; }
    .head { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: linear-gradient(135deg, #eff6ff, #f8fafc); border-bottom: 1px solid #e2e8f0; }
    .brand { display: flex; align-items: center; gap: 14px; }
    .brand h1 { margin: 0; font-size: 26px; color: #0f2f5f; letter-spacing: 1px; }
    .brand p { margin: 2px 0 0; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; }
    .pill { background: #dbeafe; color: #1e3a8a; border: 1px solid #bfdbfe; border-radius: 999px; padding: 6px 12px; font-size: 12px; font-weight: 700; }
    .section { padding: 18px 20px; }
    .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .meta .box { border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; }
    .meta .k { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
    .meta .v { margin-top: 4px; font-size: 14px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #e2e8f0; padding: 9px; font-size: 13px; text-align: left; }
    th { background: #f1f5f9; color: #334155; }
    .total { margin-top: 10px; text-align: right; font-size: 18px; font-weight: 800; color: #0f2f5f; }
    .note { margin-top: 14px; border: 1px solid #dbeafe; background: #eff6ff; color: #1e3a8a; border-radius: 12px; padding: 10px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="head">
      <div class="brand">
        ${logoMarkup}
        <div>
          <h1>${escapeHtml(invoiceData?.meta?.company_name || 'ZenCode Tech Solutions')}</h1>
          <p>Tech Solutions</p>
        </div>
      </div>
      <div class="pill">Invoice ${escapeHtml(invoiceData?.order_number || '')}</div>
    </div>
    <div class="section">
      <div class="meta">
        <div class="box"><div class="k">Recipient</div><div class="v">${escapeHtml(invoiceData?.meta?.recipient_name || '')}</div></div>
        <div class="box"><div class="k">Email</div><div class="v">${escapeHtml(invoiceData?.meta?.recipient_email || '')}</div></div>
        <div class="box"><div class="k">Order Status</div><div class="v">${escapeHtml(orderRecord?.status || '')}</div></div>
        <div class="box"><div class="k">Payment</div><div class="v">${escapeHtml(orderRecord?.payment_status || '')}</div></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div class="total">Total: ${escapeHtml(orderRecord?.currency || 'INR')} ${escapeHtml(orderRecord?.total_amount || '')}</div>
      <div class="note"><strong>Note:</strong> ${note}</div>
    </div>
  </div>
</body>
</html>`
  }, [logoDataUri])

  const createRefund = async (orderId) => {
    try {
      if (!refundForm.amount || !refundForm.reason.trim()) {
        setError('Refund amount and reason are required.')
        return
      }

      await authRequest(`/admin/orders/${orderId}/refunds/`, {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(refundForm.amount),
          reason: refundForm.reason.trim(),
        }),
      })
      setRefundForm({ amount: '', reason: '' })
      await loadOrderDetail(orderId)
      loadDashboard()
    } catch (err) {
      setError(err.message)
    }
  }

  const updateRefundStatus = async (orderId, refundId, nextStatus) => {
    try {
      await authRequest(`/admin/orders/${orderId}/refunds/${refundId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      })
      await loadOrderDetail(orderId)
      loadDashboard()
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleUserFlag = async (targetUser, key) => {
    try {
      await authRequest(`/admin/users/${targetUser.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ [key]: !targetUser[key] }),
      })
      loadDashboard()
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleMessageExpand = useCallback((id) => {
    setExpandedMessageIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const toggleMessageRead = async (message) => {
    try {
      await authRequest(`/admin/messages/${message.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_read: !message.is_read }),
      })
      loadDashboard()
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleExpand = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const filteredLogins = useMemo(() => {
    let list = loginData.results
    if (vlSearch) {
      const q = vlSearch.toLowerCase()
      list = list.filter(
        (l) =>
          (l.identifier || '').toLowerCase().includes(q) ||
          (l.ip_address || '').includes(q) ||
          (l.user_username || '').toLowerCase().includes(q),
      )
    }
    if (loginFilter === 'success') list = list.filter((l) => l.success)
    else if (loginFilter === 'failed') list = list.filter((l) => !l.success)
    else if (loginFilter === 'admin') list = list.filter((l) => l.login_type === 'admin')
    return list
  }, [loginData.results, vlSearch, loginFilter])

  const filteredVisitors = useMemo(() => {
    let list = visitorData.results
    if (vlSearch) {
      const q = vlSearch.toLowerCase()
      list = list.filter(
        (v) =>
          (v.path || '').toLowerCase().includes(q) ||
          (v.ip_address || '').includes(q) ||
          (v.referrer || '').toLowerCase().includes(q),
      )
    }
    if (visitorFilter === 'mobile') list = list.filter((v) => v.device_type === 'mobile')
    else if (visitorFilter === 'desktop') list = list.filter((v) => v.device_type === 'desktop')
    return list
  }, [visitorData.results, vlSearch, visitorFilter])

  /* ---- derived data ---- */
  const overviewStats = useMemo(
    () => [
      {
        title: 'Total Users',
        value: summary?.total_users ?? '-',
        hint: `${summary?.active_users ?? '-'} active`,
        icon: <FaUsers />,
        tone: 'cyan',
      },
      {
        title: 'Admin Users',
        value: summary?.admin_users ?? '-',
        hint: 'Staff accounts',
        icon: <FaUserShield />,
        tone: 'violet',
      },
      {
        title: 'Unread Messages',
        value: summary?.unread_contacts ?? '-',
        hint: 'Awaiting review',
        icon: <FaEnvelope />,
        tone: 'amber',
      },
      {
        title: 'Today Visitors',
        value: summary?.today_visitors ?? '-',
        hint: `${summary?.total_visits ?? '-'} total visits`,
        icon: <FaGlobe />,
        tone: 'emerald',
      },
      {
        title: 'Today Logins',
        value: summary?.today_logins ?? '-',
        hint: `${summary?.successful_logins ?? '-'} all-time success`,
        icon: <MdMarkEmailRead />,
        tone: 'cyan',
      },
      {
        title: 'Failed Logins',
        value: summary?.failed_logins ?? '-',
        hint: 'All-time failed attempts',
        icon: <MdManageAccounts />,
        tone: 'rose',
      },
    ],
    [summary],
  )

  const userDistribution = useMemo(() => {
    const total = summary?.total_users ?? 0
    const admins = summary?.admin_users ?? 0
    const active = summary?.active_users ?? 0
    return [
      { name: 'Admins', value: admins, color: '#8b5cf6' },
      { name: 'Standard', value: Math.max(total - admins, 0), color: '#22d3ee' },
      { name: 'Blocked', value: Math.max(total - active, 0), color: '#f59e0b' },
    ]
  }, [summary])

  const orderInsights = useMemo(() => {
    const rows = ordersData.results || []
    const total = rows.length || 1
    const pending = rows.filter((x) => x.status === 'pending').length
    const shipped = rows.filter((x) => x.status === 'shipped').length
    const delivered = rows.filter((x) => x.status === 'delivered').length
    const paid = rows.filter((x) => x.payment_status === 'paid').length

    return {
      pending,
      shipped,
      delivered,
      paid,
      pendingPct: Math.round((pending / total) * 100),
      shippedPct: Math.round((shipped / total) * 100),
      deliveredPct: Math.round((delivered / total) * 100),
      paidPct: Math.round((paid / total) * 100),
    }
  }, [ordersData.results])

  if (!user || !isAdmin) return null

  /* ---------------------------------------------------------------- */
  /*  Sidebar                                                          */
  /* ---------------------------------------------------------------- */

  // Sidebar with Orders sub-menu toggle
  const [ordersMenuOpen, setOrdersMenuOpen] = useState(false);
  const Sidebar = (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/5 bg-[#080d1e]/95 px-4 py-6 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* brand */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400">Admin</p>
          <h1 className="mt-1 text-xl font-extrabold leading-tight text-white">Control Center</h1>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="rounded-xl border border-white/10 p-2 text-xs text-slate-400 lg:hidden"
        >
          ✕
        </button>
      </div>

      {/* user card */}
      <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.04] p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-sm font-black text-white">
            {(user.name || user.username || '?')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user.name || user.username}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-gradient-to-r from-violet-600/25 to-cyan-500/10 px-2.5 py-1.5 text-[11px] font-bold text-violet-300">
          ✓ Admin access
        </div>
      </div>

      {/* nav */}
      <nav className="mt-6 flex-1 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const active = section === item.key || (item.key === 'orders' && section.startsWith('orders-'));
          if (item.subMenu) {
            return (
              <div key={item.key}>
                <button
                  type="button"
                  onClick={() => setOrdersMenuOpen((prev) => !prev)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-sm font-semibold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-violet-600/30 to-cyan-500/10 text-white shadow-md shadow-violet-900/30 ring-1 ring-violet-500/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <span className={`text-base ${active ? 'text-violet-300' : ''}`}>{item.icon}</span>
                  <span>{item.label}</span>
                  <motion.span animate={{ rotate: ordersMenuOpen ? 90 : 0 }} className="ml-auto text-xs">
                    <FaChevronDown size={12} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {ordersMenuOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pl-4"
                    >
                      {item.subMenu.map((sub) => (
                        <button
                          key={sub.key}
                          type="button"
                          onClick={() => { setSection(sub.key); setSidebarOpen(false); }}
                          className={`mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-all ${
                            section === sub.key
                              ? 'bg-cyan-500/20 text-cyan-200 shadow'
                              : 'text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-200'
                          }`}
                        >
                          <span className="text-base">{sub.icon}</span>
                          <span>{sub.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => { setSection(item.key); setSidebarOpen(false) }}
              className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-sm font-semibold transition-all ${
                active
                  ? 'bg-gradient-to-r from-violet-600/30 to-cyan-500/10 text-white shadow-md shadow-violet-900/30 ring-1 ring-violet-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <span className={`text-base ${active ? 'text-violet-300' : ''}`}>{item.icon}</span>
              <span>{item.label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />}
            </button>
          );
        })}
      </nav>

      {/* footer links */}
      <div className="mt-4 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-2xl border border-white/8 px-3.5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          <FaHome className="text-slate-400" /> Portfolio
        </Link>
        <button
          type="button"
          onClick={() => { logout(); navigate('/login') }}
          className="flex w-full items-center gap-2.5 rounded-2xl border border-rose-500/20 px-3.5 py-2.5 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/10"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </aside>
  )

  /* ---------------------------------------------------------------- */
  /*  Section content                                                  */
  /* ---------------------------------------------------------------- */

  const SectionOverview = (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {overviewStats.map((item) => <OverviewCard key={item.title} {...item} />)}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        {/* area chart preview */}
        <Panel
          title="Traffic Overview (last 14 days)"
          subtitle="Visitors and successful logins per day"
          action={
            <button
              type="button"
              onClick={() => setSection('analytics')}
              className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:text-white"
            >
              Full analytics →
            </button>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#22d3ee" strokeWidth={2.5} fill="url(#gV)" dot={false} />
                <Area type="monotone" dataKey="logins" name="Logins" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gL)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* donut */}
        <Panel title="User Distribution" subtitle="Role & status breakdown">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={userDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={4}>
                  {userDistribution.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2">
            {userDistribution.map((e) => (
              <div key={e.name} className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-3 py-2 text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: e.color }} />
                  {e.name}
                </span>
                <span className="font-bold text-white">{e.value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )

  const SectionAnalytics = (
    <>
      {/* day-range filter */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white">Platform Analytics</h2>
          <p className="mt-1 text-sm text-slate-400">Daily breakdown — visitors, logins, and failed attempts</p>
        </div>
        <DayFilter days={[7, 14, 30, 60]} active={chartDays} onChange={setChartDays} />
      </div>

      {chartLoading && (
        <p className="mb-4 text-center text-sm font-semibold text-slate-500 animate-pulse">Refreshing chart data…</p>
      )}

      {/* area chart full */}
      <Panel title={`Visitor & Login Trends — last ${chartDays} days`} subtitle="Line = visitors (cyan), logins (violet), failed (rose)">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="gV2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gL2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gF2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb7185" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#fb7185" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} interval={Math.ceil(chartDays / 8)} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12, paddingTop: 12 }} />
              <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#22d3ee" strokeWidth={2.5} fill="url(#gV2)" dot={false} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="logins" name="Logins" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gL2)" dot={false} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="failed" name="Failed" stroke="#fb7185" strokeWidth={2} fill="url(#gF2)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* two mini charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Daily Visitors (bar)" subtitle={`Last ${chartDays} days`}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} interval={Math.ceil(chartDays / 6)} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="visitors" name="Visitors" radius={[6, 6, 0, 0]} fill="#22d3ee" opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Login Success vs Failed (line)" subtitle={`Last ${chartDays} days`}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} interval={Math.ceil(chartDays / 6)} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12, paddingTop: 8 }} />
                <Line type="monotone" dataKey="logins" name="Success" stroke="#22c55e" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="failed" name="Failed" stroke="#fb7185" strokeWidth={2} dot={false} activeDot={{ r: 4 }} strokeDasharray="4 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* total summary bar */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: `Visitors (${chartDays}d)`, value: chartData.reduce((s, r) => s + r.visitors, 0), color: 'text-cyan-300' },
          { label: `Logins (${chartDays}d)`, value: chartData.reduce((s, r) => s + r.logins, 0), color: 'text-violet-300' },
          { label: `Failed (${chartDays}d)`, value: chartData.reduce((s, r) => s + r.failed, 0), color: 'text-rose-300' },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-800 bg-white/[0.03] px-5 py-4">
            <p className="text-xs font-semibold text-slate-400">{item.label}</p>
            <p className={`mt-2 text-3xl font-extrabold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </>
  )

  const SectionUsers = (
    <Panel
      title="User Management"
      subtitle="Search, block/activate, manage admin roles"
      action={
        <form onSubmit={handleSearchUsers} className="flex gap-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search name, email…"
              className="rounded-2xl border border-slate-700 bg-slate-950/60 pl-9 pr-4 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
          <button type="submit" className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-90">
            Search
          </button>
        </form>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="pb-3 pr-4">User</th>
              <th className="pb-3 pr-4">Email</th>
              <th className="pb-3 pr-4">Joined</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Role</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersData.results.map((u) => (
              <tr key={u.id} className="border-t border-slate-800/70">
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/40 to-cyan-500/30 text-xs font-black text-white">
                      {(u.full_name || u.username || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{u.full_name}</p>
                      <p className="text-xs text-slate-500">@{u.username}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 pr-4 text-slate-400">{u.email}</td>
                <td className="py-3.5 pr-4 text-slate-500">{new Date(u.date_joined).toLocaleDateString()}</td>
                <td className="py-3.5 pr-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${u.is_active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
                    {u.is_active ? 'Active' : 'Blocked'}
                  </span>
                </td>
                <td className="py-3.5 pr-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${u.is_staff ? 'bg-violet-500/15 text-violet-300' : 'bg-slate-500/15 text-slate-300'}`}>
                    {u.is_staff ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="py-3.5">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleUserFlag(u, 'is_active')}
                      className="rounded-xl border border-amber-500/25 px-2.5 py-1 text-xs font-bold text-amber-300 transition hover:bg-amber-500/10"
                    >
                      {u.is_active ? 'Block' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleUserFlag(u, 'is_staff')}
                      className="rounded-xl border border-violet-500/25 px-2.5 py-1 text-xs font-bold text-violet-300 transition hover:bg-violet-500/10"
                    >
                      {u.is_staff ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {usersData.results.length === 0 && !loading && (
              <tr><td colSpan={6} className="py-8 text-center text-sm text-slate-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination pagination={usersData.pagination} onPage={setUsersPage} />
    </Panel>
  )

  const SectionMessages = (
    <Panel
      title="Messenger"
      subtitle="Messages sent from public contact form"
      action={
        <form onSubmit={handleSearchMessages} className="flex flex-wrap gap-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={messageSearch}
              onChange={(e) => setMessageSearch(e.target.value)}
              placeholder="Search name, email, text…"
              className="rounded-2xl border border-slate-700 bg-slate-950/60 pl-9 pr-4 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
          <select
            value={messageFilter}
            onChange={(e) => setMessageFilter(e.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 outline-none"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <button type="submit" className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-90">
            Search
          </button>
        </form>
      }
    >
      <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
        <span>Total: <span className="font-bold text-slate-300">{messagesData.pagination?.total_items ?? messagesData.results.length}</span></span>
        <span>Click row to expand full message</span>
      </div>

      <div className="space-y-2.5">
        {messagesData.results.map((m) => {
          const expanded = expandedMessageIds.has(m.id)
          return (
            <motion.div
              key={m.id}
              layout
              className={`overflow-hidden rounded-2xl border transition-colors ${expanded ? 'border-cyan-500/25 bg-cyan-500/[0.04]' : 'border-slate-800 bg-white/[0.02]'}`}
            >
              <button
                type="button"
                onClick={() => toggleMessageExpand(m.id)}
                className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
              >
                <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${m.is_read ? 'bg-slate-500' : 'bg-cyan-400 shadow-lg shadow-cyan-500/40'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-bold text-white">{m.name}</span>
                    <span className="text-xs text-slate-500">{m.email}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${m.is_read ? 'bg-slate-500/15 text-slate-300' : 'bg-cyan-500/15 text-cyan-300'}`}>
                      {m.is_read ? 'READ' : 'UNREAD'}
                    </span>
                    <span className="text-xs text-slate-500">{new Date(m.created_at).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-300">{m.message}</p>
                </div>
                <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="text-slate-500">
                  <FaChevronDown size={11} />
                </motion.span>
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-slate-800 px-4 pb-4 pt-3">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Full Message</p>
                      <p className="rounded-xl border border-slate-800/70 bg-black/20 px-3 py-2.5 text-sm leading-relaxed text-slate-200">
                        {m.message}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleMessageRead(m)}
                          className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${m.is_read ? 'border-amber-500/25 text-amber-300 hover:bg-amber-500/10' : 'border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/10'}`}
                        >
                          {m.is_read ? 'Mark as Unread' : 'Mark as Read'}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleMessageExpand(m.id)}
                          className="rounded-xl border border-slate-700/60 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
                        >
                          <FaTimes size={10} className="mr-1 inline" /> Hide
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}

        {messagesData.results.length === 0 && !loading && (
          <EmptyState text="No messages found for current search/filter." />
        )}
      </div>

      <Pagination pagination={messagesData.pagination} onPage={setMessagesPage} />
    </Panel>
  )

  const SectionOrders = (

    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Pending', value: orderInsights.pending, pct: orderInsights.pendingPct, tone: 'from-amber-500/30 to-amber-600/5' },
          { label: 'Shipped', value: orderInsights.shipped, pct: orderInsights.shippedPct, tone: 'from-blue-500/30 to-blue-600/5' },
          { label: 'Delivered', value: orderInsights.delivered, pct: orderInsights.deliveredPct, tone: 'from-emerald-500/30 to-emerald-600/5' },
          { label: 'Payment Paid', value: orderInsights.paid, pct: orderInsights.paidPct, tone: 'from-violet-500/30 to-violet-600/5' },
        ].map((card) => (
          <motion.div
            key={card.label}
            whileHover={{ y: -3 }}
            className={`rounded-2xl border border-slate-800 bg-gradient-to-br ${card.tone} p-3`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-white">{card.value}</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${card.pct}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full bg-cyan-400"
              />
            </div>
            <p className="mt-1 text-[10px] font-semibold text-slate-500">{card.pct}% of current list</p>
          </motion.div>
        ))}
      </div>

      <ToggleBlock title="Orders List" subtitle="Expand to view all orders" defaultOpen={false}>
        <Panel
          title="Orders (Core Business)"
          subtitle="Track order status, payments, invoice, timeline and refunds"
          action={
            <form onSubmit={handleSearchOrders} className="flex flex-wrap gap-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Order no, customer..."
                  className="rounded-2xl border border-slate-700 bg-slate-950/60 pl-9 pr-4 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                />
              </div>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
              <select
                value={orderPaymentFilter}
                onChange={(e) => setOrderPaymentFilter(e.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 outline-none"
              >
                <option value="all">All Payments</option>
                <option value="pending">Payment Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <button type="submit" className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:opacity-90">
                Search
              </button>
            </form>
          }
        >
          {/* Quick Filter Chips */}
          <div className="mb-3 flex flex-wrap gap-2">
            {['all', 'pending', 'shipped', 'delivered'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setOrderStatusFilter(status)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold border transition-all duration-150 ${
                  orderStatusFilter === status
                    ? 'bg-cyan-500 text-white border-cyan-500 shadow-md'
                    : 'bg-slate-900 text-cyan-300 border-slate-700 hover:bg-cyan-500/10 hover:border-cyan-500'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
            {['all', 'pending', 'paid', 'failed', 'refunded'].map((pay) => (
              <button
                key={pay}
                type="button"
                onClick={() => setOrderPaymentFilter(pay)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold border transition-all duration-150 ${
                  orderPaymentFilter === pay
                    ? 'bg-violet-500 text-white border-violet-500 shadow-md'
                    : 'bg-slate-900 text-violet-300 border-slate-700 hover:bg-violet-500/10 hover:border-violet-500'
                }`}
              >
                {pay === 'all' ? 'All Payments' : pay.charAt(0).toUpperCase() + pay.slice(1)}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4">Order</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Payment</th>
                  <th className="pb-3 pr-4">Timeline</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ordersData.results.map((order, idx) => (
                  <tr
                    key={order.id}
                    className={`border-t border-slate-800/70 transition-all duration-150 ${idx % 2 === 0 ? 'bg-slate-900/40' : ''} hover:bg-cyan-900/10`}
                  >
                    <td className="py-3.5 pr-4">
                      <p className="font-bold text-white">{order.order_number}</p>
                      <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleString()}</p>
                    </td>
                    <td className="py-3.5 pr-4">
                      <p className="font-semibold text-slate-200">{order.customer_name}</p>
                      <p className="text-xs text-slate-500">{order.customer_email}</p>
                    </td>
                    <td className="py-3.5 pr-4 font-bold text-cyan-300">
                      {order.currency} {order.total_amount}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${
                        order.status === 'delivered'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                          : order.status === 'shipped'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-400/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-400/30'
                      }`}>
                        {order.status === 'pending' && <FaRegClock size={12} />}
                        {order.status === 'shipped' && <FaTruck size={12} />}
                        {order.status === 'delivered' && <FaCheckCircle size={12} />}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${
                        order.payment_status === 'paid'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                          : order.payment_status === 'refunded'
                            ? 'bg-violet-500/15 text-violet-300 border border-violet-400/30'
                            : order.payment_status === 'failed'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-400/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-400/30'
                      }`}>
                        <FaMoneyBillWave size={12} />
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400">
                      {order.timeline_count} events
                    </td>
                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => loadOrderDetail(order.id)}
                          className="flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-900/10 px-3 py-1.5 text-xs font-bold text-cyan-300 shadow-sm transition hover:bg-cyan-500/20 hover:text-white"
                        >
                          <FaBoxOpen size={13} /> View
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadInvoice(order.id)}
                          className="flex items-center gap-1 rounded-full border border-indigo-500/40 bg-indigo-900/10 px-3 py-1.5 text-xs font-bold text-indigo-300 shadow-sm transition hover:bg-indigo-500/20 hover:text-white"
                        >
                          <FaDownload size={13} /> Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {ordersData.results.length === 0 && !loading && (
                  <tr><td colSpan={7} className="py-8 text-center text-sm text-slate-500">No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination pagination={ordersData.pagination} onPage={setOrdersPage} />

          {!selectedOrder && ordersData.results.length > 0 && (
            <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200">
              <p className="font-semibold">Invoice tools hidden until order detail opens.</p>
              <p className="mt-1 text-cyan-300/90">Click <span className="font-bold">Manage</span> on any order, or use quick action below.</p>
              <button
                type="button"
                onClick={() => loadOrderDetail(ordersData.results[0].id)}
                className="mt-3 rounded-xl border border-cyan-400/40 px-3 py-1.5 text-xs font-bold text-cyan-200 transition hover:bg-cyan-500/20"
              >
                Open First Order Detail
              </button>
            </div>
          )}
        </Panel>
      </ToggleBlock>

      {selectedOrder && (
        <Panel
          title={`Order Detail: ${selectedOrder.order_number}`}
          subtitle="Update shipment/payment status and manage refunds"
          action={
            <button
              type="button"
              onClick={() => downloadInvoice(selectedOrder.id)}
              className="rounded-xl border border-indigo-500/25 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/10"
            >
              <FaDownload size={10} className="mr-1 inline" /> Download Invoice
            </button>
          }
        >
          <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <div className="space-y-4">
              <ToggleBlock title="Order Snapshot" subtitle="Customer and amount overview" defaultOpen>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-white/[0.02] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Customer</p>
                    <p className="mt-1 text-sm font-semibold text-white">{selectedOrder.customer_name}</p>
                    <p className="text-xs text-slate-400">{selectedOrder.customer_email}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-white/[0.02] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Amount</p>
                    <p className="mt-1 text-sm font-semibold text-cyan-300">{selectedOrder.currency} {selectedOrder.total_amount}</p>
                    <p className="text-xs text-slate-400">Created {new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </ToggleBlock>

              <ToggleBlock title="Status Controls" subtitle="Update order and payment state" defaultOpen>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-white/[0.02] p-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Update Order Status</p>
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'shipped', 'delivered'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateOrder(selectedOrder.id, { status })}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                            selectedOrder.status === status
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-white/[0.02] p-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Update Payment Status</p>
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'paid', 'failed', 'refunded'].map((paymentStatus) => (
                        <button
                          key={paymentStatus}
                          type="button"
                          onClick={() => updateOrder(selectedOrder.id, { payment_status: paymentStatus })}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                            selectedOrder.payment_status === paymentStatus
                              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                              : 'border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                          }`}
                        >
                          {paymentStatus}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </ToggleBlock>

              <ToggleBlock title="Order Timeline" subtitle="Every action history on this order" defaultOpen>
                <div className="space-y-2">
                  {(selectedOrder.timeline || []).map((event) => (
                    <div key={event.id} className="rounded-xl border border-slate-800/80 bg-black/20 px-3 py-2.5">
                      <p className="text-sm font-semibold text-white">{event.title}</p>
                      {event.description ? <p className="mt-1 text-xs text-slate-400">{event.description}</p> : null}
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {!selectedOrder.timeline?.length && (
                    <p className="text-xs text-slate-500">No timeline events yet.</p>
                  )}
                </div>
              </ToggleBlock>
            </div>

            <div className="space-y-4">
              <ToggleBlock title="Interactive Invoice Generator" subtitle="Generate, preview, and download custom invoice" defaultOpen>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={invoiceForm.recipient_name}
                    onChange={(e) => setInvoiceForm((prev) => ({ ...prev, recipient_name: e.target.value }))}
                    placeholder="Recipient name"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
                  />
                  <input
                    type="email"
                    value={invoiceForm.recipient_email}
                    onChange={(e) => setInvoiceForm((prev) => ({ ...prev, recipient_email: e.target.value }))}
                    placeholder="Recipient email"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    value={invoiceForm.company_name}
                    onChange={(e) => setInvoiceForm((prev) => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Company name"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
                  />
                  <textarea
                    rows={2}
                    value={invoiceForm.extra_note}
                    onChange={(e) => setInvoiceForm((prev) => ({ ...prev, extra_note: e.target.value }))}
                    placeholder="Extra note for client"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => generateInteractiveInvoice(selectedOrder.id)}
                      className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20"
                    >
                      Generate Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadInvoice(selectedOrder.id, invoiceForm)}
                      className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-bold text-indigo-300 transition hover:bg-indigo-500/20"
                    >
                      Download Custom Invoice
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={copyInvoiceForShare}
                    className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20"
                  >
                    <FaShareAlt size={11} className="mr-1 inline" /> Copy Invoice Text (share anywhere)
                  </button>
                </div>

                {generatedInvoice?.invoice_text && (
                  <div className="mt-3 rounded-xl border border-slate-800/80 bg-black/20 p-2.5">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Preview</p>
                    <pre className="max-h-44 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-slate-300">
                      {generatedInvoice.invoice_text}
                    </pre>
                  </div>
                )}
              </ToggleBlock>

              <ToggleBlock title="Refund Management" subtitle="Create and process refund requests" defaultOpen={false}>
                <div className="space-y-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={refundForm.amount}
                    onChange={(e) => setRefundForm((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder="Refund amount"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
                  />
                  <textarea
                    rows={3}
                    value={refundForm.reason}
                    onChange={(e) => setRefundForm((prev) => ({ ...prev, reason: e.target.value }))}
                    placeholder="Refund reason"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => createRefund(selectedOrder.id)}
                    className="w-full rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm font-bold text-rose-300 transition hover:bg-rose-500/20"
                  >
                    <FaUndo size={12} className="mr-1 inline" /> Create Refund Request
                  </button>
                </div>
              </ToggleBlock>

              <ToggleBlock title="Refund Requests" subtitle="Track and update all refund states" defaultOpen={false}>
                <div className="space-y-2">
                  {(selectedOrder.refunds || []).map((refund) => (
                    <div key={refund.id} className="rounded-xl border border-slate-800/80 bg-black/20 px-3 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-white">{selectedOrder.currency} {refund.amount}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          refund.status === 'processed'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : refund.status === 'approved'
                              ? 'bg-blue-500/15 text-blue-300'
                              : refund.status === 'rejected'
                                ? 'bg-rose-500/15 text-rose-300'
                                : 'bg-amber-500/15 text-amber-300'
                        }`}>{refund.status}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{refund.reason}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {['requested', 'approved', 'rejected', 'processed'].map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => updateRefundStatus(selectedOrder.id, refund.id, status)}
                            className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                              refund.status === status
                                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                                : 'border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {!selectedOrder.refunds?.length && <p className="text-xs text-slate-500">No refund requests yet.</p>}
                </div>
              </ToggleBlock>
            </div>
          </div>
        </Panel>
      )}
    </div>
  )

  const SectionVisitors = (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Visitor &amp; Login Panel</h2>
          <p className="mt-1 text-sm text-slate-400">
            Realtime traffic, access attempts, and full session info
          </p>
        </div>
        {/* quick stats chips */}
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {vlTab === 'logins' ? (
            <>
              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-300">
                {loginData.pagination?.total_items ?? loginData.results.length} Total
              </span>
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-emerald-300">
                {loginData.results.filter((l) => l.success).length} Success
              </span>
              <span className="rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1.5 text-rose-300">
                {loginData.results.filter((l) => !l.success).length} Failed
              </span>
              <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1.5 text-violet-300">
                {loginData.results.filter((l) => l.login_type === 'admin').length} Admin
              </span>
            </>
          ) : (
            <>
              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-300">
                {visitorData.pagination?.total_items ?? visitorData.results.length} Total
              </span>
              <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5 text-cyan-300">
                {visitorData.results.filter((v) => v.device_type === 'desktop').length} Desktop
              </span>
              <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-amber-300">
                {visitorData.results.filter((v) => v.device_type === 'mobile').length} Mobile
              </span>
            </>
          )}
        </div>
      </div>

      {/* tab switcher */}
      <div className="flex gap-1 rounded-2xl border border-slate-800 bg-slate-950/60 p-1">
        {[
          { key: 'logins', label: 'Login Activity', icon: <FaUserShield size={12} /> },
          { key: 'visitors', label: 'Visitor Logs', icon: <FaGlobe size={12} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setVlTab(tab.key)
              setVlSearch('')
              setLoginFilter('all')
              setVisitorFilter('all')
              setExpandedIds(new Set())
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all ${
              vlTab === tab.key
                ? 'bg-gradient-to-r from-violet-600/40 to-cyan-500/20 text-white ring-1 ring-violet-500/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* search + filter row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
          <input
            value={vlSearch}
            onChange={(e) => setVlSearch(e.target.value)}
            placeholder={
              vlTab === 'logins'
                ? 'Search by user, IP address…'
                : 'Search by path, IP, referrer…'
            }
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 py-2.5 pl-9 pr-9 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
          />
          {vlSearch && (
            <button
              type="button"
              onClick={() => setVlSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-200"
            >
              <FaTimes size={12} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {vlTab === 'logins'
            ? [{ key: 'all', label: 'All' }, { key: 'success', label: '✓ Success' }, { key: 'failed', label: '✗ Failed' }, { key: 'admin', label: 'Admin' }].map(
                (f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setLoginFilter(f.key)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      loginFilter === f.key
                        ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md'
                        : 'border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ),
              )
            : [{ key: 'all', label: 'All' }, { key: 'desktop', label: '🖥 Desktop' }, { key: 'mobile', label: '📱 Mobile' }].map(
                (f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setVisitorFilter(f.key)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      visitorFilter === f.key
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                        : 'border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ),
              )}
        </div>
      </div>

      {/* results count + expand all hint */}
      {(filteredLogins.length > 0 || filteredVisitors.length > 0) && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing{' '}
            <span className="font-bold text-slate-300">
              {vlTab === 'logins' ? filteredLogins.length : filteredVisitors.length}
            </span>{' '}
            {vlTab === 'logins' ? 'login records' : 'visit records'}
          </span>
          <span className="text-slate-600">Click any row to expand full details</span>
        </div>
      )}

      {/* animated card list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={vlTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="space-y-2.5"
        >
          {vlTab === 'logins' ? (
            filteredLogins.length > 0 ? (
              filteredLogins.map((log) => (
                <LoginCard
                  key={log.id}
                  log={log}
                  expanded={expandedIds.has(`l-${log.id}`)}
                  onToggle={() => toggleExpand(`l-${log.id}`)}
                />
              ))
            ) : (
              <EmptyState
                text={vlSearch || loginFilter !== 'all' ? 'No records match your search / filter.' : 'No login records found.'}
              />
            )
          ) : filteredVisitors.length > 0 ? (
            filteredVisitors.map((v) => (
              <VisitorCard
                key={v.id}
                visitor={v}
                expanded={expandedIds.has(`v-${v.id}`)}
                onToggle={() => toggleExpand(`v-${v.id}`)}
              />
            ))
          ) : (
            <EmptyState
              text={vlSearch || visitorFilter !== 'all' ? 'No records match your search / filter.' : 'No visitor records found.'}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* pagination */}
      {vlTab === 'logins' ? (
        <Pagination pagination={loginData.pagination} onPage={setLoginPage} />
      ) : (
        <Pagination pagination={visitorData.pagination} onPage={setVisitorPage} />
      )}
    </div>
  )

  const sectionMap = {
    overview: SectionOverview,
    analytics: SectionAnalytics,
    users: SectionUsers,
    messages: SectionMessages,
    orders: SectionOrders,
    'orders-list': (
      <Panel title="Orders List" subtitle="All orders in the system">
        {/* Reuse the orders list table from SectionOrders */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="pb-3 pr-4">Order</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Payment</th>
                <th className="pb-3 pr-4">Timeline</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersData.results.map((order, idx) => (
                <tr
                  key={order.id}
                  className={`border-t border-slate-800/70 transition-all duration-150 ${idx % 2 === 0 ? 'bg-slate-900/40' : ''} hover:bg-cyan-900/10`}
                >
                  <td className="py-3.5 pr-4">
                    <p className="font-bold text-white">{order.order_number}</p>
                    <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleString()}</p>
                  </td>
                  <td className="py-3.5 pr-4">
                    <p className="font-semibold text-slate-200">{order.customer_name}</p>
                    <p className="text-xs text-slate-500">{order.customer_email}</p>
                  </td>
                  <td className="py-3.5 pr-4 font-bold text-cyan-300">
                    {order.currency} {order.total_amount}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${
                      order.status === 'delivered'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                        : order.status === 'shipped'
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-400/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-400/30'
                    }`}>
                      {order.status === 'pending' && <FaRegClock size={12} />}
                      {order.status === 'shipped' && <FaTruck size={12} />}
                      {order.status === 'delivered' && <FaCheckCircle size={12} />}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${
                      order.payment_status === 'paid'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                        : order.payment_status === 'refunded'
                        ? 'bg-violet-500/15 text-violet-300 border border-violet-400/30'
                        : order.payment_status === 'failed'
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-400/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-400/30'
                    }`}>
                      <FaMoneyBillWave size={12} />
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-slate-400">
                    {order.timeline_count} events
                  </td>
                  <td className="py-3.5">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => loadOrderDetail(order.id)}
                        className="flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-900/10 px-3 py-1.5 text-xs font-bold text-cyan-300 shadow-sm transition hover:bg-cyan-500/20 hover:text-white"
                      >
                        <FaBoxOpen size={13} /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadInvoice(order.id)}
                        className="flex items-center gap-1 rounded-full border border-indigo-500/40 bg-indigo-900/10 px-3 py-1.5 text-xs font-bold text-indigo-300 shadow-sm transition hover:bg-indigo-500/20 hover:text-white"
                      >
                        <FaDownload size={13} /> Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {ordersData.results.length === 0 && !loading && (
                <tr><td colSpan={7} className="py-8 text-center text-sm text-slate-500">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination pagination={ordersData.pagination} onPage={setOrdersPage} />
      </Panel>
    ),
    'orders-invoice': (
      <Panel title="Invoice" subtitle="Modern, clean, and professional invoice UI">
        {/* ModernInvoice component for dynamic/manual invoice creation */}
        <ModernInvoice />
      </Panel>
    ),
    'orders-refunds': (
      <Panel title="Refund Management" subtitle="Create and process refund requests">
        {selectedOrder ? (
          <>
            <ToggleBlock title="Refund Management" subtitle="Create and process refund requests" defaultOpen>
              <div className="space-y-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={refundForm.amount}
                  onChange={(e) => setRefundForm((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="Refund amount"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
                />
                <textarea
                  rows={3}
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Refund reason"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => createRefund(selectedOrder.id)}
                  className="w-full rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm font-bold text-rose-300 transition hover:bg-rose-500/20"
                >
                  <FaUndo size={12} className="mr-1 inline" /> Create Refund Request
                </button>
              </div>
            </ToggleBlock>,
            <ToggleBlock title="Refund Requests" subtitle="Track and update all refund states" defaultOpen={false}>
              <div className="space-y-2">
                {(selectedOrder.refunds || []).map((refund) => (
                  <div key={refund.id} className="rounded-xl border border-slate-800/80 bg-black/20 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{selectedOrder.currency} {refund.amount}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        refund.status === 'processed'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : refund.status === 'approved'
                          ? 'bg-blue-500/15 text-blue-300'
                          : refund.status === 'rejected'
                          ? 'bg-rose-500/15 text-rose-300'
                          : 'bg-amber-500/15 text-amber-300'
                      }`}>{refund.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{refund.reason}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {['requested', 'approved', 'rejected', 'processed'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateRefundStatus(selectedOrder.id, refund.id, status)}
                          className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                            refund.status === status
                              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                              : 'border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {!selectedOrder.refunds?.length && <p className="text-xs text-slate-500">No refund requests yet.</p>}
              </div>
            </ToggleBlock>
          </>
        ) : (
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200">
            <p className="font-semibold">Refund tools hidden until order detail opens.</p>
            <p className="mt-1 text-cyan-300/90">Click <span className="font-bold">Manage</span> on any order, or use quick action below.</p>
            <button
              type="button"
              onClick={() => loadOrderDetail(ordersData.results[0]?.id)}
              className="mt-3 rounded-xl border border-cyan-400/40 px-3 py-1.5 text-xs font-bold text-cyan-200 transition hover:bg-cyan-500/20"
            >
              Open First Order Detail
            </button>
          </div>
        )}
      </Panel>
    ),
    'orders-timeline': (
      <Panel title="Order Timeline" subtitle="All timeline events for the selected order">
        {selectedOrder ? (
          <ToggleBlock title="Order Timeline" subtitle="Every action history on this order" defaultOpen>
            <div className="space-y-2">
              {(selectedOrder.timeline || []).map((event) => (
                <div key={event.id} className="rounded-xl border border-slate-800/80 bg-black/20 px-3 py-2.5">
                  <p className="text-sm font-semibold text-white">{event.title}</p>
                  {event.description ? <p className="mt-1 text-xs text-slate-400">{event.description}</p> : null}
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
              {!selectedOrder.timeline?.length && (
                <p className="text-xs text-slate-500">No timeline events yet.</p>
              )}
            </div>
          </ToggleBlock>
        ) : (
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200">
            <p className="font-semibold">Timeline tools hidden until order detail opens.</p>
            <p className="mt-1 text-cyan-300/90">Click <span className="font-bold">Manage</span> on any order, or use quick action below.</p>
            <button
              type="button"
              onClick={() => loadOrderDetail(ordersData.results[0]?.id)}
              className="mt-3 rounded-xl border border-cyan-400/40 px-3 py-1.5 text-xs font-bold text-cyan-200 transition hover:bg-cyan-500/20"
            >
              Open First Order Detail
            </button>
          </div>
        )}
      </Panel>
    ),
    visitors: SectionVisitors,
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-[#060a18] text-slate-100">
      {/* ambient orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute right-0 top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/8 blur-[100px]" />
      </div>

      <div className="flex min-h-screen">
        {Sidebar}

        {/* overlay on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* main */}
        <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
          {/* top bar */}
          <header className="sticky top-0 z-20 border-b border-white/5 bg-[#060a18]/80 px-4 py-3 backdrop-blur-2xl sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 lg:hidden"
                >
                  <FaBars />
                </button>
                <div>
                  <h2 className="text-xl font-extrabold text-white">
                    Welcome back, {user.name || user.username}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 hidden sm:block">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* section breadcrumb */}
                <div className="hidden items-center gap-1 rounded-2xl border border-slate-700/50 bg-slate-950/60 px-3 py-2 md:flex">
                  {SIDEBAR_ITEMS.map((item, i) => (
                    <span key={item.key} className="flex items-center gap-1">
                      {i > 0 && <span className="text-slate-700">/</span>}
                      <button
                        type="button"
                        onClick={() => setSection(item.key)}
                        className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${section === item.key ? 'bg-white/8 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {item.label}
                      </button>
                    </span>
                  ))}
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/8 px-3 py-2 text-xs font-bold text-cyan-300">
                  ● Live
                </div>
              </div>
            </div>
          </header>

          {/* content */}
          <main className="flex-1 px-4 py-6 sm:px-6">
            {error ? (
              <div className="mb-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300">
                ⚠ {error}
              </div>
            ) : null}

            {loading && section === 'overview' ? (
              <div className="flex h-64 items-center justify-center">
                <p className="animate-pulse text-sm font-semibold text-slate-500">Loading dashboard…</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={section}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  {sectionMap[section]}
                </motion.div>
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
