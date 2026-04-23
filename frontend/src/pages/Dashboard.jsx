import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, Card, Avatar, Btn, Skeleton, EmptyState, StatusBadge } from '../components/UI';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import FriendCard from '../components/FriendCard';
import { postAPI, userAPI, friendAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [pendingReqs, setPendingReqs] = useState([]);
  const [friends, setFriends] = useState([]);

  // ⭐ Developer modal state
  const [showDevModal, setShowDevModal] = useState(false);

  // ⭐ Developer data
  const developers = [
    {
      name: 'Kazi Arman Samir',
      image: '/images/developers/ARMAN.png',
      email: 'sameerarmaan1200@gmail.com',
      site: 'https://www.facebook.com/Armansamir1200',
    },
    {
      name: 'A. B. S. Dihan',
      image: '/images/developers/DIHAN.jpeg',
      email: 'absdihan0070@gmail.com',
      site: 'https://www.facebook.com/share/1Dtqm3t2Bj/',
    },
    {
      name: 'Aditya Babu Tanmoy',
      image: '/images/developers/ADITYA.jpg',
      email: 'aditya.b.tanmoy2023@gmail.com',
      site: 'https://aditya-babu-tanmoy.github.io/',
    },
  ];

  const loadFeed = useCallback(async (p = 1, append = false) => {
    if (p === 1) setLoadingFeed(true);
    try {
      const r = await postAPI.getFeed(p);
      const newPosts = r.data.posts || [];
      setPosts(prev => append ? [...prev, ...newPosts] : newPosts);
      setHasMore(newPosts.length === 10);
    } catch {}
    setLoadingFeed(false);
  }, []);

  useEffect(() => {
    loadFeed(1);
    userAPI.discover({ page: 1 }).then(r => setSuggestions((r.data.users || []).slice(0, 4))).catch(() => {});
    friendAPI.getReceived().then(r => setPendingReqs(r.data.requests || [])).catch(() => {});
    friendAPI.getFriends().then(r => setFriends((r.data.friends || []).slice(0, 6))).catch(() => {});
  }, [loadFeed]);

  return (
    <PageWrapper className="lg:pl-20 xl:pl-64 pb-20 lg:pb-0">
      {/* Pass onAboutClick to Navbar */}
      <Navbar onAboutClick={() => setShowDevModal(true)} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        {user?.account_status === 'pending' && (
          <div className="mb-6 p-4 rounded-2xl border-2 border-sky-400/60 shadow-lg shadow-sky-500/20 bg-amber-500/5 flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="text-amber-400 font-semibold text-sm">Account Pending Review</p>
              <p className="text-amber-400/70 text-xs">Our team is verifying your documents. Full access coming soon!</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="hidden lg:flex flex-col gap-4">
            <Card className="p-5 border-2 border-sky-400/60 shadow-lg shadow-sky-500/20">
              <div className="flex flex-col items-center text-center">
                <Avatar src={user?.profile_picture} name={user?.full_name || ''} size="xl" online className="mb-3" />
                <Link to="/profile" className="font-bold text-slate-100 hover:text-primary-400 transition-colors">
                  {user?.full_name}
                </Link>
                <p className="text-xs text-slate-500 mb-2">@{user?.username}</p>
                <StatusBadge status={user?.account_status} />
              </div>
            </Card>

            {friends.length > 0 && (
              <Card className="p-4 border-2 border-sky-400/60 shadow-lg shadow-sky-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Friends Online</h3>
                  <Link to="/friends" className="text-xs text-primary-400">See all</Link>
                </div>
                {friends.map(f => (
                  <Link
                    key={f.user_id}
                    to={`/chat/${f.user_id}`}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-primary-500/5 transition-colors group"
                  >
                    <Avatar src={f.profile_picture} name={f.full_name} size="sm" online={!!f.is_online} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-primary-400 transition-colors">
                        {f.full_name}
                      </p>
                      <p className="text-xs text-slate-600">{f.is_online ? '🟢 Online' : '⚫ Offline'}</p>
                    </div>
                  </Link>
                ))}
              </Card>
            )}

            <Card className="p-4 border-2 border-sky-400/60 shadow-lg shadow-sky-500/20">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Links</h3>
              <div className="flex flex-col">
                {[
                  ['🌐 Discover Friends', '/discover'],
                  ['💬 Messages', '/chat'],
                  ['🎉 Events', '/events'],
                  ['🗺️ Friend Map', '/map'],
                ].map(([label, to]) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-2 py-2 text-sm text-slate-500 hover:text-primary-400 transition-colors border-b border-white/20 last:border-0"
                  >
                    {label}
                  </Link>
                ))}
                {/* About Us button inside Quick Links */}
                <button
                  onClick={() => setShowDevModal(true)}
                  className="flex items-center gap-2 py-2 text-sm text-slate-500 hover:text-sky-400 transition-colors text-left w-full border-b border-white/20 last:border-0"
                >
                  <span>✨</span> About Us <span>✨</span>
                </button>
              </div>
            </Card>
          </div>

          {/* Feed */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {user?.account_status === 'verified' && <CreatePost onCreated={p => setPosts(prev => [p, ...prev])} />}

            {pendingReqs.length > 0 && (
              <Card className="p-4 border-2 border-sky-400/60 shadow-lg shadow-sky-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-200 text-sm">Friend Requests ({pendingReqs.length})</h3>
                  <Link to="/friends" className="text-xs text-primary-400">View all</Link>
                </div>
                {pendingReqs.slice(0, 2).map(req => (
                  <div key={req.request_id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary-500/5">
                    <Avatar src={req.profile_picture} name={req.full_name} size="sm" online={!!req.is_online} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{req.full_name}</p>
                      <p className="text-xs text-slate-500">{req.flag_emoji} {req.country_name}</p>
                    </div>
                    <Link to="/friends">
                      <Btn size="sm">Respond</Btn>
                    </Link>
                  </div>
                ))}
              </Card>
            )}

            {loadingFeed ? (
              <div className="flex flex-col gap-4">
                {[1, 2].map(i => (
                  <Card key={i} className="p-4 border-2 border-sky-400/60 shadow-lg shadow-sky-500/20">
                    <div className="flex gap-3 mb-4">
                      <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-1/3 mb-2" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                    <Skeleton className="h-20 w-full mb-3" />
                    <Skeleton className="h-3 w-1/3" />
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <EmptyState
                icon="🌍"
                title="Your feed is empty"
                description="Add friends or discover people to see posts here!"
                action={
                  <Link to="/discover">
                    <Btn>Discover Friends →</Btn>
                  </Link>
                }
              />
            ) : (
              <>
                {posts.map((post, i) => (
                  <motion.div
                    key={post.post_id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-2xl border-2 border-sky-400/60 shadow-lg shadow-sky-500/20 overflow-hidden"
                  >
                    <PostCard post={post} onDelete={id => setPosts(p => p.filter(x => x.post_id !== id))} />
                  </motion.div>
                ))}
                {hasMore && (
                  <div className="text-center pt-2">
                    <Btn
                      variant="secondary"
                      onClick={() => {
                        const next = page + 1;
                        setPage(next);
                        loadFeed(next, true);
                      }}
                    >
                      Load More
                    </Btn>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Developer Modal */}
      <AnimatePresence>
        {showDevModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDevModal(false)}
          >
            <motion.div
              className="glass rounded-2xl border-2 border-sky-400/60 shadow-2xl shadow-sky-500/30 w-full max-w-3xl p-6"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black font-display text-white">👨‍💻 Meet the Developers</h2>
                <button
                  onClick={() => setShowDevModal(false)}
                  className="text-slate-400 hover:text-white transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {developers.map((dev, idx) => (
                  <motion.div
                    key={dev.email}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-dark-400/40 rounded-xl p-5 border-2 border-sky-400/60 flex flex-col items-center text-center"
                  >
                    <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-sky-400/60 mb-4 shadow-md">
                      <img
                        src={dev.image}
                        alt={dev.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/112?text=' + dev.name.charAt(0);
                        }}
                      />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{dev.name}</h3>
                    <div className="flex flex-col gap-2 w-full mt-3">
                      {/* Fixed mailto link */}
                      <a
  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${dev.email}&su=Hello%20from%20Frinder`}
  target="_blank"
  rel="noopener noreferrer"
  className="w-full py-2 px-3 bg-primary-500/20 hover:bg-primary-500/40 text-primary-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
>
  <span>📧</span> Contact me
</a>
                      <a
                        href={dev.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <span>🌐</span> Website
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>

              <p className="text-center text-slate-400 text-sm mt-6 italic border-t border-sky-400/30 pt-5">
                ✨ Your one contact inspires us a lot ✨
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}