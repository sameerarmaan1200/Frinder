import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { PageWrapper, Btn, Avatar, Tag } from '../components/UI'
import GuestBanner from '../components/GuestBanner'
import { useAuthPrompt } from '../components/AuthPrompt'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const stats = [
  { value: '180+', label: 'Countries' },
  { value: '8', label: 'Demo Users' },
  { value: '35+', label: 'API Endpoints' },
  { value: '100%', label: 'Friendship Only' },
]

const features = [
  { icon: '🛡️', title: '2-Step Verified', desc: 'Email OTP + government document + live selfie. Every user is provably real.' },
  { icon: '🌍', title: 'Global Discovery', desc: 'Find friends from 180+ countries filtered by interests, language & culture.' },
  { icon: '💬', title: 'Real-time Chat', desc: 'Instant messaging with read receipts, typing indicators & image sharing.' },
  { icon: '🎯', title: 'Smart Matching', desc: 'Compatibility scoring based on shared interests, language & location.' },
  { icon: '🗺️', title: 'Friend Map', desc: 'See your global friendship network on an interactive world map.' },
  { icon: '🎉', title: 'Events & Groups', desc: 'Create meetups, calls, and communities with your friends worldwide.' },
]

// Sample public posts shown to guests
const SAMPLE_POSTS = [
  { id: 1, name: 'James Okafor', av: 'JO', color: '#7c3aed', flag: '🇳🇬', country: 'Nigeria', time: '2h ago', text: 'New beat just dropped! 🎵🌍 Mixing Afrobeats with electronic sounds. The fusion of cultures in music is what makes it truly magical.', likes: 24, comments: 5 },
  { id: 2, name: 'Tariq Khan', av: 'TK', color: '#0891b2', flag: '🇧🇩', country: 'Bangladesh', time: '5h ago', text: 'Excited to announce we just crossed 100 users on our startup! 🚀 The journey of a thousand miles begins with one step.', likes: 19, comments: 3 },
  { id: 3, name: 'Sofia Rivera', av: 'SR', color: '#be185d', flag: '🇮🇳', country: 'India', time: '1d ago', text: 'Golden hour in Mumbai never disappoints 📸✨ Every sunset here tells a different story. So grateful for this view.', likes: 8, comments: 2 },
]

// Sample users shown to guests
const SAMPLE_USERS = [
  { id: 2, name: 'James Okafor', un: 'james_o', av: 'JO', color: '#7c3aed', country: 'Nigeria', flag: '🇳🇬', age: 28, bio: 'Music producer & football fan', interests: ['Music', 'Sports'], online: true, score: 75 },
  { id: 3, name: 'Tariq Khan', un: 'tariq_k', av: 'TK', color: '#0891b2', country: 'Bangladesh', flag: '🇧🇩', age: 30, bio: 'Tech entrepreneur & cricket fan', interests: ['Coding', 'Sports'], online: true, score: 80 },
  { id: 4, name: 'Sofia Rivera', un: 'sofia_r', av: 'SR', color: '#be185d', country: 'India', flag: '🇮🇳', age: 24, bio: 'Traveler & photographer', interests: ['Travel', 'Photography'], online: false, score: 60 },
  { id: 5, name: 'Lucas Müller', un: 'lucas_m', av: 'LM', color: '#059669', country: 'Germany', flag: '🇩🇪', age: 29, bio: 'Software engineer & board games fan', interests: ['Coding', 'Gaming'], online: true, score: 70 },
  { id: 6, name: 'Priya Sharma', un: 'priya_s', av: 'PS', color: '#d97706', country: 'India', flag: '🇮🇳', age: 25, bio: 'Bookworm & yoga practitioner', interests: ['Reading', 'Travel'], online: false, score: 92 },
  { id: 7, name: 'Emma Johnson', un: 'emma_j', av: 'EJ', color: '#dc2626', country: 'USA', flag: '🇺🇸', age: 24, bio: 'Artist & activist', interests: ['Music', 'Art'], online: false, score: 65 },
]

