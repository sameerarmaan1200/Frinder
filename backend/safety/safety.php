<?php
require_once __DIR__ . '/../config/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$pdo = getDB();
$userId = $user['user_id'];
$action = $_GET['action'] ?? '';

if ($method === 'POST') {
    $body = getBody();

    if ($action === 'report') {
        $reportedId  = (int)($body['user_id'] ?? 0);
        $reason      = $body['reason'] ?? '';
        $description = !empty($body['description']) ? clean($body['description']) : null;

        if (!$reportedId || $reportedId === $userId) respond(false, 'Invalid user', [], 422);
        if (!in_array($reason, ['spam','fake_account','harassment','inappropriate_content','impersonation','other'])) {
            respond(false, 'Invalid reason', [], 422);
        }

        $pdo->prepare('INSERT INTO reports (reporter_id, reported_user_id, reason, description) VALUES (?,?,?,?)')->execute([$userId, $reportedId, $reason, $description]);

        // Increment fraud score
        $pdo->prepare('UPDATE user_verification SET fraud_score = fraud_score + 1 WHERE user_id = ?')->execute([$reportedId]);

        // Auto-flag if >= 5 reports
        $stmt = $pdo->prepare('SELECT fraud_score FROM user_verification WHERE user_id = ?');
        $stmt->execute([$reportedId]);
        $v = $stmt->fetch();
        if ($v && $v['fraud_score'] >= 5) {
            $pdo->prepare('UPDATE users SET account_status = "suspended" WHERE user_id = ? AND account_status = "verified"')->execute([$reportedId]);
        }

        logActivity($userId, 'report', "Reported user {$reportedId} for {$reason}");
        respond(true, 'Report submitted. Our team will review it.');
    }

    if ($action === 'block') {
        $blockedId = (int)($body['user_id'] ?? 0);
        if (!$blockedId || $blockedId === $userId) respond(false, 'Invalid user', [], 422);

        $pdo->prepare('INSERT IGNORE INTO blocked_users (blocker_id, blocked_id) VALUES (?,?)')->execute([$userId, $blockedId]);
        // Remove friendship if exists
        $pdo->prepare('DELETE FROM friends WHERE (user_id_1=? AND user_id_2=?) OR (user_id_1=? AND user_id_2=?)')->execute([$userId, $blockedId, $blockedId, $userId]);
        respond(true, 'User blocked');
    }

    if ($action === 'unblock') {
        $blockedId = (int)($body['user_id'] ?? 0);
        $pdo->prepare('DELETE FROM blocked_users WHERE blocker_id=? AND blocked_id=?')->execute([$userId, $blockedId]);
        respond(true, 'User unblocked');
    }

    respond(false, 'Invalid action', [], 400);
}
