<?php
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(false, 'Method not allowed', [], 405);

$body = getBody();
$pdo = getDB();

$email    = strtolower(trim($body['email'] ?? ''));
$password = $body['password'] ?? '';

if (!$email || !$password) respond(false, 'Email and password are required', [], 422);

// Get user (generic error to not reveal if email exists)
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) respond(false, 'Invalid email or password', [], 401);

// Check account status
if ($user['account_status'] === 'suspended') {
    respond(false, 'Your account has been suspended. Contact support.', [], 403);
}
if ($user['account_status'] === 'rejected') {
    respond(false, 'Your account application was rejected. Contact support.', [], 403);
}

// Check lockout
if ($user['locked_until'] && new DateTime($user['locked_until']) > new DateTime()) {
    $remaining = (new DateTime($user['locked_until']))->diff(new DateTime());
    $mins = $remaining->i + ($remaining->h * 60);
    respond(false, "Account locked. Try again in {$mins} minutes.", [], 429);
}

// Verify password
if (!password_verify($password, $user['password_hash'])) {
    $attempts = $user['failed_attempts'] + 1;
    if ($attempts >= 5) {
        $pdo->prepare('UPDATE users SET failed_attempts = ?, locked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE user_id = ?')
            ->execute([$attempts, $user['user_id']]);
        respond(false, 'Too many failed attempts. Account locked for 15 minutes.', [], 429);
    } else {
        $pdo->prepare('UPDATE users SET failed_attempts = ? WHERE user_id = ?')
            ->execute([$attempts, $user['user_id']]);
        $remaining = 5 - $attempts;
        respond(false, "Invalid password. {$remaining} attempt(s) remaining.", [], 401);
    }
}

// Check email verified
if (!$user['email_verified']) {
    respond(false, 'Please verify your email first.', ['user_id' => (int)$user['user_id'], 'needs_verification' => true], 403);
}

// Send login OTP
$otp = str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
$stmt = $pdo->prepare('UPDATE email_otps SET is_used = 1 WHERE user_id = ? AND purpose = ? AND is_used = 0');
$stmt->execute([$user['user_id'], 'login']);
$stmt = $pdo->prepare('INSERT INTO email_otps (user_id, otp_code, purpose, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))');
$stmt->execute([$user['user_id'], $otp, 'login']);

sendOTPEmail($user['email'], $user['full_name'], $otp, 'login');

respond(true, 'OTP sent to your email. Please check your inbox.', [
    'user_id' => (int)$user['user_id'],
    'step'    => 2
]);
