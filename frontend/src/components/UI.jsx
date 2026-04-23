import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Page Wrapper with transition ────────────────────────────
export function PageWrapper({ children, className = '' }) {
  return (
    <div className={`min-h-screen bg-dark-500 ${className}`}>
      {children}
    </div>
  )
}

// ─── Avatar ───────────────────────────────────────────────────
export function Avatar({ src, name = '', size = 'md', online = false, className = '' }) {
  const sizes = { xs: 'w-7 h-7 text-xs', sm: 'w-9 h-9 text-sm', md: 'w-11 h-11 text-base', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl', '2xl': 'w-28 h-28 text-4xl' }
  const dotSizes = { xs: 'w-2 h-2', sm: 'w-2.5 h-2.5', md: 'w-3 h-3', lg: 'w-3.5 h-3.5', xl: 'w-4 h-4', '2xl': 'w-4 h-4' }
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  // Build correct image URL based on stored path
  // "selfies/file.jpg"  -> /api/uploads/selfies/file.jpg
  // "posts/file.jpg"    -> /api/uploads/posts/file.jpg
  // "file.jpg"          -> /api/uploads/posts/file.jpg (legacy avatars)
  const getImgUrl = (s) => {
    if (!s) return null
    if (s.startsWith('selfies/')) return `/api/uploads/${s}`
    if (s.startsWith('posts/'))   return `/api/uploads/${s}`
    if (s.startsWith('http'))     return s
    return `/api/uploads/posts/${s}`
  }

  const [imgFailed, setImgFailed] = React.useState(false)
  const imgUrl = !imgFailed ? getImgUrl(src) : null

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div className={`${sizes[size]} rounded-full overflow-hidden flex items-center justify-center font-bold bg-gradient-to-br from-primary-600 to-primary-800 text-white border-2 border-primary-500/30`}>
        {imgUrl
          ? <img src={imgUrl} alt={name} className="w-full h-full object-cover" onError={() => setImgFailed(true)} />
          : <span>{initials || '?'}</span>
        }
      </div>
      {online && <span className={`absolute bottom-0 right-0 ${dotSizes[size]} rounded-full bg-green-500 border-2 border-dark-500`} style={{ boxShadow: '0 0 6px #22c55e' }} />}
    </div>
  )
}

// ─── Badge ───────────────────────────────────────────────────
const badgeColors = {
  verified:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  pending:    'bg-amber-500/15 text-amber-400 border-amber-500/30',
  rejected:   'bg-red-500/15 text-red-400 border-red-500/30',
  suspended:  'bg-red-600/15 text-red-500 border-red-600/30',
  incomplete: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  blue:       'bg-primary-500/15 text-primary-400 border-primary-500/30',
  purple:     'bg-purple-500/15 text-purple-400 border-purple-500/30',
}
export function StatusBadge({ status, className = '' }) {
  const icons = { verified: '✓', pending: '⏳', rejected: '✗', suspended: '🔒', incomplete: '○' }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${badgeColors[status] || badgeColors.incomplete} ${className}`}>
      {icons[status]} {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  )
}

export function Tag({ children, color = 'blue', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${badgeColors[color] || badgeColors.blue} ${className}`}>
      {children}
    </span>
  )
}

// ─── Button ──────────────────────────────────────────────────
export function Btn({ children, variant = 'primary', size = 'md', loading = false, className = '', ...props }) {
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-400 text-white border-transparent shadow-glow-sm hover:shadow-glow-md',
    secondary: 'bg-dark-300 hover:bg-dark-200 text-slate-200 border-primary-500/20 hover:border-primary-500/40',
    ghost: 'bg-transparent hover:bg-primary-500/10 text-primary-400 border-primary-500/20 hover:border-primary-500/40',
    danger: 'bg-red-600/80 hover:bg-red-500 text-white border-transparent',
    success: 'bg-emerald-600/80 hover:bg-emerald-500 text-white border-transparent',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base', xl: 'px-8 py-4 text-lg' }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
}

