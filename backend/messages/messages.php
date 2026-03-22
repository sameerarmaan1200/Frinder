<?php
require_once __DIR__ . '/../config/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$pdo = getDB();
$userId = $user['user_id'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    // Get conversations list
    if ($action === 'conversations') {
        $stmt = $pdo->prepare('
            SELECT 
                u.user_id, u.full_name, u.username, u.profile_picture, u.is_online, u.last_seen,
                c.country_name, c.flag_emoji,
                m.content AS last_message, m.sent_at AS last_message_at, m.sender_id AS last_sender_id,
                (SELECT COUNT(*) FROM messages WHERE sender_id = u.user_id AND receiver_id = ? AND is_read = 0) AS unread_count
            FROM (
                SELECT CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_user_id,
                    MAX(message_id) AS latest_msg_id
                FROM messages WHERE sender_id = ? OR receiver_id = ?
                GROUP BY other_user_id
            ) conv
            JOIN users u ON u.user_id = conv.other_user_id
            LEFT JOIN countries c ON c.country_id = u.country_id
            JOIN messages m ON m.message_id = conv.latest_msg_id
            ORDER BY m.sent_at DESC
        ');
        $stmt->execute([$userId, $userId, $userId, $userId]);
        respond(true, 'Conversations', ['conversations' => $stmt->fetchAll()]);
    }

    // Get messages between two users
    if ($action === 'chat') {
        $otherId = (int)($_GET['user_id'] ?? 0);
        if (!$otherId) respond(false, 'User ID required', [], 422);

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = 50;
        $offset = ($page - 1) * $limit;

        $stmt = $pdo->prepare('
            SELECT m.message_id, m.sender_id, m.receiver_id, m.content, m.message_type, m.sent_at, m.is_read, m.read_at,
                u.full_name, u.profile_picture
            FROM messages m
            JOIN users u ON u.user_id = m.sender_id
            WHERE (m.sender_id=? AND m.receiver_id=?) OR (m.sender_id=? AND m.receiver_id=?)
            ORDER BY m.sent_at DESC LIMIT ? OFFSET ?
        ');
        $stmt->execute([$userId, $otherId, $otherId, $userId, $limit, $offset]);
        $messages = array_reverse($stmt->fetchAll());

        // Mark as read
        $pdo->prepare('UPDATE messages SET is_read=1, read_at=NOW() WHERE sender_id=? AND receiver_id=? AND is_read=0')
            ->execute([$otherId, $userId]);

        // Get other user info
        $stmt = $pdo->prepare('
            SELECT u.user_id, u.full_name, u.username, u.profile_picture, u.is_online, u.last_seen,
                c.country_name, c.flag_emoji
            FROM users u LEFT JOIN countries c ON c.country_id = u.country_id
            WHERE u.user_id = ?
        ');
        $stmt->execute([$otherId]);
        $otherUser = $stmt->fetch();

        respond(true, 'Messages', ['messages' => $messages, 'other_user' => $otherUser]);
    }

    respond(false, 'Invalid action', [], 400);
}

if ($method === 'POST') {
    if ($action === 'send') {
        $body = getBody();
        $receiverId = (int)($body['receiver_id'] ?? 0);
        $content    = trim($body['content'] ?? '');
        $type       = $body['type'] ?? 'text';

        if (!$receiverId || !$content) respond(false, 'Receiver and content required', [], 422);
        if (strlen($content) > 2000) respond(false, 'Message too long', [], 422);

        $stmt = $pdo->prepare('INSERT INTO messages (sender_id, receiver_id, content, message_type) VALUES (?,?,?,?)');
        $stmt->execute([$userId, $receiverId, $content, $type]);
        $msgId = $pdo->lastInsertId();

        $stmt = $pdo->prepare('SELECT * FROM messages WHERE message_id = ?');
        $stmt->execute([$msgId]);
        $msg = $stmt->fetch();

        respond(true, 'Message sent', ['message' => $msg]);
    }

    respond(false, 'Invalid action', [], 400);
}
