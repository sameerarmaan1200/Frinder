<?php
// ============================================================
// FRINDER — Login API (fixed version)
// File: backend/auth/login.php
// Step 1: email + password → sends OTP via PHPMailer
// Step 2: verify OTP → creates session token
// Step 3: resend OTP
// ============================================================
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed', [], 405);
}

$body   = getBody();
$pdo    = getDB();
$action = trim($body['action'] ?? 'login'); // 'login', 'verify', or 'resend'
// ── STEP 1: Email + Password → Send OTP ──────────────────────
if ($action === 'login') {
    $email    = strtolower(trim($body['email']    ?? ''));
    $password = trim($body['password'] ?? '');

    if (!$email || !isValidEmail($email)) {
        respond(false, 'Please enter a valid email address', [], 422);
    }
    if (!$password) {
        respond(false, 'Password is required', [], 422);
    }

    $stmt = $pdo->prepare('
        SELECT user_id, full_name, email, password_hash,
               account_status, email_verified,
               failed_attempts, locked_until
        FROM users WHERE email = ?
    ');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && $user['locked_until'] && strtotime($user['locked_until']) > time()) {
        $mins = ceil((strtotime($user['locked_until']) - time()) / 60);
        respond(false, "Account locked due to too many failed attempts. Try again in {$mins} minute(s).", [], 429);
    }

    if (!$user || !password_verify($password, $user['password_hash'])) {
        if ($user) {
            $attempts = (int)$user['failed_attempts'] + 1;
            $lockUntil = $attempts >= 5 ? date('Y-m-d H:i:s', time() + 900) : null;
            $pdo->prepare('UPDATE users SET failed_attempts = ?, locked_until = ? WHERE user_id = ?')
                ->execute([$attempts, $lockUntil, $user['user_id']]);
            logActivity($user['user_id'], 'login_failed', "Wrong password (attempt {$attempts})");
        }
        respond(false, 'Incorrect email or password', [], 401);
    }

    // Block only suspended accounts, allow incomplete accounts to proceed
    if ($user['account_status'] === 'suspended') {
        respond(false, 'Your account has been suspended. Please contact support.', [], 403);
    }

    if ((int)$user['failed_attempts'] > 0) {
        $pdo->prepare('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE user_id = ?')
            ->execute([$user['user_id']]);
    }

    $pdo->prepare("UPDATE email_otps SET is_used = 1 WHERE user_id = ? AND purpose = 'login' AND is_used = 0")
        ->execute([$user['user_id']]);

    $otp = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    $pdo->prepare("
        INSERT INTO email_otps (user_id, otp_code, purpose, expires_at)
        VALUES (?, ?, 'login', DATE_ADD(NOW(), INTERVAL 5 MINUTE))
    ")->execute([$user['user_id'], $otp]);

    sendOTPEmail($user['email'], $user['full_name'], $otp, 'login');
    logActivity($user['user_id'], 'login_otp_sent', "OTP sent to {$email}");

    respond(true, 'Verification code sent to your email', [
        'user_id'     => (int)$user['user_id'],
        'email_hint'  => substr($email, 0, 3) . '***' . strstr($email, '@'),
    ]);
}
// ── STEP 2: Verify OTP → Create Session ──────────────────────
if ($action === 'verify') {
    $userId = (int)trim($body['user_id'] ?? 0);
    $code   = trim($body['otp_code']  ?? '');

    if (!$userId) {
        respond(false, 'User ID missing. Please start login again.', [], 422);
    }
    if (!$code || strlen($code) !== 6 || !ctype_digit($code)) {
        respond(false, 'Please enter the 6-digit code', [], 422);
    }

    $stmt = $pdo->prepare("
        SELECT COUNT(*) FROM user_activity
        WHERE user_id = ? AND action = 'otp_fail'
        AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
    ");
    $stmt->execute([$userId]);
    if ((int)$stmt->fetchColumn() >= 5) {
        respond(false, 'Too many wrong codes. Please request a new one.', [], 429);
    }

    $stmt = $pdo->prepare("
        SELECT otp_id FROM email_otps
        WHERE user_id = ? AND otp_code = ? AND purpose = 'login'
        AND expires_at > NOW() AND is_used = 0
        ORDER BY created_at DESC LIMIT 1
    ");
    $stmt->execute([$userId, $code]);
    $otp = $stmt->fetch();

    if (!$otp) {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $pdo->prepare("INSERT INTO user_activity (user_id, action, details, ip_address) VALUES (?, 'otp_fail', 'Wrong login OTP', ?)")
            ->execute([$userId, $ip]);
        respond(false, 'Invalid or expired code. Try again or request a new one.', [], 422);
    }

    $pdo->prepare('UPDATE email_otps SET is_used = 1 WHERE otp_id = ?')
        ->execute([$otp['otp_id']]);

    $stmt = $pdo->prepare('SELECT user_id, full_name, email, account_status, profile_picture FROM users WHERE user_id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        respond(false, 'User not found', [], 404);
    }

    $rawToken    = bin2hex(random_bytes(32));
    $hashedToken = hash('sha256', $rawToken);
    $expiresAt   = date('Y-m-d H:i:s', time() + (30 * 24 * 3600));
    $ip          = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $ua          = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 200);

    $pdo->prepare('
        INSERT INTO login_sessions (user_id, session_token, ip_address, device_info, expires_at)
        VALUES (?, ?, ?, ?, ?)
    ')->execute([$userId, $hashedToken, $ip, $ua, $expiresAt]);

    $pdo->prepare('UPDATE users SET is_online = 1, last_seen = NOW(), failed_attempts = 0, locked_until = NULL WHERE user_id = ?')
        ->execute([$userId]);

    logActivity($userId, 'login_success', "Logged in from {$ip}");

    respond(true, 'Login successful!', [
        'session_token' => $rawToken,
        'user'          => [
            'user_id'         => (int)$user['user_id'],
            'full_name'       => $user['full_name'],
            'email'           => $user['email'],
            'account_status'  => $user['account_status'],
            'profile_picture' => $user['profile_picture'],
        ]
    ]);
}
// ── STEP 3: Resend OTP ───────────────────────────────────────
if ($action === 'resend') {
    $userId = (int)trim($body['user_id'] ?? 0);
    if (!$userId) respond(false, 'User ID required', [], 422);

    $stmt = $pdo->prepare("
        SELECT COUNT(*) FROM email_otps
        WHERE user_id = ? AND purpose = 'login'
        AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
    ");
    $stmt->execute([$userId]);
    if ((int)$stmt->fetchColumn() >= 3) {
        respond(false, 'Too many resend requests. Please wait 15 minutes.', [], 429);
    }

    $stmt = $pdo->prepare('SELECT full_name, email FROM users WHERE user_id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    if (!$user) respond(false, 'User not found', [], 404);

    $pdo->prepare("UPDATE email_otps SET is_used = 1 WHERE user_id = ? AND purpose = 'login' AND is_used = 0")
        ->execute([$userId]);

    $otp = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    $pdo->prepare("
        INSERT INTO email_otps (user_id, otp_code, purpose, expires_at)
        VALUES (?, ?, 'login', DATE_ADD(NOW(), INTERVAL 5 MINUTE))
    ")->execute([$userId, $otp]);

    sendOTPEmail($user['email'], $user['full_name'], $otp, 'login');
    logActivity($userId, 'login_otp_resent', "Resent login OTP to {$user['email']}");

    respond(true, 'New code sent to your email', [
        'user_id'    => $userId,
        'email_hint' => substr($user['email'], 0, 3) . '***' . strstr($user['email'], '@'),
    ]);
}
// ── FALLBACK ────────────────────────────────────────────────
respond(false, 'Invalid action. Expected: login, verify, or resend', [], 400);
