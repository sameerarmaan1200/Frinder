<?php
require_once __DIR__ . '/../config/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$pdo = getDB();
$userId = $user['user_id'];
$action = $_GET['action'] ?? '';

// GET: list requests or friends
if ($method === 'GET') {
    if ($action === 'received') {
        $stmt = $pdo->prepare('
            SELECT fr.request_id, fr.message, fr.sent_at, fr.status,
                u.user_id, u.full_name, u.username, u.profile_picture, u.is_online,
                c.country_name, c.flag_emoji,
                (SELECT COUNT(*) FROM friends WHERE (user_id_1=u.user_id OR user_id_2=u.user_id)) AS friend_count
            FROM friend_requests fr
            JOIN users u ON u.user_id = fr.sender_id
            LEFT JOIN countries c ON c.country_id = u.country_id
            WHERE fr.receiver_id = ? AND fr.status = "pending"
            ORDER BY fr.sent_at DESC
        ');
        $stmt->execute([$userId]);
        respond(true, 'Received requests', ['requests' => $stmt->fetchAll()]);
    }

    if ($action === 'sent') {
        $stmt = $pdo->prepare('
            SELECT fr.request_id, fr.message, fr.sent_at, fr.status,
                u.user_id, u.full_name, u.username, u.profile_picture, u.is_online,
                c.country_name, c.flag_emoji
            FROM friend_requests fr
            JOIN users u ON u.user_id = fr.receiver_id
            LEFT JOIN countries c ON c.country_id = u.country_id
            WHERE fr.sender_id = ? AND fr.status = "pending"
            ORDER BY fr.sent_at DESC
        ');
        $stmt->execute([$userId]);
        respond(true, 'Sent requests', ['requests' => $stmt->fetchAll()]);
    }

    if ($action === 'friends') {
        $stmt = $pdo->prepare('
            SELECT u.user_id, u.full_name, u.username, u.profile_picture, u.is_online, u.last_seen, u.city,
                c.country_name, c.flag_emoji, f.created_at AS friends_since
            FROM friends f
            JOIN users u ON u.user_id = CASE WHEN f.user_id_1 = ? THEN f.user_id_2 ELSE f.user_id_1 END
            LEFT JOIN countries c ON c.country_id = u.country_id
            WHERE (f.user_id_1 = ? OR f.user_id_2 = ?) AND f.status = "active"
            ORDER BY u.is_online DESC, u.last_seen DESC
        ');
        $stmt->execute([$userId, $userId, $userId]);
        respond(true, 'Friends list', ['friends' => $stmt->fetchAll()]);
    }

    respond(false, 'Invalid action', [], 400);
}

// POST: send, accept, decline, cancel
if ($method === 'POST') {
    $body = getBody();
    $targetId = (int)($body['user_id'] ?? 0);
    $requestId = (int)($body['request_id'] ?? 0);

    if ($action === 'send') {
        if (!$targetId || $targetId === $userId) respond(false, 'Invalid user', [], 422);
        $message = !empty($body['message']) ? clean($body['message']) : null;

        // Check if already friends
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM friends WHERE (user_id_1=? AND user_id_2=?) OR (user_id_1=? AND user_id_2=?)');
        $stmt->execute([$userId, $targetId, $targetId, $userId]);
        if ($stmt->fetchColumn() > 0) respond(false, 'Already friends!', [], 409);

        // Check existing request
        $stmt = $pdo->prepare('SELECT request_id, status FROM friend_requests WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)');
        $stmt->execute([$userId, $targetId, $targetId, $userId]);
        $existing = $stmt->fetch();
        if ($existing && $existing['status'] === 'pending') respond(false, 'Request already pending', [], 409);

        // Delete old declined/cancelled
        $pdo->prepare('DELETE FROM friend_requests WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)')->execute([$userId, $targetId, $targetId, $userId]);

        $pdo->prepare('INSERT INTO friend_requests (sender_id, receiver_id, message) VALUES (?, ?, ?)')->execute([$userId, $targetId, $message]);
        logActivity($userId, 'friend_request_sent', "To user {$targetId}");
        respond(true, 'Friend request sent!');
    }

    if ($action === 'accept') {
        if (!$requestId) respond(false, 'Request ID required', [], 422);
        $stmt = $pdo->prepare('SELECT * FROM friend_requests WHERE request_id = ? AND receiver_id = ? AND status = "pending"');
        $stmt->execute([$requestId, $userId]);
        $req = $stmt->fetch();
        if (!$req) respond(false, 'Request not found', [], 404);

        $pdo->beginTransaction();
        $pdo->prepare('UPDATE friend_requests SET status="accepted", responded_at=NOW() WHERE request_id=?')->execute([$requestId]);
        $pdo->prepare('INSERT IGNORE INTO friends (user_id_1, user_id_2) VALUES (?,?)')->execute([min($userId, $req['sender_id']), max($userId, $req['sender_id'])]);
        $pdo->commit();

        // Award badge
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM friends WHERE user_id_1=? OR user_id_2=?');
        $stmt->execute([$userId, $userId]);
        if ($stmt->fetchColumn() == 1) {
            $pdo->prepare('INSERT IGNORE INTO user_badges (user_id, badge_type, badge_label) VALUES (?,?,?)')->execute([$userId, 'first_friend', 'First Friend!']);
        }

        logActivity($userId, 'friend_request_accepted', "Request {$requestId}");
        respond(true, 'Friend request accepted! 🎉');
    }

    if ($action === 'decline') {
        $pdo->prepare('UPDATE friend_requests SET status="declined", responded_at=NOW() WHERE request_id=? AND receiver_id=?')->execute([$requestId, $userId]);
        respond(true, 'Request declined');
    }

    if ($action === 'cancel') {
        $pdo->prepare('UPDATE friend_requests SET status="cancelled" WHERE request_id=? AND sender_id=?')->execute([$requestId, $userId]);
        respond(true, 'Request cancelled');
    }

    if ($action === 'unfriend') {
        if (!$targetId) respond(false, 'User ID required', [], 422);
        $pdo->prepare('DELETE FROM friends WHERE (user_id_1=? AND user_id_2=?) OR (user_id_1=? AND user_id_2=?)')->execute([$userId, $targetId, $targetId, $userId]);
        respond(true, 'Unfriended');
    }

    respond(false, 'Invalid action', [], 400);
}
