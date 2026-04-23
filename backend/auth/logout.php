<?php
// ============================================================
// FRINDER — Logout Endpoint — FIXED
// File: backend/auth/logout.php
//
// Fixes:
// 1. Deletes session using sha256-hashed token (matches verify_otp.php storage)
// 2. Updates user online status and last_seen
// 3. Logs activity
// ============================================================
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed', [], 405);
}

$pdo  = getDB();
$user = requireAuth($pdo); // requireAuth now expects $pdo

// Extract raw token from Authorization header
$headers = getallheaders();
$auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';
preg_match('/^Bearer\s+(.+)$/i', $auth, $m);
$rawToken = $m[1] ?? '';

if (!$rawToken) {
    respond(false, 'Missing token', [], 401);
}

// Hash token before deleting (matches storage format)
$hashed = hash('sha256', $rawToken);

// Delete session
$pdo->prepare('DELETE FROM login_sessions WHERE session_token = ?')
    ->execute([$hashed]);

// Update user status
$pdo->prepare('UPDATE users SET is_online = 0, last_seen = NOW() WHERE user_id = ?')
    ->execute([$user['user_id']]);

logActivity($user['user_id'], 'logout', 'User logged out successfully');

respond(true, 'Logged out successfully');
