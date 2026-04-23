import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PageWrapper, Avatar, Btn, EmptyState, useToast } from '../components/UI'
import Navbar from '../components/Navbar'
import { messageAPI, friendAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import CallManager from '../components/CallManager'

const timeAgo = (dt) => {
  if (!dt) return ''
  const diff = (Date.now() - new Date(dt)) / 1000
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(dt).toLocaleDateString()
}

const formatBytes = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024)       return `${bytes} B`
  if (bytes < 1024*1024)  return `${(bytes/1024).toFixed(1)} KB`
  return `${(bytes/1024/1024).toFixed(1)} MB`
}

// File type icon
const fileIcon = (mime, type) => {
  if (type === 'image') return '🖼️'
  if (type === 'video') return '🎬'
  if (!mime) return '📎'
  if (mime.includes('pdf'))         return '📄'
  if (mime.includes('word'))        return '📝'
  if (mime.includes('excel') || mime.includes('sheet')) return '📊'
  if (mime.includes('powerpoint') || mime.includes('presentation')) return '📊'
  if (mime.includes('zip'))         return '🗜️'
  if (mime.includes('text'))        return '📃'
  return '📎'
}

// Render a message bubble content based on type
function MessageContent({ msg, isMine }) {
  const [imgExpanded, setImgExpanded] = useState(false)
  const filePath = msg.file_path ? `/api/uploads/${msg.file_path}` : null

  // Image
  if (msg.message_type === 'image' && filePath) {
    return (
      <>
        <div className="cursor-pointer rounded-xl overflow-hidden max-w-xs"
          onClick={() => setImgExpanded(true)}>
          <img src={filePath} alt={msg.file_name || 'Image'}
            className="w-full max-h-60 object-cover hover:opacity-90 transition-opacity"
            onError={e => e.target.src = '/api/uploads/posts/broken.jpg'} />
          {msg.content && msg.content !== msg.file_name && (
            <p className="px-3 py-2 text-sm text-slate-200">{msg.content}</p>
          )}
        </div>

        {/* Fullscreen */}
        <AnimatePresence>
          {imgExpanded && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setImgExpanded(false)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.95)' }}>
              <img src={filePath} alt="" className="max-w-full max-h-full object-contain rounded-xl" />
              <a href={filePath} download={msg.file_name}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-primary-600 transition-colors"
                onClick={e => e.stopPropagation()}>
                ⬇️ Download
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  // Video
  if (msg.message_type === 'video' && filePath) {
    return (
      <div className="max-w-xs">
        <video src={filePath} controls className="w-full max-h-56 rounded-xl"
          style={{ background: '#000' }}>
          Your browser does not support video.
        </video>
        {msg.content && msg.content !== msg.file_name && (
          <p className="mt-1 text-sm text-slate-200">{msg.content}</p>
        )}
        <a href={filePath} download={msg.file_name}
          className="inline-flex items-center gap-1 mt-1.5 text-xs text-primary-400 hover:text-primary-300">
          ⬇️ Download {msg.file_name}
        </a>
      </div>
    )
  }

  // Document
  if (msg.message_type === 'doc' && filePath) {
    return (
      <a href={filePath} download={msg.file_name} target="_blank" rel="noreferrer"
        className="flex items-center gap-3 p-3 rounded-xl hover:opacity-80 transition-opacity"
        style={{ background: 'rgba(0,102,255,0.12)', border: '1px solid rgba(0,102,255,0.2)', maxWidth: 280 }}>
        <span className="text-3xl">{fileIcon(msg.file_mime, 'doc')}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{msg.file_name || msg.content}</p>
          <p className="text-xs text-slate-400">{formatBytes(msg.file_size)} · Tap to download</p>
        </div>
        <span className="text-primary-400 text-lg">⬇️</span>
      </a>
    )
  }

  // Regular text
  return <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
}

export default function Chat() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { user }   = useAuth()
  const { show, ToastContainer } = useToast()

  const [conversations, setConversations] = useState([])
  const [messages,      setMessages]      = useState([])
  const [otherUser,     setOtherUser]     = useState(null)
  const [text,          setText]          = useState('')
  const [sending,       setSending]       = useState(false)
  const [uploading,     setUploading]     = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [friends,       setFriends]       = useState([])
  const [showNewChat,   setShowNewChat]   = useState(false)
  const [selectedFile,  setSelectedFile]  = useState(null)  // { file, preview, type }
  const [caption,       setCaption]       = useState('')

  const messagesEndRef = useRef()
  const fileInputRef   = useRef()
  const pollRef        = useRef()
  const unpack = (payload) => (
    payload?.data && typeof payload.data === 'object'
      ? { ...payload, ...payload.data, data: payload.data }
      : payload
  )

  const otherId = id ? parseInt(id) : null

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
    loadFriends()
  }, [])

  // Load chat when otherId changes
  useEffect(() => {
    if (otherId) {
      loadChat(otherId)
      startPolling(otherId)
    }
    return () => clearInterval(pollRef.current)
  }, [otherId])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = async () => {
    try {
      const r = await messageAPI.getConversations()
      setConversations(r.data.conversations || [])
    } catch {}
  }

  const loadChat = async (uid) => {
    try {
      const r = await messageAPI.getChat({ user_id: uid })
      setMessages(r.data.messages || [])
      setOtherUser(r.data.other_user)
      loadConversations()
    } catch {}
  }

  const loadFriends = async () => {
    try {
      const r = await friendAPI.getFriends()
      setFriends(r.data.friends || [])
    } catch {}
  }

  // Poll for new messages every 3 seconds
  const startPolling = (uid) => {
    clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const r = await messageAPI.getChat({ user_id: uid })
        setMessages(prev => {
          const newMsgs = r.data.messages || []
          if (newMsgs.length !== prev.length) return newMsgs
          return prev
        })
        loadConversations()
      } catch {}
    }, 3000)
  }

  // Send text message
  const handleSend = async () => {
    if (!text.trim() || !otherId || sending) return
    setSending(true)
    const t = text.trim()
    setText('')
    try {
      const r = await messageAPI.send({ receiver_id: otherId, content: t, type: 'text' })
      setMessages(prev => [...prev, r.data.message])
      loadConversations()
    } catch {
      setText(t)
      show('Failed to send message', 'error')
    }
    setSending(false)
  }

  // File picker
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''

    // Size check
    if (file.size > 10 * 1024 * 1024) {
      show('File too large. Maximum size is 10MB.', 'error')
      return
    }

    const type = file.type.startsWith('image/') ? 'image'
               : file.type.startsWith('video/') ? 'video'
               : 'doc'

    // Generate preview for images
    if (type === 'image') {
      const reader = new FileReader()
      reader.onload = () => setSelectedFile({ file, preview: reader.result, type })
      reader.readAsDataURL(file)
    } else {
      setSelectedFile({ file, preview: null, type })
    }
  }

  // Upload file and send
  const handleFileSend = async () => {
    if (!selectedFile || !otherId) return
    setUploading(true)
    setUploadProgress(0)

    const fd = new FormData()
    fd.append('file', selectedFile.file)
    fd.append('receiver_id', otherId)
    if (caption.trim()) fd.append('caption', caption.trim())

    try {
      const r = await fetch('/api/messages/messages.php?action=upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('frinder_token')}` },
        body: fd
      })
      const data = unpack(await r.json())
      if (data.success) {
        setMessages(prev => [...prev, data.message])
        loadConversations()
        setSelectedFile(null)
        setCaption('')
        show('File sent!', 'success')
      } else {
        show(data.message || 'Failed to send file', 'error')
      }
    } catch {
      show('Failed to send file', 'error')
    }
    setUploading(false)
    setUploadProgress(0)
  }

  // Cancel file selection
  const cancelFile = () => {
    setSelectedFile(null)
    setCaption('')
  }

  // Conversation preview text
  const convPreview = (conv) => {
    const isMine = conv.last_sender_id === user?.user_id
    const prefix = isMine ? 'You: ' : ''
    if (conv.last_message_type === 'image') return prefix + '📷 Image'
    if (conv.last_message_type === 'video') return prefix + '🎬 Video'
    if (conv.last_message_type === 'doc')   return prefix + `📎 ${conv.last_file_name || 'Document'}`
    return prefix + (conv.last_message || '')
  }

  return (
    <PageWrapper>
      <ToastContainer />
      <Navbar />

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" className="hidden"
        accept="image/*,video/mp4,video/webm,video/quicktime,video/x-msvideo,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,application/zip"
        onChange={handleFileSelect} />

      <div className="lg:pl-20 xl:pl-64 min-h-screen flex">
        <div className="flex-1 flex max-w-6xl mx-auto w-full">

          {/* ── Conversations sidebar ── */}
          <div className={`${otherId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-2 border-sky-400/60 shadow-lg shadow-sky-500/20 rounded-l-2xl overflow-hidden`}
            style={{ background: 'rgba(7,12,24,0.98)' }}>

            {/* Sidebar header */}
            <div className="p-4 border-b border-primary-500/15 flex items-center justify-between"
              style={{ background: 'rgba(10,16,32,0.99)' }}>
              <h2 className="font-black text-white text-lg font-display">Messages</h2>
              <button onClick={() => setShowNewChat(s => !s)}
                className="w-9 h-9 rounded-xl bg-primary-500/15 border border-primary-500/25 flex items-center justify-center text-primary-400 hover:bg-primary-500/25 transition-all text-xl font-bold">
                ✏️
              </button>
            </div>

            {/* New chat - friends list */}
            <AnimatePresence>
              {showNewChat && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-primary-500/15"
                  style={{ background: 'rgba(0,102,255,0.04)' }}>
                  <div className="p-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start a chat</p>
                    {friends.length === 0 ? (
                      <p className="text-xs text-slate-600 p-2">Add friends to start chatting</p>
                    ) : (
                      friends.map(f => (
                        <button key={f.user_id} onClick={() => { navigate(`/chat/${f.user_id}`); setShowNewChat(false) }}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary-500/10 transition-all text-left">
                          <Avatar src={f.profile_picture} name={f.full_name} size="sm" online={!!f.is_online} />
                          <div>
                            <p className="text-sm font-semibold text-white">{f.full_name}</p>
                            <p className="text-xs text-slate-500">{f.flag_emoji} {f.country_name}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Conversations list */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <EmptyState icon="💬" title="No conversations yet"
                  description="Click ✏️ above to start chatting with a friend" />
              ) : (
                conversations.map(conv => (
                  <button key={conv.user_id}
                    onClick={() => navigate(`/chat/${conv.user_id}`)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-primary-500/8 transition-all text-left ${
                      otherId === conv.user_id
                        ? 'bg-primary-500/12 border-l-2 border-l-primary-500'
                        : 'hover:bg-primary-500/6'
                    }`}>
                    <div className="relative shrink-0">
                      <Avatar src={conv.profile_picture} name={conv.full_name} size="md" online={!!conv.is_online} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-sm truncate">{conv.full_name}</span>
                        <span className="text-xs text-slate-600 shrink-0 ml-2">{timeAgo(conv.last_message_at)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-slate-500 truncate flex-1">{convPreview(conv)}</p>
                        {conv.unread_count > 0 && (
                          <span className="ml-2 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                            {conv.unread_count > 9 ? '9+' : conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Chat window ── */}
          <div className={`${otherId ? 'flex' : 'hidden md:flex'} flex-col flex-1 border-2 border-sky-400/60 shadow-lg shadow-sky-500/20 rounded-r-2xl overflow-hidden`}
            style={{ background: 'rgba(7,12,24,0.99)' }}>

            {!otherId ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="text-6xl">💬</div>
                <h3 className="font-black text-xl text-white">Select a conversation</h3>
                <p className="text-slate-500 text-sm">Choose from your chats or start a new one</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-primary-500/15"
                  style={{ background: 'rgba(10,16,32,0.99)' }}>
                  <button onClick={() => navigate('/chat')} className="md:hidden text-slate-500 hover:text-white mr-1">←</button>
                  {otherUser && (
                    <>
                      <Link to={`/profile/${otherUser.user_id}`}>
                        <Avatar src={otherUser.profile_picture} name={otherUser.full_name}
                          size="md" online={!!otherUser.is_online} />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/profile/${otherUser.user_id}`}>
                          <p className="font-bold text-white text-sm hover:text-primary-400 transition-colors">
                            {otherUser.full_name}
                          </p>
                        </Link>
                        <p className="text-xs text-slate-500">
                          {otherUser.is_online ? (
                            <span className="text-green-400">● Online</span>
                          ) : (
                            `Last seen ${timeAgo(otherUser.last_seen)}`
                          )}
                        </p>
                      </div>
                      {/* Call buttons via CallManager */}
                      <CallManager otherUser={otherUser} currentUser={user} />
                    </>
                  )}
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
                  style={{ background: 'rgba(7,12,24,0.99)' }}>
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <span className="text-5xl">👋</span>
                      <p className="text-slate-500 text-sm">Say hello to {otherUser?.full_name}!</p>
                      <p className="text-xs text-slate-600">Share text, images, videos, docs · 📞 Audio & 🎥 Video calls</p>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMine = msg.sender_id === user?.user_id
                      return (
                        <div key={msg.message_id} className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isMine && (
                            <Avatar src={msg.profile_picture} name={msg.full_name} size="xs" />
                          )}
                          <div className={`max-w-xs lg:max-w-sm xl:max-w-md ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                            <div className={`rounded-2xl px-3 py-2.5 ${
                              isMine
                                ? 'rounded-br-sm text-white'
                                : 'rounded-bl-sm text-slate-100'
                            }`} style={{
                              background: isMine
                                ? 'linear-gradient(135deg, #0066ff, #0040cc)'
                                : 'rgba(255,255,255,0.07)',
                              border: isMine ? 'none' : '1px solid rgba(255,255,255,0.08)',
                              boxShadow: isMine
                                ? '0 2px 12px rgba(0,102,255,0.3)'
                                : '0 2px 8px rgba(0,0,0,0.3)',
                            }}>
                              <MessageContent msg={msg} isMine={isMine} />
                            </div>
                            <div className={`flex items-center gap-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                              <span className="text-xs text-slate-600">{timeAgo(msg.sent_at)}</span>
                              {isMine && (
                                <span className="text-xs" style={{ color: msg.is_read ? '#3b9eff' : '#6b7c93' }}>
                                  {msg.is_read ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* File preview before sending */}
                <AnimatePresence>
                  {selectedFile && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-primary-500/15 px-4 py-3"
                      style={{ background: 'rgba(0,102,255,0.06)' }}>
                      <div className="flex items-start gap-3">

                        {/* Preview */}
                        {selectedFile.type === 'image' && selectedFile.preview ? (
                          <img src={selectedFile.preview} alt=""
                            className="w-20 h-20 object-cover rounded-xl border border-primary-500/20" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                            style={{ background: 'rgba(0,102,255,0.1)', border: '1px solid rgba(0,102,255,0.2)' }}>
                            {fileIcon(selectedFile.file.type, selectedFile.type)}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{selectedFile.file.name}</p>
                          <p className="text-xs text-slate-500 mb-2">
                            {formatBytes(selectedFile.file.size)} · {selectedFile.type}
                          </p>
                          <input
                            value={caption}
                            onChange={e => setCaption(e.target.value)}
                            placeholder="Add a caption (optional)…"
                            className="w-full text-sm bg-transparent text-slate-300 placeholder-slate-600 focus:outline-none border-b border-primary-500/20 pb-1"
                          />
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          <Btn size="sm" onClick={handleFileSend} loading={uploading}>
                            Send {selectedFile.type === 'image' ? '📷' : selectedFile.type === 'video' ? '🎬' : '📎'}
                          </Btn>
                          <button onClick={cancelFile}
                            className="text-xs text-slate-500 hover:text-red-400 transition-colors py-1">
                            Cancel
                          </button>
                        </div>
                      </div>

                      {uploading && (
                        <div className="mt-2">
                          <div className="h-1 bg-dark-400 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-primary-500 rounded-full"
                              initial={{ width: '0%' }}
                              animate={{ width: '85%' }}
                              transition={{ duration: 2 }} />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Uploading…</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input bar */}
                {!selectedFile && (
                  <div className="px-4 py-3 border-t-2 border-sky-400/60 flex items-end gap-2"
                    style={{ background: 'rgba(10,16,32,0.99)' }}>

                    {/* Attach button */}
                    <div className="relative group">
                      <button onClick={() => fileInputRef.current?.click()}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all hover:bg-primary-500/15 text-slate-500 hover:text-primary-400"
                        title="Attach file (image, video, document — max 10MB)">
                        📎
                      </button>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-0 mb-2 w-52 p-2 rounded-xl text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                        style={{ background: 'rgba(10,16,32,0.98)', border: '1px solid rgba(0,102,255,0.2)' }}>
                        📷 Images (JPG, PNG, GIF, WebP)<br />
                        🎬 Videos (MP4, MOV, AVI, WebM)<br />
                        📄 Docs (PDF, Word, Excel, PPT)<br />
                        📦 ZIP files<br />
                        <span className="text-primary-400">Max size: 10MB</span>
                      </div>
                    </div>

                    {/* Text input */}
                    <div className="flex-1 flex items-end rounded-2xl px-4 py-2.5 min-h-10"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <textarea
                        value={text}
                        onChange={e => {
                          setText(e.target.value)
                          e.target.style.height = 'auto'
                          e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSend()
                          }
                        }}
                        placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                        rows={1}
                        className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed w-full"
                        style={{ maxHeight: 120 }}
                      />
                    </div>

                    {/* Send button */}
                    <button onClick={handleSend} disabled={!text.trim() || sending}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ background: text.trim() ? 'linear-gradient(135deg,#0066ff,#0040cc)' : 'rgba(255,255,255,0.06)' }}>
                      {sending ? '⏳' : '➤'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}