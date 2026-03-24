import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageWrapper, Card, Avatar, Btn, Input, StatusBadge, useToast, EmptyState } from '../components/UI'
import { adminAPI } from '../services/api'

export default function AdminDashboard() {
  const { show, ToastContainer } = useToast()
  const [tab, setTab]     = useState('analytics')
  const [authed, setAuthed] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [adminToken, setAdminToken] = useState(localStorage.getItem('frinder_admin_token') || '')
  const [loading, setLoading] = useState(false)

  const [analytics, setAnalytics] = useState(null)
  const [pending, setPending]     = useState([])
  const [users, setUsers]         = useState([])
  const [reports, setReports]     = useState([])
  const [fraud, setFraud]         = useState([])
  const [userSearch, setUserSearch] = useState('')

  useEffect(() => {
    if (adminToken) {
      // Set admin token for API calls
      const origGet = localStorage.getItem
      setAuthed(true)
      loadTab('analytics')
    }
  }, [adminToken])

  const setAdminHeader = () => {
    // Temporarily patch axios for admin calls
    const token = localStorage.getItem('frinder_admin_token')
    return token
  }

  const adminFetch = async (fn) => {
    const token = localStorage.getItem('frinder_admin_token')
    const origToken = localStorage.getItem('frinder_token')
    localStorage.setItem('frinder_token', `admin:${token}`)
    try { return await fn() }
    finally {
  if (origToken) {
    localStorage.setItem('frinder_token', origToken);
  } else {
    localStorage.removeItem('frinder_token');
  }
}


  const handleLogin = async () => {
    setLoading(true)
    try {
      const r = await adminAPI.login(loginForm)
      const token = btoa(`${loginForm.email}:${r.data.admin?.admin_id}`)
      // Store admin credentials for API
      localStorage.setItem('frinder_admin_token', r.data.token)
      setAdminToken(r.data.token)
      setAuthed(true)
      show('Admin logged in!', 'success')
    } catch (e) { show(e.response?.data?.message || 'Invalid credentials', 'error') }
    finally { setLoading(false) }
  }

  const loadTab = async (t) => {
    setTab(t)
    setLoading(true)
    try {
      const token = localStorage.getItem('frinder_admin_token')
      const headers = { Authorization: `Bearer ${token}` }
      const base = '/api/admin/admin.php'

      const r = await fetch(`${base}?action=${t}`, { headers })
      const data = await r.json()

      if (t === 'analytics') setAnalytics(data)
      if (t === 'pending')   setPending(data.users || [])
      if (t === 'users')     setUsers(data.users || [])
      if (t === 'reports')   setReports(data.reports || [])
      if (t === 'fraud')     setFraud(data.users || [])
    } catch { show('Failed to load data', 'error') }
    finally { setLoading(false) }
  }

  const adminPost = async (action, body) => {
    const token = localStorage.getItem('frinder_admin_token')
    const r = await fetch(`/api/admin/admin.php?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    })
    return r.json()
  }

  const handleApprove = async (userId) => {
    await adminPost('approve', { user_id: userId })
    show('User approved!', 'success')
    loadTab('pending')
  }

  const handleReject = async (userId) => {
    const reason = prompt('Rejection reason:') || 'Document invalid'
    await adminPost('reject', { user_id: userId, reason })
    show('User rejected', 'info')
    loadTab('pending')
  }

  const handleSuspend = async (userId) => {
    if (!confirm('Suspend this user?')) return
    await adminPost('suspend', { user_id: userId })
    show('User suspended', 'info')
    loadTab(tab)
  }

  const handleResolveReport = async (reportId) => {
    await adminPost('resolve_report', { report_id: reportId })
    show('Report resolved', 'success')
    loadTab('reports')
  }

  if (!authed) return (
    <PageWrapper>
      <ToastContainer />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md glass rounded-3xl border border-primary-500/20 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl mx-auto mb-4">🛡️</div>
            <h1 className="font-black text-2xl text-white font-display">Admin Panel</h1>
            <p className="text-slate-500 text-sm mt-1">Frinder Administration</p>
            <p className="text-xs text-slate-600 mt-2">Default: admin@frinder.com / password</p>
          </div>
          <div className="flex flex-col gap-4">
            <Input label="Admin Email" type="email" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} placeholder="admin@frinder.com" icon="✉️" />
            <Input label="Password" type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} placeholder="Admin password" icon="🔒" />
            <Btn onClick={handleLogin} loading={loading} className="w-full">Access Admin Panel →</Btn>
          </div>
        </div>
      </div>
    </PageWrapper>
  )

  const tabs = [
    { key: 'analytics', icon: '📊', label: 'Analytics' },
    { key: 'pending',   icon: '⏳', label: `Pending${pending.length ? ` (${pending.length})` : ''}` },
    { key: 'users',     icon: '👥', label: 'Users' },
    { key: 'reports',   icon: '🚩', label: `Reports${reports.filter(r => r.status === 'pending').length ? ` (${reports.filter(r => r.status === 'pending').length})` : ''}` },
    { key: 'fraud',     icon: '🔍', label: 'Fraud' },
  ]

  return (
    <PageWrapper>
      <ToastContainer />
      <div className="min-h-screen flex flex-col">
        {/* Admin header */}
        <header className="glass-dark border-b border-primary-500/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black">F</div>
            <div>
              <span className="font-black text-lg gradient-text font-display">FRINDER</span>
              <span className="ml-2 text-xs text-slate-500 font-semibold border border-slate-700 px-2 py-0.5 rounded-full">ADMIN</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">← Back to App</a>
            <Btn size="sm" variant="ghost" onClick={() => { localStorage.removeItem('frinder_admin_token'); setAuthed(false) }}>Logout</Btn>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-16 md:w-56 glass-dark border-r border-primary-500/10 flex flex-col p-3 gap-1">
            {tabs.map(t => (
              <button key={t.key} onClick={() => loadTab(t.key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${tab === t.key ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-primary-500/5'}`}>
                <span className="text-lg">{t.icon}</span>
                <span className="hidden md:block">{t.label}</span>
              </button>
            ))}
          </aside>

          {/* Main */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {loading && <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>}

            {/* Analytics */}
            {!loading && tab === 'analytics' && analytics && (
              <div className="space-y-6">
                <h2 className="font-black text-xl text-white font-display">Platform Analytics</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: analytics.stats?.totalUsers, icon: '👥', color: 'text-primary-400' },
                    { label: 'Verified', value: analytics.stats?.verifiedUsers, icon: '✓', color: 'text-emerald-400' },
                    { label: 'Pending', value: analytics.stats?.pendingUsers, icon: '⏳', color: 'text-amber-400' },
                    { label: 'Total Posts', value: analytics.stats?.totalPosts, icon: '📝', color: 'text-purple-400' },
                    { label: 'Messages', value: analytics.stats?.totalMessages, icon: '💬', color: 'text-blue-400' },
                    { label: 'Friendships', value: analytics.stats?.totalFriends, icon: '🤝', color: 'text-pink-400' },
                    { label: 'Open Reports', value: analytics.stats?.totalReports, icon: '🚩', color: 'text-red-400' },
                  ].map((s, i) => (
                    <Card key={i} className="p-4 text-center">
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className={`font-black text-2xl ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-slate-500">{s.label}</div>
                    </Card>
                  ))}
                </div>

                {/* Top countries */}
                {analytics.top_countries?.length > 0 && (
                  <Card className="p-5">
                    <h3 className="font-bold text-slate-300 mb-4">Top Countries</h3>
                    <div className="space-y-3">
                      {analytics.top_countries.map((c, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-lg w-8">{c.flag_emoji}</span>
                          <span className="flex-1 text-sm text-slate-300">{c.country_name}</span>
                          <div className="flex-1 bg-dark-400 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(c.user_count / analytics.top_countries[0].user_count) * 100}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-400 w-8 text-right">{c.user_count}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Pending verifications */}
            {!loading && tab === 'pending' && (
              <div className="space-y-4">
                <h2 className="font-black text-xl text-white font-display">Pending Verifications ({pending.length})</h2>
                {pending.length === 0 ? <EmptyState icon="✅" title="No pending verifications" /> : (
                  pending.map(u => (
                    <Card key={u.user_id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar name={u.full_name} size="lg" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-bold text-slate-100">{u.full_name}</h3>
                              <StatusBadge status={u.account_status} />
                              <span className="text-xs text-slate-500">@{u.username}</span>
                            </div>
                            <p className="text-xs text-slate-500">{u.email}</p>
                            <p className="text-xs text-slate-600 mt-1">{u.flag_emoji} {u.country_name} · Joined {new Date(u.created_at).toLocaleDateString()}</p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap text-xs">
                              <span className="text-primary-400">Score: {u.verification_score}/100</span>
                              {u.document_type && <span className="text-slate-500">Doc: {u.document_type}</span>}
                              {u.location_mismatch == 1 && <span className="text-amber-400">⚠️ Location mismatch</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Btn size="sm" variant="success" onClick={() => handleApprove(u.user_id)}>✓ Approve</Btn>
                          <Btn size="sm" variant="danger" onClick={() => handleReject(u.user_id)}>✕ Reject</Btn>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Users */}
            {!loading && tab === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-black text-xl text-white font-display">All Users</h2>
                  <Input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search…" className="w-48 !gap-0" />
                </div>
                <div className="space-y-2">
                  {users.filter(u => !userSearch || u.full_name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                    <Card key={u.user_id} className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar name={u.full_name} size="md" online={!!u.is_online} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-100 text-sm">{u.full_name}</span>
                            <StatusBadge status={u.account_status} />
                          </div>
                          <p className="text-xs text-slate-500">{u.email} · {u.country_name}</p>
                          <p className="text-xs text-slate-600">{new Date(u.created_at).toLocaleDateString()}</p>
                        </div>
                        {u.account_status === 'verified' && (
                          <Btn size="sm" variant="danger" onClick={() => handleSuspend(u.user_id)}>Suspend</Btn>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Reports */}
            {!loading && tab === 'reports' && (
              <div className="space-y-4">
                <h2 className="font-black text-xl text-white font-display">Reports ({reports.length})</h2>
                {reports.length === 0 ? <EmptyState icon="✅" title="No reports" /> : (
                  reports.map(r => (
                    <Card key={r.report_id} className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-slate-200">{r.reported_name}</span>
                            <span className="text-xs text-slate-600">reported by</span>
                            <span className="text-sm font-semibold text-slate-200">{r.reporter_name}</span>
                          </div>
                          <p className="text-xs font-semibold text-red-400 capitalize">{r.reason.replace('_', ' ')}</p>
                          {r.description && <p className="text-xs text-slate-500 mt-1">{r.description}</p>}
                          <p className="text-xs text-slate-600 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={r.status} />
                          {r.status === 'pending' && (
                            <Btn size="sm" variant="success" onClick={() => handleResolveReport(r.report_id)}>Resolve</Btn>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Fraud */}
            {!loading && tab === 'fraud' && (
              <div className="space-y-4">
                <h2 className="font-black text-xl text-white font-display">Fraud Alerts ({fraud.length})</h2>
                {fraud.length === 0 ? <EmptyState icon="🛡️" title="No fraud alerts" /> : (
                  fraud.map(u => (
                    <Card key={u.user_id} className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-slate-100">{u.full_name}</span>
                            <StatusBadge status={u.account_status} />
                          </div>
                          <div className="flex gap-4 text-xs">
                            <span className="text-red-400">Fraud Score: {u.fraud_score}</span>
                            {u.location_mismatch == 1 && <span className="text-amber-400">⚠️ Location mismatch</span>}
                            <span className="text-slate-500">Verification: {u.verification_score}/100</span>
                          </div>
                        </div>
                        <Btn size="sm" variant="danger" onClick={() => handleSuspend(u.user_id)}>Suspend</Btn>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </PageWrapper>
  )
}
}