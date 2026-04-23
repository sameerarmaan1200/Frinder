import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, Btn, Input } from './UI'
import { postAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
// AuthPrompt handled inline below

const timeAgo = (dt) => {
  const diff = (Date.now() - new Date(dt)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff/86400)}d ago`
  return new Date(dt).toLocaleDateString()
}

// Full emoji set — all social media emojis
const ALL_EMOJIS = [
  { emoji: '❤️',  label: 'Love' },
  { emoji: '😂',  label: 'Haha' },
  { emoji: '😮',  label: 'Wow' },
  { emoji: '😢',  label: 'Sad' },
  { emoji: '😡',  label: 'Angry' },
  { emoji: '👍',  label: 'Like' },
  { emoji: '👎',  label: 'Dislike' },
  { emoji: '🔥',  label: 'Fire' },
  { emoji: '🎉',  label: 'Celebrate' },
  { emoji: '💯',  label: '100' },
  { emoji: '😍',  label: 'Heart eyes' },
  { emoji: '🥰',  label: 'Adore' },
  { emoji: '😎',  label: 'Cool' },
  { emoji: '🤩',  label: 'Star struck' },
  { emoji: '😭',  label: 'Cry' },
  { emoji: '😱',  label: 'Shocked' },
  { emoji: '🙏',  label: 'Pray' },
  { emoji: '💪',  label: 'Strong' },
  { emoji: '🤝',  label: 'Handshake' },
  { emoji: '✨',  label: 'Sparkle' },
  { emoji: '😊',  label: 'Smile' },
  { emoji: '🥹',  label: 'Touched' },
  { emoji: '😆',  label: 'Laugh' },
  { emoji: '🤣',  label: 'Rofl' },
  { emoji: '😅',  label: 'Sweat' },
  { emoji: '😇',  label: 'Angel' },
  { emoji: '🤗',  label: 'Hug' },
  { emoji: '🤔',  label: 'Think' },
  { emoji: '😏',  label: 'Smirk' },
  { emoji: '😒',  label: 'Meh' },
  { emoji: '🙄',  label: 'Eyeroll' },
  { emoji: '😤',  label: 'Huff' },
  { emoji: '🤯',  label: 'Mind blown' },
  { emoji: '🥳',  label: 'Party' },
  { emoji: '💀',  label: 'Dead' },
  { emoji: '👻',  label: 'Ghost' },
  { emoji: '🫶',  label: 'Heart hands' },
  { emoji: '❤️‍🔥', label: 'Love fire' },
  { emoji: '💔',  label: 'Broken heart' },
  { emoji: '💕',  label: 'Two hearts' },
  { emoji: '💖',  label: 'Sparkling heart' },
  { emoji: '💙',  label: 'Blue heart' },
  { emoji: '💚',  label: 'Green heart' },
  { emoji: '💛',  label: 'Yellow heart' },
  { emoji: '🧡',  label: 'Orange heart' },
  { emoji: '💜',  label: 'Purple heart' },
  { emoji: '⭐',  label: 'Star' },
  { emoji: '🌟',  label: 'Glowing star' },
  { emoji: '🚀',  label: 'Rocket' },
  { emoji: '🎯',  label: 'Bullseye' },
  { emoji: '🏆',  label: 'Trophy' },
  { emoji: '🎊',  label: 'Confetti' },
  { emoji: '💡',  label: 'Idea' },
  { emoji: '✅',  label: 'Check' },
  { emoji: '❌',  label: 'Cross' },
  { emoji: '💬',  label: 'Chat' },
  { emoji: '👏',  label: 'Clap' },
  { emoji: '🤌',  label: 'Chef kiss' },
  { emoji: '🫠',  label: 'Melting' },
]

// Quick reactions shown in the popup (first 6)
const QUICK_EMOJIS = ['❤️','😂','😮','😢','😡','👍']

export default function PostCard({ post, onDelete }) {
  const { user }  = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const prompt = () => setShowAuthModal(true)
  const AuthPromptModal = () => showAuthModal ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.8)'}}
      onClick={() => setShowAuthModal(false)}>
      <div className="glass rounded-2xl border border-primary-500/20 p-8 max-w-sm w-full text-center" onClick={e=>e.stopPropagation()}>
        <div className="text-4xl mb-4">🌍</div>
        <h3 className="font-black text-xl text-white mb-2">Join Frinder</h3>
        <p className="text-slate-500 text-sm mb-6">Login or create an account to interact with posts</p>
        <div className="flex gap-3">
          <a href="/login" className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-bold text-center hover:bg-primary-600 transition-colors">Login</a>
          <a href="/register" className="flex-1 py-2.5 rounded-xl border border-primary-500/30 text-primary-400 text-sm font-bold text-center hover:bg-primary-500/10 transition-colors">Register</a>
        </div>
      </div>
    </div>
  ) : null
  const imgUrl    = post.image_path ? `/api/uploads/posts/${post.image_path}` : null

  const [liked,         setLiked]         = useState(!!post.user_liked)
  const [likeCount,     setLikeCount]     = useState(parseInt(post.like_count) || 0)
  const [comments,      setComments]      = useState([])
  const [showComments,  setShowComments]  = useState(false)
  const [commentText,   setCommentText]   = useState('')
  const [commenting,    setCommenting]    = useState(false)
  const [imgExpanded,   setImgExpanded]   = useState(false)
  const [deleting,      setDeleting]      = useState(false)

  // Reactions state
  const [reactions,     setReactions]     = useState([])
  const [myReaction,    setMyReaction]    = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAllEmojis, setShowAllEmojis]   = useState(false)
  const [reactionUsers, setReactionUsers]   = useState(null) // which emoji's users to show
  const emojiRef = useRef()
  const unpack = (payload) => (
    payload?.data && typeof payload.data === 'object'
      ? { ...payload, ...payload.data, data: payload.data }
      : payload
  )

  const isOwn = user?.user_id === post.user_id

  useEffect(() => {
    loadReactions()
  }, [post.post_id])

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false)
        setShowAllEmojis(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const loadReactions = async () => {
    try {
      const r = await fetch(`/api/posts/reactions.php?action=get&post_id=${post.post_id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('frinder_token')}` }
      })
      const data = unpack(await r.json())
      if (data.success) {
        setReactions(data.reactions || [])
        setMyReaction(data.my_reaction)
      }
    } catch {}
  }

  const handleReaction = async (emoji) => {
    if (!user) { prompt(); return }
    setShowEmojiPicker(false)
    setShowAllEmojis(false)
    try {
      const r = await fetch('/api/posts/reactions.php?action=react', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('frinder_token')}`
        },
        body: JSON.stringify({ post_id: post.post_id, emoji })
      })
      const data = unpack(await r.json())
      if (data.success) {
        loadReactions()
        setMyReaction(data.action === 'removed' ? null : emoji)
      }
    } catch {}
  }

  const handleLike = async () => {
    if (!user) { prompt(); return }
    try {
      const r = await postAPI.like({ post_id: post.post_id })
      setLiked(r.data.liked)
      setLikeCount(r.data.like_count)
    } catch {}
  }

  const loadComments = async () => {
    try {
      const r = await postAPI.getComments(post.post_id)
      setComments(r.data.comments || [])
    } catch {}
  }

  const toggleComments = () => {
    if (!showComments) loadComments()
    setShowComments(s => !s)
  }

  const handleComment = async () => {
    if (!user) { prompt(); return }
    if (!commentText.trim()) return
    setCommenting(true)
    try {
      const r = await postAPI.comment({ post_id: post.post_id, comment_text: commentText.trim() })
      setComments(prev => [...prev, r.data.comment])
      setCommentText('')
    } catch {}
    setCommenting(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    setDeleting(true)
    try {
      await postAPI.delete(post.post_id)
      onDelete?.(post.post_id)
    } catch {}
    setDeleting(false)
  }

  // Total reaction count
  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0)

  return (
    <>
      <AuthPromptModal />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary-500/20 bg-dark-300/95 shadow-lg overflow-hidden"
        style={{ background: 'rgba(10,16,32,0.97)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-4 pb-3">
          <Link to={`/profile/${post.user_id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Avatar src={post.profile_picture} name={post.full_name} size="md" online={!!post.is_online} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-sm leading-tight">{post.full_name}</span>
                {post.flag_emoji && (
                  <span className="text-xs">{post.flag_emoji}</span>
                )}
              </div>
              {/* Username shown below name */}
              <span className="text-xs text-primary-400/80">@{post.username}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500">{timeAgo(post.created_at)}</span>
                {post.visibility === 'public' && (
                  <span className="text-xs text-slate-600">· 🌐 Public</span>
                )}
              </div>
            </div>
          </Link>
          {isOwn && (
            <button onClick={handleDelete} disabled={deleting}
              className="text-slate-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10 shrink-0">
              {deleting ? '...' : '🗑️'}
            </button>
          )}
        </div>

        {/* Content */}
        {post.content && (
          <div className="px-4 pb-3">
            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>
        )}

        {/* Image */}
        {imgUrl && (
          <div className="px-4 pb-3">
            <div className="rounded-xl overflow-hidden border border-primary-500/10 cursor-pointer"
              onClick={() => setImgExpanded(true)}>
              <img src={imgUrl} alt="" className="w-full max-h-80 object-cover hover:scale-105 transition-transform duration-500"
                onError={e => e.target.parentElement.style.display='none'} />
            </div>
          </div>
        )}

        {/* Reactions summary — shows emoji + count + who reacted */}
        {totalReactions > 0 && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              {reactions.map(r => (
                <button key={r.emoji}
                  onClick={() => setReactionUsers(reactionUsers?.emoji === r.emoji ? null : r)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                    myReaction === r.emoji
                      ? 'bg-primary-500/20 border-primary-500/40 text-primary-300'
                      : 'bg-dark-400/60 border-slate-700/50 text-slate-400 hover:border-primary-500/30'
                  }`}>
                  <span className="text-sm">{r.emoji}</span>
                  <span>{r.count}</span>
                </button>
              ))}
              <span className="text-xs text-slate-600">{totalReactions} reaction{totalReactions !== 1 ? 's' : ''}</span>
            </div>

            {/* Who reacted — names list */}
            <AnimatePresence>
              {reactionUsers && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-3 rounded-xl bg-dark-400/40 border border-primary-500/10"
                >
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-lg">{reactionUsers.emoji}</span>
                    <span className="text-xs font-semibold text-slate-400">
                      {reactionUsers.count} {reactionUsers.count === 1 ? 'person' : 'people'} reacted
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {reactionUsers.users.map(u => (
                      <Link key={u.user_id} to={`/profile/${u.user_id}`}
                        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                        <Avatar src={u.profile_picture} name={u.full_name} size="xs" />
                        <span className="text-xs text-slate-300">{u.full_name}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Divider */}
        <div className="mx-4 border-t border-primary-500/10" />

        {/* Action bar */}
        <div className="flex items-center px-2 py-1 gap-1">

          {/* Emoji reaction button */}
          <div className="relative" ref={emojiRef}>
            <button
              onClick={() => { if (!user) { prompt(); return } setShowEmojiPicker(s => !s) }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-primary-500/10 ${
                myReaction ? 'text-primary-400' : 'text-slate-500 hover:text-primary-400'
              }`}>
              <span className="text-base">{myReaction || '😊'}</span>
              <span>{myReaction ? 'Reacted' : 'React'}</span>
            </button>

            {/* Quick emoji popup */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 mb-2 z-50"
                  style={{ background: 'rgba(10,16,32,0.99)', border: '1px solid rgba(0,102,255,0.25)', borderRadius: 16, padding: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
                >
                  {/* Quick reactions */}
                  <div className="flex items-center gap-1 mb-2">
                    {QUICK_EMOJIS.map(e => (
                      <button key={e} onClick={() => handleReaction(e)}
                        className={`text-2xl p-1.5 rounded-xl hover:scale-125 transition-transform hover:bg-primary-500/10 ${myReaction === e ? 'bg-primary-500/20' : ''}`}
                        title={ALL_EMOJIS.find(x => x.emoji === e)?.label}>
                        {e}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowAllEmojis(s => !s)}
                      className="text-xs text-slate-400 hover:text-primary-400 px-2 py-1 rounded-lg hover:bg-primary-500/10 transition-all font-semibold">
                      {showAllEmojis ? 'Less' : 'More ↓'}
                    </button>
                  </div>

                  {/* Full emoji grid */}
                  <AnimatePresence>
                    {showAllEmojis && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="grid grid-cols-8 gap-0.5 max-h-48 overflow-y-auto"
                          style={{ scrollbarWidth: 'thin' }}>
                          {ALL_EMOJIS.map(({ emoji, label }) => (
                            <button key={emoji} onClick={() => handleReaction(emoji)}
                              title={label}
                              className={`text-xl p-1.5 rounded-lg hover:scale-110 transition-transform hover:bg-primary-500/10 ${myReaction === emoji ? 'bg-primary-500/20' : ''}`}>
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Like button */}
          <button onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-primary-500/10 ${
              liked ? 'text-primary-400' : 'text-slate-500 hover:text-primary-400'
            }`}>
            <span className="text-base">{liked ? '👍' : '👍'}</span>
            <span className={liked ? 'text-primary-400' : ''}>{likeCount > 0 ? likeCount : ''} {liked ? 'Liked' : 'Like'}</span>
          </button>

          {/* Comment button */}
          <button onClick={toggleComments}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-primary-400 hover:bg-primary-500/10 transition-all">
            <span className="text-base">💬</span>
            <span>{post.comment_count > 0 ? post.comment_count : ''} Comment</span>
          </button>
        </div>

        {/* Comments section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-primary-500/10 px-4 py-3"
              style={{ background: 'rgba(7,12,24,0.6)' }}
            >
              {/* Comments list */}
              <div className="space-y-3 mb-3 max-h-60 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-600 text-center py-2">No comments yet. Be the first!</p>
                ) : (
                  comments.map(c => (
                    <div key={c.comment_id} className="flex items-start gap-2">
                      <Avatar src={c.profile_picture} name={c.full_name} size="xs" />
                      <div className="flex-1 min-w-0">
                        <div className="rounded-2xl px-3 py-2"
                          style={{ background: 'rgba(0,102,255,0.08)', border: '1px solid rgba(0,102,255,0.15)' }}>
                          <div className="flex items-center gap-2 mb-1">
                            <Link to={`/profile/${c.user_id}`}
                              className="text-xs font-bold text-white hover:text-primary-400 transition-colors">
                              {c.full_name}
                            </Link>
                            <span className="text-xs text-primary-500/60">@{c.username}</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{c.comment_text}</p>
                        </div>
                        <span className="text-xs text-slate-600 ml-2">{timeAgo(c.created_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment */}
              {user && (
                <div className="flex items-center gap-2">
                  <Avatar src={user.profile_picture} name={user.full_name} size="xs" />
                  <div className="flex-1 flex items-center gap-2"
                    style={{ background: 'rgba(0,102,255,0.06)', border: '1px solid rgba(0,102,255,0.15)', borderRadius: 24, padding: '6px 12px' }}>
                    <input
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment()}
                      placeholder="Write a comment…"
                      className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                    />
                    <button onClick={handleComment} disabled={!commentText.trim() || commenting}
                      className="text-primary-400 hover:text-primary-300 transition-colors text-xs font-bold disabled:opacity-30">
                      {commenting ? '...' : 'Post'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Image fullscreen */}
      <AnimatePresence>
        {imgExpanded && imgUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setImgExpanded(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.92)' }}>
            <img src={imgUrl} alt="" className="max-w-full max-h-full object-contain rounded-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
