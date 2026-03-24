<?php
require_once __DIR__ . '/../config/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

// Admin login
$action = $_GET['action'] ?? '';

if ($action === 'login' && $method === 'POST') {
    $body = getBody();
    $email    = strtolower(trim($body['email'] ?? ''));
    $password = $body['password'] ?? '';

    $stmt = $pdo->prepare('SELECT * FROM admin_users WHERE email = ?');
    $stmt->execute([$email]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($password, $admin['password_hash'])) {
        respond(false, 'Invalid admin credentials', [], 401);
    }

    $pdo->prepare('UPDATE admin_users SET last_login=NOW() WHERE admin_id=?')->execute([$admin['admin_id']]);
    respond(true, 'Admin login successful', [
        'admin' => ['admin_id' => $admin['admin_id'], 'admin_name' => $admin['admin_name'], 'role' => $admin['role']],
        'token' => base64_encode($admin['email'] . ':' . $admin['password_hash'])
    ]);
}

// All other actions require admin auth (simple token check)
$headers = getallheaders();
$auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
preg_match('/^Bearer\s+(.+)$/i', $auth, $m);
$token = $m[1] ?? '';

if ($token) {
    $decoded = base64_decode($token);
    [$adminEmail, $adminHash] = explode(':', $decoded, 2) + ['',''];
    $stmt = $pdo->prepare('SELECT * FROM admin_users WHERE email = ? AND password_hash = ?');
    $stmt->execute([$adminEmail, $adminHash]);
    $adminUser = $stmt->fetch();
    if (!$adminUser) respond(false, 'Unauthorized', [], 401);
} else {
    respond(false, 'Admin authentication required', [], 401);
}

// Analytics
if ($action === 'analytics') {
    $totalUsers    = $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    $verifiedUsers = $pdo->query('SELECT COUNT(*) FROM users WHERE account_status="verified"')->fetchColumn();
    $pendingUsers  = $pdo->query('SELECT COUNT(*) FROM users WHERE account_status="pending"')->fetchColumn();
    $totalPosts    = $pdo->query('SELECT COUNT(*) FROM posts')->fetchColumn();
    $totalMessages = $pdo->query('SELECT COUNT(*) FROM messages')->fetchColumn();
    $totalFriends  = $pdo->query('SELECT COUNT(*) FROM friends')->fetchColumn();
    $totalReports  = $pdo->query('SELECT COUNT(*) FROM reports WHERE status="pending"')->fetchColumn();

    // Daily registrations (last 7 days)
    $stmt = $pdo->query('SELECT DATE(created_at) AS day, COUNT(*) AS count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY day ORDER BY day');
    $dailyRegs = $stmt->fetchAll();

    // Top countries
    $stmt = $pdo->query('SELECT c.country_name, c.flag_emoji, COUNT(*) AS user_count FROM users u JOIN countries c ON c.country_id=u.country_id GROUP BY u.country_id ORDER BY user_count DESC LIMIT 10');
    $topCountries = $stmt->fetchAll();

    respond(true, 'Analytics', [
        'stats' => compact('totalUsers','verifiedUsers','pendingUsers','totalPosts','totalMessages','totalFriends','totalReports'),
        'daily_registrations' => $dailyRegs,
        'top_countries' => $topCountries,
    ]);
}

// Pending verifications
if ($action === 'pending') {
    $stmt = $pdo->prepare('
        SELECT u.user_id, u.full_name, u.username, u.email, u.created_at, u.account_status,
            c.country_name, c.flag_emoji,
            uv.verification_score, uv.document_type, uv.document_path, uv.selfie_path, uv.gps_lat, uv.gps_lng, uv.location_mismatch
        FROM users u
        LEFT JOIN countries c ON c.country_id=u.country_id
        LEFT JOIN user_verification uv ON uv.user_id=u.user_id
        WHERE u.account_status = "pending"
        ORDER BY u.created_at ASC
        LIMIT 50
    ');
    $stmt->execute();
    respond(true, 'Pending users', ['users' => $stmt->fetchAll()]);
}

// All users
if ($action === 'users') {
    $search = trim($_GET['search'] ?? '');
    $status = $_GET['status'] ?? '';
    $page   = max(1, (int)($_GET['page'] ?? 1));
    $limit  = 20;
    $offset = ($page - 1) * $limit;

    $where = ['1=1'];
    $params = [];
    if ($search) { $where[] = '(u.full_name LIKE ? OR u.username LIKE ? OR u.email LIKE ?)'; $s="%{$search}%"; $params[]=$s; $params[]=$s; $params[]=$s; }
    if ($status) { $where[] = 'u.account_status = ?'; $params[] = $status; }

    $stmt = $pdo->prepare('SELECT u.user_id, u.full_name, u.username, u.email, u.account_status, u.created_at, u.is_online, c.country_name FROM users u LEFT JOIN countries c ON c.country_id=u.country_id WHERE ' . implode(' AND ', $where) . ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?');
    $stmt->execute(array_merge($params, [$limit, $offset]));
    respond(true, 'Users', ['users' => $stmt->fetchAll()]);
}

// Reports
if ($action === 'reports') {
    $stmt = $pdo->query('
        SELECT r.*, 
            reporter.full_name AS reporter_name, reporter.username AS reporter_username,
            reported.full_name AS reported_name, reported.username AS reported_username
        FROM reports r
        JOIN users reporter ON reporter.user_id = r.reporter_id
        JOIN users reported ON reported.user_id = r.reported_user_id
        ORDER BY r.created_at DESC LIMIT 50
    ');
    respond(true, 'Reports', ['reports' => $stmt->fetchAll()]);
}

// Fraud alerts
if ($action === 'fraud') {
    $stmt = $pdo->query('
        SELECT u.user_id, u.full_name, u.username, u.account_status,
            uv.fraud_score, uv.location_mismatch, uv.verification_score
        FROM users u JOIN user_verification uv ON uv.user_id=u.user_id
        WHERE uv.fraud_score > 0 OR uv.location_mismatch=1
        ORDER BY uv.fraud_score DESC LIMIT 50
    ');
    respond(true, 'Fraud alerts', ['users' => $stmt->fetchAll()]);
}

// POST actions
if ($method === 'POST') {
    $body = getBody();
    $targetId = (int)($body['user_id'] ?? 0);

    if ($action === 'approve') {
        $pdo->prepare('UPDATE users SET account_status="verified" WHERE user_id=?')->execute([$targetId]);
        $pdo->prepare('UPDATE user_verification SET reviewed_at=NOW() WHERE user_id=?')->execute([$targetId]);
        respond(true, 'User approved!');
    }
    if ($action === 'reject') {
        $reason = clean($body['reason'] ?? 'Document invalid');
        $pdo->prepare('UPDATE users SET account_status="rejected" WHERE user_id=?')->execute([$targetId]);
        $pdo->prepare('UPDATE user_verification SET admin_notes=?, reviewed_at=NOW() WHERE user_id=?')->execute([$reason, $targetId]);
        respond(true, 'User rejected');
    }
    if ($action === 'suspend') {
        $pdo->prepare('UPDATE users SET account_status="suspended" WHERE user_id=?')->execute([$targetId]);
        respond(true, 'User suspended');
    }
    if ($action === 'resolve_report') {
        $reportId = (int)($body['report_id'] ?? 0);
        $pdo->prepare('UPDATE reports SET status="resolved" WHERE report_id=?')->execute([$reportId]);
        respond(true, 'Report resolved');
    }
}

respond(false, 'Invalid action', [], 400);
