<?php
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') respond(false, 'Method not allowed', [], 405);

$authUser = requireAuth();
$pdo = getDB();

$userId     = $authUser['user_id'];
$page       = max(1, (int)($_GET['page'] ?? 1));
$limit      = 20;
$offset     = ($page - 1) * $limit;
$search     = trim($_GET['search'] ?? '');
$country    = (int)($_GET['country_id'] ?? 0);
$interest   = (int)($_GET['interest_id'] ?? 0);
$language   = (int)($_GET['language_id'] ?? 0);
$minAge     = (int)($_GET['min_age'] ?? 0);
$maxAge     = (int)($_GET['max_age'] ?? 0);
$continent  = trim($_GET['continent'] ?? '');

// Get viewer's profile for compatibility
$stmt = $pdo->prepare('SELECT country_id, city, date_of_birth FROM users WHERE user_id = ?');
$stmt->execute([$userId]);
$me = $stmt->fetch();

$myInterests = $pdo->prepare('SELECT interest_id FROM user_interests WHERE user_id = ?');
$myInterests->execute([$userId]);
$myInterestIds = array_column($myInterests->fetchAll(), 'interest_id') ?: [0];
$interestPlaceholders = implode(',', array_fill(0, count($myInterestIds), '?'));

$myAge = $me ? (int)(new DateTime($me['date_of_birth']))->diff(new DateTime())->y : 0;

$where = ['u.user_id != ?', 'u.account_status = "verified"'];
$params = [$userId];

// Exclude already friends
$where[] = 'u.user_id NOT IN (
    SELECT user_id_2 FROM friends WHERE user_id_1 = ?
    UNION SELECT user_id_1 FROM friends WHERE user_id_2 = ?
)';
$params[] = $userId; $params[] = $userId;

// Exclude blocked
$where[] = 'u.user_id NOT IN (SELECT blocked_id FROM blocked_users WHERE blocker_id = ?)';
$params[] = $userId;

if ($search) {
    $where[] = '(u.full_name LIKE ? OR u.username LIKE ? OR u.bio LIKE ? OR c.country_name LIKE ?)';
    $s = "%{$search}%";
    $params[] = $s; $params[] = $s; $params[] = $s; $params[] = $s;
}
if ($country) { $where[] = 'u.country_id = ?'; $params[] = $country; }
if ($continent) { $where[] = 'c.continent = ?'; $params[] = $continent; }
if ($minAge) {
    $where[] = 'TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) >= ?';
    $params[] = $minAge;
}
if ($maxAge) {
    $where[] = 'TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) <= ?';
    $params[] = $maxAge;
}
if ($language) {
    $where[] = 'u.user_id IN (SELECT user_id FROM user_languages WHERE language_id = ?)';
    $params[] = $language;
}
if ($interest) {
    $where[] = 'u.user_id IN (SELECT user_id FROM user_interests WHERE interest_id = ?)';
    $params[] = $interest;
}

$whereStr = implode(' AND ', $where);

// Compatibility score params
$interestParams = array_merge($myInterestIds, [$me['country_id'] ?? 0, $me['city'] ?? '', $myAge]);

$sql = "
    SELECT 
        u.user_id, u.username, u.full_name, u.bio, u.profile_picture,
        u.city, u.is_online, u.last_seen, u.date_of_birth,
        c.country_name, c.flag_emoji, c.continent,
        TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) AS age,
        (
            LEAST(COALESCE((SELECT COUNT(*) FROM user_interests ui2 WHERE ui2.user_id = u.user_id AND ui2.interest_id IN ({$interestPlaceholders})), 0) * 12, 60)
            + IF(u.country_id = ?, 30, 0)
            + IF(LOWER(u.city) = LOWER(?), 15, 0)
            + IF(ABS(TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) - ?) <= 5, 10, 0)
        ) AS compatibility_score,
        (SELECT GROUP_CONCAT(i.interest_name ORDER BY i.interest_name SEPARATOR ',') 
         FROM user_interests ui3 JOIN interests i ON i.interest_id = ui3.interest_id
         WHERE ui3.user_id = u.user_id LIMIT 4) AS interests_preview,
        (SELECT status FROM friend_requests WHERE 
         (sender_id = {$userId} AND receiver_id = u.user_id) OR
         (sender_id = u.user_id AND receiver_id = {$userId})
         ORDER BY sent_at DESC LIMIT 1) AS request_status,
        (SELECT sender_id FROM friend_requests WHERE 
         (sender_id = {$userId} AND receiver_id = u.user_id) OR
         (sender_id = u.user_id AND receiver_id = {$userId})
         ORDER BY sent_at DESC LIMIT 1) AS request_sender_id
    FROM users u
    LEFT JOIN countries c ON c.country_id = u.country_id
    WHERE {$whereStr}
    ORDER BY compatibility_score DESC, u.is_online DESC
    LIMIT ? OFFSET ?
";

$finalParams = array_merge($interestParams, $params, [$limit, $offset]);
$stmt = $pdo->prepare($sql);
$stmt->execute($finalParams);
$users = $stmt->fetchAll();

// Total count
$countSql = "SELECT COUNT(*) FROM users u LEFT JOIN countries c ON c.country_id = u.country_id WHERE {$whereStr}";
$countStmt = $pdo->prepare($countSql);
$countStmt->execute($params);
$total = (int)$countStmt->fetchColumn();

respond(true, 'Users loaded', [
    'users' => $users,
    'total' => $total,
    'page'  => $page,
    'pages' => ceil($total / $limit),
]);
