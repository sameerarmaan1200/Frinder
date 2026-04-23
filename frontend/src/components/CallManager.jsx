import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar } from './UI'

// ── Free STUN servers ─────────────────────────────────────────
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
}

const token = () => localStorage.getItem('frinder_token') || ''

const callFetch = (action, body = null) => {
  const opts = {
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    method: body ? 'POST' : 'GET',
  }
  if (body) opts.body = JSON.stringify(body)
  return fetch(`/api/calls/calls.php?action=${action}`, opts).then(r => r.json()).catch(() => null)
}

const fmt = (s) => {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

// Control button component
function CtrlBtn({ icon, label, active, danger, onClick }) {
  return (
    <button onClick={onClick}
      className="flex flex-col items-center gap-1.5 group"
    >
      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all duration-200 hover:scale-110 active:scale-95 ${
        danger
          ? 'bg-red-500 hover:bg-red-400 shadow-lg'
          : active
            ? 'bg-white/10 hover:bg-white/15 ring-2 ring-white/30'
            : 'bg-white/10 hover:bg-white/15'
      }`}
        style={danger ? { boxShadow: '0 4px 20px rgba(239,68,68,0.5)' } : {}}>
        {icon}
      </div>
      <span className="text-xs text-white/50 font-medium">{label}</span>
    </button>
  )
}

export default function CallManager({ otherUser, currentUser }) {
  const [state,       setState]       = useState('idle')
  const [callType,    setCallType]    = useState('audio')
  const [callId,      setCallId]      = useState(null)
  const [incoming,    setIncoming]    = useState(null)
  const [duration,    setDuration]    = useState(0)
  const [muted,       setMuted]       = useState(false)
  const [videoOff,    setVideoOff]    = useState(false)
  const [error,       setError]       = useState('')
  const [remoteReady, setRemoteReady] = useState(false)

  const pc          = useRef(null)
  const localStream = useRef(null)
  const localVid    = useRef(null)
  const remoteVid   = useRef(null)
  const pollRef     = useRef(null)
  const timerRef    = useRef(null)
  const iceBatch    = useRef([])
  const iceTimer    = useRef(null)

  // ── Cleanup ────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    clearInterval(pollRef.current)
    clearInterval(timerRef.current)
    clearTimeout(iceTimer.current)
    localStream.current?.getTracks().forEach(t => t.stop())
    localStream.current = null
    if (pc.current) { pc.current.close(); pc.current = null }
    if (localVid.current)  localVid.current.srcObject  = null
    if (remoteVid.current) remoteVid.current.srcObject = null
    iceBatch.current = []
    setDuration(0)
    setMuted(false)
    setVideoOff(false)
    setRemoteReady(false)
    setError('')
  }, [])

  // ── Get media ──────────────────────────────────────────────
  const getMedia = useCallback(async (type) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === 'video' ? { width: 640, height: 480, facingMode: 'user' } : false
    })
    localStream.current = stream
    if (localVid.current) {
      localVid.current.srcObject = stream
      localVid.current.muted = true
    }
    return stream
  }, [])

  // ── Create peer connection ─────────────────────────────────
  const buildPC = useCallback((role, cid) => {
    const conn = new RTCPeerConnection(ICE_SERVERS)
    pc.current = conn

    conn.onicecandidate = ({ candidate }) => {
      if (!candidate) return
      iceBatch.current.push(candidate)
      clearTimeout(iceTimer.current)
      iceTimer.current = setTimeout(async () => {
        if (iceBatch.current.length && cid) {
          await callFetch('ice', { call_id: cid, ice: JSON.stringify(iceBatch.current), role })
          iceBatch.current = []
        }
      }, 600)
    }

    conn.ontrack = ({ streams }) => {
      if (streams[0] && remoteVid.current) {
        remoteVid.current.srcObject = streams[0]
        setRemoteReady(true)
      }
    }

    conn.onconnectionstatechange = () => {
      const s = conn.connectionState
      if (s === 'connected') {
        setState('active')
        let sec = 0
        timerRef.current = setInterval(() => { sec++; setDuration(sec) }, 1000)
      }
      if (['disconnected', 'failed', 'closed'].includes(s) && pc.current) {
        handleEnd(false)
      }
    }
    return conn
  }, [])

  // ── Start call (caller) ────────────────────────────────────
  const startCall = useCallback(async (type) => {
    if (state !== 'idle') return
    setCallType(type)
    setState('calling')
    setError('')

    try {
      const stream = await getMedia(type).catch(e => {
        throw new Error(e.name === 'NotAllowedError'
          ? 'Camera/microphone access denied. Please allow in browser settings.'
          : 'Could not access camera/microphone.')
      })

      const conn  = buildPC('caller', null)
      stream.getTracks().forEach(t => conn.addTrack(t, stream))

      const offer  = await conn.createOffer()
      await conn.setLocalDescription(offer)

      const res = await callFetch('initiate', {
        receiver_id: otherUser.user_id,
        call_type:   type,
        offer_sdp:   JSON.stringify(offer)
      })

      if (!res?.success) throw new Error(res?.message || 'Failed to reach server')

      const cid = res.data.call_id
      setCallId(cid)

      // Update ICE handler with real callId
      conn.onicecandidate = ({ candidate }) => {
        if (!candidate) return
        iceBatch.current.push(candidate)
        clearTimeout(iceTimer.current)
        iceTimer.current = setTimeout(async () => {
          await callFetch('ice', { call_id: cid, ice: JSON.stringify(iceBatch.current), role: 'caller' })
          iceBatch.current = []
        }, 600)
      }

      // Poll for answer
      let ticks = 0
      pollRef.current = setInterval(async () => {
        ticks++
        if (ticks > 25) { // ~50s timeout
          clearInterval(pollRef.current)
          await callFetch('end', { call_id: cid })
          cleanup()
          setState('idle')
          setError(`${otherUser.full_name} did not answer`)
          setTimeout(() => setError(''), 3000)
          return
        }

        const poll = await callFetch(`poll&call_id=${cid}`)
        const cs = poll?.data?.call_status

        if (cs?.status === 'active' && cs.answer_sdp) {
          clearInterval(pollRef.current)
          await conn.setRemoteDescription(new RTCSessionDescription(JSON.parse(cs.answer_sdp)))

          // Apply remote ICE
          setTimeout(async () => {
            const iceRes = await callFetch(`get_ice&call_id=${cid}&role=caller`)
            const raw = iceRes?.data?.ice
            if (raw) {
              const cands = JSON.parse(raw)
              for (const c of cands) {
                try { await conn.addIceCandidate(new RTCIceCandidate(c)) } catch {}
              }
            }
          }, 800)

        } else if (['rejected', 'missed', 'ended'].includes(cs?.status)) {
          clearInterval(pollRef.current)
          cleanup()
          setState('idle')
          if (cs.status === 'rejected') {
            setError(`${otherUser.full_name} declined the call`)
            setTimeout(() => setError(''), 3000)
          }
        }
      }, 2000)

    } catch (err) {
      cleanup()
      setState('idle')
      setError(err.message)
      setTimeout(() => setError(''), 4000)
    }
  }, [state, otherUser, getMedia, buildPC, cleanup])

  // ── Poll for incoming calls ────────────────────────────────
  useEffect(() => {
    if (!currentUser) return
    const poll = setInterval(async () => {
      if (state !== 'idle') return
      const res = await callFetch('poll')
      const inc = res?.data?.incoming
      if (inc && String(inc.caller_user_id) !== String(currentUser.user_id)) {
        setIncoming(inc)
        setState('incoming')
        setCallType(inc.call_type)
        setCallId(inc.call_id)
      }
    }, 2500)
    return () => clearInterval(poll)
  }, [state, currentUser])

  // ── Answer ─────────────────────────────────────────────────
  const answerCall = useCallback(async () => {
    if (!incoming) return
    setError('')

    try {
      const stream = await getMedia(callType).catch(e => {
        throw new Error(e.name === 'NotAllowedError'
          ? 'Camera/microphone access denied.'
          : 'Could not access camera/microphone.')
      })

      const cid  = incoming.call_id
      const conn = buildPC('receiver', cid)
      stream.getTracks().forEach(t => conn.addTrack(t, stream))

      await conn.setRemoteDescription(new RTCSessionDescription(JSON.parse(incoming.offer_sdp)))
      const answer = await conn.createAnswer()
      await conn.setLocalDescription(answer)

      const res = await callFetch('answer', { call_id: cid, answer_sdp: JSON.stringify(answer) })
      if (!res?.success) throw new Error(res?.message || 'Answer failed')

      setState('active')
      let sec = 0
      timerRef.current = setInterval(() => { sec++; setDuration(sec) }, 1000)

      // Apply caller ICE
      setTimeout(async () => {
        const iceRes = await callFetch(`get_ice&call_id=${cid}&role=receiver`)
        const raw = iceRes?.data?.ice
        if (raw) {
          const cands = JSON.parse(raw)
          for (const c of cands) {
            try { await conn.addIceCandidate(new RTCIceCandidate(c)) } catch {}
          }
        }
      }, 800)

    } catch (err) {
      cleanup()
      setState('idle')
      setIncoming(null)
      setError(err.message)
      setTimeout(() => setError(''), 4000)
    }
  }, [incoming, callType, getMedia, buildPC, cleanup])

  // ── Reject ─────────────────────────────────────────────────
  const rejectCall = useCallback(async () => {
    if (callId) await callFetch('reject', { call_id: callId })
    cleanup()
    setState('idle')
    setIncoming(null)
  }, [callId, cleanup])

  // ── End ────────────────────────────────────────────────────
  const handleEnd = useCallback(async (notify = true) => {
    clearInterval(pollRef.current)
    clearInterval(timerRef.current)
    if (notify && callId) await callFetch('end', { call_id: callId }).catch(() => {})
    const dur = duration
    cleanup()
    setState('ended')
    setDuration(dur)
    setTimeout(() => { setState('idle'); setCallId(null); setIncoming(null) }, 2000)
  }, [callId, duration, cleanup])

  const toggleMute  = () => {
    localStream.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
    setMuted(m => !m)
  }
  const toggleVideo = () => {
    localStream.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
    setVideoOff(v => !v)
  }

  if (!otherUser) return null

  return (
    <>
      {/* ── CALL TRIGGER BUTTONS ─────────────────────────── */}
      {state === 'idle' && (
        <div className="flex items-center gap-0.5">
          <button onClick={() => startCall('audio')} title="Voice call"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/8 active:scale-95 group">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="text-slate-400 group-hover:text-primary-400 transition-colors">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.9 19.79 19.79 0 01.22 1.26 2 2 0 012.2 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.05 6.05l1.08-1.08a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
          </button>
          <button onClick={() => startCall('video')} title="Video call"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/8 active:scale-95 group">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="text-slate-400 group-hover:text-primary-400 transition-colors">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── ERROR TOAST ──────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-4 left-1/2 z-[60] px-5 py-3 rounded-2xl text-sm font-semibold text-white max-w-sm text-center"
            style={{ background: 'rgba(239,68,68,0.95)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── OUTGOING CALL ────────────────────────────────── */}
      <AnimatePresence>
        {state === 'calling' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0d1a35 50%, #070c18 100%)' }}>

            {/* Pulse rings */}
            <div className="relative mb-10">
              {[1.6, 2.1, 2.6].map((scale, i) => (
                <motion.div key={i}
                  animate={{ scale: [1, scale, 1], opacity: [0.15, 0, 0.15] }}
                  transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.5 }}
                  className="absolute inset-0 rounded-full border-2 border-primary-400"
                  style={{ transform: `scale(${scale})` }}
                />
              ))}
              <div className="relative z-10 w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary-500/30">
                <Avatar src={otherUser.profile_picture} name={otherUser.full_name} size="xl" />
              </div>
            </div>

            <p className="text-white font-black text-2xl mb-1 tracking-tight">{otherUser.full_name}</p>
            <p className="text-slate-400 text-sm mb-1">
              {callType === 'video' ? 'Video calling…' : 'Calling…'}
            </p>
            <p className="text-slate-600 text-xs mb-14">Frinder</p>

            {/* End button */}
            <button onClick={() => handleEnd(true)}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ background: '#ef4444', boxShadow: '0 6px 30px rgba(239,68,68,0.6)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── INCOMING CALL ────────────────────────────────── */}
      <AnimatePresence>
        {state === 'incoming' && incoming && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }} transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-8 px-4">
            <div className="w-full max-w-sm rounded-3xl p-6 text-center"
              style={{ background: 'rgba(13,21,38,0.98)', border: '1px solid rgba(0,102,255,0.2)', backdropFilter: 'blur(20px)', boxShadow: '0 -8px 60px rgba(0,0,0,0.6)' }}>

              {/* Avatar with ring animation */}
              <div className="relative inline-block mb-4">
                <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1.8 }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: callType === 'video' ? 'rgba(0,102,255,0.2)' : 'rgba(34,197,94,0.2)', transform: 'scale(1.5)' }} />
                <div className="relative z-10 w-16 h-16 rounded-full overflow-hidden ring-4 ring-primary-500/40 mx-auto">
                  <Avatar src={incoming.caller_pic} name={incoming.caller_name} size="lg" />
                </div>
              </div>

              <p className="text-white font-black text-xl mb-0.5">{incoming.caller_name}</p>
              <p className="text-slate-400 text-sm mb-1">
                {callType === 'video' ? '📹 Incoming video call' : '📞 Incoming voice call'}
              </p>
              <p className="text-slate-600 text-xs mb-6">Frinder</p>

              <div className="flex items-center justify-center gap-12">
                {/* Decline */}
                <div className="flex flex-col items-center gap-2">
                  <button onClick={rejectCall}
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    style={{ background: '#ef4444', boxShadow: '0 4px 20px rgba(239,68,68,0.4)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
                    </svg>
                  </button>
                  <span className="text-xs text-slate-500">Decline</span>
                </div>

                {/* Accept */}
                <div className="flex flex-col items-center gap-2">
                  <button onClick={answerCall}
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    style={{ background: '#22c55e', boxShadow: '0 4px 20px rgba(34,197,94,0.4)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.9 19.79 19.79 0 01.22 1.26 2 2 0 012.2 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.05 6.05l1.08-1.08a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                  </button>
                  <span className="text-xs text-slate-500">Accept</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ACTIVE CALL ──────────────────────────────────── */}
      <AnimatePresence>
        {state === 'active' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: '#050a14' }}>

            {callType === 'video' ? (
              // ── VIDEO CALL ──────────────────────────────
              <div className="relative flex-1 bg-black overflow-hidden">
                {/* Remote video — full screen */}
                <video ref={remoteVid} autoPlay playsInline className="w-full h-full object-cover"
                  style={{ background: '#0a1020' }} />

                {/* Remote placeholder when connecting */}
                {!remoteReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white/20 mb-4">
                      <Avatar src={otherUser.profile_picture} name={otherUser.full_name} size="xl" />
                    </div>
                    <p className="text-white/60 text-sm">Connecting…</p>
                  </div>
                )}

                {/* Top bar */}
                <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between"
                  style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white text-sm font-semibold">{otherUser.full_name}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full text-white text-sm font-mono"
                    style={{ background: 'rgba(0,0,0,0.4)' }}>
                    {fmt(duration)}
                  </div>
                </div>

                {/* Local video PiP */}
                <div className="absolute bottom-28 right-4 rounded-2xl overflow-hidden shadow-xl"
                  style={{ width: 100, height: 140, border: '2px solid rgba(255,255,255,0.15)' }}>
                  <video ref={localVid} autoPlay playsInline muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)', background: '#0a1020' }} />
                  {videoOff && (
                    <div className="absolute inset-0 bg-dark-500 flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // ── AUDIO CALL ──────────────────────────────
              <div className="flex-1 flex flex-col items-center justify-center"
                style={{ background: 'linear-gradient(160deg, #0a0f1e, #0d1a35, #070c18)' }}>
                {/* Hidden audio element */}
                <video ref={remoteVid} autoPlay playsInline className="hidden" />

                {/* Avatar */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="relative mb-6">
                  <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary-500/40 shadow-2xl">
                    <Avatar src={otherUser.profile_picture} name={otherUser.full_name} size="xl" />
                  </div>
                </motion.div>

                <p className="text-white font-black text-2xl tracking-tight mb-1">{otherUser.full_name}</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-green-400 text-sm font-medium">Connected</p>
                </div>
                <p className="text-white/50 font-mono text-xl tracking-wider">{fmt(duration)}</p>
              </div>
            )}

            {/* ── Controls bar ─────────────────────────── */}
            <div className="flex-shrink-0 flex items-center justify-center gap-6 px-6 py-5"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)' }}>

              <CtrlBtn icon={muted ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white" opacity="0.6">
                  <line x1="1" y1="1" x2="23" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/>
                  <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23"/>
                  <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="23" x2="16" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                  <path d="M19 10v2a7 7 0 01-14 0v-2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="23" x2="16" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )} label={muted ? 'Unmute' : 'Mute'} active={muted} onClick={toggleMute} />

              {callType === 'video' && (
                <CtrlBtn icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={videoOff ? 0.6 : 1}>
                    {videoOff ? (
                      <>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                        <path d="M21 21H3a2 2 0 01-2-2V8a2 2 0 012-2h3m3-3h6l2 3h4a2 2 0 012 2v9.34m-7.72-2.06A3 3 0 019.88 15a3 3 0 01-1.8-3.8"/>
                      </>
                    ) : (
                      <>
                        <polygon points="23 7 16 12 23 17 23 7"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                      </>
                    )}
                  </svg>
                } label={videoOff ? 'Cam on' : 'Cam off'} active={videoOff} onClick={toggleVideo} />
              )}

              {/* End call */}
              <CtrlBtn icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
                </svg>
              } label="End" danger onClick={() => handleEnd(true)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CALL ENDED ──────────────────────────────────── */}
      <AnimatePresence>
        {state === 'ended' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'rgba(5,10,20,0.96)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#ef4444">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
              </svg>
            </div>
            <p className="text-white font-bold text-lg mb-1">Call ended</p>
            {duration > 0 && <p className="text-slate-500 text-sm">{fmt(duration)}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}