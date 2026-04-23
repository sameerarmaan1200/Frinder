<?php
// ============================================================
// FRINDER — Verify OTP (Universal) — FINAL FIXED VERSION
// File: backend/auth/verify_otp.php
//
// Fixes:
// 1. login case: INSERT login_sessions includes expires_at, ip_address, device_info
// 2. login case: session_token is sha256-hashed before storing (requireAuth hashes too)
// 3. respond() spreads data at top level to match frontend expectations
// 4. reset case: purpose stored consistently as 'reset_token' and returned properly
// ============================================================
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed', [], 405);
}

$body    = getBody();
$pdo     = getDB();

$userId  = (int)($body['user_id'] ?? 0);
$code    = trim($body['otp_code'] ?? '');
$purpose = trim($body['purpose'] ?? 'register');

if (!$userId) {
    respond(false, 'User ID is required', [], 422);
}
if (!$code || strlen($code) !== 6 || !ctype_digit($code)) {
    respond(false, 'Please enter the 6-digit code from your email', [], 422);
}
if (!in_array($purpose, ['register', 'login', 'reset'], true)) {
    respond(false, 'Invalid OTP purpose', [], 422);
}

// Rate limit: max 5 wrong attempts per 15 min
$stmt = $pdo->prepare("
    SELECT COUNT(*) FROM user_activity
    WHERE user_id = ? AND action = 'otp_fail'
    AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
");
$stmt->execute([$userId]);
if ((int)$stmt->fetchColumn() >= 5) {
    respond(false, 'Too many failed attempts. Please request a new code.', [], 429);
}

// Find valid OTP
$stmt = $pdo->prepare("
    SELECT otp_id FROM email_otps
    WHERE user_id = ? AND otp_code = ? AND purpose = ?
    AND expires_at > NOW() AND is_used = 0
    ORDER BY created_at DESC LIMIT 1
");
$stmt->execute([$userId, $code, $purpose]);
$otp = $stmt->fetch();

if (!$otp) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $pdo->prepare("INSERT INTO user_activity (user_id, action, details, ip_address) VALUES (?, 'otp_fail', ?, ?)")
        ->execute([$userId, "Wrong {$purpose} OTP", $ip]);
    respond(false, 'Invalid or expired code. Please check and try again.', [], 422);
}

// Mark OTP as used
$pdo->prepare('UPDATE email_otps SET is_used = 1 WHERE otp_id = ?')
    ->execute([$otp['otp_id']]);

// Handle each purpose
switch ($purpose) {

    // ── REGISTRATION ──────────────────────────────────────────
    case 'register':
        $pdo->prepare("UPDATE users SET email_verified = 1 WHERE user_id = ?")
            ->execute([$userId]);
        logActivity($userId, 'email_verified', 'Registration OTP verified successfully');

        respond(true, 'Email verified successfully!', [
            'user_id'        => $userId,
            'email_verified' => true,
            'purpose'        => 'register',
        ]);
        break;

    // ── LOGIN ─────────────────────────────────────────────────
    case 'login':
        $rawToken    = bin2hex(random_bytes(32)); // 64-char hex
        $storedToken = hash('sha256', $rawToken);
        $expiresAt   = date('Y-m-d H:i:s', time() + (30 * 24 * 3600)); // 30 days
        $ip          = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $ua          = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 200);

        $pdo->prepare("
            INSERT INTO login_sessions (user_id, session_token, ip_address, device_info, expires_at)
            VALUES (?, ?, ?, ?, ?)
        ")->execute([$userId, $storedToken, $ip, $ua, $expiresAt]);

        $pdo->prepare("UPDATE users SET is_online = 1, last_seen = NOW(), failed_attempts = 0 WHERE user_id = ?")
            ->execute([$userId]);

        $stmt = $pdo->prepare('SELECT user_id, full_name, email, account_status, profile_picture FROM users WHERE user_id = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        logActivity($userId, 'login_success', "Login OTP verified from {$ip}");

        respond(true, 'Login successful!', [
            'session_token' => $rawToken,
            'user'          => $user,
            'purpose'       => 'login',
        ]);
        break;

    // ── PASSWORD RESET ────────────────────────────────────────
    case 'reset':
        $resetToken = createPasswordResetToken($userId, 600);

        logActivity($userId, 'reset_otp_verified', 'Password reset OTP verified');

        respond(true, 'Code verified! Set your new password.', [
            'reset_token' => $resetToken,
            'user_id'     => $userId,
            'purpose'     => 'reset',
        ]);
        break;
}

respond(false, 'Unknown error', [], 500);
