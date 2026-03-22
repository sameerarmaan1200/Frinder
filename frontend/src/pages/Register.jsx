import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PageWrapper, Btn, Input, Select, OTPInput, useToast } from '../components/UI'
import { authAPI, lookupAPI } from '../services/api'

const STEPS = ['Basic Info','Account','Verify Email','Profile & Interests','Identity Doc','Selfie & GPS']

export default function Register() {
  const navigate = useNavigate()
  const { show, ToastContainer } = useToast()
  const [step, setStep] = useState(0)
  const [userId, setUserId] = useState(null)
  const [lookup, setLookup] = useState({ countries:[], interests:[], languages:[] })
  const [loading, setLoading] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpError, setOtpError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [selfieCapture, setSelfieCapture] = useState(null)
  const [gpsStatus, setGpsStatus] = useState('')
  const [form, setForm] = useState({
    full_name:'', username:'', date_of_birth:'', gender:'',
    email:'', password:'', confirm_password:'',
    country_id:'', city:'',
    bio:'', education:'', profession:'',
    interests:[], languages:[],
    document_type:'national_id', document_file:null,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => { lookupAPI.all().then(r => setLookup(r.data)).catch(()=>{}) }, [])
  useEffect(() => {
    if (resendTimer > 0) { const t = setTimeout(()=>setResendTimer(r=>r-1),1000); return ()=>clearTimeout(t) }
  }, [resendTimer])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const validate = () => {
    const e = {}
    if (step===0) {
      if (!form.full_name.trim()) e.full_name='Required'
      if (!form.username.match(/^[a-zA-Z0-9_]{3,50}$/)) e.username='3-50 chars, letters/numbers/underscore'
      if (!form.date_of_birth) e.date_of_birth='Required'
      if (!form.gender) e.gender='Required'
    }
    if (step===1) {
      if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email='Invalid email'
      if (form.password.length<8) e.password='Min 8 characters'
      else if (!form.password.match(/[A-Z]/)) e.password='Needs 1 uppercase letter'
      else if (!form.password.match(/[0-9]/)) e.password='Needs 1 number'
      if (form.password !== form.confirm_password) e.confirm_password='Passwords do not match'
    }
    if (step===3 && form.interests.length<3) e.interests='Select at least 3'
    setErrors(e)
    return Object.keys(e).length===0
  }

  const handleNext = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      if (step===0) { setStep(1) }
      else if (step===1) {
        const r = await authAPI.register({
          full_name:form.full_name, username:form.username,
          date_of_birth:form.date_of_birth, gender:form.gender,
          email:form.email, password:form.password,
          country_id:form.country_id||null, city:form.city||null,
        })
        setUserId(r.data.user_id)
        await authAPI.sendOTP({ user_id:r.data.user_id, purpose:'register' })
        setResendTimer(60); setStep(2)
      }
      else if (step===3) {
        await authAPI.saveProfile({
          user_id:userId, bio:form.bio, education:form.education, profession:form.profession,
          interests:form.interests, languages:form.languages,
        })
        setStep(4)
      }
      else if (step===4) {
        if (!form.document_file) { show('Please upload an identity document','error'); setLoading(false); return }
        const fd = new FormData()
        fd.append('action','document'); fd.append('user_id',userId)
        fd.append('document_type',form.document_type); fd.append('document',form.document_file)
        const r = await fetch('/api/verification/upload.php',{method:'POST',body:fd})
        const d = await r.json()
        if (!d.success) { show(d.message,'error'); setLoading(false); return }
        setStep(5); setTimeout(startCamera, 300)
      }
    } catch(err) { show(err.response?.data?.message||'Something went wrong','error') }
    setLoading(false)
  }

  const verifyOTP = async () => {
    if (otpValue.length<6) { setOtpError('Enter the 6-digit code'); return }
    setLoading(true); setOtpError('')
    try {
      await authAPI.verifyOTP({ user_id:userId, otp_code:otpValue, purpose:'register' })
      show('Email verified! 🎉','success'); setStep(3)
    } catch(err) { setOtpError(err.response?.data?.message||'Invalid or expired code') }
    setLoading(false)
  }

  const resendOTP = async () => {
    setLoading(true)
    try { await authAPI.sendOTP({user_id:userId,purpose:'register'}); setResendTimer(60); setOtpValue(''); setOtpError(''); show('New code sent!','success') } catch {}
    setLoading(false)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false})
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch { setGpsStatus('Camera not available') }
  }

  const captureSelfie = async () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth||320; canvas.height = videoRef.current.videoHeight||240
    canvas.getContext('2d').drawImage(videoRef.current,0,0)
    const base64 = canvas.toDataURL('image/jpeg',0.8)
    setSelfieCapture(base64)
    streamRef.current?.getTracks().forEach(t=>t.stop())
    const fd = new FormData()
    fd.append('action','selfie'); fd.append('user_id',userId); fd.append('selfie_base64',base64)
    await fetch('/api/verification/upload.php',{method:'POST',body:fd})
    show('Selfie captured! 📸','success')
  }

  const captureGPS = () => {
    if (!navigator.geolocation) { setGpsStatus('GPS not available'); return }
    setGpsStatus('Getting location…')
    navigator.geolocation.getCurrentPosition(async pos => {
      const fd = new FormData()
      fd.append('action','gps'); fd.append('user_id',userId)
      fd.append('lat',pos.coords.latitude); fd.append('lng',pos.coords.longitude)
      fd.append('country_id',form.country_id)
      await fetch('/api/verification/upload.php',{method:'POST',body:fd})
      setGpsStatus(`✓ Location saved (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`)
      show('Location verified! 📍','success')
    }, ()=>setGpsStatus('Location permission denied'))
  }

  const toggleInterest = id => set('interests', form.interests.includes(id)?form.interests.filter(i=>i!==id):[...form.interests,id])
  const toggleLang = (lid) => {
    const exists = form.languages.find(l=>l.language_id===lid)
    set('languages', exists ? form.languages.filter(l=>l.language_id!==lid) : [...form.languages,{language_id:lid,proficiency:'Intermediate'}])
  }

  if (step===6) return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} className="text-center max-w-md">
          <div className="text-7xl mb-6">🎉</div>
          <h1 className="font-black font-display text-3xl text-white mb-4">You're Almost In!</h1>
          <p className="text-slate-400 mb-2">Your account is <strong className="text-amber-400">pending review</strong>.</p>
          <p className="text-slate-500 text-sm mb-8">Our admin team will verify your documents. Check Apache error log for OTP codes during local development.</p>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 mb-8 text-sm text-amber-300">⏳ Admin reviewing your identity documents</div>
          <Link to="/login"><Btn size="lg" className="w-full">Go to Login →</Btn></Link>
        </motion.div>
      </div>
    </PageWrapper>
  )

  return (
    <PageWrapper>
      <ToastContainer />
      <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black shadow-glow-sm">F</div>
          <span className="font-black text-xl gradient-text font-display tracking-widest">FRINDER</span>
        </Link>

        <div className="w-full max-w-lg mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-semibold">Step {step+1} of {STEPS.length}</span>
            <span className="text-xs text-primary-400 font-semibold">{STEPS[step]}</span>
          </div>
          <div className="h-1.5 bg-dark-300 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full" animate={{width:`${(step/(STEPS.length-1))*100}%`}} transition={{duration:0.4}} />
          </div>
        </div>

        <div className="w-full max-w-lg glass rounded-2xl border border-primary-500/15 shadow-glow-sm overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{x:40,opacity:0}} animate={{x:0,opacity:1}} exit={{x:-40,opacity:0}} transition={{duration:0.25}} className="p-6 md:p-8">

              {step===0 && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-bold font-display text-2xl text-white">Let's start! 👋</h2>
                  <Input label="Full Name" value={form.full_name} onChange={e=>set('full_name',e.target.value)} placeholder="Your real name" error={errors.full_name} icon="👤" />
                  <Input label="Username" value={form.username} onChange={e=>set('username',e.target.value.toLowerCase())} placeholder="e.g. alex_chen" error={errors.username} icon="@" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Date of Birth" type="date" value={form.date_of_birth} onChange={e=>set('date_of_birth',e.target.value)} error={errors.date_of_birth} />
                    <Select label="Gender" value={form.gender} onChange={e=>set('gender',e.target.value)} error={errors.gender}>
                      <option value="">Select</option>
                      {['Male','Female','Other','Prefer not to say'].map(g=><option key={g} value={g}>{g}</option>)}
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Select label="Country" value={form.country_id} onChange={e=>set('country_id',e.target.value)}>
                      <option value="">Select country</option>
                      {lookup.countries.map(c=><option key={c.country_id} value={c.country_id}>{c.flag_emoji} {c.country_name}</option>)}
                    </Select>
                    <Input label="City" value={form.city} onChange={e=>set('city',e.target.value)} placeholder="Your city" />
                  </div>
                </div>
              )}

              {step===1 && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-bold font-display text-2xl text-white">Account Credentials 🔐</h2>
                  <Input label="Email" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="your@email.com" error={errors.email} icon="✉️" />
                  <Input label="Password" type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Min 8 chars, 1 uppercase, 1 number" error={errors.password} icon="🔑" />
                  <Input label="Confirm Password" type="password" value={form.confirm_password} onChange={e=>set('confirm_password',e.target.value)} placeholder="Repeat password" error={errors.confirm_password} icon="🔒" />
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[['8+ chars',form.password.length>=8],['Uppercase',/[A-Z]/.test(form.password)],['Number',/[0-9]/.test(form.password)]].map(([l,ok])=>(
                      <div key={l} className={`text-center p-2 rounded-lg text-xs font-semibold border transition-all ${ok?'bg-green-500/10 border-green-500/30 text-green-400':'bg-dark-400/60 border-primary-500/10 text-slate-600'}`}>{ok?'✓':''} {l}</div>
                    ))}
                  </div>
                </div>
              )}

              {step===2 && (
                <div className="flex flex-col items-center gap-6 text-center">
                  <div className="text-5xl">📧</div>
                  <h2 className="font-bold font-display text-2xl text-white">Verify Your Email</h2>
                  <p className="text-sm text-slate-400">6-digit code sent to <strong className="text-primary-400">{form.email}</strong></p>
                  <p className="text-xs text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">💡 Local dev: check <code className="font-mono">C:\xampp\apache\logs\error.log</code> for OTP</p>
                  <OTPInput value={otpValue} onChange={setOtpValue} error={otpError} />
                  <Btn onClick={verifyOTP} loading={loading} className="w-full" disabled={otpValue.length<6}>Verify →</Btn>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-500">Didn't get it?</span>
                    {resendTimer>0 ? <span className="text-slate-600">Resend in {resendTimer}s</span> : <button onClick={resendOTP} className="text-primary-400 hover:text-primary-300 font-semibold">Resend OTP</button>}
                  </div>
                </div>
              )}

              {step===3 && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-bold font-display text-2xl text-white">Your Profile 🎨</h2>
                  <Input label="Bio (optional)" value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="Tell the world about yourself" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Education" value={form.education} onChange={e=>set('education',e.target.value)} placeholder="e.g. BSc CS" />
                    <Input label="Profession" value={form.profession} onChange={e=>set('profession',e.target.value)} placeholder="e.g. Developer" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Interests — select at least 3 ({form.interests.length} selected)</label>
                    {errors.interests && <p className="text-xs text-red-400 mb-2">{errors.interests}</p>}
                    <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1 custom-scroll">
                      {lookup.interests.map(i=>(
                        <button key={i.interest_id} type="button" onClick={()=>toggleInterest(i.interest_id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${form.interests.includes(i.interest_id)?'bg-primary-500/20 border-primary-500/50 text-primary-300':'bg-dark-400/60 border-primary-500/10 text-slate-500 hover:border-primary-500/30 hover:text-slate-300'}`}
                        >{i.icon} {i.interest_name}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Languages (optional)</label>
                    <div className="flex flex-wrap gap-2">
                      {lookup.languages.slice(0,12).map(l=>{
                        const sel = form.languages.find(x=>x.language_id===l.language_id)
                        return <button key={l.language_id} type="button" onClick={()=>toggleLang(l.language_id)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${sel?'bg-primary-500/20 border-primary-500/50 text-primary-300':'bg-dark-400/60 border-primary-500/10 text-slate-500 hover:border-primary-500/30'}`}>{l.language_name}</button>
                      })}
                    </div>
                  </div>
                </div>
              )}

              {step===4 && (
                <div className="flex flex-col gap-4">
                  <div className="text-4xl text-center">🪪</div>
                  <h2 className="font-bold font-display text-2xl text-white text-center">Identity Verification</h2>
                  <p className="text-sm text-slate-400 text-center">Upload a government-issued document. Private & encrypted.</p>
                  <Select label="Document Type" value={form.document_type} onChange={e=>set('document_type',e.target.value)}>
                    {[['national_id','National ID'],['passport','Passport'],['driving_license','Driving License'],['student_id','Student ID'],['ssn','SSN']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </Select>
                  <label className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${form.document_file?'border-primary-500/50 bg-primary-500/5':'border-primary-500/20 hover:border-primary-500/40 bg-dark-400/30'}`}>
                    <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={e=>set('document_file',e.target.files[0])} />
                    {form.document_file ? <><span className="text-3xl">✅</span><span className="text-sm text-green-400 font-semibold">{form.document_file.name}</span></> : <><span className="text-3xl">📁</span><span className="text-sm text-slate-500">Click to upload</span><span className="text-xs text-slate-600">JPG · PNG · PDF · max 5MB</span></>}
                  </label>
                  <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-blue-300">🔒 Only visible to our verification team. Never shown publicly.</div>
                </div>
              )}

              {step===5 && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-bold font-display text-2xl text-white text-center">Live Selfie 🤳</h2>
                  <p className="text-sm text-slate-400 text-center">Take a selfie to confirm you match your documents.</p>
                  {!selfieCapture ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden bg-dark-400 aspect-[4/3]">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        <div className="absolute inset-0 border-4 border-primary-500/40 rounded-2xl pointer-events-none" />
                      </div>
                      <Btn onClick={captureSelfie}>📸 Capture Selfie</Btn>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <img src={selfieCapture} className="w-36 h-36 rounded-full object-cover border-4 border-primary-500 shadow-glow-md" alt="Selfie" />
                      <span className="text-sm text-green-400 font-semibold">✓ Selfie captured!</span>
                    </div>
                  )}
                  <div className="border-t border-primary-500/10 pt-4 flex flex-col gap-2">
                    <Btn onClick={captureGPS} variant="secondary" className="w-full">📍 Share Location</Btn>
                    {gpsStatus && <p className="text-xs text-center text-primary-400">{gpsStatus}</p>}
                  </div>
                  <p className="text-xs text-slate-600 text-center">Both are optional but improve verification score.</p>
                </div>
              )}

              {step!==2 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-primary-500/10">
                  {step>0 ? <Btn variant="ghost" onClick={()=>setStep(s=>s-1)}>← Back</Btn> : <div/>}
                  {step===5
                    ? <Btn onClick={()=>setStep(6)}>Complete →</Btn>
                    : <Btn onClick={handleNext} loading={loading}>{step===4?'Submit →':'Next →'}</Btn>
                  }
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-6 text-sm text-slate-600">Already have an account? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">Sign in</Link></p>
      </div>
    </PageWrapper>
  )
}
