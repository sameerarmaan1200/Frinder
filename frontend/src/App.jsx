import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import AdminLogin     from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ForgotPassword from './pages/ForgotPassword'

// Requires user login
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-dark-500 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

// Guest can view but not interact
function GuestAllowedRoute({ children }) {
  const { loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-dark-500 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return children
}

// Redirect logged-in users away from login/register
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

// Requires admin token
function AdminRoute({ children }) {
  const token = localStorage.getItem('frinder_admin_token')
  return token ? children : <Navigate to="/admin" replace />
}

function AppRoutes() {
  return (
      <Routes>

        {/* Public pages */}
        <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Guest-viewable pages */}
        <Route path="/"           element={<GuestAllowedRoute><Home /></GuestAllowedRoute>} />
        <Route path="/discover"   element={<GuestAllowedRoute><Discover /></GuestAllowedRoute>} />
        <Route path="/profile/:id" element={<GuestAllowedRoute><Profile /></GuestAllowedRoute>} />

        {/* Protected user pages */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/chat"      element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/chat/:id"  element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/friends"   element={<ProtectedRoute><Friends /></ProtectedRoute>} />
        <Route path="/events"    element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route path="/map"       element={<ProtectedRoute><FriendMap /></ProtectedRoute>} />

        {/* Admin pages */}
        <Route path="/admin"           element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
