import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, Btn, Input, OTPInput, useToast } from '../components/UI';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { show, ToastContainer } = useToast();

  const [activeTab, setActiveTab] = useState('user');

  // User login state
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Admin login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // ⭐ NEW: Developer modal state
  const [showDevModal, setShowDevModal] = useState(false);

  // Resend timer
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const startTimer = () => setResendTimer(60);

  // ⭐ NEW: Developer data
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

  // ── STEP 1: Submit email + password ─────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const r = await authAPI.login({ email, password });
      const payload = r.data ?? {};
      const uid = payload.user_id ?? payload.data?.user_id;
      if (!uid) throw new Error(payload.message || 'Login started but OTP details were missing');
      setUserId(uid);
      setStep(2);
      startTimer();
      show(payload.message || 'OTP sent to your email!', 'info');
    } catch (err) {
      show(err.response?.data?.message || err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2: Verify OTP ───────────────────────────────────────
  const handleOTP = async () => {
    if (otp.length < 6) { setOtpError('Enter all 6 digits'); return; }
    setLoading(true);
    setOtpError('');
    try {
      const r = await authAPI.loginVerify({
        user_id:  userId,
        otp_code: otp,
      });
      const payload = r.data ?? {};
      const token = payload.session_token ?? payload.data?.session_token;
      const user  = payload.user ?? payload.data?.user;

      if (!token) throw new Error('No session token in response');

      login(user, token);
      show('Welcome back! 🎉', 'success');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      setOtpError(err.response?.data?.message || err.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  // ── RESEND OTP ───────────────────────────────────────────────
  const resend = async () => {
    setLoading(true);
    try {
      const r = await authAPI.loginResend({ user_id: userId });
      setOtp('');
      setOtpError('');
      startTimer();
      show(r.data?.message || 'New code sent!', 'info');
    } catch (err) {
      show(err.response?.data?.message || 'Failed to resend code. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── ADMIN LOGIN ──────────────────────────────────────────────
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      show('Enter admin email and password', 'error');
      return;
    }
    setAdminLoading(true);
    try {
      const response = await fetch('/api/admin/admin.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await response.json();
      if (data.success) {
        const token = data.token ?? data.data?.token;
        const name  = data.admin?.admin_name ?? data.data?.admin?.admin_name ?? 'Admin';
        localStorage.setItem('frinder_admin_token', token);
        localStorage.setItem('frinder_admin_name', name);
        show('Welcome, Admin! 🛡️', 'success');
        setTimeout(() => navigate('/admin/dashboard'), 300);
      } else {
        show(data.message || 'Invalid admin credentials', 'error');
      }
    } catch (error) {
      show('Cannot connect to server. Check XAMPP is running.', 'error');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <PageWrapper>
      <ToastContainer />
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        {/* Background decorations */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-500/6 rounded-full blur-3xl" />
        </div>

        <Link to="/" className="flex items-center gap-2 mb-8 z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black shadow-glow-sm">
            F
          </div>
          <span className="font-black text-xl gradient-text font-display tracking-widest">
            FRINDER
          </span>
        </Link>

        <div className="w-full max-w-md z-10">
          {/* Tab switcher */}
          <div className="flex rounded-2xl border border-primary-500/15 glass p-1 mb-4">
            <button
              onClick={() => {
                setActiveTab('user');
                setStep(1);
                setOtp('');
                setOtpError('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === 'user'
                  ? 'bg-primary-500 text-white shadow-glow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              🌍 Login as User
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-primary-500 text-white shadow-glow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              🛡️ Login as Admin
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* ── USER LOGIN ── */}
            {activeTab === 'user' && (
              <motion.div
                key="user-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="creds"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ x: -400, opacity: 0 }}
                      // ⭐ UPDATED: Highlighted border
                      className="glass rounded-2xl border-2 border-white/60 shadow-lg shadow-white/10 p-8"
                    >
                      <h1 className="font-black font-display text-2xl text-white mb-1">
                        Welcome back 👋
                      </h1>
                      <p className="text-slate-500 text-sm mb-6">
                        Sign in to your Frinder account
                      </p>
                      <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <Input
                          label="Email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          icon="✉️"
                          required
                          autoFocus
                        />
                        <Input
                          label="Password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Your password"
                          icon="🔑"
                          required
                        />
                        <Btn type="submit" size="lg" loading={loading} className="w-full mt-2">
                          Sign In →
                        </Btn>
                        <div className="text-right mt-1">
                          <Link
                            to="/forgot-password"
                            className="text-xs text-slate-500 hover:text-primary-400 transition-colors"
                          >
                            Forgot password?
                          </Link>
                        </div>
                      </form>
                      <div className="mt-5 pt-5 border-t border-primary-500/10 bg-dark-400/40 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                          Quick Demo Login
                        </p>
                        {[
                          ['alex@demo.com', 'Demo@1234', 'Alex Chen 🇯🇵'],
                          ['tariq@demo.com', 'Demo@1234', 'Tariq Khan 🇧🇩'],
                          ['emma@demo.com', 'Demo@1234', 'Emma Johnson 🇺🇸'],
                        ].map(([e, p, n]) => (
                          <button
                            key={e}
                            onClick={() => { setEmail(e); setPassword(p); }}
                            className="w-full text-left text-sm text-slate-500 hover:text-primary-400 transition-colors py-1 flex items-center gap-2"
                          >
                            <span className="text-primary-600">→</span>
                            {n}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="otp"
                      initial={{ x: 400, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3, type: 'spring', damping: 25, stiffness: 300 }}
                      className="glass rounded-2xl border border-primary-500/15 shadow-glow-sm p-8 flex flex-col items-center gap-5 text-center"
                    >
                      <div className="text-5xl">📱</div>
                      <div>
                        <h2 className="font-black font-display text-2xl text-white mb-2">
                          Check Your Email
                        </h2>
                        <p className="text-slate-400 text-sm">6-digit code sent to</p>
                        <p className="text-primary-400 font-semibold mt-1">{email}</p>
                      </div>
                      <div className="w-full p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-400">
                        💡 Dev tip: phpMyAdmin → frinder → email_otps → otp_code column
                      </div>
                      <OTPInput value={otp} onChange={setOtp} error={otpError} />
                      <Btn
                        onClick={handleOTP}
                        loading={loading}
                        className="w-full"
                        size="lg"
                        disabled={otp.length < 6}
                      >
                        Verify & Login →
                      </Btn>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-500">Didn't get it?</span>
                        {resendTimer > 0 ? (
                          <span className="text-slate-600">Resend in {resendTimer}s</span>
                        ) : (
                          <button onClick={resend} className="text-primary-400 font-semibold">
                            Resend
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => { setStep(1); setOtp(''); setOtpError(''); }}
                        className="text-xs text-slate-600 hover:text-slate-400"
                      >
                        ← Back
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── ADMIN LOGIN ── */}
            {activeTab === 'admin' && (
              <motion.div
                key="admin-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="glass rounded-2xl border border-primary-500/15 shadow-glow-sm p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-2xl">
                      🛡️
                    </div>
                    <div>
                      <h1 className="font-black font-display text-xl text-white">Admin Access</h1>
                      <p className="text-slate-500 text-xs">Frinder Administration Panel</p>
                    </div>
                  </div>
                  <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
                    <Input
                      label="Admin Email"
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@gmail.com"
                      icon="✉️"
                      required
                      autoFocus
                    />
                    <Input
                      label="Admin Password"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Admin password"
                      icon="🔒"
                      required
                    />
                    <Btn type="submit" size="lg" loading={adminLoading} className="w-full mt-2">
                      Access Admin Panel 🛡️
                    </Btn>
                  </form>
                  <div className="mt-5 p-3 bg-primary-500/5 border border-primary-500/15 rounded-xl">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Admin login goes directly to the dashboard — no OTP required.
                      <br />
                      After reviewing, click{' '}
                      <strong className="text-slate-400">🌐 Go to App</strong> to use the platform
                      as a normal user.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ⭐ NEW: Sign-up link and "Behind this" button */}
          {activeTab === 'user' && step === 1 && (
            <>
              <p className="mt-5 text-sm text-slate-600 text-center">
                No account?{' '}
                <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold">
                  Create one free →
                </Link>
              </p>
              <div className="mt-3 text-center">
                <button
                  onClick={() => setShowDevModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-bold rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200"
                >
                  <span>✨</span> Behind this <span>✨</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ⭐ NEW: Developer Modal */}
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
              className="glass rounded-2xl border-2 border-amber-400/70 shadow-2xl shadow-amber-500/30 w-full max-w-3xl p-6"
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
                    className="bg-dark-400/40 rounded-xl p-5 border border-primary-500/15 flex flex-col items-center text-center"
                  >
                    <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-amber-400/60 mb-4 shadow-md">
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

              <p className="text-center text-slate-400 text-sm mt-6 italic border-t border-primary-500/15 pt-5">
                ✨ Your one contact inspires us a lot ✨
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}