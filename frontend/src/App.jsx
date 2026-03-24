import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'

import Home           from './pages/Home'
import Register       from './pages/Register'
import Login          from './pages/Login'
import Dashboard      from './pages/Dashboard'
import Profile        from './pages/Profile'
import Discover       from './pages/Discover'
import Chat           from './pages/Chat'
import Friends        from './pages/Friends'
import Events         from './pages/Events'
import FriendMap      from './pages/FriendMap'
import AdminDashboard from './pages/AdminDashboard'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-dark-500 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
  return user ? children : <Navigate to="/login" replace />
}

function GuestAllowedRoute({ children }) {
  const { loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-dark-500 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/"           element={<GuestAllowedRoute><Home /></GuestAllowedRoute>} />
        <Route path="/discover"   element={<GuestAllowedRoute><Discover /></GuestAllowedRoute>} />
        <Route path="/profile/:id" element={<GuestAllowedRoute><Profile /></GuestAllowedRoute>} />
        <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/chat"       element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/chat/:id"   element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/friends"    element={<ProtectedRoute><Friends /></ProtectedRoute>} />
        <Route path="/events"     element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route path="/map"        element={<ProtectedRoute><FriendMap /></ProtectedRoute>} />
        <Route path="/admin"      element={<AdminDashboard />} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}