import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, Btn, Input } from './UI'
import { postAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useAuthPrompt } from './AuthPrompt'

const timeAgo = (dt) => {
  const diff = (Date.now() - new Date(dt)) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dt).toLocaleDateString()
}

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth()
  const { prompt, AuthPromptModal } = useAuthPrompt()
  const [liked, setLiked] = useState(post.user_liked == 1)
  const [likeCount, setLikeCount] = useState(parseInt(post.like_count) || 0)
  const [comments, setComments] = useState(null)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commenting, setCommenting] = useState(false)
  const [imgExpanded, setImgExpanded] = useState(false)

  const handleLike = async () => {
    if (!user) { prompt('like posts'); return }
    const prev = liked
    setLiked(!liked)
    setLikeCount(c => prev ? c - 1 : c + 1)
    try {
      await postAPI.like({ post_id: post.post_id })
    } catch {
      setLiked(prev)
      setLikeCount(c => prev ? c + 1 : c - 1)
    }
  }

  const loadComments = async () => {
    if (!user) { prompt('view comments'); return }
    if (comments) { setShowComments(!showComments); return }
    try {
      const r = await postAPI.getComments(post.post_id)
      setComments(r.data.comments || [])
      setShowComments(true)
    } catch { }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!user) { prompt('comment on posts'); return }
    if (!commentText.trim()) return
    setCommenting(true)
    try {
      const r = await postAPI.comment({ post_id: post.post_id, comment_text: commentText })
      setComments(c => [...(c || []), r.data.comment])
      setCommentText('')
    } catch { } finally { setCommenting(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    try {
      await postAPI.delete(post.post_id)
      onDelete?.(post.post_id)
    } catch { }
  }

  const imgUrl = post.image_path ? `/api/uploads/posts/${post.image_path}` : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary-500/10 bg-dark-300/80 backdrop-blur-sm overflow-hidden"
    >
      <AuthPromptModal />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Link to={user ? `/profile/${post.user_id}` : '/register'}>
            <Avatar src={post.profile_picture} name={post.full_name} size="md" />
          </Link>
          <div>
            <Link
              to={user ? `/profile/${post.user_id}` : '/register'}
              className="font-semibold text-slate-200 hover:text-primary-400 transition-colors text-sm"
            >
              {post.full_name}
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">@{post.username}</span>
              <span className="text-slate-700">·</span>
              <span className="text-xs text-slate-600">{timeAgo(post.created_at)}</span>
              {post.flag_emoji && (
                <><span className="text-slate-700">·</span>
                  <span className="text-xs text-slate-600">{post.flag_emoji}</span></>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {post.visibility === 'public' && (
            <span className="text-xs text-slate-600 border border-slate-700/50 px-2 py-0.5 rounded-full">
              🌐 Public
            </span>
          )}
          {user?.user_id == post.user_id && (
            <button
              onClick={handleDelete}
              className="text-slate-600 hover:text-red-400 transition-colors text-sm p-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <p className="px-4 pb-3 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* Image */}
      {imgUrl && (
        <div
          className="relative overflow-hidden cursor-zoom-in"
          onClick={() => setImgExpanded(true)}
        >
          <img
            src={imgUrl}
            alt=""
            className="w-full max-h-96 object-cover hover:scale-105 transition-transform duration-500"
            onError={e => e.target.style.display = 'none'}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-primary-500/8">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-all duration-200 px-2 py-1 rounded-lg hover:bg-red-500/10
            ${liked ? 'text-red-400' : 'text-slate-500 hover:text-red-400'}`}
        >
          <motion.span
            animate={{ scale: liked ? [1, 1.4, 1] : 1 }}
            transition={{ duration: 0.2 }}
          >
            {liked ? '❤️' : '🤍'}
          </motion.span>
          <span className="font-semibold">{likeCount}</span>
        </button>

        <button
          onClick={loadComments}
          className={`flex items-center gap-1.5 text-sm px-2 py-1 rounded-lg hover:bg-primary-500/10 transition-colors
            ${showComments ? 'text-primary-400' : 'text-slate-500 hover:text-primary-400'}`}
        >
          <span>💬</span>
          <span className="font-semibold">{post.comment_count || (comments?.length ?? 0)}</span>
        </button>

        <button
          onClick={() => { if (!user) { prompt('share posts'); return } }}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-400 transition-colors px-2 py-1 rounded-lg hover:bg-primary-500/10"
        >
          🔗 Share
        </button>

        {/* Guest nudge */}
        {!user && (
          <div className="flex-1 text-right">
            <Link
              to="/register"
              className="text-xs text-primary-500/60 hover:text-primary-400 font-semibold transition-colors"
            >
              Sign in to interact →
            </Link>
          </div>
        )}
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-primary-500/8"
          >
            <div className="px-4 py-3 space-y-3">
              {(comments || []).map(c => (
                <div key={c.comment_id} className="flex items-start gap-2">
                  <Avatar src={c.profile_picture} name={c.full_name} size="xs" />
                  <div className="flex-1 bg-dark-400/60 rounded-xl px-3 py-2">
                    <span className="text-xs font-semibold text-primary-400">{c.full_name} </span>
                    <span className="text-xs text-slate-300">{c.comment_text}</span>
                  </div>
                </div>
              ))}

              {user ? (
                <form onSubmit={handleComment} className="flex gap-2 items-center">
                  <Avatar src={user?.profile_picture} name={user?.full_name || ''} size="xs" />
                  <input
                    type="text"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Write a comment…"
                    className="flex-1 bg-dark-400/60 border border-primary-500/15 rounded-full px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary-500/40"
                  />
                  <Btn
                    type="submit"
                    size="sm"
                    loading={commenting}
                    disabled={!commentText.trim()}
                    className="rounded-full !px-3 !py-1.5 text-xs"
                  >
                    Send
                  </Btn>
                </form>
              ) : (
                <div className="text-center py-2">
                  <Link
                    to="/register"
                    className="text-xs font-semibold text-primary-400 hover:text-primary-300"
                  >
                    Sign in to comment →
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image expanded */}
      <AnimatePresence>
        {imgExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 cursor-zoom-out p-4"
            onClick={() => setImgExpanded(false)}
          >
            <img
              src={imgUrl}
              alt=""
              className="max-w-full max-h-full object-contain rounded-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}