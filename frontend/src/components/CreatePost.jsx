import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Modal, Btn, Avatar } from './UI'
import { postAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function CreatePost({ onCreated }) {
  const { user } = useAuth()
  const [open, setOpen]       = useState(false)
  const [content, setContent] = useState('')
  const [visibility, setVis]  = useState('friends')
  const [image, setImage]     = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const fileRef = useRef()
  const unpack = (payload) => (
    payload?.data && typeof payload.data === 'object'
      ? { ...payload, ...payload.data, data: payload.data }
      : payload
  )

  const handleImage = (e) => {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return }
    setImage(f)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(f)
  }

  const handleSubmit = async () => {
    if (!content.trim() && !image) { setError('Write something or add an image'); return }
    setLoading(true); setError('')
    try {
      let data
      if (image) {
        const fd = new FormData()
        if (content) fd.append('content', content)
        fd.append('visibility', visibility)
        fd.append('image', image)
        const r = await fetch('/api/posts/posts.php?action=create', {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('frinder_token')}` },
          body: fd
        })
        data = unpack(await r.json())
      } else {
        const r = await postAPI.create({ content, visibility })
        data = r.data
      }
      if (data.success) {
        onCreated?.(data.post)
        setOpen(false)
        setContent(''); setImage(null); setPreview(null)
      } else { setError(data.message) }
    } catch { setError('Failed to create post') } finally { setLoading(false) }
  }

  return (
    <>
      {/* Trigger */}
      <div onClick={() => setOpen(true)} className="flex items-center gap-3 p-4 rounded-2xl border border-primary-500/10 bg-dark-300/80 cursor-pointer hover:border-primary-500/30 transition-all duration-200 group">
        <Avatar src={user?.profile_picture} name={user?.full_name || ''} size="md" />
        <div className="flex-1 bg-dark-400/60 rounded-full px-4 py-2.5 text-sm text-slate-600 group-hover:text-slate-500 transition-colors">
          What's on your mind, {user?.full_name?.split(' ')[0]}? ✨
        </div>
        <div className="flex gap-2">
          <span className="text-lg">📸</span>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create Post" size="md">
        <div className="flex flex-col gap-4">
          {/* User info */}
          <div className="flex items-center gap-3">
            <Avatar src={user?.profile_picture} name={user?.full_name || ''} size="md" online />
            <div>
              <p className="font-semibold text-slate-200">{user?.full_name}</p>
              <select value={visibility} onChange={e => setVis(e.target.value)}
                className="text-xs text-slate-500 bg-dark-400 border border-primary-500/20 rounded-lg px-2 py-1 mt-0.5"
              >
                <option value="friends">🤝 Friends only</option>
                <option value="public">🌐 Public</option>
              </select>
            </div>
          </div>

          {/* Text area */}
          <textarea
            value={content} onChange={e => setContent(e.target.value)}
            placeholder="What's happening? Share with your global friends… 🌍"
            rows={4}
            className="w-full bg-transparent text-slate-100 placeholder-slate-600 text-base resize-none focus:outline-none leading-relaxed"
            maxLength={1000}
          />

          {/* Image preview */}
          {preview && (
            <div className="relative rounded-xl overflow-hidden">
              <img src={preview} alt="" className="w-full max-h-64 object-cover" />
              <button onClick={() => { setImage(null); setPreview(null) }}
                className="absolute top-2 right-2 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
              >✕</button>
            </div>
          )}

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-primary-500/10 pt-4">
            <div className="flex gap-2">
              <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleImage} />
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-500/10">
                📸 Photo
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600">{content.length}/1000</span>
              <Btn onClick={handleSubmit} loading={loading} disabled={!content.trim() && !image}>
                Post ✨
              </Btn>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
