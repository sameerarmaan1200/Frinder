<?php
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(false, 'Method not allowed', [], 405);

$body = getBody();
$pdo = getDB();

$userId  = (int)($body['user_id'] ?? 0);
$code    = trim($body['otp_code'] ?? '');
$purpose = $body['purpose'] ?? 'register';

if (!$userId || !$code) respond(false, 'User ID and OTP code are required', [], 422);

// Find valid OTP
$stmt = $pdo->prepare('
    SELECT otp_id FROM email_otps
    WHERE user_id = ? AND otp_code = ? AND purpose = ? AND expires_at > NOW() AND is_used = 0
    ORDER BY created_at DESC LIMIT 1
');
$stmt->execute([$userId, $code, $purpose]);
$otp = $stmt->fetch();

if (!$otp) {
    respond(false, 'Invalid or expired OTP code', [], 422);
}

// Mark as used
$stmt = $pdo->prepare('UPDATE email_otps SET is_used = 1 WHERE otp_id = ?');
$stmt->execute([$otp['otp_id']]);

if ($purpose === 'register') {
    // Mark email verified, update score
    $stmt = $pdo->prepare('UPDATE users SET email_verified = 1 WHERE user_id = ?');
    $stmt->execute([$userId]);
    $stmt = $pdo->prepare('UPDATE user_verification SET verification_score = verification_score + 10 WHERE user_id = ?');
    $stmt->execute([$userId]);
    respond(true, 'Email verified successfully!');
}

if ($purpose === 'login') {
    // Create session token
    $token = bin2hex(random_bytes(32));
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $device = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

    $stmt = $pdo->prepare('INSERT INTO login_sessions (user_id, session_token, ip_address, device_info, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))');
    $stmt->execute([$userId, $token, $ip, $device]);

    // Reset failed attempts
    $stmt = $pdo->prepare('UPDATE users SET failed_attempts = 0, is_online = 1, last_seen = NOW() WHERE user_id = ?');
    $stmt->execute([$userId]);

    // Get user data
    $stmt = $pdo->prepare('
        SELECT u.*, c.country_name, c.flag_emoji
        FROM users u
        LEFT JOIN countries c ON c.country_id = u.country_id
        WHERE u.user_id = ?
    ');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    logActivity($userId, 'login', "Login from IP: {$ip}");

    respond(true, 'Login successful!', [
        'token' => $token,
        'user'  => [
            'user_id'         => (int)$user['user_id'],
            'username'        => $user['username'],
            'full_name'       => $user['full_name'],
            'email'           => $user['email'],
            'profile_picture' => $user['profile_picture'],
            'account_status'  => $user['account_status'],
            'country_name'    => $user['country_name'],
            'flag_emoji'      => $user['flag_emoji'],
        ]
    ]);
}
