<?php
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(false, 'Method not allowed', [], 405);

$user = requireAuth();
$pdo  = getDB();

// Handle multipart (file upload) or JSON
$isMultipart = strpos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart') !== false;
$body        = $isMultipart ? $_POST : getBody();
$userId      = $user['user_id'];

$updates = [];
$params  = [];

// ── Text fields ───────────────────────────────────────────────
foreach (['bio','city','education','profession'] as $f) {
    if (array_key_exists($f, $body)) {
        $updates[] = "{$f} = ?";
        $params[]  = $body[$f] ? clean($body[$f]) : null;
    }
}

// ── Helper: delete old profile picture from disk ──────────────
function deleteOldAvatar(int $userId, PDO $pdo): void {
    $stmt = $pdo->prepare('SELECT profile_picture FROM users WHERE user_id = ?');
    $stmt->execute([$userId]);
    $old = $stmt->fetchColumn();
    if ($old) {
        $oldPath = __DIR__ . '/../../uploads/posts/' . $old;
        if (file_exists($oldPath)) {
            unlink($oldPath);
        }
    }
}

// ── File upload (multipart form) ──────────────────────────────
if ($isMultipart && isset($_FILES['profile_picture'])) {
    $file         = $_FILES['profile_picture'];
    $allowedMimes = ['image/jpeg','image/png','image/webp','image/gif'];
    $finfo        = new finfo(FILEINFO_MIME_TYPE);
    $mime         = $finfo->file($file['tmp_name']);

    if (!in_array($mime, $allowedMimes)) respond(false, 'Invalid image type', [], 422);
    if ($file['size'] > 5 * 1024 * 1024) respond(false, 'Image too large (max 5MB)', [], 422);

    deleteOldAvatar($userId, $pdo);

    $ext       = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename  = 'avatar_' . $userId . '_' . time() . '.' . $ext;
    $uploadDir = __DIR__ . '/../../uploads/posts/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
    move_uploaded_file($file['tmp_name'], $uploadDir . $filename);

    $updates[] = 'profile_picture = ?';
    $params[]  = $filename;
}

// ── Base64 upload (from React frontend) ──────────────────────
if (!empty($body['profile_picture_base64'])) {
    $imgData = base64_decode(
        preg_replace('#^data:image/\w+;base64,#i', '', $body['profile_picture_base64'])
    );

    if (!$imgData || strlen($imgData) < 100) respond(false, 'Invalid image data', [], 422);
    if (strlen($imgData) > 5 * 1024 * 1024) respond(false, 'Image too large (max 5MB)', [], 422);

    deleteOldAvatar($userId, $pdo);

    $filename  = 'avatar_' . $userId . '_' . time() . '.jpg';
    $uploadDir = __DIR__ . '/../../uploads/posts/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
    file_put_contents($uploadDir . $filename, $imgData);

    $updates[] = 'profile_picture = ?';
    $params[]  = $filename;
}

// ── Apply all updates to database ────────────────────────────
if (!empty($updates)) {
    $params[] = $userId;
    $pdo->prepare(
        'UPDATE users SET ' . implode(', ', $updates) . ' WHERE user_id = ?'
    )->execute($params);
}

// ── Update interests ──────────────────────────────────────────
if (!empty($body['interests'])) {
    $interests = is_string($body['interests'])
        ? json_decode($body['interests'], true)
        : $body['interests'];

    if (is_array($interests)) {
        $pdo->prepare('DELETE FROM user_interests WHERE user_id = ?')->execute([$userId]);
        $stmt = $pdo->prepare(
            'INSERT IGNORE INTO user_interests (user_id, interest_id) VALUES (?, ?)'
        );
        foreach ($interests as $iid) {
            $stmt->execute([$userId, (int)$iid]);
        }
    }
}

// ── Update languages ──────────────────────────────────────────
if (!empty($body['languages'])) {
    $languages = is_string($body['languages'])
        ? json_decode($body['languages'], true)
        : $body['languages'];

    if (is_array($languages)) {
        $pdo->prepare('DELETE FROM user_languages WHERE user_id = ?')->execute([$userId]);
        $stmt = $pdo->prepare(
            'INSERT IGNORE INTO user_languages (user_id, language_id, proficiency, is_native)
             VALUES (?, ?, ?, ?)'
        );
        foreach ($languages as $lang) {
            $stmt->execute([
                $userId,
                (int)$lang['language_id'],
                $lang['proficiency'],
                $lang['proficiency'] === 'Native' ? 1 : 0,
            ]);
        }
    }
}

logActivity($userId, 'profile_update');
respond(true, 'Profile updated successfully!');