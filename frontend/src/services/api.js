import axios from 'axios'

const BASE = 'https://api.allorigins.win/raw?url=https://frinder.infinityfree.me/backend'

const api = axios.create({ baseURL: BASE })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('frinder_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('frinder_token')
      localStorage.removeItem('frinder_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const authAPI = {
  register:    (data) => api.post('/auth/register.php', data),
  sendOTP:     (data) => api.post('/auth/send_otp.php', data),
  verifyOTP:   (data) => api.post('/auth/verify_otp.php', data),
  login:       (data) => api.post('/auth/login.php', data),
  saveProfile: (data) => api.post('/auth/save_profile.php', data),
  logout:      ()     => api.post('/auth/logout.php'),
}

// Lookup
export const lookupAPI = {
  all: () => api.get('/lookup.php?action=all'),
}

// Users
export const userAPI = {
  getProfile:    (id) => api.get(`/users/get_profile.php${id ? `?user_id=${id}` : ''}`),
  updateProfile: (data) => api.post('/users/update_profile.php', data),
  discover:      (params) => api.get('/users/discover.php', { params }),
}

// Verification
export const verifyAPI = {
  upload: (formData) => api.post('/verification/upload.php', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// Friends
export const friendAPI = {
  getFriends:  ()       => api.get('/friends/friends.php?action=friends'),
  getReceived: ()       => api.get('/friends/friends.php?action=received'),
  getSent:     ()       => api.get('/friends/friends.php?action=sent'),
  send:        (data)   => api.post('/friends/friends.php?action=send', data),
  accept:      (data)   => api.post('/friends/friends.php?action=accept', data),
  decline:     (data)   => api.post('/friends/friends.php?action=decline', data),
  cancel:      (data)   => api.post('/friends/friends.php?action=cancel', data),
  unfriend:    (data)   => api.post('/friends/friends.php?action=unfriend', data),
}

// Messages
export const messageAPI = {
  getConversations: ()       => api.get('/messages/messages.php?action=conversations'),
  getChat:          (params) => api.get('/messages/messages.php?action=chat', { params }),
  send:             (data)   => api.post('/messages/messages.php?action=send', data),
}

// Posts
export const postAPI = {
  getFeed:    (page=1)  => api.get(`/posts/posts.php?action=feed&page=${page}`),
  getComments:(postId)  => api.get(`/posts/posts.php?action=comments&post_id=${postId}`),
  create:     (data)    => api.post('/posts/posts.php?action=create', data),
  like:       (data)    => api.post('/posts/posts.php?action=like', data),
  comment:    (data)    => api.post('/posts/posts.php?action=comment', data),
  delete:     (postId)  => api.delete(`/posts/posts.php?post_id=${postId}`),
}

// Events
export const eventAPI = {
  getAll:   ()     => api.get('/events/events.php'),
  create:   (data) => api.post('/events/events.php?action=create', data),
  respond:  (data) => api.post('/events/events.php?action=respond', data),
}

// Safety
export const safetyAPI = {
  report:   (data) => api.post('/safety/safety.php?action=report', data),
  block:    (data) => api.post('/safety/safety.php?action=block', data),
  unblock:  (data) => api.post('/safety/safety.php?action=unblock', data),
}

// Admin
export const adminAPI = {
  login:         (data) => api.post('/admin/admin.php?action=login', data),
  analytics:     ()     => api.get('/admin/admin.php?action=analytics'),
  pending:       ()     => api.get('/admin/admin.php?action=pending'),
  users:         (p)    => api.get('/admin/admin.php?action=users', { params: p }),
  reports:       ()     => api.get('/admin/admin.php?action=reports'),
  fraud:         ()     => api.get('/admin/admin.php?action=fraud'),
  approve:       (data) => api.post('/admin/admin.php?action=approve', data),
  reject:        (data) => api.post('/admin/admin.php?action=reject', data),
  suspend:       (data) => api.post('/admin/admin.php?action=suspend', data),
  resolveReport: (data) => api.post('/admin/admin.php?action=resolve_report', data),
}

export const imgSrc = (path) => path ? `https://api.allorigins.win/raw?url=https://frinder.infinityfree.me/uploads/posts/${path}` : null

export default api