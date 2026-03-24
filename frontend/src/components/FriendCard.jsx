import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Avatar, Btn, CompatScore, Tag } from './UI'
import { friendAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useAuthPrompt } from './AuthPrompt'

export default function FriendCard({ user, onRequestSent, showScore = true }) {
  const { user: authUser } = useAuth()
  const { prompt, AuthPromptModal } = useAuthPrompt()
  const [status, setStatus] = useState(user.request_status || null)
  const [loading, setLoading] = useState(false)

  const interests = user.interests_preview
    ? user.interests_preview.split(',').filter(Boolean).slice(0, 3)
    : []

  const handleSendRequest = async () => {
    if (!authUser) { prompt('add friends'); return }
    if (loading) return
    setLoading(true)
    try {
      await friendAPI.send({ user_id: user.user_id })
      setStatus('pending')
      onRequestSent?.()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleMessage = () => {
    if (!authUser) { prompt('send messages'); return }
  }

  const getActionBtn = () => {
    if (!authUser) {
      return (
        <Btn size="sm" variant="primary" onClick={handleSendRequest}>
          🔒 Add Friend
        </Btn>
      )
    }
    if (status === 'pending' && user.request_sender_id != user.user_id) {
      return <Btn size="sm" variant="secondary" disabled>Request Sent</Btn>
    }
    if (status === 'active') {
      return <Btn size="sm" variant="success" disabled>✓ Friends</Btn>
    }
    if (status === 'request_received') {
      return <Link to="/friends"><Btn size="sm" variant="primary">Respond ↗</Btn></Link>
    }
    return (
      <Btn size="sm" variant="primary" loading={loading} onClick={handleSendRequest}>
        + Add Friend
      </Btn>
    )
  }

  const age = user.age || (user.date_of_birth
    ? Math.floor((new Date() - new Date(user.date_of_birth)) / (365.25 * 24 * 3600 * 1000))
    : null)

  const profileLink = authUser ? `/profile/${user.user_id}` : '/register'
  const chatLink = authUser ? `/chat/${user.user_id}` : null

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="rounded-2xl border border-primary-500/10 bg-dark-300/80 backdrop-blur-sm hover:border-primary-500/30 hover:shadow-card-hover transition-all duration-300 overflow-hidden group"
    >
      <AuthPromptModal />

      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary-600 via-primary-400 to-accent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Link to={profileLink}>
            <Avatar src={user.profile_picture} name={user.full_name} size="lg" online={!!user.is_online} />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={profileLink}>
              <p className="font-bold text-slate-100 truncate hover:text-primary-400 transition-colors">
                {user.full_name}
              </p>
            </Link>
            <p className="text-xs text-slate-500 truncate">@{user.username}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-xs">{user.flag_emoji}</span>
              <span className="text-xs text-slate-500">{user.country_name}</span>
              {user.city && (
                <><span className="text-slate-700">·</span>
                  <span className="text-xs text-slate-500">{user.city}</span></>
              )}
              {age && (
                <><span className="text-slate-700">·</span>
                  <span className="text-xs text-slate-500">{age}y</span></>
              )}
            </div>
          </div>
          {showScore && user.compatibility_score > 0 && (
            <CompatScore score={user.compatibility_score} />
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{user.bio}</p>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {interests.map((int, i) => (
              <Tag key={i} color="blue" className="text-[10px] px-2 py-0.5">{int}</Tag>
            ))}
          </div>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {user.is_online
              ? <>
                <span className="w-2 h-2 bg-green-500 rounded-full" style={{ boxShadow: '0 0 6px #22c55e' }} />
                <span className="text-xs text-green-400">Online</span>
              </>
              : <span className="text-xs text-slate-600">Offline</span>
            }
          </div>
          <div className="flex items-center gap-2">
            {chatLink
              ? <Link to={chatLink}>
                <Btn size="sm" variant="ghost" className="px-2 py-1.5">💬</Btn>
              </Link>
              : <Btn size="sm" variant="ghost" className="px-2 py-1.5" onClick={handleMessage}>
                💬
              </Btn>
            }
            {getActionBtn()}
          </div>
        </div>
      </div>
    </motion.div>
  )
}