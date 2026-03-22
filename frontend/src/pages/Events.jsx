import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageWrapper, Card, Btn, Input, Select, Modal, Avatar, EmptyState, useToast } from '../components/UI'
import Navbar from '../components/Navbar'
import { eventAPI, friendAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const typeInfo = {
  meetup: { icon: '📍', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Meetup' },
  group:  { icon: '👥', color: 'text-primary-400',  bg: 'bg-primary-500/10',  border: 'border-primary-500/20',  label: 'Group' },
  call:   { icon: '📹', color: 'text-purple-400',   bg: 'bg-purple-500/10',   border: 'border-purple-500/20',   label: 'Call' },
}

export default function Events() {
  const { user } = useAuth()
  const { show, ToastContainer } = useToast()
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [friends, setFriends] = useState([])
  const [form, setForm] = useState({ event_type: 'meetup', title: '', description: '', location: '', scheduled_at: '', max_attendees: '', invitees: [] })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await eventAPI.getAll()
      setEvents(r.data.events || [])
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    friendAPI.getFriends().then(r => setFriends(r.data.friends || [])).catch(() => {})
  }, [])

  const handleCreate = async () => {
    if (!form.title.trim()) { show('Title is required', 'error'); return }
    setSaving(true)
    try {
      await eventAPI.create(form)
      show('Event created! 🎉', 'success')
      setCreateOpen(false)
      setForm({ event_type: 'meetup', title: '', description: '', location: '', scheduled_at: '', max_attendees: '', invitees: [] })
      load()
    } catch (e) { show(e.response?.data?.message || 'Failed', 'error') }
    finally { setSaving(false) }
  }

  const handleRespond = async (eventId, status) => {
    try {
      await eventAPI.respond({ event_id: eventId, status })
      show(status === 'accepted' ? 'You\'re going! 🎉' : 'Declined', status === 'accepted' ? 'success' : 'info')
      load()
    } catch { show('Failed', 'error') }
  }

  const toggleInvitee = (uid) => {
    setForm(f => ({
      ...f, invitees: f.invitees.includes(uid) ? f.invitees.filter(i => i !== uid) : [...f.invitees, uid]
    }))
  }

  const myEvents   = events.filter(e => e.creator_id == user?.user_id)
  const invited    = events.filter(e => e.creator_id != user?.user_id && e.my_status === 'invited')
  const attending  = events.filter(e => e.creator_id != user?.user_id && e.my_status === 'accepted')

  return (
    <PageWrapper>
      <ToastContainer />
      <Navbar />
      <div className="lg:pl-20 xl:pl-64 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 pt-20 lg:pt-8 pb-24 lg:pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-black text-2xl text-white font-display">Events 🎉</h1>
              <p className="text-slate-500 text-sm mt-1">Organize meetups, calls & groups with your friends</p>
            </div>
            <Btn onClick={() => setCreateOpen(true)}>+ Create Event</Btn>
          </div>

          {loading ? (
            <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-36 shimmer rounded-2xl" />)}</div>
          ) : events.length === 0 ? (
            <EmptyState icon="🎉" title="No events yet" description="Create a meetup, group or call with your friends!"
              action={<Btn onClick={() => setCreateOpen(true)}>Create First Event</Btn>} />
          ) : (
            <div className="space-y-6">
              {/* Invitations */}
              {invited.length > 0 && (
                <div>
                  <h2 className="font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" /> Invitations ({invited.length})
                  </h2>
                  <div className="space-y-3">
                    {invited.map(ev => <EventCard key={ev.event_id} ev={ev} onRespond={handleRespond} isInvite />)}
                  </div>
                </div>
              )}

              {/* Attending */}
              {attending.length > 0 && (
                <div>
                  <h2 className="font-bold text-slate-300 mb-3">Attending ({attending.length})</h2>
                  <div className="space-y-3">
                    {attending.map(ev => <EventCard key={ev.event_id} ev={ev} onRespond={handleRespond} />)}
                  </div>
                </div>
              )}

              {/* My events */}
              {myEvents.length > 0 && (
                <div>
                  <h2 className="font-bold text-slate-300 mb-3">My Events ({myEvents.length})</h2>
                  <div className="space-y-3">
                    {myEvents.map(ev => <EventCard key={ev.event_id} ev={ev} onRespond={handleRespond} isOwn />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Event" size="lg">
        <div className="flex flex-col gap-4">
          {/* Event type */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Event Type</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(typeInfo).map(([type, info]) => (
                <button key={type} onClick={() => setForm(f => ({ ...f, event_type: type }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
                    ${form.event_type === type ? `${info.bg} ${info.border} ${info.color}` : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                  <span className="text-2xl">{info.icon}</span>
                  <span className="text-xs font-bold">{info.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Input label="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Event title…" />
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What's this event about?" rows={3}
              className="w-full bg-dark-300 border border-primary-500/20 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="City or 'Online'" />
            {form.event_type !== 'group' && (
              <Input label="Date & Time" type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} />
            )}
          </div>
          {form.event_type === 'meetup' && (
            <Input label="Max Attendees" type="number" value={form.max_attendees} onChange={e => setForm(f => ({ ...f, max_attendees: e.target.value }))} placeholder="Leave empty for unlimited" />
          )}

          {/* Invite friends */}
          {friends.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Invite Friends ({form.invitees.length} selected)</label>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                {friends.map(f => (
                  <button key={f.user_id} onClick={() => toggleInvitee(f.user_id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                      ${form.invitees.includes(f.user_id) ? 'bg-primary-500/20 border-primary-500/40 text-primary-300' : 'bg-dark-400 border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                    <Avatar src={f.profile_picture} name={f.full_name} size="xs" />
                    {f.full_name.split(' ')[0]}
                    {form.invitees.includes(f.user_id) && ' ✓'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Btn variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Btn>
            <Btn onClick={handleCreate} loading={saving}>Create Event 🎉</Btn>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  )
}

function EventCard({ ev, onRespond, isOwn, isInvite }) {
  const info = typeInfo[ev.event_type] || typeInfo.meetup
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 ${isInvite ? 'border-amber-500/20 bg-amber-500/5' : 'border-primary-500/10 bg-dark-300/80'}`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${info.bg} border ${info.border} flex items-center justify-center text-2xl shrink-0`}>
          {info.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-100">{ev.title}</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${info.bg} ${info.border} border ${info.color}`}>{info.label}</span>
            {isInvite && <span className="text-xs text-amber-400 font-semibold">⏳ Invited</span>}
            {isOwn && <span className="text-xs text-primary-400 font-semibold">👑 Your event</span>}
          </div>
          {ev.description && <p className="text-xs text-slate-500 mt-1">{ev.description}</p>}
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-600">
            {ev.location && <span>📍 {ev.location}</span>}
            {ev.scheduled_at && <span>🕐 {new Date(ev.scheduled_at).toLocaleString()}</span>}
            {ev.max_attendees && <span>👥 Max {ev.max_attendees}</span>}
            <span>✓ {ev.accepted_count} attending</span>
          </div>

          {/* Attendees */}
          {ev.attendees?.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {ev.attendees.slice(0, 5).map(a => (
                <Avatar key={a.user_id} src={a.profile_picture} name={a.full_name} size="xs" />
              ))}
              {ev.attendees.length > 5 && <span className="text-xs text-slate-600">+{ev.attendees.length - 5}</span>}
            </div>
          )}
        </div>

        {isInvite && (
          <div className="flex gap-2 shrink-0">
            <Btn size="sm" onClick={() => onRespond(ev.event_id, 'accepted')}>✓ Going</Btn>
            <Btn size="sm" variant="ghost" onClick={() => onRespond(ev.event_id, 'declined')}>✕</Btn>
          </div>
        )}
      </div>
    </motion.div>
  )
}
