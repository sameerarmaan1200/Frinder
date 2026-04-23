import axios from 'axios'

// -------------------- BASE URL --------------------
// Use relative /api so Vite proxy works locally.
// In production, override with VITE_API_BASE env var.
const BASE = import.meta.env.VITE_API_BASE || '/api'
const api = axios.create({ baseURL: BASE })

const USER_AUTH_PAGES = ['/login', '/register', '/forgot', '/forgot-password']
const USER_AUTH_ENDPOINTS = [
  '/auth/login.php',
  '/auth/logout.php',
  '/auth/send_otp.php',
  '/auth/verify_otp.php',
  '/auth/register.php',
  '/auth/reset_password.php',
]

const ADMIN_AUTH_ENDPOINTS = [
  '/admin/admin.php?action=login',
]

const normalizePayload = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return payload

  const nested = payload.data
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return { ...payload, ...nested, data: nested }
  }

  return payload
}

// -------------------- TOKEN INTERCEPTORS --------------------
api.interceptors.request.use(cfg => {
  const requestUrl = cfg.url || ''
  const isUserAuthRequest = USER_AUTH_ENDPOINTS.some(endpoint => requestUrl.includes(endpoint))
  const isAdminAuthRequest = ADMIN_AUTH_ENDPOINTS.some(endpoint => requestUrl.includes(endpoint))

  // Keep auth and password-reset endpoints free from stale bearer tokens.
  if (!isUserAuthRequest && !isAdminAuthRequest) {
    const token = localStorage.getItem('frinder_token') || localStorage.getItem('frinder_admin_token')
    if (token) cfg.headers.Authorization = `Bearer ${token}`
  }

  return cfg
})

api.interceptors.response.use(
  r => ({ ...r, data: normalizePayload(r.data) }),
  err => {
    const status = err.response?.status
    const path = window.location.pathname
    const requestUrl = err.config?.url || ''
    const hasUserToken = !!localStorage.getItem('frinder_token')
    const isUserAuthPage = USER_AUTH_PAGES.includes(path)
    const isAuthRequest = USER_AUTH_ENDPOINTS.some(endpoint => requestUrl.includes(endpoint))

    if (status === 401 && hasUserToken && !isUserAuthPage && !isAuthRequest) {
      localStorage.removeItem('frinder_token')
      localStorage.removeItem('frinder_user')
      if (path !== '/login') window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// -------------------- USER AUTH --------------------
export const authAPI = {
  register:      (data) => api.post('/auth/register.php', data),
  sendOTP:       (data) => api.post('/auth/send_otp.php', data),
  verifyOTP:     (data) => api.post('/auth/verify_otp.php', data),
  login:         (data) => api.post('/auth/login.php', data),
  loginVerify:   (data) => api.post('/auth/login.php', { ...data, action: 'verify' }),
  loginResend:   (data) => api.post('/auth/login.php', { ...data, action: 'resend' }),
  saveProfile:   (data) => api.post('/auth/save_profile.php', data),
  logout:        ()     => api.post('/auth/logout.php'),
  resetPassword: (data) => api.post('/auth/reset_password.php', data), // ✅ added
}

// -------------------- LOOKUP --------------------
export const lookupAPI = {
  all: () => api.get('/lookup.php?action=all'),
}

// -------------------- USERS --------------------
export const userAPI = {
  getProfile:    (id) => api.get(`/users/get_profile.php${id ? `?user_id=${id}` : ''}`),
  updateProfile: (data) => api.post('/users/update_profile.php', data),
  discover:      (params) => api.get('/users/discover.php', { params }),
}

// -------------------- VERIFICATION --------------------
export const verifyAPI = {
  upload: (formData) => api.post('/verification/upload.php', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  saveGPS: (data) => api.post('/verification/upload.php?action=gps', data),
}

// -------------------- FRIENDS --------------------
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

// -------------------- MESSAGES --------------------
export const messageAPI = {
  getConversations: ()       => api.get('/messages/messages.php?action=conversations'),
  getChat:          (params) => api.get('/messages/messages.php?action=chat', { params }),
  send:             (data)   => api.post('/messages/messages.php?action=send', data),
}

// -------------------- POSTS --------------------
export const postAPI = {
  getFeed:    (page=1)  => api.get(`/posts/posts.php?action=feed&page=${page}`),
  getComments:(postId)  => api.get(`/posts/posts.php?action=comments&post_id=${postId}`),
  create:     (data)    => api.post('/posts/posts.php?action=create', data),
  like:       (data)    => api.post('/posts/posts.php?action=like', data),
  comment:    (data)    => api.post('/posts/posts.php?action=comment', data),
  delete:     (postId)  => api.delete(`/posts/posts.php?post_id=${postId}`),
}

// -------------------- EVENTS --------------------
export const eventAPI = {
  getAll:   ()     => api.get('/events/events.php'),
  create:   (data) => api.post('/events/events.php?action=create', data),
  respond:  (data) => api.post('/events/events.php?action=respond', data),
}

// -------------------- SAFETY --------------------
export const safetyAPI = {
  report:   (data) => api.post('/safety/safety.php?action=report', data),
  block:    (data) => api.post('/safety/safety.php?action=block', data),
  unblock:  (data) => api.post('/safety/safety.php?action=unblock', data),
}

// -------------------- ADMIN --------------------
export const adminAPI = {
  login:     (data) => api.post('/admin/admin.php?action=login', data),
  analytics: ()     => api.get('/admin/admin.php?action=analytics'),
}

// -------------------- IMAGE PATH --------------------
export const imgSrc = (path) => path ? `/api/uploads/posts/${path}` : null

export default api
