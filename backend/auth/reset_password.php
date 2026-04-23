<?php
// ============================================================
// FRINDER — Password Reset API — FIXED
// File: backend/auth/reset_password.php
//
// BUGS FIXED:
// 1. Step 1 response: user_id now at TOP LEVEL — ForgotPassword.jsx reads data.user_id
//    (Frontend uses raw fetch: const data = await res.json() then data.user_id)
// 2. Step 2 response: reset_token at TOP LEVEL — ForgotPassword reads data.data.reset_token
//    Wait: ForgotPassword uses authAPI.verifyOTP which is axios:
//    res.data.reset_token — axios res.data = parsed json = {success, message, reset_token}
//    So reset_token must be at top level in JSON for axios res.data.reset_token to work
//    But Step 1 uses raw fetch: const data = await res.json() = {success, message, user_id}
//    So user_id also needs to be at top level in JSON
// ============================================================
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed', [], 405);
}

$body   = getBody();
$pdo    = getDB();
$action = trim($body['action'] ?? '');

if (!$action) {
    respond(false, 'action is required: request, verify, or set_password', [], 422);
}

// ── STEP 1: Request OTP (email → sends OTP) ───────────────────
if ($action === 'request') {
    $email = strtolower(trim($body['email'] ?? ''));

    if (!$email) {
        respond(false, 'Email address is required', [], 422);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(false, 'Please enter a valid email address', [], 422);
    }

    $stmt = $pdo->prepare('SELECT user_id, full_name, email, account_status FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        // Security: don't reveal if email exists — but return user_id = 0 so FE doesn't crash
        respond(true, 'If that email is registered, a reset code has been sent.', [
            'user_id' => 0,
        ]);
    }

    if ($user['account_status'] === 'suspended') {
        respond(false, 'This account has been suspended. Contact support.', [], 403);
    }

    // Rate limit
    $stmt = $pdo->prepare("
        SELECT COUNT(*) FROM email_otps
        WHERE user_id = ? AND purpose = 'reset'
        AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
    ");
    $stmt->execute([$user['user_id']]);
    if ((int)$stmt->fetchColumn() >= 3) {
        respond(false, 'Too many reset requests. Please wait 15 minutes.', [], 429);
    }

    // Invalidate previous reset OTPs / reset sessions
    $pdo->prepare("UPDATE email_otps SET is_used = 1 WHERE user_id = ? AND purpose IN ('reset','reset_token') AND is_used = 0")
        ->execute([$user['user_id']]);

    // Generate OTP
    $otp = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

    $pdo->prepare("
        INSERT INTO email_otps (user_id, otp_code, purpose, expires_at)
        VALUES (?, ?, 'reset', DATE_ADD(NOW(), INTERVAL 15 MINUTE))
    ")->execute([$user['user_id'], $otp]);

    sendOTPEmail($user['email'], $user['full_name'], $otp, 'reset');

    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $pdo->prepare("INSERT INTO user_activity (user_id, action, details, ip_address) VALUES (?, 'password_reset_requested', ?, ?)")
        ->execute([$user['user_id'], "Reset OTP sent to {$email}", $ip]);

    // FIX: user_id at top level — ForgotPassword.jsx raw fetch reads data.user_id
    respond(true, 'If that email is registered, a reset code has been sent.', [
        'user_id' => (int)$user['user_id'],
    ]);
}

// ── STEP 2: Verify OTP → return reset_token ───────────────────
// NOTE: ForgotPassword.jsx calls authAPI.verifyOTP() for this step
// which hits verify_otp.php, NOT this endpoint.
// This endpoint's verify action is kept as fallback only.
if ($action === 'verify') {
    $userId = (int)($body['user_id'] ?? 0);
    $code   = trim($body['otp_code'] ?? '');

    if (!$userId) {
        respond(false, 'User ID is required. Please start over.', [], 422);
    }
    if (!$code || strlen($code) !== 6 || !ctype_digit($code)) {
        respond(false, 'Please enter the 6-digit code', [], 422);
    }

    // Rate limit
    $stmt = $pdo->prepare("
        SELECT COUNT(*) FROM user_activity
        WHERE user_id = ? AND action = 'reset_otp_fail'
        AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
    ");
    $stmt->execute([$userId]);
    if ((int)$stmt->fetchColumn() >= 5) {
        respond(false, 'Too many failed attempts. Please request a new code.', [], 429);
    }

    $stmt = $pdo->prepare("
        SELECT otp_id FROM email_otps
        WHERE user_id = ? AND otp_code = ? AND purpose = 'reset'
        AND expires_at > NOW() AND is_used = 0
        ORDER BY created_at DESC LIMIT 1
    ");
    $stmt->execute([$userId, $code]);
    $otp = $stmt->fetch();

    if (!$otp) {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $pdo->prepare("INSERT INTO user_activity (user_id, action, details, ip_address) VALUES (?, 'reset_otp_fail', 'Wrong reset OTP', ?)")
            ->execute([$userId, $ip]);
        respond(false, 'Invalid or expired code. Please check and try again.', [], 422);
    }

    $pdo->prepare('UPDATE email_otps SET is_used = 1 WHERE otp_id = ?')
        ->execute([$otp['otp_id']]);

    $resetToken = createPasswordResetToken($userId, 600);

    // reset_token at top level for axios: res.data.reset_token
    respond(true, 'Code verified! Now set your new password.', [
        'reset_token' => $resetToken,
        'user_id'     => (int)$userId,
    ]);
}

// ── STEP 3: Set New Password ──────────────────────────────────
if ($action === 'set_password') {
    $userId      = (int)($body['user_id']    ?? 0);
    $resetToken  = trim($body['reset_token'] ?? '');
    $newPassword = $body['new_password']      ?? '';
    $confirmPass = $body['confirm_password']  ?? $newPassword;

    if (!$userId) {
        respond(false, 'Session invalid. Please start the reset process again.', [], 422);
    }
    if (!$resetToken) {
        respond(false, 'Reset token missing. Please start over.', [], 422);
    }
    if (!$newPassword) {
        respond(false, 'New password is required', [], 422);
    }
    if (strlen($newPassword) < 8) {
        respond(false, 'Password must be at least 8 characters', [], 422);
    }
    if (!preg_match('/[A-Z]/', $newPassword)) {
        respond(false, 'Password must contain at least 1 uppercase letter (A-Z)', [], 422);
    }
    if (!preg_match('/[0-9]/', $newPassword)) {
        respond(false, 'Password must contain at least 1 number (0-9)', [], 422);
    }
    if ($confirmPass && $newPassword !== $confirmPass) {
        respond(false, 'Passwords do not match', [], 422);
    }

    if (!validatePasswordResetToken($resetToken, $userId)) {
        respond(false, 'Reset session expired. Please request a new code and try again.', [], 422);
    }

    $stmt = $pdo->prepare('SELECT user_id, account_status FROM users WHERE user_id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) respond(false, 'Account not found', [], 404);
    if ($user['account_status'] === 'suspended') respond(false, 'Account suspended', [], 403);

    $hash = password_hash($newPassword, PASSWORD_BCRYPT);
    $pdo->prepare('UPDATE users SET password_hash = ?, failed_attempts = 0, locked_until = NULL WHERE user_id = ?')
        ->execute([$hash, $userId]);

    $pdo->prepare('DELETE FROM login_sessions WHERE user_id = ?')
        ->execute([$userId]);

    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $pdo->prepare("INSERT INTO user_activity (user_id, action, details, ip_address) VALUES (?, 'password_reset_completed', 'Password reset successfully', ?)")
        ->execute([$userId, $ip]);

    respond(true, 'Password changed successfully! You can now login with your new password.');
}

respond(false, 'Invalid action. Use: request, verify, or set_password', [], 400);
