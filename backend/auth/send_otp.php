<?php
// ============================================================
// FRINDER — Send / Resend OTP (Universal) — FIXED
// File: backend/auth/send_otp.php
// Supports: register, login, reset
//
// BUGS FIXED:
// 1. respond() data now at top level (matches frontend expectations)
// 2. rate limit checks per-purpose correctly
// 3. 'reset' purpose resend now works (ForgotPassword resend calls this)
// ============================================================
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed', [], 405);
}

$body    = getBody();
$pdo     = getDB();

$userId  = (int)($body['user_id'] ?? 0);
$email   = strtolower(trim($body['email'] ?? ''));
$purpose = trim($body['purpose'] ?? 'register');

// Validate purpose
if (!in_array($purpose, ['register', 'login', 'reset'], true)) {
    respond(false, 'Invalid OTP purpose. Use: register, login, or reset', [], 422);
}

// Find user — by user_id preferred, fallback to email
if ($userId) {
    $stmt = $pdo->prepare('SELECT user_id, full_name, email, account_status FROM users WHERE user_id = ?');
    $stmt->execute([$userId]);
} elseif ($email) {
    $stmt = $pdo->prepare('SELECT user_id, full_name, email, account_status FROM users WHERE email = ?');
    $stmt->execute([$email]);
} else {
    respond(false, 'user_id or email is required', [], 422);
}
$user = $stmt->fetch();

if (!$user) {
    respond(false, 'User not found', [], 404);
}
if ($user['account_status'] === 'suspended') {
    respond(false, 'Account suspended. Contact support.', [], 403);
}

// Rate limit: max 3 OTPs per 15 minutes per purpose
$stmt = $pdo->prepare("
    SELECT COUNT(*) FROM email_otps
    WHERE user_id = ? AND purpose = ?
    AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
");
$stmt->execute([$user['user_id'], $purpose]);
if ((int)$stmt->fetchColumn() >= 3) {
    respond(false, 'Too many code requests. Please wait 15 minutes.', [], 429);
}

// Invalidate old unused OTPs for this user + purpose
$pdo->prepare("UPDATE email_otps SET is_used = 1 WHERE user_id = ? AND purpose = ? AND is_used = 0")
    ->execute([$user['user_id'], $purpose]);

// Generate secure 6-digit OTP
$otp = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

// Expiry: 5 min for login, 15 min for register/reset
$expireMinutes = ($purpose === 'login') ? 5 : 15;
$pdo->prepare("
    INSERT INTO email_otps (user_id, otp_code, purpose, expires_at)
    VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL {$expireMinutes} MINUTE))
")->execute([$user['user_id'], $otp, $purpose]);

// Send via PHPMailer
sendOTPEmail($user['email'], $user['full_name'], $otp, $purpose);

logActivity($user['user_id'], "{$purpose}_otp_sent", "OTP sent for {$purpose} to {$user['email']}");

// Return user_id at top level (FE expects r.data.user_id or data.user_id directly)
respond(true, 'Verification code sent to your email!', [
    'user_id'    => (int)$user['user_id'],
    'email_hint' => substr($user['email'], 0, 3) . '***' . strstr($user['email'], '@'),
]);