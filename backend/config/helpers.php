<?php
// ============================================================
// FRINDER — Core Helpers & Middleware
// ============================================================

require_once __DIR__ . '/db.php';

// ─── CORS Headers ────────────────────────────────────────────
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    http_response_code(200);
    exit(0);
}
header('Content-Type: application/json; charset=utf-8');

// ─── JSON Response ───────────────────────────────────────────
function respond(bool $success, string $message, array $data = [], int $code = 200): void {
    http_response_code($code);
    echo json_encode(['success' => $success, 'message' => $message, ...$data]);
    exit;
}

// ─── Get JSON Body ───────────────────────────────────────────
function getBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

// ─── Auth Middleware ─────────────────────────────────────────
function requireAuth(): array {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $auth, $m)) {
        respond(false, 'Unauthorized', [], 401);
    }
    $token = $m[1];
    $pdo = getDB();
    $stmt = $pdo->prepare('
        SELECT ls.user_id, u.full_name, u.email, u.username, u.account_status, u.profile_picture
        FROM login_sessions ls
        JOIN users u ON u.user_id = ls.user_id
        WHERE ls.session_token = ? AND ls.expires_at > NOW()
    ');
    $stmt->execute([$token]);
    $user = $stmt->fetch();
    if (!$user) {
        respond(false, 'Session expired or invalid', [], 401);
    }
    return $user;
}

// ─── Optional Auth ───────────────────────────────────────────
function optionalAuth(): ?array {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $auth, $m)) return null;
    $token = $m[1];
    $pdo = getDB();
    $stmt = $pdo->prepare('
        SELECT ls.user_id, u.full_name, u.email, u.username, u.account_status
        FROM login_sessions ls
        JOIN users u ON u.user_id = ls.user_id
        WHERE ls.session_token = ? AND ls.expires_at > NOW()
    ');
    $stmt->execute([$token]);
    return $stmt->fetch() ?: null;
}

// ─── Admin Auth ──────────────────────────────────────────────
function requireAdmin(): array {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!preg_match('/^Bearer\s+admin:(.+)$/i', $auth, $m)) {
        respond(false, 'Admin access required', [], 403);
    }
    $token = $m[1];
    $pdo = getDB();
    $stmt = $pdo->prepare('SELECT * FROM admin_users WHERE password_hash = ?');
    $stmt->execute([$token]);
    $admin = $stmt->fetch();
    if (!$admin) {
        respond(false, 'Invalid admin session', [], 403);
    }
    return $admin;
}

// ─── Send OTP Email ──────────────────────────────────────────
function sendOTPEmail(string $toEmail, string $toName, string $otp, string $purpose): bool {
    require_once __DIR__ . '/mail.php';
    
    $subject = $purpose === 'login' 
        ? 'Your Frinder Login Code' 
        : 'Verify Your Frinder Account';
    
    $expiry = $purpose === 'login' ? '5 minutes' : '10 minutes';
    
    $html = "
    <!DOCTYPE html>
    <html>
    <head><meta charset='utf-8'></head>
    <body style='font-family: Arial, sans-serif; background: #0a0f1e; color: #ffffff; padding: 40px 0; margin: 0;'>
      <div style='max-width: 520px; margin: 0 auto; background: #0d1526; border-radius: 16px; overflow: hidden; border: 1px solid #1e3a5f;'>
        <div style='background: linear-gradient(135deg, #0066ff, #0040cc); padding: 32px; text-align: center;'>
          <h1 style='margin: 0; font-size: 28px; letter-spacing: 4px; color: #fff;'>FRINDER</h1>
          <p style='margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 13px;'>Verified Global Friendship Platform</p>
        </div>
        <div style='padding: 40px 32px; text-align: center;'>
          <p style='color: #a0b4cc; font-size: 16px; margin: 0 0 24px;'>Hi <strong style='color: #fff;'>{$toName}</strong>, your verification code is:</p>
          <div style='background: #0a0f1e; border: 2px solid #0066ff; border-radius: 12px; padding: 24px; margin: 0 0 24px;'>
            <span style='font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #3b9eff; font-family: monospace;'>{$otp}</span>
          </div>
          <p style='color: #6b7c93; font-size: 13px; margin: 0;'>This code expires in <strong style='color: #a0b4cc;'>{$expiry}</strong>. Do not share it with anyone.</p>
        </div>
        <div style='background: #070c18; padding: 20px; text-align: center;'>
          <p style='color: #3a5068; font-size: 12px; margin: 0;'>© " . date('Y') . " Frinder · Pure Friendship · No Borders · No Limits</p>
        </div>
      </div>
    </body>
    </html>";

    if (file_exists(__DIR__ . '/../../vendor/autoload.php')) {
        require_once __DIR__ . '/../../vendor/autoload.php';
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = SMTP_HOST;
            $mail->SMTPAuth = true;
            $mail->Username = SMTP_USER;
            $mail->Password = SMTP_PASS;
            $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = SMTP_PORT;
            $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
            $mail->addAddress($toEmail, $toName);
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $html;
            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("PHPMailer Error: " . $mail->ErrorInfo);
        }
    }
    
    error_log("FRINDER OTP [{$purpose}] for {$toEmail}: {$otp}");
    return true;
}

// ─── Log Activity ────────────────────────────────────────────
function logActivity(int $userId, string $action, string $details = ''): void {
    try {
        $pdo = getDB();
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $stmt = $pdo->prepare('INSERT INTO user_activity (user_id, action, details, ip_address) VALUES (?,?,?,?)');
        $stmt->execute([$userId, $action, $details, $ip]);
    } catch (Exception $e) {
        // Non-critical, ignore
    }
}

// ─── Sanitize ────────────────────────────────────────────────
function clean(string $val): string {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

// ─── Validate Email ──────────────────────────────────────────
function isValidEmail(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// ─── Time Ago ────────────────────────────────────────────────
function timeAgo(string $datetime): string {
    $now = new DateTime();
    $past = new DateTime($datetime);
    $diff = $now->diff($past);
    if ($diff->y > 0) return $diff->y . 'y ago';
    if ($diff->m > 0) return $diff->m . 'mo ago';
    if ($diff->d > 0) return $diff->d . 'd ago';
    if ($diff->h > 0) return $diff->h . 'h ago';
    if ($diff->i > 0) return $diff->i . 'm ago';
    return 'Just now';
}