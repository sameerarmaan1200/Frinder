import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper, Card, Avatar, Btn, Input, StatusBadge, useToast, EmptyState } from '../components/UI'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { show, ToastContainer } = useToast()
  const abortRef = useRef(null)

  const [tab,     setTab]     = useState('analytics')
  const [ready,   setReady]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const [analytics, setAnalytics] = useState(null)
  const [pending,   setPending]   = useState(null)
  const [users,     setUsers]     = useState(null)
  const [reports,   setReports]   = useState(null)
  const [fraud,     setFraud]     = useState(null)
  const [userSearch, setUserSearch] = useState('')

  const adminName = localStorage.getItem('frinder_admin_name') || 'Admin'
  const unpack = (payload) => (
    payload?.data && typeof payload.data === 'object'
      ? { ...payload, ...payload.data, data: payload.data }
      : payload
  )

  const apiFetch = async (action, opts = {}) => {
    const token = localStorage.getItem('frinder_admin_token')
    if (!token) { navigate('/admin', { replace: true }); return null }
    const res = await fetch(`/api/admin/admin.php?action=${action}`, {
      ...opts,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers||{}) },
    })
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('frinder_admin_token')
      localStorage.removeItem('frinder_admin_name')
      navigate('/admin', { replace: true })
      return null
    }
    return unpack(await res.json())
  }

  useEffect(() => {
    const token = localStorage.getItem('frinder_admin_token')
    if (!token) { navigate('/admin', { replace: true }); return }
    ;(async () => {
      try {
        const data = await apiFetch('analytics')
        if (!data) return
        if (data.success) { setAnalytics(data) }
        else {
          localStorage.removeItem('frinder_admin_token')
          localStorage.removeItem('frinder_admin_name')
          navigate('/admin', { replace: true })
          return
        }
      } catch { setError('Cannot reach server. Check XAMPP is running.') }
      setReady(true)
    })()
  }, [])

  const loadTab = async (key, force = false) => {
    setTab(key)
    setError('')
    const cache = { analytics, pending, users, reports, fraud }
    if (!force && cache[key] !== null) return
    setLoading(true)
    try {
      const data = await apiFetch(key)
      if (!data) return
      if (!data.success) { setError(data.message || `Failed to load ${key}`); return }
      switch (key) {
        case 'analytics': setAnalytics(data); break
        case 'pending':   setPending(data.users || data.data?.users || []); break
        case 'users':     setUsers(data.users || data.data?.users || []); break
        case 'reports':   setReports(data.reports || data.data?.reports || []); break
        case 'fraud':     setFraud(data.users || data.data?.users || []); break
      }
    } catch (e) {
      if (e.name !== 'AbortError') setError('Load failed. Check XAMPP is running.')
    } finally { setLoading(false) }
  }

  const adminAction = async (action, body) =>
    apiFetch(action, { method: 'POST', body: JSON.stringify(body) })

  const invalidate = (key, setter) => { setter(null); loadTab(key, true) }

  const approve = async (id) => {
    const d = await adminAction('approve', { user_id: id })
    d?.success ? (show('User approved', 'success'), invalidate('pending', setPending)) : show(d?.message||'Failed','error')
  }
  const reject = async (id) => {
    const reason = prompt('Rejection reason:') || 'Document invalid'
    const d = await adminAction('reject', { user_id: id, reason })
    d?.success ? (show('User rejected','info'), invalidate('pending', setPending)) : show(d?.message||'Failed','error')
  }
  const suspend = async (id) => {
    if (!confirm('Suspend this user?')) return
    const d = await adminAction('suspend', { user_id: id })
    if (d?.success) {
      show('User suspended','info')
      if (tab === 'users')   invalidate('users', setUsers)
      if (tab === 'pending') invalidate('pending', setPending)
      if (tab === 'fraud')   invalidate('fraud', setFraud)
    } else show(d?.message||'Failed','error')
  }
  const resolveReport = async (id) => {
    const d = await adminAction('resolve_report', { report_id: id })
    d?.success ? (show('Resolved','success'), invalidate('reports', setReports)) : show(d?.message||'Failed','error')
  }
  const logout = () => {
    localStorage.removeItem('frinder_admin_token')
    localStorage.removeItem('frinder_admin_name')
    navigate('/admin', { replace: true })
  }

  if (!ready) return (
    <div className="min-h-screen bg-dark-500 flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 text-sm">Verifying admin access...</p>
    </div>
  )

  const tabs = [
    { key: 'analytics', icon: '📊', label: 'Analytics' },
    { key: 'pending',   icon: '⏳', label: `Pending${Array.isArray(pending) && pending.length ? ` (${pending.length})` : ''}` },
    { key: 'users',     icon: '👥', label: 'Users' },
    { key: 'reports',   icon: '🚩', label: `Reports${Array.isArray(reports) ? ` (${reports.filter(r=>r.status==='pending').length||''})` : ''}` },
    { key: 'fraud',     icon: '🔍', label: 'Fraud' },
  ]
  const cache = { analytics, pending, users, reports, fraud }
  const isLoaded = cache[tab] !== null

  return (
    <PageWrapper>
      <ToastContainer />
      <div className="min-h-screen flex flex-col">

        <header className="glass-dark border-b border-primary-500/10 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black text-sm">F</div>
            <div className="hidden sm:block">
              <span className="font-black text-base gradient-text font-display tracking-widest">FRINDER</span>
              <span className="ml-2 text-xs text-slate-500 border border-slate-700 px-2 py-0.5 rounded-full font-semibold">ADMIN</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden md:block">👋 {adminName}</span>
            <button onClick={() => navigate('/dashboard')} className="text-xs text-slate-500 hover:text-primary-400 px-2.5 py-1.5 rounded-lg hover:bg-primary-500/10 font-medium transition-colors">
              🌐 App
            </button>
            <Btn size="sm" variant="ghost" onClick={logout}>Logout</Btn>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-14 md:w-52 glass-dark border-r border-primary-500/10 flex flex-col p-2 gap-1 flex-shrink-0">
            {tabs.map(t => (
              <button key={t.key} onClick={() => loadTab(t.key)}
                className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-semibold transition-all w-full text-left ${
                  tab === t.key ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}>
                <span className="text-lg flex-shrink-0">{t.icon}</span>
                <span className="hidden md:block truncate">{t.label}</span>
              </button>
            ))}
            <div className="mt-auto pt-3 border-t border-primary-500/10">
              <button onClick={() => loadTab(tab, true)}
                className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-400 hover:bg-white/5 w-full transition-all">
                <span>🔄</span><span className="hidden md:block">Refresh</span>
              </button>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                <span>⚠️</span><span className="flex-1">{error}</span>
                <button onClick={() => setError('')} className="text-red-400/60 hover:text-red-400 font-bold">✕</button>
              </div>
            )}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-sm">Loading {tab}...</p>
              </div>
            )}

            {!loading && tab === 'analytics' && (
              <div className="space-y-5">
                <h2 className="font-black text-xl text-white font-display">📊 Platform Analytics</h2>
                {!analytics ? <EmptyState icon="📊" title="No data" description="Refresh to load" /> : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                      {[
                        { label: 'Total Users',  value: analytics.stats?.totalUsers,    icon: '👥', c: 'text-primary-400' },
                        { label: 'Verified',     value: analytics.stats?.verifiedUsers,  icon: '✅', c: 'text-emerald-400' },
                        { label: 'Pending',      value: analytics.stats?.pendingUsers,   icon: '⏳', c: 'text-amber-400'   },
                        { label: 'Posts',        value: analytics.stats?.totalPosts,     icon: '📝', c: 'text-purple-400'  },
                        { label: 'Messages',     value: analytics.stats?.totalMessages,  icon: '💬', c: 'text-blue-400'    },
                        { label: 'Friendships',  value: analytics.stats?.totalFriends,   icon: '🤝', c: 'text-pink-400'    },
                        { label: 'Open Reports', value: analytics.stats?.totalReports,   icon: '🚩', c: 'text-red-400'     },
                      ].map((s, i) => (
                        <Card key={i} className="p-4 text-center">
                          <div className="text-2xl mb-1">{s.icon}</div>
                          <div className={`font-black text-2xl ${s.c}`}>{s.value ?? 0}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                        </Card>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {Array.isArray(analytics.top_countries) && analytics.top_countries.length > 0 && (
                        <Card className="p-5">
                          <h3 className="font-bold text-slate-300 mb-4">🌍 Top Countries</h3>
                          <div className="space-y-2.5">
                            {analytics.top_countries.map((c, i) => {
                              const pct = Math.round((c.user_count / analytics.top_countries[0].user_count) * 100)
                              return (
                                <div key={i} className="flex items-center gap-2">
                                  <span className="w-6 text-base">{c.flag_emoji}</span>
                                  <span className="text-xs text-slate-400 w-24 truncate">{c.country_name}</span>
                                  <div className="flex-1 bg-dark-400 rounded-full h-1.5 overflow-hidden">
                                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-xs font-bold text-slate-500 w-5 text-right">{c.user_count}</span>
                                </div>
                              )
                            })}
                          </div>
                        </Card>
                      )}
                      {Array.isArray(analytics.daily_registrations) && analytics.daily_registrations.length > 0 && (
                        <Card className="p-5">
                          <h3 className="font-bold text-slate-300 mb-4">📈 New Users — Last 7 Days</h3>
                          <div className="flex items-end gap-1.5 h-20">
                            {analytics.daily_registrations.map((d, i) => {
                              const max = Math.max(...analytics.daily_registrations.map(x => Number(x.count)))
                              const pct = max ? Math.round((Number(d.count) / max) * 100) : 0
                              return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                                  <span className="text-xs text-slate-500">{d.count}</span>
                                  <div className="w-full rounded-t-sm" style={{ height: `${Math.max(6, pct)}%`, background: 'linear-gradient(to top,#0066ff,#3b9eff)', minHeight: 6 }} />
                                  <span className="text-xs text-slate-600 truncate w-full text-center">
                                    {new Date(d.day).toLocaleDateString('en',{weekday:'short'})}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </Card>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {!loading && tab === 'pending' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-xl text-white font-display">
                    ⏳ Pending Verifications {Array.isArray(pending) && <span className="text-base text-slate-500 font-normal ml-1">({pending.length})</span>}
                  </h2>
                  <Btn size="sm" variant="secondary" onClick={() => invalidate('pending', setPending)}>Refresh</Btn>
                </div>
                {!isLoaded ? <EmptyState icon="⏳" title="Not loaded yet" description="Select this tab to load" />
                : pending.length === 0 ? <EmptyState icon="✅" title="All clear!" description="No pending verifications" />
                : pending.map(u => (
                  <Card key={u.user_id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Avatar name={u.full_name} size="lg" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <h3 className="font-bold text-slate-100 text-sm">{u.full_name}</h3>
                            <StatusBadge status={u.account_status} />
                          </div>
                          <p className="text-xs text-slate-500">@{u.username} · {u.email}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{u.flag_emoji} {u.country_name} · {new Date(u.created_at).toLocaleDateString()}</p>
                          <div className="flex gap-3 mt-1.5 flex-wrap text-xs">
                            <span className="text-primary-400 font-medium">Score: {u.verification_score ?? 0}/100</span>
                            {u.document_type && <span className="text-slate-500 capitalize">{u.document_type.replace('_',' ')}</span>}
                            {u.location_mismatch == 1 && <span className="text-amber-400">⚠️ Location mismatch</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                        <Btn size="sm" variant="success" onClick={() => approve(u.user_id)}>✓ Approve</Btn>
                        <Btn size="sm" variant="danger"  onClick={() => reject(u.user_id)}>✕ Reject</Btn>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!loading && tab === 'users' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="font-black text-xl text-white font-display">👥 All Users</h2>
                  <Input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search name or email..." className="w-52" />
                  <Btn size="sm" variant="secondary" onClick={() => invalidate('users', setUsers)}>Refresh</Btn>
                </div>
                {!isLoaded ? <EmptyState icon="👥" title="Not loaded" description="Click Users in sidebar" />
                : users.length === 0 ? <EmptyState icon="👥" title="No users found" />
                : (
                  <div className="space-y-2">
                    {users.filter(u => !userSearch ||
                      u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.username?.toLowerCase().includes(userSearch.toLowerCase())
                    ).map(u => (
                      <Card key={u.user_id} className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.full_name} size="md" online={!!u.is_online} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-100 text-sm">{u.full_name}</span>
                              <StatusBadge status={u.account_status} />
                              <span className="text-xs text-slate-600">@{u.username}</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{u.email} · {u.country_name}</p>
                            <p className="text-xs text-slate-600">{new Date(u.created_at).toLocaleDateString()}</p>
                          </div>
                          {u.account_status !== 'suspended'
                            ? <Btn size="sm" variant="danger" onClick={() => suspend(u.user_id)}>Suspend</Btn>
                            : <span className="text-xs text-slate-600 px-2 py-1 rounded border border-slate-700">Suspended</span>
                          }
                        </div>
                      </Card>
                    ))}
                    <p className="text-xs text-slate-600 text-center pt-1">Showing up to 20 users per page</p>
                  </div>
                )}
              </div>
            )}

            {!loading && tab === 'reports' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-xl text-white font-display">
                    🚩 Reports {Array.isArray(reports) && <span className="text-base text-slate-500 font-normal ml-1">({reports.length})</span>}
                  </h2>
                  <Btn size="sm" variant="secondary" onClick={() => invalidate('reports', setReports)}>Refresh</Btn>
                </div>
                {!isLoaded ? <EmptyState icon="🚩" title="Not loaded" description="Click Reports in sidebar" />
                : reports.length === 0 ? <EmptyState icon="✅" title="No reports" description="Nothing to review!" />
                : reports.map(r => (
                  <Card key={r.report_id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap text-sm">
                          <span className="font-semibold text-slate-200">{r.reported_name}</span>
                          <span className="text-slate-600 text-xs">reported by</span>
                          <span className="font-semibold text-slate-200">{r.reporter_name}</span>
                        </div>
                        <span className="inline-block text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full capitalize">
                          {r.reason?.replace(/_/g,' ')}
                        </span>
                        {r.description && <p className="text-xs text-slate-500 mt-1.5">{r.description}</p>}
                        <p className="text-xs text-slate-600 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={r.status} />
                        {r.status === 'pending' && (
                          <Btn size="sm" variant="success" onClick={() => resolveReport(r.report_id)}>Resolve</Btn>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!loading && tab === 'fraud' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-xl text-white font-display">
                    🔍 Fraud Alerts {Array.isArray(fraud) && <span className="text-base text-slate-500 font-normal ml-1">({fraud.length})</span>}
                  </h2>
                  <Btn size="sm" variant="secondary" onClick={() => invalidate('fraud', setFraud)}>Refresh</Btn>
                </div>
                {!isLoaded ? <EmptyState icon="🔍" title="Not loaded" description="Click Fraud in sidebar" />
                : fraud.length === 0 ? <EmptyState icon="🛡️" title="No fraud alerts" description="Platform looks clean!" />
                : fraud.map(u => (
                  <Card key={u.user_id} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-slate-100">{u.full_name}</span>
                          <span className="text-xs text-slate-500">@{u.username}</span>
                          <StatusBadge status={u.account_status} />
                        </div>
                        <div className="flex gap-4 text-xs flex-wrap">
                          <span className="text-red-400 font-semibold">Fraud: {u.fraud_score}</span>
                          {u.location_mismatch == 1 && <span className="text-amber-400">⚠️ Location mismatch</span>}
                          <span className="text-slate-500">Verify: {u.verification_score}/100</span>
                        </div>
                      </div>
                      {u.account_status !== 'suspended' && (
                        <Btn size="sm" variant="danger" onClick={() => suspend(u.user_id)}>Suspend</Btn>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

          </main>
        </div>
      </div>
    </PageWrapper>
  )
}
