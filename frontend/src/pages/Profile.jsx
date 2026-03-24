import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageWrapper, Avatar, Btn, Tag, StatusBadge, Card, Modal, Input, Textarea, useToast, EmptyState } from '../components/UI'
import Navbar from '../components/Navbar'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import { userAPI, friendAPI, safetyAPI, lookupAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { id } = useParams()
  const { user: me, updateUser } = useAuth()
  const { show, ToastContainer } = useToast()
  const targetId = id ? parseInt(id) : me?.user_id
  const avatarInputRef = useRef()

  const [profile, setProfile]           = useState(null)
  const [loading, setLoading]           = useState(true)
  const [editOpen, setEditOpen]         = useState(false)
  const [reportOpen, setReportOpen]     = useState(false)
  const [friendStatus, setFriendStatus] = useState(null)
  const [posts, setPosts]               = useState([])
  const [interests, setInterests]       = useState([])
  const [languages, setLanguages]       = useState([])
  const [editForm, setEditForm]         = useState({})
  const [saving, setSaving]             = useState(false)
  const [allInterests, setAllInterests] = useState([])
  const [reportReason, setReportReason] = useState('')
  const [reportDesc, setReportDesc]     = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    loadProfile()
    lookupAPI.all().then(r => setAllInterests(r.data.interests || []))
  }, [targetId])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const r = await userAPI.getProfile(targetId === me?.user_id ? null : targetId)
      const d = r.data
      setProfile(d.user)
      setFriendStatus(d.friend_status)
      setPosts(d.posts || [])
      setInterests(d.interests || [])
      setLanguages(d.languages || [])
      setEditForm({
        bio: d.user.bio || '',
        city: d.user.city || '',
        education: d.user.education || '',
        profession: d.user.profession || '',
        selectedInterests: d.interests.map(i => i.interest_id),
      })
    } catch {
      show('Failed to load profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Avatar upload ──────────────────────────────────────────
  const handleAvatarClick = () => {
    if (!isOwn) return
    avatarInputRef.current?.click()
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      show('Image must be under 5MB', 'error')
      return
    }
    setUploadingAvatar(true)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        await userAPI.updateProfile({ profile_picture_base64: reader.result })
        const r2 = await userAPI.getProfile(null)
        const newPic = r2.data.user.profile_picture
        setProfile(p => ({ ...p, profile_picture: newPic }))
        updateUser({ profile_picture: newPic })
        show('Profile picture updated! 📸', 'success')
      } catch {
        show('Failed to upload picture', 'error')
      } finally {
        setUploadingAvatar(false)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // ── Friend actions ─────────────────────────────────────────
  const handleSendRequest = async () => {
    try {
      await friendAPI.send({ user_id: targetId })
      setFriendStatus('request_sent')
      show('Friend request sent! 🤝', 'success')
    } catch (e) {
      show(e.response?.data?.message || 'Failed', 'error')
    }
  }

  const handleUnfriend = async () => {
    if (!confirm('Remove this friend?')) return
    try {
      await friendAPI.unfriend({ user_id: targetId })
      setFriendStatus(null)
      show('Removed from friends', 'info')
    } catch {
      show('Failed', 'error')
    }
  }

  // ── Save edit ──────────────────────────────────────────────
  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      await userAPI.updateProfile({
        bio:        editForm.bio,
        city:       editForm.city,
        education:  editForm.education,
        profession: editForm.profession,
        interests:  JSON.stringify(editForm.selectedInterests),
      })
      updateUser({ bio: editForm.bio, city: editForm.city })
      setEditOpen(false)
      loadProfile()
      show('Profile updated! ✓', 'success')
    } catch {
      show('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Report ─────────────────────────────────────────────────
  const handleReport = async () => {
    if (!reportReason) { show('Select a reason', 'error'); return }
    try {
      await safetyAPI.report({ user_id: targetId, reason: reportReason, description: reportDesc })
      setReportOpen(false)
      show('Report submitted. Thank you.', 'success')
    } catch {
      show('Failed to submit report', 'error')
    }
  }

  const handleBlock = async () => {
    if (!confirm(`Block ${profile?.full_name}?`)) return
    try {
      await safetyAPI.block({ user_id: targetId })
      show('User blocked', 'info')
    } catch {
      show('Failed', 'error')
    }
  }

  const isOwn = targetId === me?.user_id

  // ── Loading ────────────────────────────────────────────────
  if (loading) return (
    <PageWrapper>
      <Navbar />
      <div className="lg:pl-20 xl:pl-64 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </PageWrapper>
  )

  if (!profile) return (
    <PageWrapper>
      <Navbar />
      <div className="lg:pl-20 xl:pl-64 min-h-screen flex items-center justify-center">
        <EmptyState icon="👤" title="User not found" />
      </div>
    </PageWrapper>
  )

  const age = profile.date_of_birth
    ? Math.floor((new Date() - new Date(profile.date_of_birth)) / (365.25 * 24 * 3600 * 1000))
    : null

  const coverSrc = profile.cover_photo
    ? `/api/uploads/posts/${profile.cover_photo}`
    : null

  return (
    <PageWrapper>
      <ToastContainer />
      <Navbar />

      {/* Hidden file input */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleAvatarChange}
      />

      <div className="lg:pl-20 xl:pl-64 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 pt-20 lg:pt-8 pb-24 lg:pb-8">

          {/* ── Cover + Avatar ── */}
          <div className="relative mb-16">
            <div className="h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-800/60 via-primary-600/40 to-dark-300 border border-primary-500/20">
              {coverSrc && (
                <img
                  src={coverSrc}
                  alt=""
                  className="w-full h-full object-cover opacity-60"
                  onError={e => e.target.style.display = 'none'}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-500/80 to-transparent" />
            </div>

            {/* Avatar */}
            <div className="absolute -bottom-12 left-6 flex items-end gap-4">
              <div
                className={`relative ${isOwn ? 'cursor-pointer group' : ''}`}
                onClick={handleAvatarClick}
                title={isOwn ? 'Click to change profile picture' : ''}
              >
                {/* Spinner while uploading */}
                {uploadingAvatar ? (
                  <div className="w-28 h-28 rounded-full bg-dark-300 border-4 border-dark-500 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <Avatar
                    src={profile.profile_picture}
                    name={profile.full_name}
                    size="2xl"
                    online={!!profile.is_online}
                  />
                )}

                {/* Hover overlay — own profile only */}
                {isOwn && !uploadingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 border-2 border-primary-500/60">
                    <span className="text-2xl">📸</span>
                    <span className="text-white text-[9px] font-bold text-center leading-tight">
                      CHANGE<br />PHOTO
                    </span>
                  </div>
                )}

                {/* Verified badge */}
                {profile.account_status === 'verified' && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-dark-500 shadow-glow-sm">
                    ✓
                  </div>
                )}
              </div>

              {isOwn && (
                <p
                  className="mb-1 text-xs text-slate-600 cursor-pointer hover:text-primary-400 transition-colors hidden sm:block"
                  onClick={handleAvatarClick}
                >
                  📸 Click to change photo
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              {isOwn ? (
                <Btn size="sm" variant="secondary" onClick={() => setEditOpen(true)}>
                  ✏️ Edit Profile
                </Btn>
              ) : (
                <>
                  <Link to={`/chat/${targetId}`}>
                    <Btn size="sm" variant="secondary">💬 Message</Btn>
                  </Link>
                  {!friendStatus || friendStatus === 'declined' || friendStatus === 'cancelled' ? (
                    <Btn size="sm" onClick={handleSendRequest}>+ Add Friend</Btn>
                  ) : friendStatus === 'request_sent' ? (
                    <Btn size="sm" variant="secondary" disabled>Request Sent</Btn>
                  ) : friendStatus === 'active' ? (
                    <Btn size="sm" variant="ghost" onClick={handleUnfriend}>✓ Friends</Btn>
                  ) : null}
                  <button
                    onClick={() => setReportOpen(true)}
                    className="p-2 rounded-xl bg-dark-300 border border-slate-700 text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-all text-sm"
                  >
                    ⚑
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Profile Info ── */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="font-black text-2xl text-white font-display">{profile.full_name}</h1>
              <StatusBadge status={profile.account_status} />
            </div>
            <p className="text-slate-500 text-sm mb-2">@{profile.username}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              {profile.flag_emoji && <span>{profile.flag_emoji} {profile.country_name}</span>}
              {profile.city && <><span className="text-slate-700">·</span><span>📍 {profile.city}</span></>}
              {age && <><span className="text-slate-700">·</span><span>🎂 {age} years old</span></>}
              {profile.gender && <><span className="text-slate-700">·</span><span>{profile.gender}</span></>}
            </div>
            {profile.bio && (
              <p className="mt-3 text-slate-300 leading-relaxed max-w-2xl">{profile.bio}</p>
            )}
            {(profile.education || profile.profession) && (
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                {profile.education && <span>🎓 {profile.education}</span>}
                {profile.profession && <span>💼 {profile.profession}</span>}
              </div>
            )}
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { value: profile.friend_count,       label: 'Friends',   icon: '🤝' },
              { value: profile.post_count,          label: 'Posts',     icon: '📝' },
              { value: profile.countries_connected || 0, label: 'Countries', icon: '🌍' },
            ].map((s, i) => (
              <Card key={i} className="p-4 text-center">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="font-black text-xl gradient-text">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </Card>
            ))}
          </div>

          {/* ── Content grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Sidebar */}
            <div className="space-y-4">

              {interests.length > 0 && (
                <Card className="p-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {interests.map(i => (
                      <Tag key={i.interest_id} color="blue">{i.icon} {i.interest_name}</Tag>
                    ))}
                  </div>
                </Card>
              )}

              {languages.length > 0 && (
                <Card className="p-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Languages</h3>
                  <div className="space-y-2">
                    {languages.map(l => (
                      <div key={l.language_id} className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">{l.language_name}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          l.proficiency === 'Native'       ? 'bg-emerald-500/15 text-emerald-400' :
                          l.proficiency === 'Fluent'       ? 'bg-primary-500/15 text-primary-400' :
                          'bg-slate-700/50 text-slate-500'
                        }`}>{l.proficiency}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {!isOwn && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleBlock}
                    className="text-xs text-slate-600 hover:text-red-400 transition-colors text-left"
                  >
                    🚫 Block user
                  </button>
                  <button
                    onClick={() => setReportOpen(true)}
                    className="text-xs text-slate-600 hover:text-red-400 transition-colors text-left"
                  >
                    ⚑ Report user
                  </button>
                </div>
              )}
            </div>

            {/* Posts column */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-300">
                {isOwn ? 'My Posts' : `${profile.full_name}'s Posts`}
              </h3>

              {/* Create post box — only on own profile */}
              {isOwn && (
                <CreatePost
                  onCreated={(newPost) => {
                    setPosts(prev => [newPost, ...prev])
                    setProfile(p => ({
                      ...p,
                      post_count: (parseInt(p.post_count) || 0) + 1,
                    }))
                  }}
                />
              )}

              {posts.length === 0 ? (
                <EmptyState
                  icon="📝"
                  title="No posts yet"
                  description={
                    isOwn
                      ? 'Share something with your friends!'
                      : `${profile.full_name} hasn't posted yet`
                  }
                />
              ) : (
                posts.map(post => (
                  <PostCard
                    key={post.post_id}
                    post={post}
                    onDelete={deletedId =>
                      setPosts(p => p.filter(x => x.post_id !== deletedId))
                    }
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Profile Modal ── */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile" size="md">
        <div className="flex flex-col gap-4">

          {/* Avatar upload inside modal */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-400/40 border border-primary-500/10">
            <div
              className="relative cursor-pointer group"
              onClick={handleAvatarClick}
            >
              {uploadingAvatar ? (
                <div className="w-16 h-16 rounded-full bg-dark-300 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <Avatar src={profile.profile_picture} name={profile.full_name} size="xl" />
              )}
              <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xl">📸</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Profile Picture</p>
              <p className="text-xs text-slate-500">Click the avatar to upload a new photo</p>
              <p className="text-xs text-slate-600 mt-0.5">JPG, PNG or WebP · Max 5MB</p>
            </div>
          </div>

          <Textarea
            label="Bio"
            value={editForm.bio || ''}
            onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="Tell friends about yourself…"
            rows={3}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              value={editForm.city || ''}
              onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
              placeholder="Your city"
            />
            <Input
              label="Profession"
              value={editForm.profession || ''}
              onChange={e => setEditForm(f => ({ ...f, profession: e.target.value }))}
              placeholder="Your job"
            />
          </div>

          <Input
            label="Education"
            value={editForm.education || ''}
            onChange={e => setEditForm(f => ({ ...f, education: e.target.value }))}
            placeholder="Your education"
          />

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Interests
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {allInterests.map(int => (
                <button
                  key={int.interest_id}
                  onClick={() => setEditForm(f => ({
                    ...f,
                    selectedInterests: f.selectedInterests.includes(int.interest_id)
                      ? f.selectedInterests.filter(x => x !== int.interest_id)
                      : [...f.selectedInterests, int.interest_id],
                  }))}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
                    editForm.selectedInterests?.includes(int.interest_id)
                      ? 'bg-primary-500/20 border-primary-500/50 text-primary-300'
                      : 'bg-dark-400 border-slate-700 text-slate-500 hover:border-primary-500/30'
                  }`}
                >
                  {int.icon} {int.interest_name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Btn variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Btn>
            <Btn onClick={handleSaveEdit} loading={saving}>Save Changes</Btn>
          </div>
        </div>
      </Modal>

      {/* ── Report Modal ── */}
      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Report User" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-400">Help us keep Frinder safe by reporting violations.</p>
          <div className="space-y-2">
            {['spam','fake_account','harassment','inappropriate_content','impersonation','other'].map(r => (
              <label
                key={r}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  reportReason === r
                    ? 'border-primary-500/40 bg-primary-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reportReason === r}
                  onChange={() => setReportReason(r)}
                  className="accent-primary-500"
                />
                <span className="text-sm text-slate-300 capitalize">{r.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
          <Textarea
            label="Additional Details (optional)"
            value={reportDesc}
            onChange={e => setReportDesc(e.target.value)}
            placeholder="Describe the issue…"
            rows={3}
          />
          <div className="flex gap-3 justify-end">
            <Btn variant="ghost" onClick={() => setReportOpen(false)}>Cancel</Btn>
            <Btn variant="danger" onClick={handleReport}>Submit Report</Btn>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  )
}