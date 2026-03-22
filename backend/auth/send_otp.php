<?php
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(false, 'Method not allowed', [], 405);

$body = getBody();
$pdo = getDB();

$userId  = (int)($body['user_id'] ?? 0);
$purpose = $body['purpose'] ?? 'register';

if (!$userId) respond(false, 'User ID required', [], 422);
if (!in_array($purpose, ['register','login','reset'])) respond(false, 'Invalid purpose', [], 422);

// Get user
$stmt = $pdo->prepare('SELECT user_id, full_name, email FROM users WHERE user_id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();
if (!$user) respond(false, 'User not found', [], 404);

// Invalidate old OTPs
$stmt = $pdo->prepare('UPDATE email_otps SET is_used = 1 WHERE user_id = ? AND purpose = ? AND is_used = 0');
$stmt->execute([$userId, $purpose]);

// Generate OTP
$otp = str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
$expiry = $purpose === 'login' ? 5 : 10; // minutes

$stmt = $pdo->prepare('INSERT INTO email_otps (user_id, otp_code, purpose, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))');
$stmt->execute([$userId, $otp, $purpose, $expiry]);

// Send email
$sent = sendOTPEmail($user['email'], $user['full_name'], $otp, $purpose);

if ($sent) {
    respond(true, 'OTP sent to your email', ['expires_in' => $expiry * 60]);
} else {
    respond(false, 'Failed to send OTP email. Please try again.', [], 500);
}