// ─── Input ───────────────────────────────────────────────────
export function Input({ label, error, icon, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>}
        <input
          className={`w-full bg-dark-300 border ${error ? 'border-red-500/50' : 'border-primary-500/20'} rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all duration-200 ${icon ? 'pl-10 pr-4 py-3' : 'px-4 py-3'} text-sm`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>}
      <textarea
        className={`w-full bg-dark-300 border ${error ? 'border-red-500/50' : 'border-primary-500/20'} rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all duration-200 px-4 py-3 text-sm resize-none`}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>}
      <select
        className={`w-full bg-dark-300 border ${error ? 'border-red-500/50' : 'border-primary-500/20'} rounded-xl text-slate-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all duration-200 px-4 py-3 text-sm`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}

// ─── Card ────────────────────────────────────────────────────
export function Card({ children, className = '', hover = false, glow = false, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-primary-500/10 bg-dark-300/80 backdrop-blur-sm transition-all duration-300 ${hover ? 'hover:border-primary-500/30 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer' : ''} ${glow ? 'shadow-glow-sm' : 'shadow-card'} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// ─── Skeleton loader ─────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={`shimmer rounded-xl ${className}`} />
}

// ─── Modal ───────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={`relative w-full ${sizes[size]} glass rounded-2xl border border-primary-500/20 shadow-glow-md overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-primary-500/10">
            <h3 className="font-bold text-lg text-white font-display">{title}</h3>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors text-xl leading-none">✕</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  )
}

// ─── Toast notification ───────────────────────────────────────
export function Toast({ message, type = 'success', onClose }) {
  const colors = { success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', error: 'border-red-500/40 bg-red-500/10 text-red-300', info: 'border-primary-500/40 bg-primary-500/10 text-primary-300' }
  const icons  = { success: '✓', error: '✕', info: 'ℹ' }
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm ${colors[type]} shadow-lg max-w-sm`}
    >
      <span className="font-bold">{icons[type]}</span>
      <span className="text-sm flex-1">{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 text-lg leading-none">✕</button>
    </motion.div>
  )
}

// ─── Toast container hook ────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState([])
  const show = (message, type = 'success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }
  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => setToasts(p => p.filter(x => x.id !== t.id))} />)}
      </AnimatePresence>
    </div>
  )
  return { show, ToastContainer }
}

// ─── Empty state ─────────────────────────────────────────────
export function EmptyState({ icon = '🌐', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-slate-300 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-xs mb-6">{description}</p>}
      {action}
    </div>
  )
}

// ─── Compatibility score ring ─────────────────────────────────
export function CompatScore({ score }) {
  const max = 170
  const pct = Math.min(100, Math.round((score / max) * 100))
  const color = pct >= 70 ? '#22c55e' : pct >= 40 ? '#0066ff' : '#6b7280'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-8 h-8 relative">
        <svg viewBox="0 0 32 32" className="w-full h-full -rotate-90">
          <circle cx="16" cy="16" r="13" fill="none" stroke="#1e3a5f" strokeWidth="3" />
          <circle cx="16" cy="16" r="13" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 13}`}
            strokeDashoffset={`${2 * Math.PI * 13 * (1 - pct / 100)}`}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold" style={{ color }}>{pct}%</span>
      </div>
      <span className="text-xs text-slate-500">match</span>
    </div>
  )
}

// ─── OTP Input ───────────────────────────────────────────────
export function OTPInput({ value, onChange, error }) {
  const digits = 6
  const vals = value.split('')
  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !vals[i] && i > 0) document.getElementById(`otp-${i-1}`)?.focus()
  }
  const handleChange = (i, v) => {
    const d = v.replace(/\D/, '')
    const newVals = [...vals]
    newVals[i] = d
    onChange(newVals.join(''))
    if (d && i < digits - 1) document.getElementById(`otp-${i+1}`)?.focus()
  }
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2">
        {Array.from({ length: digits }, (_, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={vals[i] || ''}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKey(i, e)}
            className={`w-11 h-14 text-center text-xl font-bold font-mono bg-dark-400 border-2 rounded-xl transition-all duration-200
              ${vals[i] ? 'border-primary-500 text-white shadow-glow-sm' : 'border-primary-500/20 text-slate-500'}
              ${error ? 'border-red-500 animate-pulse' : ''}
              focus:outline-none focus:border-primary-400`}
          />
        ))}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
