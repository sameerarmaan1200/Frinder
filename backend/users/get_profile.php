<?php
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') respond(false, 'Method not allowed', [], 405);

$authUser = requireAuth();
$pdo = getDB();

$targetId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : $authUser['user_id'];

$stmt = $pdo->prepare('
    SELECT 
        u.user_id, u.username, u.full_name, u.bio, u.profile_picture, u.cover_photo,
        u.date_of_birth, u.gender, u.city, u.education, u.profession,
        u.account_status, u.is_online, u.last_seen, u.created_at,
        c.country_name, c.flag_emoji, c.continent,
        (SELECT COUNT(*) FROM friends WHERE (user_id_1=u.user_id OR user_id_2=u.user_id) AND status="active") AS friend_count,
        (SELECT COUNT(*) FROM posts WHERE user_id=u.user_id) AS post_count,
        (SELECT COUNT(DISTINCT CASE WHEN user_id_1=u.user_id THEN u2.country_id ELSE u3.country_id END)
         FROM friends f2
         LEFT JOIN users u2 ON u2.user_id = f2.user_id_2
         LEFT JOIN users u3 ON u3.user_id = f2.user_id_1
         WHERE (f2.user_id_1=u.user_id OR f2.user_id_2=u.user_id)) AS countries_connected
    FROM users u
    LEFT JOIN countries c ON c.country_id = u.country_id
    WHERE u.user_id = ?
');
$stmt->execute([$targetId]);
$user = $stmt->fetch();

if (!$user) respond(false, 'User not found', [], 404);

// Interests
$stmt = $pdo->prepare('
    SELECT i.interest_id, i.interest_name, i.icon, i.category
    FROM user_interests ui JOIN interests i ON i.interest_id = ui.interest_id
    WHERE ui.user_id = ?
');
$stmt->execute([$targetId]);
$interests = $stmt->fetchAll();

// Languages
$stmt = $pdo->prepare('
    SELECT l.language_id, l.language_name, ul.proficiency, ul.is_native
    FROM user_languages ul JOIN languages l ON l.language_id = ul.language_id
    WHERE ul.user_id = ?
');
$stmt->execute([$targetId]);
$languages = $stmt->fetchAll();

// Badges
$stmt = $pdo->prepare('SELECT badge_type, badge_label, earned_at FROM user_badges WHERE user_id = ?');
$stmt->execute([$targetId]);
$badges = $stmt->fetchAll();

// Friendship status with viewing user
$friendStatus = null;
if ($targetId !== $authUser['user_id']) {
    $stmt = $pdo->prepare('
        SELECT status FROM friends
        WHERE (user_id_1=? AND user_id_2=?) OR (user_id_1=? AND user_id_2=?)
    ');
    $stmt->execute([$authUser['user_id'], $targetId, $targetId, $authUser['user_id']]);
    $f = $stmt->fetch();
    if ($f) {
        $friendStatus = $f['status'];
    } else {
        // Check pending request
        $stmt = $pdo->prepare('
            SELECT status, sender_id FROM friend_requests
            WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)
            ORDER BY sent_at DESC LIMIT 1
        ');
        $stmt->execute([$authUser['user_id'], $targetId, $targetId, $authUser['user_id']]);
        $req = $stmt->fetch();
        if ($req) {
            $friendStatus = $req['status'] === 'pending' 
                ? ($req['sender_id'] == $authUser['user_id'] ? 'request_sent' : 'request_received')
                : $req['status'];
        }
    }
}

// Recent posts (for profile page)
$stmt = $pdo->prepare('
    SELECT p.*, u.full_name, u.username, u.profile_picture,
        (SELECT COUNT(*) FROM post_comments WHERE post_id = p.post_id) AS comment_count,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.post_id AND user_id = ?) AS user_liked
    FROM posts p JOIN users u ON u.user_id = p.user_id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC LIMIT 10
');
$stmt->execute([$authUser['user_id'], $targetId]);
$posts = $stmt->fetchAll();

respond(true, 'Profile loaded', [
    'user'          => $user,
    'interests'     => $interests,
    'languages'     => $languages,
    'badges'        => $badges,
    'posts'         => $posts,
    'friend_status' => $friendStatus,
    'is_own'        => $targetId === $authUser['user_id'],
]);
