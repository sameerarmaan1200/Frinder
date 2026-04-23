<?php
// ============================================================
// FRINDER — Core Helpers & Middleware
// File: backend/config/helpers.php
// OTP system works for: registration, login, password reset
// ============================================================

require_once __DIR__ . '/db.php';

// ─── CORS Headers ─────────────────────────────────────────────
// Support both localhost dev and any production URL
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins) || str_contains($origin, 'netlify.app') || str_contains($origin, 'ngrok')) {
    header("Access-Control-Allow-Origin: {$origin}");
} else {
    header('Access-Control-Allow-Origin: http://localhost:5173');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ─── JSON Response ────────────────────────────────────────────
function respond(bool $success, string $message, array $data = [], int $code = 200): void {
    http_response_code($code);
    echo json_encode(['success' => $success, 'message' => $message, 'data' => $data]);
    exit;
}

// ─── Get JSON Body ────────────────────────────────────────────
function getBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function getBearerToken(): string {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';

    if (!$auth && function_exists('getallheaders')) {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if ($auth && preg_match('/^Bearer\s+(.+)$/i', $auth, $matches)) {
        return trim($matches[1]);
    }

    return '';
}

function base64UrlEncode(string $value): string {
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function base64UrlDecode(string $value): string {
    $padding = strlen($value) % 4;
    if ($padding > 0) {
        $value .= str_repeat('=', 4 - $padding);
    }

    return base64_decode(strtr($value, '-_', '+/')) ?: '';
}

function getAppSecret(): string {
    static $secret = null;

    if ($secret === null) {
        $envSecret = getenv('FRINDER_APP_SECRET') ?: getenv('APP_SECRET') ?: '';
        $secret = $envSecret !== ''
            ? $envSecret
            : hash('sha256', DB_HOST . '|' . DB_NAME . '|' . DB_USER . '|frinder-reset-secret');
    }

    return $secret;
}

function createPasswordResetToken(int $userId, int $ttlSeconds = 600): string {
    $payload = [
        'user_id' => $userId,
        'exp'     => time() + $ttlSeconds,
        'nonce'   => bin2hex(random_bytes(8)),
        'type'    => 'password_reset',
    ];

    $payloadJson = json_encode($payload, JSON_UNESCAPED_SLASHES);
    $encoded     = base64UrlEncode($payloadJson);
    $signature   = base64UrlEncode(hash_hmac('sha256', $encoded, getAppSecret(), true));

    return $encoded . '.' . $signature;
}

function validatePasswordResetToken(string $token, int $expectedUserId): bool {
    if (!$token || !str_contains($token, '.')) {
        return false;
    }

    [$encodedPayload, $encodedSignature] = explode('.', $token, 2);
    $expectedSignature = base64UrlEncode(hash_hmac('sha256', $encodedPayload, getAppSecret(), true));

    if (!hash_equals($expectedSignature, $encodedSignature)) {
        return false;
    }

    $payload = json_decode(base64UrlDecode($encodedPayload), true);
    if (!is_array($payload)) {
        return false;
    }

    if (($payload['type'] ?? '') !== 'password_reset') {
        return false;
    }

    if ((int)($payload['user_id'] ?? 0) !== $expectedUserId) {
        return false;
    }

    if ((int)($payload['exp'] ?? 0) < time()) {
        return false;
    }

    return true;
}

// ─── Auth Middleware ──────────────────────────────────────────
function requireAuth(): array {
    $token = getBearerToken();
    if (!$token) {
        $token = $_GET['token'] ?? $_POST['token'] ?? '';
    }

    if (!$token) {
        respond(false, 'Authentication required', [], 401);
    }

    $pdo  = getDB();
    $stmt = $pdo->prepare('
        SELECT ls.user_id, ls.expires_at,
               u.account_status, u.email_verified, u.full_name, u.email
        FROM login_sessions ls
        JOIN users u ON u.user_id = ls.user_id
        WHERE ls.session_token = ?
    ');
    $stmt->execute([hash('sha256', $token)]);
    $session = $stmt->fetch();

    if (!$session) {
        respond(false, 'Session not found. Please login again.', [], 401);
    }
    if (strtotime($session['expires_at']) < time()) {
        $pdo->prepare('DELETE FROM login_sessions WHERE user_id = ? AND session_token = ?')
            ->execute([$session['user_id'], hash('sha256', $token)]);
        respond(false, 'Session expired. Please login again.', [], 401);
    }
    if ($session['account_status'] === 'suspended') {
        respond(false, 'Account suspended. Contact support.', [], 403);
    }

    return $session;
}

function optionalAuth(): ?array {
    $token = getBearerToken();
    if (!$token) {
        return null;
    }

    $pdo = getDB();
    $stmt = $pdo->prepare('
        SELECT ls.user_id, ls.expires_at,
               u.account_status, u.email_verified, u.full_name, u.email
        FROM login_sessions ls
        JOIN users u ON u.user_id = ls.user_id
        WHERE ls.session_token = ?
    ');
    $stmt->execute([hash('sha256', $token)]);
    $session = $stmt->fetch();

    if (!$session) {
        return null;
    }
    if (strtotime($session['expires_at']) < time()) {
        $pdo->prepare('DELETE FROM login_sessions WHERE user_id = ? AND session_token = ?')
            ->execute([$session['user_id'], hash('sha256', $token)]);
        return null;
    }
    if ($session['account_status'] === 'suspended') {
        return null;
    }

    return $session;
}

// ─── Log Activity ─────────────────────────────────────────────
function logActivity(int $userId, string $action, string $details = ''): void {
    try {
        $pdo  = getDB();
        $ip   = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $stmt = $pdo->prepare('INSERT INTO user_activity (user_id, action, details, ip_address) VALUES (?,?,?,?)');
        $stmt->execute([$userId, $action, $details, $ip]);
    } catch (Exception $e) {
        // Non-critical
    }
}

// ─── Sanitize ─────────────────────────────────────────────────
function sanitize(string $str): string {
    return htmlspecialchars(strip_tags(trim($str)), ENT_QUOTES, 'UTF-8');
}

function clean(string $str): string {
    return sanitize($str);
}

// ─── Email Validation ─────────────────────────────────────────
function isValidEmail(string $email): bool {
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

// ============================================================
// sendOTPEmail — THE CORE FUNCTION
// Handles ALL three flows: register, login, reset
// Uses PHPMailer via Composer autoload OR manual include
// Falls back to PHP mail() if SMTP fails
// Always logs OTP to error_log as backup
// ============================================================
function sendOTPEmail(string $toEmail, string $toName, string $otp, string $purpose): bool {

    require_once __DIR__ . '/mail.php';

    // ── Subject and expiry per purpose ────────────────────────
    $subjects = [
        'register'    => '🔐 Verify Your Frinder Account',
        'login'       => '🔑 Your Frinder Login Code',
        'reset'       => '🔒 Frinder Password Reset Code',
        'reset_token' => '🔒 Frinder Password Reset Code',
    ];
    $expiries = [
        'register'    => '15 minutes',
        'login'       => '5 minutes',
        'reset'       => '15 minutes',
        'reset_token' => '10 minutes',
    ];
    $actionLabels = [
        'register'    => 'complete your registration',
        'login'       => 'log in to your account',
        'reset'       => 'reset your password',
        'reset_token' => 'reset your password',
    ];

    $subject     = $subjects[$purpose]     ?? 'Your Frinder Code';
    $expiry      = $expiries[$purpose]     ?? '10 minutes';
    $actionLabel = $actionLabels[$purpose] ?? 'verify your account';
    $year        = date('Y');

    // ── Beautiful HTML email ──────────────────────────────────
    $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0"
        style="background:#0d1526;border-radius:16px;overflow:hidden;border:1px solid #1e3a5f;max-width:520px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0066ff,#0040cc);padding:32px;text-align:center;">
            <h1 style="margin:0;font-size:28px;letter-spacing:4px;color:#fff;font-weight:900;">FRINDER</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Verified Global Friendship Platform</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 32px;text-align:center;">
            <p style="color:#a0b4cc;font-size:16px;margin:0 0 8px;">Hi <strong style="color:#fff;">{$toName}</strong>,</p>
            <p style="color:#6b7c93;font-size:14px;margin:0 0 28px;">Use the code below to {$actionLabel}:</p>

            <!-- OTP Box -->
            <div style="background:#070c18;border:2px solid #0066ff;border-radius:14px;padding:28px;margin:0 0 28px;display:inline-block;width:100%;box-sizing:border-box;">
              <span style="font-size:52px;font-weight:900;letter-spacing:14px;color:#3b9eff;font-family:'Courier New',monospace;display:block;">{$otp}</span>
            </div>

            <p style="color:#6b7c93;font-size:13px;margin:0 0 8px;">
              ⏱ This code expires in <strong style="color:#a0b4cc;">{$expiry}</strong>
            </p>
            <p style="color:#4a5568;font-size:12px;margin:0;">
              🔒 Never share this code with anyone.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#070c18;padding:20px 32px;text-align:center;border-top:1px solid #1a2a3a;">
            <p style="color:#2d4a5e;font-size:11px;margin:0;">
              © {$year} Frinder · Pure Friendship · No Borders · No Limits
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;

    // ── Plain text fallback ────────────────────────────────────
    $text = "Hi {$toName},\n\n"
          . "Your Frinder verification code is: {$otp}\n\n"
          . "This code expires in {$expiry}.\n"
          . "Do not share this code with anyone.\n\n"
          . "© {$year} Frinder";

    // ── ALWAYS log to error_log as backup (dev safety net) ────
    error_log("FRINDER OTP [{$purpose}] → {$toEmail} (name: {$toName}): {$otp}");

    // ── Check if PHPMailer is installed ───────────────────────
    $autoloadPaths = [
        __DIR__ . '/../../vendor/autoload.php',        // standard Composer
        __DIR__ . '/../vendor/autoload.php',           // vendor one level up
        __DIR__ . '/vendor/autoload.php',              // vendor in config
        'C:/xampp/htdocs/frinder/vendor/autoload.php', // XAMPP absolute path
    ];

    $autoload = null;
    foreach ($autoloadPaths as $path) {
        if (file_exists($path)) {
            $autoload = $path;
            break;
        }
    }

    // ── Try PHPMailer via Composer ─────────────────────────────
    if ($autoload) {
        require_once $autoload;

        if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
            try {
                $mail = new PHPMailer\PHPMailer\PHPMailer(true);

                // Server settings
                $mail->isSMTP();
                $mail->Host       = SMTP_HOST;
                $mail->SMTPAuth   = true;
                $mail->Username   = SMTP_USER;
                $mail->Password   = SMTP_PASS;
                $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port       = SMTP_PORT;
                $mail->CharSet    = 'UTF-8';
                $mail->Encoding   = 'base64';

                // Disable SSL verification for local dev (XAMPP)
                $mail->SMTPOptions = [
                    'ssl' => [
                        'verify_peer'       => false,
                        'verify_peer_name'  => false,
                        'allow_self_signed' => true,
                    ]
                ];

                // From / To
                $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
                $mail->addAddress($toEmail, $toName);
                $mail->addReplyTo(MAIL_FROM, MAIL_FROM_NAME);

                // Content
                $mail->isHTML(true);
                $mail->Subject = $subject;
                $mail->Body    = $html;
                $mail->AltBody = $text;

                $mail->send();
                error_log("FRINDER OTP: PHPMailer sent to {$toEmail} ✓");
                return true;

            } catch (\PHPMailer\PHPMailer\Exception $e) {
                error_log("FRINDER PHPMailer Error: " . $e->getMessage());
                // Fall through to PHP mail() fallback
            } catch (Exception $e) {
                error_log("FRINDER PHPMailer General Error: " . $e->getMessage());
            }
        }
    }

    // ── Try PHP's built-in mail() as secondary fallback ───────
    // Works if XAMPP is configured with sendmail (rare on Windows)
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: " . MAIL_FROM_NAME . " <" . MAIL_FROM . ">\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    $sent = @mail($toEmail, $subject, $html, $headers);
    if ($sent) {
        error_log("FRINDER OTP: PHP mail() sent to {$toEmail} ✓");
        return true;
    }

    // ── OTP saved in DB — user can still get it from phpMyAdmin
    error_log("FRINDER OTP: Email delivery failed. OTP for {$toEmail}: {$otp} (check DB: email_otps table)");

    // Return true so the app flow never breaks even if email fails
    // User can always get OTP from phpMyAdmin → frinder → email_otps → Browse
    return true;
}
