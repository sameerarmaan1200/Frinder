<?php
// ============================================================
// FRINDER — Messages API with File Upload Support
// File: backend/messages/messages.php
// Supports: text, image, video, docs up to 10MB
// ============================================================
require_once __DIR__ . '/../config/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$user   = requireAuth();
$pdo    = getDB();
$userId = (int)$user['user_id'];
$action = $_GET['action'] ?? '';

// ── Allowed file types ────────────────────────────────────────
$allowedTypes = [
    // Images
    'image/jpeg'      => ['ext' => 'jpg',  'type' => 'image'],
    'image/png'       => ['ext' => 'png',  'type' => 'image'],
    'image/gif'       => ['ext' => 'gif',  'type' => 'image'],
    'image/webp'      => ['ext' => 'webp', 'type' => 'image'],
    // Videos
    'video/mp4'       => ['ext' => 'mp4',  'type' => 'video'],
    'video/webm'      => ['ext' => 'webm', 'type' => 'video'],
    'video/quicktime' => ['ext' => 'mov',  'type' => 'video'],
    'video/x-msvideo' => ['ext' => 'avi',  'type' => 'video'],
    // Documents
    'application/pdf'                                                          => ['ext' => 'pdf',  'type' => 'doc'],
    'application/msword'                                                       => ['ext' => 'doc',  'type' => 'doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'  => ['ext' => 'docx', 'type' => 'doc'],
    'application/vnd.ms-excel'                                                 => ['ext' => 'xls',  'type' => 'doc'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'        => ['ext' => 'xlsx', 'type' => 'doc'],
    'application/vnd.ms-powerpoint'                                            => ['ext' => 'ppt',  'type' => 'doc'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'=> ['ext' => 'pptx', 'type' => 'doc'],
    'text/plain'                                                               => ['ext' => 'txt',  'type' => 'doc'],
    'application/zip'                                                          => ['ext' => 'zip',  'type' => 'doc'],
];

$maxFileSize = 10 * 1024 * 1024; // 10MB

// ── GET: Conversations list ───────────────────────────────────
if ($method === 'GET' && $action === 'conversations') {
    $stmt = $pdo->prepare('
        SELECT
            u.user_id, u.full_name, u.username, u.profile_picture, u.is_online, u.last_seen,
            c.country_name, c.flag_emoji,
            m.content AS last_message,
            m.message_type AS last_message_type,
            m.file_name AS last_file_name,
            m.sent_at AS last_message_at,
            m.sender_id AS last_sender_id,
            (SELECT COUNT(*) FROM messages
             WHERE sender_id = u.user_id AND receiver_id = ? AND is_read = 0) AS unread_count
        FROM (
            SELECT
                CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_user_id,
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

// ── GET: Chat history ─────────────────────────────────────────
if ($method === 'GET' && $action === 'chat') {
    $otherId = (int)($_GET['user_id'] ?? 0);
    if (!$otherId) respond(false, 'User ID required', [], 422);

    $page   = max(1, (int)($_GET['page'] ?? 1));
    $limit  = 50;
    $offset = ($page - 1) * $limit;

    $stmt = $pdo->prepare('
        SELECT m.message_id, m.sender_id, m.receiver_id,
               m.content, m.message_type, m.file_path, m.file_name, m.file_size, m.file_mime,
               m.sent_at, m.is_read, m.read_at,
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

// ── POST: Send text message ───────────────────────────────────
if ($method === 'POST' && $action === 'send') {
    $body       = getBody();
    $receiverId = (int)($body['receiver_id'] ?? 0);
    $content    = trim($body['content'] ?? '');
    $type       = $body['type'] ?? 'text';

    if (!$receiverId) respond(false, 'Receiver required', [], 422);
    if (!$content)    respond(false, 'Message content required', [], 422);
    if (strlen($content) > 2000) respond(false, 'Message too long (max 2000 chars)', [], 422);

    $stmt = $pdo->prepare('INSERT INTO messages (sender_id, receiver_id, content, message_type) VALUES (?,?,?,?)');
    $stmt->execute([$userId, $receiverId, $content, $type]);
    $msgId = $pdo->lastInsertId();

    $stmt = $pdo->prepare('SELECT * FROM messages WHERE message_id = ?');
    $stmt->execute([$msgId]);
    respond(true, 'Message sent', ['message' => $stmt->fetch()]);
}

// ── POST: Upload file message ─────────────────────────────────
if ($method === 'POST' && $action === 'upload') {
    $receiverId = (int)($_POST['receiver_id'] ?? 0);
    $caption    = trim($_POST['caption'] ?? '');

    if (!$receiverId) respond(false, 'Receiver required', [], 422);
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        respond(false, 'No file uploaded or upload error', [], 422);
    }

    $file = $_FILES['file'];

    // Size check — 10MB max
    if ($file['size'] > $maxFileSize) {
        respond(false, 'File too large. Maximum size is 10MB.', [], 422);
    }

    // MIME type check
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime  = $finfo->file($file['tmp_name']);

    if (!isset($allowedTypes[$mime])) {
        respond(false, 'File type not allowed. Supported: images, videos (MP4/MOV/AVI), documents (PDF/Word/Excel/PowerPoint/ZIP)', [], 422);
    }

    $fileInfo   = $allowedTypes[$mime];
    $msgType    = $fileInfo['type'];
    $ext        = $fileInfo['ext'];
    $origName   = basename($file['name']);
    $safeOrig   = preg_replace('/[^a-zA-Z0-9._-]/', '_', $origName);
    $filename   = $userId . '_' . $receiverId . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;

    // Create upload directory
    $uploadDir = __DIR__ . '/../../uploads/messages/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Move file
    if (!move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
        respond(false, 'Failed to save file. Check uploads/messages/ folder exists.', [], 500);
    }

    // Message content: caption or original filename
    $content = $caption ?: $safeOrig;

    // Save to database
    $stmt = $pdo->prepare('
        INSERT INTO messages (sender_id, receiver_id, content, message_type, file_path, file_name, file_size, file_mime)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $userId, $receiverId, $content, $msgType,
        'messages/' . $filename,
        $safeOrig,
        (int)$file['size'],
        $mime
    ]);
    $msgId = $pdo->lastInsertId();

    $stmt = $pdo->prepare('SELECT * FROM messages WHERE message_id = ?');
    $stmt->execute([$msgId]);
    $msg = $stmt->fetch();

    respond(true, 'File sent!', ['message' => $msg]);
}

respond(false, 'Invalid action', [], 400);
