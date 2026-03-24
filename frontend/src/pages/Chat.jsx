import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PageWrapper, Avatar, Btn, EmptyState } from '../components/UI'
import Navbar from '../components/Navbar'
import { messageAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const timeAgo = (dt) => {
  const diff = (Date.now() - new Date(dt)) / 1000
  if (diff < 60) return 'now'
  if (diff < 3600) return `${Math.floor(diff/60)}m`
  if (diff < 86400) return `${Math.floor(diff/3600)}h`
  return new Date(dt).toLocaleDateString()
}

const formatTime = (dt) => new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default function Chat() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [conversations, setConversations] = useState([])
  const [messages, setMessages]           = useState([])
  const [otherUser, setOtherUser]         = useState(null)
  const [content, setContent]             = useState('')
  const [sending, setSending]             = useState(false)
  const [loadingConvs, setLoadingConvs]   = useState(true)
  const [loadingMsgs, setLoadingMsgs]     = useState(false)
  const [activeId, setActiveId]           = useState(id ? parseInt(id) : null)
  const bottomRef = useRef()
  const inputRef  = useRef()
  const pollRef   = useRef()

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const r = await messageAPI.getConversations()
      setConversations(r.data.conversations || [])
    } catch {}
    finally { setLoadingConvs(false) }
  }, [])

  // Load chat
  const loadChat = useCallback(async (uid) => {
    if (!uid) return
    setLoadingMsgs(true)
    try {
      const r = await messageAPI.getChat({ user_id: uid })
      setMessages(r.data.messages || [])
      setOtherUser(r.data.other_user)
    } catch {}
    finally { setLoadingMsgs(false) }
  }, [])

  // Poll for new messages
  const pollMessages = useCallback(async () => {
    if (!activeId) return
    try {
      const r = await messageAPI.getChat({ user_id: activeId })
      setMessages(r.data.messages || [])
    } catch {}
  }, [activeId])

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (activeId) {
      loadChat(activeId)
      navigate(`/chat/${activeId}`, { replace: true })
    }
    clearInterval(pollRef.current)
    if (activeId) {
      pollRef.current = setInterval(pollMessages, 2500)
    }
    return () => clearInterval(pollRef.current)
  }, [activeId])

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!content.trim() || !activeId || sending) return
    const text = content.trim()
    setContent('')
    setSending(true)

    // Optimistic
    const tempMsg = {
      message_id: Date.now(), sender_id: user.user_id, receiver_id: activeId,
      content: text, message_type: 'text', sent_at: new Date().toISOString(), is_read: 0,
      full_name: user.full_name, profile_picture: user.profile_picture
    }
    setMessages(p => [...p, tempMsg])

    try {
      const r = await messageAPI.send({ receiver_id: activeId, content: text })
      setMessages(p => p.map(m => m.message_id === tempMsg.message_id ? r.data.message : m))
      loadConversations()
    } catch {
      setMessages(p => p.filter(m => m.message_id !== tempMsg.message_id))
      setContent(text)
    } finally { setSending(false); inputRef.current?.focus() }
  }

  const selectConversation = (conv) => {
    setActiveId(conv.user_id)
    setOtherUser(conv)
    setMessages([])
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.sent_at).toLocaleDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(msg)
    return groups
  }, {})

  return (
    <PageWrapper>
      <Navbar />
      <div className="lg:pl-20 xl:pl-64 h-screen flex flex-col">
        <div className="flex flex-1 overflow-hidden pt-16 lg:pt-0 pb-16 lg:pb-0">

          {/* ── Conversations sidebar ── */}
          <div className={`${activeId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-72 xl:w-80 flex-col border-r border-primary-500/10 bg-dark-400/40 shrink-0`}>
            <div className="p-4 border-b border-primary-500/10">
              <h2 className="font-black text-lg text-white font-display">Messages</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="p-4 space-y-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                      <div className="w-12 h-12 bg-dark-300 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-dark-300 rounded w-24" />
                        <div className="h-2 bg-dark-300 rounded w-36" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
                  <span className="text-4xl">💬</span>
                  <p className="text-slate-500 text-sm">No conversations yet</p>
                  <Link to="/discover"><Btn size="sm" variant="ghost">Find Friends →</Btn></Link>
                </div>
              ) : (
                conversations.map(conv => (
                  <button key={conv.user_id} onClick={() => selectConversation(conv)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-500/5 transition-colors text-left border-b border-primary-500/5
                      ${activeId === conv.user_id ? 'bg-primary-500/10 border-l-2 border-l-primary-500' : ''}`}
                  >
                    <Avatar src={conv.profile_picture} name={conv.full_name} size="md" online={!!conv.is_online} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-slate-200 truncate">{conv.full_name}</p>
                        <span className="text-xs text-slate-600 shrink-0 ml-2">{timeAgo(conv.last_message_at)}</span>
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${conv.unread_count > 0 ? 'text-slate-300 font-semibold' : 'text-slate-600'}`}>
                        {conv.last_sender_id == user?.user_id ? 'You: ' : ''}{conv.last_message}
                      </p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="shrink-0 bg-primary-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{conv.unread_count}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Chat window ── */}
          <div className={`${!activeId ? 'hidden md:flex' : 'flex'} flex-1 flex-col min-w-0`}>
            {!activeId ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <span className="text-6xl">💬</span>
                <h3 className="font-bold text-slate-400">Select a conversation</h3>
                <p className="text-sm text-slate-600">Choose from your conversations on the left</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-primary-500/10 bg-dark-400/40 shrink-0">
                  <button onClick={() => { setActiveId(null); navigate('/chat') }} className="md:hidden text-slate-500 hover:text-slate-300 transition-colors mr-1">←</button>
                  {otherUser && (
                    <>
                      <Link to={`/profile/${otherUser.user_id}`}>
                        <Avatar src={otherUser.profile_picture} name={otherUser.full_name} size="md" online={!!otherUser.is_online} />
                      </Link>
                      <div className="flex-1">
                        <Link to={`/profile/${otherUser.user_id}`} className="font-bold text-slate-100 hover:text-primary-400 transition-colors">{otherUser.full_name}</Link>
                        <p className="text-xs text-slate-500">
                          {otherUser.is_online ? <span className="text-green-400">● Online</span> : `Last seen ${timeAgo(otherUser.last_seen || '')} ago`}
                          {otherUser.flag_emoji && <span className="ml-2">{otherUser.flag_emoji} {otherUser.country_name}</span>}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <span className="text-4xl">👋</span>
                      <p className="text-slate-500 text-sm">Say hello to {otherUser?.full_name}!</p>
                    </div>
                  ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                      <div key={date}>
                        <div className="flex items-center gap-3 my-4">
                          <div className="flex-1 h-px bg-primary-500/10" />
                          <span className="text-xs text-slate-600 font-medium">{date}</span>
                          <div className="flex-1 h-px bg-primary-500/10" />
                        </div>
                        <div className="space-y-1.5">
                          {msgs.map((msg, i) => {
                            const isMe = msg.sender_id == user?.user_id
                            const showAvatar = !isMe && (i === 0 || msgs[i-1]?.sender_id !== msg.sender_id)
                            return (
                              <motion.div key={msg.message_id}
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.15 }}
                                className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                              >
                                {!isMe && (showAvatar
                                  ? <Avatar src={otherUser?.profile_picture} name={otherUser?.full_name || ''} size="xs" />
                                  : <div className="w-7" />
                                )}
                                <div className={`max-w-[75%] group`}>
                                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                                    ${isMe
                                      ? 'bg-primary-600/80 text-white rounded-br-sm'
                                      : 'bg-dark-200 text-slate-200 border border-primary-500/10 rounded-bl-sm'}`}>
                                    {msg.content}
                                  </div>
                                  <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <span className="text-[10px] text-slate-700">{formatTime(msg.sent_at)}</span>
                                    {isMe && <span className={`text-[10px] ${msg.is_read ? 'text-primary-400' : 'text-slate-700'}`}>{msg.is_read ? '✓✓' : '✓'}</span>}
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="flex items-center gap-3 px-4 py-3 border-t border-primary-500/10 bg-dark-400/40 shrink-0">
                  <div className="flex-1 flex items-center gap-2 bg-dark-300 border border-primary-500/20 rounded-2xl px-4 py-2.5 focus-within:border-primary-500/50 transition-colors">
                    <input
                      ref={inputRef}
                      type="text"
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder={`Message ${otherUser?.full_name || ''}…`}
                      className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none"
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) } }}
                    />
                  </div>
                  <button type="submit" disabled={!content.trim() || sending}
                    className="w-10 h-10 bg-primary-500 hover:bg-primary-400 disabled:opacity-40 rounded-xl flex items-center justify-center text-white transition-all active:scale-95 shadow-glow-sm">
                    {sending ? <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <span className="text-lg">➤</span>}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
