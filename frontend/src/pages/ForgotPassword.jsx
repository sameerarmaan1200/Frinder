import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper, Btn, Input, OTPInput, useToast } from '../components/UI';
import { authAPI } from '../services/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { show, ToastContainer } = useToast();

  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const unpack = (payload) => (
    payload?.data && typeof payload.data === 'object'
      ? { ...payload, ...payload.data, data: payload.data }
      : payload
  );

  // Timer
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

  // ── STEP 1: Request reset (sends OTP) ───────────────────────
  const handleRequest = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', email }),
      });
      const data = unpack(await res.json());

      if (data.success) {
        // FIX: reset_password.php returns user_id at TOP LEVEL:
        // {success: true, message: '...', user_id: 123}
        // raw fetch: data = this object → data.user_id is correct
        const uid = data.user_id ?? data.data?.user_id;
        setUserId(uid);
        setStep(2);
        startTimer();
        show('Reset code sent to your email!', 'info');
      } else {
        show(data.message || 'Something went wrong', 'error');
      }
    } catch {
      show('Cannot connect to server. Check XAMPP is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2: Verify OTP (uses authAPI → verify_otp.php) ──────
  const handleVerifyOTP = async () => {
    if (otp.length < 6) { setOtpError('Enter all 6 digits'); return; }
    setLoading(true);
    setOtpError('');
    try {
      const res = await authAPI.verifyOTP({
        user_id:  userId,
        otp_code: otp,
        purpose:  'reset',
      });
      // verify_otp.php returns {success, message, reset_token, user_id, purpose} at top level
      // axios: res.data = above object → res.data.reset_token
      const token = res.data?.reset_token ?? res.data?.data?.reset_token;
      if (!token) throw new Error('No reset token in response');
      setResetToken(token);
      setStep(3);
      show('Code verified! Set your new password.', 'success');
    } catch (err) {
      setOtpError(err.response?.data?.message || err.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  // ── RESEND OTP (uses send_otp.php via authAPI) ───────────────
  const resend = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // send_otp.php supports purpose='reset'
      await authAPI.sendOTP({ user_id: userId, purpose: 'reset' });
      setOtp('');
      setOtpError('');
      startTimer();
      show('New code sent!', 'info');
    } catch (err) {
      show('Failed to resend code. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 3: Set new password ─────────────────────────────────
  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { show('Passwords do not match', 'error'); return; }
    if (newPassword.length < 8) { show('Password must be at least 8 characters', 'error'); return; }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      show('Password must contain 1 uppercase letter and 1 number', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:       'set_password',
          user_id:      userId,
          reset_token:  resetToken,
          new_password: newPassword,
        }),
      });
      const data = unpack(await res.json());
      if (data.success) {
        show('Password reset! Please login.', 'success');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        show(data.message || 'Failed. Try again.', 'error');
      }
    } catch {
      show('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Password strength meter
  const strength = () => {
    if (!newPassword) return null;
    if (newPassword.length < 6) return { label: 'Too short', color: '#ef4444', width: '20%' };
    if (newPassword.length < 8) return { label: 'Weak', color: '#f59e0b', width: '40%' };
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword))
      return { label: 'Fair', color: '#f59e0b', width: '60%' };
    if (newPassword.length >= 12) return { label: 'Strong', color: '#22c55e', width: '100%' };
    return { label: 'Good', color: '#3b9eff', width: '80%' };
  };
  const pw = strength();

  return (
    <PageWrapper>
      <ToastContainer />
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        </div>

        <Link to="/" className="flex items-center gap-2 mb-8 z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black shadow-glow-sm">F</div>
          <span className="font-black text-xl gradient-text font-display tracking-widest">FRINDER</span>
        </Link>

        <div className="w-full max-w-md z-10">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6 justify-center">
            {['Email', 'Verify', 'New Password'].map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > i + 1 ? 'bg-green-500 text-white'
                  : step === i + 1 ? 'bg-primary-500 text-white'
                  : 'bg-dark-300 border border-slate-700 text-slate-500'
                }`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-semibold ${step === i + 1 ? 'text-primary-400' : 'text-slate-600'}`}>
                  {label}
                </span>
                {i < 2 && <div className={`w-6 h-px ${step > i + 1 ? 'bg-green-500' : 'bg-slate-700'}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1 — Email */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                className="glass rounded-2xl border border-primary-500/15 p-8">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">🔑</div>
                  <h1 className="font-black font-display text-2xl text-white mb-1">Forgot Password?</h1>
                  <p className="text-slate-500 text-sm">Enter your email and we will send a reset code</p>
                </div>
                <form onSubmit={handleRequest} className="flex flex-col gap-4">
                  <Input label="Email Address" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com" icon="✉️" required autoFocus />
                  <Btn type="submit" size="lg" loading={loading} className="w-full">
                    Send Reset Code →
                  </Btn>
                </form>
                <p className="text-center mt-4 text-sm text-slate-600">
                  Remember it?{' '}
                  <Link to="/login" className="text-primary-400 font-semibold">Back to Login</Link>
                </p>
                <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl text-xs text-amber-400 text-center">
                  💡 If email not configured: check phpMyAdmin → email_otps → otp_code
                </div>
              </motion.div>
            )}

            {/* Step 2 — OTP */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                className="glass rounded-2xl border border-primary-500/15 p-8 flex flex-col items-center gap-5 text-center">
                <div className="text-5xl">📧</div>
                <div>
                  <h2 className="font-black font-display text-2xl text-white mb-2">Check Your Email</h2>
                  <p className="text-slate-400 text-sm">6-digit code sent to</p>
                  <p className="text-primary-400 font-semibold mt-1">{email}</p>
                </div>
                <OTPInput value={otp} onChange={setOtp} error={otpError} />
                <Btn onClick={handleVerifyOTP} loading={loading} className="w-full" size="lg" disabled={otp.length < 6}>
                  Verify Code →
                </Btn>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">Didn't get it?</span>
                  {resendTimer > 0 ? (
                    <span className="text-slate-600">Resend in {resendTimer}s</span>
                  ) : (
                    <button onClick={resend} className="text-primary-400 font-semibold">Resend</button>
                  )}
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-slate-600 hover:text-slate-400">
                  ← Back
                </button>
              </motion.div>
            )}

            {/* Step 3 — New Password */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                className="glass rounded-2xl border border-primary-500/15 p-8">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">🔒</div>
                  <h2 className="font-black font-display text-2xl text-white mb-1">Set New Password</h2>
                  <p className="text-slate-500 text-sm">Choose a strong password</p>
                </div>
                <form onSubmit={handleSetPassword} className="flex flex-col gap-4">
                  <div>
                    <Input label="New Password" type="password" value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 chars, 1 uppercase, 1 number" icon="🔒" required />
                    {pw && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Strength</span>
                          <span style={{ color: pw.color }}>{pw.label}</span>
                        </div>
                        <div className="h-1.5 bg-dark-400 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-300"
                            style={{ width: pw.width, background: pw.color }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <Input label="Confirm Password" type="password" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password" icon="🔒" required />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-400">Passwords do not match</p>
                  )}
                  <Btn type="submit" size="lg" loading={loading} className="w-full"
                    disabled={!newPassword || newPassword !== confirmPassword}>
                    Reset Password ✓
                  </Btn>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  );
}