function CompatRing({ score }) {
  const pct = Math.min(100, Math.round(score / 170 * 100))
  const c = pct >= 70 ? '#22c55e' : pct >= 40 ? '#0066ff' : '#6b7280'
  const r = 11, circ = 2 * Math.PI * r
  return (
    <svg width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r={r} fill="none" stroke="#1e3a5f" strokeWidth="2.5" />
      <circle cx="14" cy="14" r={r} fill="none" stroke={c} strokeWidth="2.5"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round" transform="rotate(-90 14 14)" style={{ transition: 'stroke-dashoffset .6s' }} />
      <text x="14" y="18.5" textAnchor="middle" fontSize="6" fill={c} fontWeight="700">{pct}%</text>
    </svg>
  )
}

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { prompt, AuthPromptModal } = useAuthPrompt()
  const [likedPosts, setLikedPosts] = useState({})
  const [likeCounts, setLikeCounts] = useState(
    Object.fromEntries(SAMPLE_POSTS.map(p => [p.id, p.likes]))
  )

  // If logged in, redirect to dashboard
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const handleLike = (postId) => {
    prompt('like posts')
  }

  const handleComment = () => prompt('comment on posts')
  const handleShare   = () => prompt('share posts')
  const handleMessage = () => prompt('send messages')
  const handleAddFriend = () => prompt('add friends')

  return (
    <PageWrapper className="min-h-screen">
      <AuthPromptModal />

      {/* Guest banner at top */}
      <GuestBanner />

      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-80 h-80 bg-primary-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-primary-700/10 rounded-full blur-3xl" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,102,255,0.04) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Navbar */}
      <header className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-primary-500/10 backdrop-blur-sm sticky top-0 z-40 bg-dark-500/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black text-lg shadow-glow-sm">F</div>
          <span className="font-black text-xl gradient-text font-display tracking-widest">FRINDER</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/discover" className="text-sm text-slate-400 hover:text-primary-400 transition-colors font-medium">Discover</Link>
          <span className="text-sm text-slate-400 cursor-pointer hover:text-primary-400 transition-colors font-medium" onClick={() => prompt('browse posts')}>Posts</span>
          <span className="text-sm text-slate-400 cursor-pointer hover:text-primary-400 transition-colors font-medium" onClick={() => prompt('view events')}>Events</span>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login"><Btn variant="ghost" size="sm">Sign In</Btn></Link>
          <Link to="/register"><Btn size="sm" className="shadow-glow-sm">Join Free →</Btn></Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4">

        {/* ── HERO ── */}
        <section className="text-center py-16 md:py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/25 bg-primary-500/8 text-xs text-primary-400 font-semibold mb-8 tracking-wider">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              VERIFIED GLOBAL FRIENDSHIP PLATFORM · 180+ COUNTRIES
            </div>
            <h1 className="font-black font-display text-5xl md:text-7xl lg:text-8xl leading-none mb-6 max-w-5xl mx-auto">
              <span className="text-white">Swipe Into</span><br />
              <span className="gradient-text text-glow">Friendships</span><br />
              <span className="text-white">That Last</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              The world's only <strong className="text-slate-200">fully verified</strong> global friendship platform.
              Browse freely — create an account to connect!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/register">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Btn size="xl" className="font-bold shadow-glow-lg">Create Free Account →</Btn>
                </motion.div>
              </Link>
              <Link to="/discover">
                <Btn size="xl" variant="secondary">Browse People 🌍</Btn>
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-600">No credit card · Free forever · Browse without signing up</p>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16"
          >
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-black text-3xl md:text-4xl gradient-text font-display">{s.value}</div>
                <div className="text-xs text-slate-500 font-semibold tracking-wider mt-1 uppercase">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── LIVE PREVIEW SECTION ── */}
        <section className="py-10">
          <div className="text-center mb-10">
            <h2 className="font-black font-display text-3xl text-white mb-3">See Who's On Frinder 👀</h2>
            <p className="text-slate-500">Browse real profiles and posts. Sign up to start connecting.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT — People */}
            <div className="lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-200 text-sm">People You May Know</h3>
                <Link to="/discover" className="text-xs text-primary-400 hover:text-primary-300 font-semibold">See all →</Link>
              </div>
              <div className="flex flex-col gap-3">
                {SAMPLE_USERS.slice(0, 5).map((u, i) => (
                  <motion.div key={u.id}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-primary-500/10 bg-dark-300/80 hover:border-primary-500/25 transition-all"
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: u.color }}>{u.av}</div>
                      {u.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-dark-300" style={{ boxShadow: '0 0 6px #22c55e' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.flag} {u.country} · {u.age}y</p>
                      <div className="flex gap-1 mt-1">
                        {u.interests.slice(0, 2).map(int => (
                          <span key={int} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary-500/15 text-primary-400 border border-primary-500/20">{int}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <CompatRing score={u.score} />
                      <button onClick={handleAddFriend}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-400 transition-colors shadow-glow-sm"
                      >+</button>
                    </div>
                  </motion.div>
                ))}
                <Link to="/discover"
                  className="text-center py-3 rounded-2xl border border-dashed border-primary-500/20 text-sm text-primary-400 hover:border-primary-500/40 hover:bg-primary-500/5 transition-all font-semibold"
                >
                  Discover 180+ more people 🌍
                </Link>
              </div>
            </div>

            {/* RIGHT — Posts feed */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-200 text-sm">Latest Posts</h3>
                <button onClick={() => prompt('see full feed')} className="text-xs text-primary-400 hover:text-primary-300 font-semibold">Full Feed →</button>
              </div>

              {/* Create Post — locked for guests */}
              <div onClick={() => prompt('create a post')}
                className="flex items-center gap-3 p-4 rounded-2xl border border-primary-500/10 bg-dark-300/80 cursor-pointer hover:border-primary-500/25 transition-all mb-4 group"
              >
                <div className="w-10 h-10 rounded-full bg-primary-500/20 border-2 border-dashed border-primary-500/30 flex items-center justify-center text-primary-400 text-lg">+</div>
                <div className="flex-1 bg-dark-400/60 rounded-full px-4 py-2.5 text-sm text-slate-600 group-hover:text-slate-500 transition-colors">
                  Share something with the world... ✨ <span className="text-primary-500/60 font-semibold">(Sign in to post)</span>
                </div>
              </div>

              {/* Posts */}
              <div className="flex flex-col gap-4">
                {SAMPLE_POSTS.map((p, i) => (
                  <motion.div key={p.id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="rounded-2xl border border-primary-500/10 bg-dark-300/80 overflow-hidden"
                  >
                    <div className="p-4">
                      {/* Post header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: p.color }}>{p.av}</div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-200">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.flag} {p.country} · {p.time}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/12 text-green-400 border border-green-500/20 font-bold">✓ Verified</span>
                      </div>
                      {/* Post content */}
                      <p className="text-sm text-slate-200 leading-relaxed mb-3">{p.text}</p>
                      {/* Post actions — all locked for guests */}
                      <div className="flex items-center gap-1 pt-3 border-t border-primary-500/8">
                        <button onClick={() => handleLike(p.id)}
                          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/8"
                        >
                          🤍 <span>{likeCounts[p.id]}</span>
                        </button>
                        <button onClick={handleComment}
                          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-500/8"
                        >
                          💬 <span>{p.comments}</span>
                        </button>
                        <button onClick={handleShare}
                          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-500/8"
                        >
                          🔗 Share
                        </button>
                        <div className="flex-1" />
                        <button onClick={handleMessage}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-primary-500/20 text-primary-400 hover:bg-primary-500/10 transition-colors"
                        >
                          Message {p.name.split(' ')[0]}
                        </button>
                      </div>

                      {/* Sign-in nudge */}
                      <div className="mt-3 pt-3 border-t border-primary-500/8 flex items-center justify-between">
                        <p className="text-xs text-slate-600">
                          <span className="text-primary-500/60">🔒</span> Sign in to like, comment & reply
                        </p>
                        <Link to="/register" className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors">
                          Join Free →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="py-16">
          <div className="text-center mb-10">
            <h2 className="font-black font-display text-3xl md:text-4xl text-white mb-3">Everything After You Join</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Create a free account to unlock every feature below.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="p-6 rounded-2xl border border-primary-500/10 bg-dark-300/60 hover:border-primary-500/30 hover:shadow-card-hover transition-all duration-300 group cursor-pointer"
                onClick={() => prompt(f.title)}
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-slate-100 mb-2 group-hover:text-primary-400 transition-colors">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                <p className="text-xs text-primary-500/50 mt-3 font-semibold">🔒 Requires account</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="max-w-2xl mx-auto p-10 rounded-3xl border border-primary-500/20 bg-dark-300/60 backdrop-blur-sm"
            style={{ boxShadow: '0 0 60px rgba(0,102,255,0.1)' }}
          >
            <div className="text-5xl mb-4">🌍</div>
            <h2 className="font-black font-display text-3xl text-white mb-3">Ready to Connect?</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              You've been browsing. Now take the next step — create your verified profile and start making real global friendships.
            </p>
            <Link to="/register">
              <Btn size="xl" className="font-bold shadow-glow-lg">Create Free Account →</Btn>
            </Link>
            <p className="mt-4 text-xs text-slate-600">Already have an account? <Link to="/login" className="text-primary-400 hover:text-primary-300">Sign in here</Link></p>
          </motion.div>
        </section>

      </div>

      {/* Footer */}
      <footer className="border-t border-primary-500/10 px-6 py-6 text-center mt-8">
        <p className="text-xs text-slate-600">© {new Date().getFullYear()} Frinder · DBMS Project 2025–26 · Pure Friendship · No Borders · No Limits</p>
      </footer>
    </PageWrapper>
  )
}
