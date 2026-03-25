import { lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Route, Routes } from 'react-router-dom'

const App = lazy(() => import('./App'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030814]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/30 border-t-cyan-400" />
    </div>
  )
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

export default function AppRouter() {
  const location = useLocation()
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><App /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
          <Route path="/admin/dashboard" element={<PageTransition><AdminDashboardPage /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}
