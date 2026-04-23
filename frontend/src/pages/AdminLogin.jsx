import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageWrapper, Input, Btn, useToast } from '../components/UI'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { show, ToastContainer } = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('frinder_admin_token')) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [navigate])

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      show('Enter email and password', 'error')
      return
    }
    setLoading(true)
    try {
      // Use fetch directly — admin.php does NOT use axios interceptors
      const response = await fetch('/api/admin/admin.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await response.json()

      if (!data.success) {
        show(data.message || 'Invalid email or password', 'error')
        return
      }

      // admin.php respond() wraps payload in data.data
      // Structure: { success:true, message:'...', data:{ admin:{...}, token:'...' } }
      const token     = data.data?.token     ?? data.token
      const adminName = data.data?.admin?.admin_name ?? data.admin?.admin_name ?? 'Admin'

      if (!token) {
        show('Server returned no token. Check admin.php helpers.php respond() format.', 'error')
        return
      }

      localStorage.setItem('frinder_admin_token', token)
      localStorage.setItem('frinder_admin_name', adminName)
      show('Welcome to Admin Panel!', 'success')
      setTimeout(() => navigate('/admin/dashboard', { replace: true }), 300)
    } catch (e) {
      show('Cannot connect to server. Check XAMPP is running.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      <ToastContainer />
      <div className="min-h-screen flex items-center justify-center px-4 bg-animated">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-3xl border border-primary-500/20 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-3xl mx-auto mb-4 shadow-glow">
                🛡️
              </div>
              <h1 className="font-black text-2xl text-white font-display">Admin Panel</h1>
              <p className="text-slate-500 text-sm mt-1">Frinder Administration Access</p>
            </div>
            <div className="flex flex-col gap-4">
              <Input
                label="Admin Email"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="your@gmail.com"
                icon="✉️"
              />
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Admin password"
                icon="🔒"
              />
              <Btn onClick={handleLogin} loading={loading} className="w-full mt-2">
                Access Admin Panel →
              </Btn>
            </div>
            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-slate-500 hover:text-primary-400 transition-colors">
                ← Back to User Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}