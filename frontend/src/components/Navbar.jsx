import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './UI';
import { friendAPI } from '../services/api';

const navLinks = [
  { to: '/dashboard', icon: '⊞', label: 'Home' },
  { to: '/discover',  icon: '🌐', label: 'Discover' },
  { to: '/friends',   icon: '🤝', label: 'Friends' },
  { to: '/chat',      icon: '💬', label: 'Chat' },
  { to: '/events',    icon: '🎉', label: 'Events' },
  { to: '/map',       icon: '🗺️', label: 'Map' },
];

export default function Navbar({ onAboutClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    friendAPI.getReceived().then(r => setPendingCount(r.data.requests?.length || 0)).catch(() => {});
    const interval = setInterval(() => {
      friendAPI.getReceived().then(r => setPendingCount(r.data.requests?.length || 0)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Safe handler for About Us click
  const handleAboutClick = () => {
    if (onAboutClick) {
      onAboutClick();
    } else {
      // Optional: show a fallback message or do nothing
      console.warn('About Us clicked but no handler provided');
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-20 xl:w-64 flex-col z-40 glass-dark border-r border-white/20">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 px-4 xl:px-6 py-6 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black text-lg shadow-glow-sm shrink-0">F</div>
          <span className="hidden xl:block font-black text-xl gradient-text font-display tracking-widest">FRINDER</span>
        </Link>

        {/* Nav links */}
        <nav className="flex-1 px-3 xl:px-4 py-4 flex flex-col gap-1 overflow-y-auto">
          {navLinks.map(link => {
            const active = location.pathname.startsWith(link.to);
            return (
              <Link key={link.to} to={link.to}
                className={`relative flex items-center gap-3 px-3 xl:px-4 py-3 rounded-xl transition-all duration-200 group
                  ${active ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20' : 'text-slate-500 hover:text-slate-200 hover:bg-primary-500/5'}`}
              >
                <span className="text-xl leading-none">{link.icon}</span>
                <span className="hidden xl:block text-sm font-semibold">{link.label}</span>
                {link.to === '/friends' && pendingCount > 0 && (
                  <span className="hidden xl:flex ml-auto bg-primary-500 text-white text-xs font-bold w-5 h-5 rounded-full items-center justify-center">{pendingCount}</span>
                )}
                {link.to === '/friends' && pendingCount > 0 && (
                  <span className="xl:hidden absolute -top-1 -right-1 bg-primary-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{pendingCount}</span>
                )}
                {active && <motion.div layoutId="activeNav" className="absolute inset-0 rounded-xl bg-primary-500/10 border border-primary-500/20 -z-10" />}
              </Link>
            );
          })}

          {/* About Us button */}
          <button
            onClick={handleAboutClick}
            className="relative flex items-center gap-3 px-3 xl:px-4 py-3 rounded-xl transition-all duration-200 group text-slate-500 hover:text-slate-200 hover:bg-primary-500/5 w-full text-left"
          >
            <span className="text-xl leading-none">🍭</span>
            <span className="hidden xl:block text-sm font-semibold">About Us</span>
          </button>
        </nav>

        {/* User section */}
        <div className="px-3 xl:px-4 py-4 border-t border-white/20 shrink-0">
          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-primary-500/5 transition-colors group"
            >
              <Avatar src={user.profile_picture} name={user.full_name} size="sm" online />
              <div className="hidden xl:block text-left overflow-hidden flex-1">
                <p className="text-sm font-semibold text-slate-200 truncate">{user.full_name}</p>
                <p className="text-xs text-slate-500 truncate">@{user.username}</p>
              </div>
              <span className="hidden xl:block text-slate-500 group-hover:text-slate-300 transition-colors">⋮</span>
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-full left-0 right-0 mb-2 glass rounded-xl border border-primary-500/20 overflow-hidden shadow-glow-md z-50"
                >
                  <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-3 hover:bg-primary-500/10 transition-colors text-sm text-slate-300">
                    👤 <span className="hidden xl:inline">My Profile</span>
                  </Link>
                  {user.account_status === 'verified' && (
                    <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-3 hover:bg-primary-500/10 transition-colors text-sm text-slate-300">
                      🛡️ <span className="hidden xl:inline">Admin</span>
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-500/10 transition-colors text-sm text-red-400">
                    🚪 <span className="hidden xl:inline">Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-dark border-b border-white/20 px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black text-sm">F</div>
          <span className="font-black text-lg gradient-text font-display tracking-widest">FRINDER</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/chat" className="text-slate-400 hover:text-white transition-colors text-xl">💬</Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-slate-400 hover:text-white transition-colors p-1">
            <div className={`w-6 h-4 flex flex-col justify-between transition-all ${mobileOpen ? 'gap-0' : 'gap-1.5'}`}>
              <span className={`block h-0.5 bg-current transition-all origin-center ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all origin-center ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="lg:hidden fixed inset-0 z-50 glass-dark pt-16"
          >
            <nav className="p-4 flex flex-col gap-2">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-colors ${location.pathname.startsWith(link.to) ? 'bg-primary-500/15 text-primary-400' : 'text-slate-400 hover:text-white hover:bg-primary-500/5'}`}
                >
                  <span className="text-2xl">{link.icon}</span>
                  <span className="text-base font-semibold">{link.label}</span>
                  {link.to === '/friends' && pendingCount > 0 && <span className="ml-auto bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>}
                </Link>
              ))}
              {/* About Us button in mobile menu */}
              <button
                onClick={() => { setMobileOpen(false); handleAboutClick(); }}
                className="flex items-center gap-4 px-4 py-4 rounded-xl transition-colors text-slate-400 hover:text-white hover:bg-primary-500/5 w-full text-left"
              >
                <span className="text-2xl">🍭</span>
                <span className="text-base font-semibold">About Us</span>
              </button>
              <div className="border-t border-white/20 mt-4 pt-4 flex flex-col gap-2">
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-primary-500/5 transition-colors">
                  <Avatar src={user.profile_picture} name={user.full_name} size="sm" online />
                  <div>
                    <p className="font-semibold text-slate-200">{user.full_name}</p>
                    <p className="text-xs text-slate-500">@{user.username}</p>
                  </div>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
                  <span className="text-2xl">🚪</span><span>Logout</span>
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-dark border-t border-white/20 flex">
        {navLinks.slice(0, 5).map(link => {
          const active = location.pathname.startsWith(link.to);
          return (
            <Link key={link.to} to={link.to} className={`relative flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${active ? 'text-primary-400' : 'text-slate-600 hover:text-slate-300'}`}>
              <span className="text-xl leading-none">{link.icon}</span>
              <span className="text-[9px] font-semibold">{link.label}</span>
              {link.to === '/friends' && pendingCount > 0 && <span className="absolute top-1 right-1/4 bg-primary-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{pendingCount}</span>}
            </Link>
          );
        })}
        {/* About Us in mobile bottom nav */}
        <button
          onClick={handleAboutClick}
          className="relative flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors text-slate-600 hover:text-slate-300"
        >
          <span className="text-xl leading-none">🍭</span>
          <span className="text-[9px] font-semibold">About Us</span>
        </button>
      </nav>
    </>
  );
}