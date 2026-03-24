<?php
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(false, 'Method not allowed', [], 405);

$user = requireAuth();
$pdo = getDB();

$headers = getallheaders();
$auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
preg_match('/^Bearer\s+(.+)$/i', $auth, $m);
$token = $m[1] ?? '';

$pdo->prepare('DELETE FROM login_sessions WHERE session_token = ?')->execute([$token]);
$pdo->prepare('UPDATE users SET is_online = 0, last_seen = NOW() WHERE user_id = ?')->execute([$user['user_id']]);

logActivity($user['user_id'], 'logout');
respond(true, 'Logged out successfully');
