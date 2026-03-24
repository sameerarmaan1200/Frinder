<<<<<<< HEAD
# 🌍 FRINDER — Verified Global Friendship Platform
> Pure Friendship. No Borders. No Limits.

A complete full-stack DBMS project: **22 MySQL tables · 35+ PHP REST APIs · React 18 Frontend**

---

## 🚀 Quick Setup (6 Steps)

### Prerequisites
- [XAMPP](https://www.apachefriends.org) (PHP 8.1+, MySQL 8.0+)
- [Node.js](https://nodejs.org) v20+ (LTS)

---

### STEP 1 — Start XAMPP
1. Open **XAMPP Control Panel**
2. Click **Start** next to **Apache**
3. Click **Start** next to **MySQL**
4. Visit `http://localhost` — you should see the XAMPP welcome page ✓

---

### STEP 2 — Import the Database
1. Open `http://localhost/phpmyadmin`
2. Click **New** in the left sidebar
3. Name it `frinder` → click **Create**
4. Click the `frinder` database → click **Import** tab
5. Click **Choose File** → select `database/frinder.sql`
6. Click **Go**
7. ✅ All 22 tables created with sample data

---

### STEP 3 — Copy Backend to XAMPP
Copy the entire project folder to your XAMPP htdocs:

**Windows:**
```
C:\xampp\htdocs\frinder\
```

**Mac/Linux:**
```
/Applications/XAMPP/htdocs/frinder/
  OR
/opt/lampp/htdocs/frinder/
```

Your backend should be at: `http://localhost/frinder/backend/`

Test it: `http://localhost/frinder/backend/lookup.php?action=all`
You should see JSON with countries/interests/languages ✓

---

### STEP 4 — Configure Email (Optional but Recommended)
Edit `backend/config/mail.php`:

```php
define('SMTP_USER', 'your@gmail.com');
define('SMTP_PASS', 'your-16-char-app-password');
```

**To get Gmail App Password:**
1. Google Account → Security → 2-Step Verification → App Passwords
2. Generate new password for "Mail"
3. Use the 16-character code

**⚠️ Without email configured:**
- OTP codes are logged to Apache error log
- Windows: `C:\xampp\apache\logs\error.log`
- Mac: `/Applications/XAMPP/logs/error.log`
- Search for `FRINDER OTP` to find the code

---

### STEP 5 — Install PHPMailer (Optional)
In the `frinder/` root folder:
```bash
composer require phpmailer/phpmailer
```
If you don't have Composer: skip this — OTPs will be logged to error.log instead.

---

### STEP 6 — Setup and Run Frontend
```bash
cd frinder/frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser 🎉

---

## 🎮 Demo Accounts

| Account | Email | Password |
|---------|-------|----------|
| Alex Chen (JP) | alex@demo.com | Demo@1234 |
| Sofia Rivera (IN) | sofia@demo.com | Demo@1234 |
| James Okafor (NG) | james@demo.com | Demo@1234 |
| **Admin** | admin@frinder.com | password |

**Admin Panel:** `http://localhost:5173/admin`

---

## 📁 Project Structure

```
frinder/
├── frontend/          ← React 18 app (npm run dev)
│   └── src/
│       ├── pages/     ← 10 pages (Home, Dashboard, Discover, Chat, etc.)
│       ├── components/← Reusable UI components
│       ├── services/  ← Axios API client
│       └── context/   ← Auth context
├── backend/           ← PHP REST API
│   ├── auth/          ← Register, Login, OTP endpoints
│   ├── users/         ← Profile, Discover endpoints
│   ├── friends/       ← Friend request system
│   ├── messages/      ← Chat endpoints
│   ├── posts/         ← Feed, likes, comments
│   ├── events/        ← Events management
│   ├── safety/        ← Report & block
│   ├── admin/         ← Admin dashboard
│   ├── verification/  ← Document/selfie upload
│   ├── config/        ← DB, mail, helpers
│   └── lookup.php     ← Countries, interests, languages
├── database/
│   └── frinder.sql    ← Complete 22-table schema
├── uploads/           ← Private uploads (blocked from web)
│   ├── .htaccess      ← Deny from all
│   ├── selfies/
│   ├── documents/
│   └── posts/
└── README.md
```

---

## 🗄️ Database (22 Tables)

| # | Table | Purpose |
|---|-------|---------|
| 1 | users | All accounts, credentials, status |
| 2 | countries | 50 world countries lookup |
| 3 | languages | 25 languages lookup |
| 4 | interests | 30 interest categories |
| 5 | email_otps | OTP codes for register/login |
| 6 | user_verification | Selfie, document, GPS, scores |
| 7 | login_sessions | Active session tokens |
| 8 | user_interests | Users ↔ interests junction |
| 9 | user_languages | Users ↔ languages junction |
| 10 | friend_requests | All friendship requests |
| 11 | friends | Confirmed friendships |
| 12 | messages | Direct messages |
| 13 | posts | User posts (text/image) |
| 14 | post_likes | Post likes (unique per user) |
| 15 | post_comments | Post comments |
| 16 | events | Meetups, calls, groups |
| 17 | event_attendees | Event invitations |
| 18 | reports | Safety reports |
| 19 | blocked_users | Blocked user pairs |
| 20 | user_badges | Gamification badges |
| 21 | user_activity | Audit log |
| 22 | admin_users | Admin accounts |

---

## 🔐 Security Features

1. **bcrypt Password Hashing** — Never stored plain text
2. **2-Step OTP Login** — Email verification on every login
3. **PDO Prepared Statements** — SQL injection proof
4. **Bearer Token Auth** — 64-char hex session tokens
5. **Account Lockout** — 5 wrong passwords → 15 min lock
6. **Secure File Upload** — MIME validation, blocked directory
7. **CORS Protection** — Restricted to localhost:5173
8. **XSS Prevention** — htmlspecialchars on all output
9. **Fraud Detection** — Auto-flag after 5+ reports
10. **Admin Verification** — Separate admin session system

---

## 🔧 Troubleshooting

**"API not working" / CORS errors:**
- Make sure XAMPP Apache is running
- Backend must be at `http://localhost/frinder/backend/`
- Check `vite.config.js` proxy is set to `http://localhost`

**"OTP not received":**
- Check Apache error log for `FRINDER OTP` entries
- Configure `backend/config/mail.php` with real SMTP credentials

**"Upload failed":**
- Create `uploads/selfies/`, `uploads/documents/`, `uploads/posts/` folders
- Give write permissions: `chmod 755 uploads/` (Mac/Linux)

**"Database connection failed":**
- Ensure MySQL is running in XAMPP
- Default credentials: host=localhost, user=root, pass=''
- Edit `backend/config/db.php` if different

**"Images not showing":**
- Images are served from `/api/uploads/posts/`
- The Vite proxy maps `/api` → `http://localhost/frinder/backend`

---

## 📱 Features

- ✅ 6-step animated registration wizard
- ✅ 2-step OTP login (email verification)
- ✅ Government document upload
- ✅ Live selfie capture (webcam API)
- ✅ GPS location verification
- ✅ Global friend discovery with filters
- ✅ Compatibility scoring algorithm
- ✅ Real-time chat (2s polling)
- ✅ Post feed with likes & comments
- ✅ Events (meetup/call/group)
- ✅ Interactive friend world map
- ✅ Friend requests system
- ✅ Report & block users
- ✅ Friendship badges & milestones
- ✅ Admin dashboard with analytics
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Dark blue theme with glass morphism
- ✅ Framer Motion page transitions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Styling | Tailwind CSS 3 |
| Animations | Framer Motion |
| HTTP Client | Axios |
| Router | React Router v6 |
| Map | React Leaflet |
| Backend | PHP 8.1+ |
| Database | MySQL 8.0 |
| Email | PHPMailer + SMTP |
| Local Dev | XAMPP |

---

© 2025-26 Frinder · DBMS Project · Pure Friendship · No Borders · No Limits
=======
# Frinder_LocalHost
>>>>>>> e02ae6b4f5f2f7a4afe000ecd5b98d5509fbdfa5
