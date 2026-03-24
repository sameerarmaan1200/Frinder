<?php
require_once __DIR__ . '/../config/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$pdo = getDB();
$userId = $user['user_id'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    // Feed: posts from friends + own + public
    if ($action === 'feed') {
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = 10;
        $offset = ($page - 1) * $limit;

        $stmt = $pdo->prepare('
            SELECT p.post_id, p.content, p.image_path, p.visibility, p.like_count, p.created_at,
                u.user_id, u.full_name, u.username, u.profile_picture, u.account_status,
                c.country_name, c.flag_emoji,
                (SELECT COUNT(*) FROM post_comments WHERE post_id = p.post_id) AS comment_count,
                (SELECT COUNT(*) FROM post_likes WHERE post_id = p.post_id AND user_id = ?) AS user_liked
            FROM posts p
            JOIN users u ON u.user_id = p.user_id
            LEFT JOIN countries c ON c.country_id = u.country_id
            WHERE (
                p.user_id = ? OR
                p.visibility = "public" OR
                p.user_id IN (SELECT CASE WHEN user_id_1=? THEN user_id_2 ELSE user_id_1 END FROM friends WHERE user_id_1=? OR user_id_2=?)
            )
            AND u.account_status = "verified"
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        ');
        $stmt->execute([$userId, $userId, $userId, $userId, $userId, $limit, $offset]);
        $posts = $stmt->fetchAll();

        respond(true, 'Feed loaded', ['posts' => $posts, 'page' => $page]);
    }

    // Comments for a post
    if ($action === 'comments') {
        $postId = (int)($_GET['post_id'] ?? 0);
        if (!$postId) respond(false, 'Post ID required', [], 422);
        $stmt = $pdo->prepare('
            SELECT pc.comment_id, pc.comment_text, pc.created_at,
                u.user_id, u.full_name, u.username, u.profile_picture
            FROM post_comments pc JOIN users u ON u.user_id = pc.user_id
            WHERE pc.post_id = ? ORDER BY pc.created_at ASC
        ');
        $stmt->execute([$postId]);
        respond(true, 'Comments', ['comments' => $stmt->fetchAll()]);
    }

    respond(false, 'Invalid action', [], 400);
}

if ($method === 'POST') {
    if ($action === 'create') {
        $isMultipart = strpos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart') !== false;
        $body = $isMultipart ? $_POST : getBody();
        
        $content    = !empty($body['content']) ? clean($body['content']) : null;
        $visibility = in_array($body['visibility'] ?? 'friends', ['friends','public']) ? $body['visibility'] : 'friends';
        $imagePath  = null;

        if (!$content && !isset($_FILES['image'])) {
            respond(false, 'Post must have text or image', [], 422);
        }

        // Handle image upload
        if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
            $file = $_FILES['image'];
            if ($file['size'] > 5 * 1024 * 1024) respond(false, 'Image too large (max 5MB)', [], 422);
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime = $finfo->file($file['tmp_name']);
            if (!in_array($mime, ['image/jpeg','image/png','image/webp','image/gif'])) {
                respond(false, 'Invalid image type', [], 422);
            }
            $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'post_' . $userId . '_' . time() . '.' . $ext;
            $uploadDir = __DIR__ . '/../../uploads/posts/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
            move_uploaded_file($file['tmp_name'], $uploadDir . $filename);
            $imagePath = $filename;
        }

        // Handle base64 image
        if (!empty($body['image_base64'])) {
            $imgData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $body['image_base64']));
            $filename = 'post_' . $userId . '_' . time() . '.jpg';
            $uploadDir = __DIR__ . '/../../uploads/posts/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
            file_put_contents($uploadDir . $filename, $imgData);
            $imagePath = $filename;
        }

        $stmt = $pdo->prepare('INSERT INTO posts (user_id, content, image_path, visibility) VALUES (?,?,?,?)');
        $stmt->execute([$userId, $content, $imagePath, $visibility]);
        $postId = $pdo->lastInsertId();

        // Badge check
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM posts WHERE user_id = ?');
        $stmt->execute([$userId]);
        if ($stmt->fetchColumn() == 1) {
            $pdo->prepare('INSERT IGNORE INTO user_badges (user_id, badge_type, badge_label) VALUES (?,?,?)')->execute([$userId, 'first_post', 'First Post!']);
        }

        // Return full post
        $stmt = $pdo->prepare('
            SELECT p.*, u.full_name, u.username, u.profile_picture, c.country_name, c.flag_emoji,
                0 AS comment_count, 0 AS user_liked
            FROM posts p JOIN users u ON u.user_id=p.user_id
            LEFT JOIN countries c ON c.country_id=u.country_id WHERE p.post_id=?
        ');
        $stmt->execute([$postId]);
        respond(true, 'Post created!', ['post' => $stmt->fetch()]);
    }

    if ($action === 'like') {
        $body = getBody();
        $postId = (int)($body['post_id'] ?? 0);
        if (!$postId) respond(false, 'Post ID required', [], 422);

        // Toggle like
        $stmt = $pdo->prepare('SELECT like_id FROM post_likes WHERE post_id=? AND user_id=?');
        $stmt->execute([$postId, $userId]);
        $existing = $stmt->fetch();

        if ($existing) {
            $pdo->prepare('DELETE FROM post_likes WHERE post_id=? AND user_id=?')->execute([$postId, $userId]);
            $pdo->prepare('UPDATE posts SET like_count = GREATEST(like_count-1, 0) WHERE post_id=?')->execute([$postId]);
            $liked = false;
        } else {
            $pdo->prepare('INSERT IGNORE INTO post_likes (post_id, user_id) VALUES (?,?)')->execute([$postId, $userId]);
            $pdo->prepare('UPDATE posts SET like_count = like_count+1 WHERE post_id=?')->execute([$postId]);
            $liked = true;
        }

        $stmt = $pdo->prepare('SELECT like_count FROM posts WHERE post_id=?');
        $stmt->execute([$postId]);
        $count = $stmt->fetchColumn();
        respond(true, $liked ? 'Liked!' : 'Unliked', ['liked' => $liked, 'like_count' => (int)$count]);
    }

    if ($action === 'comment') {
        $body = getBody();
        $postId = (int)($body['post_id'] ?? 0);
        $text   = trim($body['comment_text'] ?? '');
        if (!$postId || !$text) respond(false, 'Post ID and comment required', [], 422);
        if (strlen($text) > 500) respond(false, 'Comment too long', [], 422);

        $pdo->prepare('INSERT INTO post_comments (post_id, user_id, comment_text) VALUES (?,?,?)')->execute([$postId, $userId, $text]);
        $cid = $pdo->lastInsertId();

        $stmt = $pdo->prepare('
            SELECT pc.*, u.full_name, u.username, u.profile_picture
            FROM post_comments pc JOIN users u ON u.user_id=pc.user_id WHERE pc.comment_id=?
        ');
        $stmt->execute([$cid]);
        respond(true, 'Comment added!', ['comment' => $stmt->fetch()]);
    }

    respond(false, 'Invalid action', [], 400);
}

if ($method === 'DELETE') {
    $postId = (int)($_GET['post_id'] ?? 0);
    if (!$postId) respond(false, 'Post ID required', [], 422);

    $stmt = $pdo->prepare('SELECT user_id FROM posts WHERE post_id = ?');
    $stmt->execute([$postId]);
    $post = $stmt->fetch();
    if (!$post || $post['user_id'] != $userId) respond(false, 'Not authorized', [], 403);

    $pdo->prepare('DELETE FROM posts WHERE post_id = ?')->execute([$postId]);
    respond(true, 'Post deleted');
}
