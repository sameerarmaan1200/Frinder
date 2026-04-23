import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, Avatar, Btn, Card, EmptyState, useToast } from '../components/UI';
import Navbar from '../components/Navbar';
import FriendCard from '../components/FriendCard';
import { friendAPI } from '../services/api';

export default function Friends() {
  const { show, ToastContainer } = useToast();
  const [tab, setTab]           = useState('friends');
  const [friends, setFriends]   = useState([]);
  const [received, setReceived] = useState([]);
  const [sent, setSent]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [fr, rec, snt] = await Promise.all([
        friendAPI.getFriends(),
        friendAPI.getReceived(),
        friendAPI.getSent(),
      ]);
      setFriends(fr.data.friends || []);
      setReceived(rec.data.requests || []);
      setSent(snt.data.requests || []);
    } catch { show('Failed to load', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAccept = async (req) => {
    try {
      await friendAPI.accept({ request_id: req.request_id });
      setReceived(p => p.filter(r => r.request_id !== req.request_id));
      show(`You and ${req.full_name} are now friends! 🎉`, 'success');
      load();
    } catch { show('Failed', 'error'); }
  };

  const handleDecline = async (req) => {
    try {
      await friendAPI.decline({ request_id: req.request_id });
      setReceived(p => p.filter(r => r.request_id !== req.request_id));
    } catch {}
  };

  const handleCancel = async (req) => {
    try {
      await friendAPI.cancel({ request_id: req.request_id });
      setSent(p => p.filter(r => r.request_id !== req.request_id));
      show('Request cancelled', 'info');
    } catch {}
  };

  const handleUnfriend = async (friendUserId, name) => {
    if (!confirm(`Remove ${name} from friends?`)) return;
    try {
      await friendAPI.unfriend({ user_id: friendUserId });
      setFriends(p => p.filter(f => f.user_id !== friendUserId));
      show('Removed from friends', 'info');
    } catch {}
  };

  const filteredFriends = friends.filter(f =>
    f.full_name.toLowerCase().includes(search.toLowerCase()) ||
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { key: 'friends',  label: 'Friends',   count: friends.length },
    { key: 'received', label: 'Requests',  count: received.length },
    { key: 'sent',     label: 'Sent',      count: sent.length },
  ];

  return (
    <PageWrapper>
      <ToastContainer />
      <Navbar />
      <div className="lg:pl-20 xl:pl-64 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 pt-20 lg:pt-8 pb-24 lg:pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-black text-2xl text-white font-display">Friends 🤝</h1>
              <p className="text-slate-500 text-sm mt-1">{friends.length} friends · {received.length} pending requests</p>
            </div>
            <Link to="/discover"><Btn size="sm">Find Friends 🌍</Btn></Link>
          </div>

          {/* Tabs - with skyblue border */}
          <div className="flex gap-2 mb-6 glass rounded-2xl p-1.5 border-2 border-sky-400/60 shadow-lg shadow-sky-500/20">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
                  ${tab === t.key ? 'bg-primary-500 text-white shadow-glow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                {t.label}
                {t.count > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-primary-500/20 text-primary-400'}`}>{t.count}</span>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Friends list */}
            {tab === 'friends' && (
              <motion.div key="friends" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="🔍 Search friends…"
                  className="w-full mb-4 bg-dark-300 border-2 border-sky-400/60 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-400 px-4 py-3 text-sm shadow-lg shadow-sky-500/20"
                />
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 shimmer rounded-2xl" />)}
                  </div>
                ) : filteredFriends.length === 0 ? (
                  <EmptyState icon="🤝" title={search ? 'No friends match your search' : 'No friends yet'}
                    description={search ? 'Try a different name' : 'Start discovering people from around the world!'}
                    action={!search && <Link to="/discover"><Btn>Discover Friends 🌍</Btn></Link>} />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFriends.map(f => (
                      <Card key={f.user_id} className="p-4 border-2 border-sky-400/60 shadow-lg shadow-sky-500/20">
                        <div className="flex items-center gap-3 mb-3">
                          <Link to={`/profile/${f.user_id}`}>
                            <Avatar src={f.profile_picture} name={f.full_name} size="lg" online={!!f.is_online} />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/profile/${f.user_id}`} className="font-bold text-slate-100 hover:text-primary-400 transition-colors truncate block">{f.full_name}</Link>
                            <p className="text-xs text-slate-500">@{f.username}</p>
                            <p className="text-xs text-slate-600">{f.flag_emoji} {f.country_name}{f.city ? `, ${f.city}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {f.is_online
                            ? <span className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" />Online</span>
                            : <span className="text-xs text-slate-600">Offline</span>
                          }
                          <div className="flex-1" />
                          <Link to={`/chat/${f.user_id}`}><Btn size="sm" variant="ghost" className="!px-2 !py-1 text-xs">💬</Btn></Link>
                          <button onClick={() => handleUnfriend(f.user_id, f.full_name)}
                            className="text-xs text-slate-600 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-all">✕</button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Received requests */}
            {tab === 'received' && (
              <motion.div key="received" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {received.length === 0 ? (
                  <EmptyState icon="📭" title="No pending requests" description="When someone sends you a friend request, it will appear here." />
                ) : (
                  <div className="space-y-3">
                    {received.map(req => (
                      <Card key={req.request_id} className="p-4 border-2 border-sky-400/60 shadow-lg shadow-sky-500/20">
                        <div className="flex items-center gap-4">
                          <Link to={`/profile/${req.user_id}`}>
                            <Avatar src={req.profile_picture} name={req.full_name} size="lg" online={!!req.is_online} />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/profile/${req.user_id}`} className="font-bold text-slate-100 hover:text-primary-400 transition-colors">{req.full_name}</Link>
                            <p className="text-xs text-slate-500">@{req.username} · {req.flag_emoji} {req.country_name}</p>
                            {req.message && <p className="text-xs text-slate-400 mt-1 italic">"{req.message}"</p>}
                            <p className="text-xs text-slate-600 mt-0.5">{new Date(req.sent_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Btn size="sm" onClick={() => handleAccept(req)}>✓ Accept</Btn>
                            <Btn size="sm" variant="ghost" onClick={() => handleDecline(req)}>✕</Btn>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Sent requests */}
            {tab === 'sent' && (
              <motion.div key="sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {sent.length === 0 ? (
                  <EmptyState icon="📤" title="No sent requests" description="Friend requests you've sent will appear here."
                    action={<Link to="/discover"><Btn>Find Friends 🌍</Btn></Link>} />
                ) : (
                  <div className="space-y-3">
                    {sent.map(req => (
                      <Card key={req.request_id} className="p-4 border-2 border-sky-400/60 shadow-lg shadow-sky-500/20">
                        <div className="flex items-center gap-4">
                          <Link to={`/profile/${req.user_id}`}>
                            <Avatar src={req.profile_picture} name={req.full_name} size="lg" />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/profile/${req.user_id}`} className="font-bold text-slate-100 hover:text-primary-400 transition-colors">{req.full_name}</Link>
                            <p className="text-xs text-slate-500">@{req.username} · {req.flag_emoji} {req.country_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-amber-400">⏳ Pending</span>
                              <span className="text-slate-700">·</span>
                              <span className="text-xs text-slate-600">Sent {new Date(req.sent_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Btn size="sm" variant="ghost" onClick={() => handleCancel(req)}>Cancel</Btn>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  );
}