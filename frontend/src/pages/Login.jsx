import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PageWrapper, Btn, Input, OTPInput, useToast } from '../components/UI'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { show, ToastContainer } = useToast()
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const startTimer = () => {
    setResendTimer(60)
    const t = setInterval(()=>setResendTimer(r=>{ if(r<=1){clearInterval(t);return 0} return r-1 }),1000)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email||!password) return
    setLoading(true)
    try {
      const r = await authAPI.login({ email, password })
      setUserId(r.data.user_id); setStep(2); startTimer()
      show('OTP sent to your email!','info')
    } catch(err) { show(err.response?.data?.message||'Login failed','error') }
    setLoading(false)
  }

  const handleOTP = async () => {
    if (otp.length<6) { setOtpError('Enter all 6 digits'); return }
    setLoading(true); setOtpError('')
    try {
      const r = await authAPI.verifyOTP({ user_id:userId, otp_code:otp, purpose:'login' })
      login(r.data.user, r.data.token)
      show('Welcome back! 🎉','success')
      setTimeout(()=>navigate('/dashboard'),500)
    } catch(err) { setOtpError(err.response?.data?.message||'Invalid or expired code') }
    setLoading(false)
  }

  const resend = async () => {
    setLoading(true)
    try { await authAPI.sendOTP({user_id:userId,purpose:'login'}); setOtp(''); setOtpError(''); startTimer(); show('New code sent!','info') } catch {}
    setLoading(false)
  }

  return (
    <PageWrapper>
      <ToastContainer />
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-500/6 rounded-full blur-3xl" />
        </div>

        <Link to="/" className="flex items-center gap-2 mb-10 z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black shadow-glow-sm">F</div>
          <span className="font-black text-xl gradient-text font-display tracking-widest">FRINDER</span>
        </Link>

        <div className="w-full max-w-md z-10">
          <AnimatePresence mode="wait">
            {step===1 ? (
              <motion.div key="creds" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{x:-400,opacity:0}} transition={{duration:0.3}}
                className="glass rounded-2xl border border-primary-500/15 shadow-glow-sm p-8"
              >
                <h1 className="font-black font-display text-3xl text-white mb-1">Welcome back 👋</h1>
                <p className="text-slate-500 text-sm mb-8">Sign in to your Frinder account</p>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" icon="✉️" required autoFocus />
                  <Input label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" icon="🔑" required />
                  <Btn type="submit" size="lg" loading={loading} className="w-full mt-2">Sign In →</Btn>
                </form>
                <div className="mt-6 pt-6 border-t border-primary-500/10 bg-dark-400/40 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Demo Login</p>
                  {[['alex@demo.com','Demo@1234','Alex Chen 🇯🇵'],['tariq@demo.com','Demo@1234','Tariq Khan 🇧🇩'],['emma@demo.com','Demo@1234','Emma Johnson 🇺🇸']].map(([e,p,n])=>(
                    <button key={e} onClick={()=>{setEmail(e);setPassword(p)}} className="w-full text-left text-sm text-slate-500 hover:text-primary-400 transition-colors py-1 flex items-center gap-2">
                      <span className="text-primary-600">→</span>{n}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{x:400,opacity:0}} animate={{x:0,opacity:1}} transition={{duration:0.3,type:'spring',damping:25,stiffness:300}}
                className="glass rounded-2xl border border-primary-500/15 shadow-glow-sm p-8 flex flex-col items-center gap-6 text-center"
              >
                <div className="text-5xl">📱</div>
                <div>
                  <h2 className="font-black font-display text-2xl text-white mb-2">Check Your Email</h2>
                  <p className="text-slate-400 text-sm">6-digit code sent to</p>
                  <p className="text-primary-400 font-semibold mt-1">{email}</p>
                </div>
                <div className="w-full p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-400">
                  💡 Dev mode: check <code className="font-mono bg-black/30 px-1 rounded">apache/logs/error.log</code> for OTP
                </div>
                <OTPInput value={otp} onChange={setOtp} error={otpError} />
                <Btn onClick={handleOTP} loading={loading} className="w-full" size="lg" disabled={otp.length<6}>Verify & Login →</Btn>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">Didn't get it?</span>
                  {resendTimer>0 ? <span className="text-slate-600">Resend in {resendTimer}s</span> : <button onClick={resend} className="text-primary-400 font-semibold">Resend</button>}
                </div>
                <button onClick={()=>{setStep(1);setOtp('');setOtpError('')}} className="text-xs text-slate-600 hover:text-slate-400">← Back</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-6 text-sm text-slate-600 z-10">No account? <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold">Create one free →</Link></p>
      </div>
    </PageWrapper>
  )
}
