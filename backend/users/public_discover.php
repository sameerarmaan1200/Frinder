<?php
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') respond(false, 'Method not allowed', [], 405);

$pdo    = getDB();
$page   = max(1, (int)($_GET['page'] ?? 1));
$limit  = 20;
$offset = ($page - 1) * $limit;
$search    = trim($_GET['search'] ?? '');
$country   = (int)($_GET['country_id'] ?? 0);
$interest  = (int)($_GET['interest_id'] ?? 0);
$language  = (int)($_GET['language_id'] ?? 0);
$minAge    = (int)($_GET['min_age'] ?? 0);
$maxAge    = (int)($_GET['max_age'] ?? 0);
$continent = trim($_GET['continent'] ?? '');

$where  = ['u.account_status = "verified"'];
$params = [];

if ($search)   { $where[]='(u.full_name LIKE ? OR u.username LIKE ? OR u.bio LIKE ? OR c.country_name LIKE ?)'; $s="%$search%"; $params[]=$s;$params[]=$s;$params[]=$s;$params[]=$s; }
if ($country)  { $where[]='u.country_id = ?'; $params[]=$country; }
if ($continent){ $where[]='c.continent = ?';  $params[]=$continent; }
if ($minAge)   { $where[]='TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) >= ?'; $params[]=$minAge; }
if ($maxAge)   { $where[]='TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) <= ?'; $params[]=$maxAge; }
if ($language) { $where[]='u.user_id IN (SELECT user_id FROM user_languages WHERE language_id = ?)'; $params[]=$language; }
if ($interest) { $where[]='u.user_id IN (SELECT user_id FROM user_interests WHERE interest_id = ?)'; $params[]=$interest; }

$whereStr = implode(' AND ', $where);

$sql = "
    SELECT u.user_id, u.username, u.full_name, u.bio, u.profile_picture,
        u.city, u.is_online, u.date_of_birth,
        c.country_name, c.flag_emoji, c.continent,
        TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) AS age,
        0 AS compatibility_score,
        (SELECT GROUP_CONCAT(i.interest_name SEPARATOR ',')
         FROM user_interests ui JOIN interests i ON i.interest_id=ui.interest_id
         WHERE ui.user_id=u.user_id LIMIT 4) AS interests_preview
    FROM users u
    LEFT JOIN countries c ON c.country_id=u.country_id
    WHERE $whereStr
    ORDER BY u.is_online DESC, u.created_at DESC
    LIMIT ? OFFSET ?
";
$stmt = $pdo->prepare($sql);
$stmt->execute(array_merge($params, [$limit, $offset]));
$users = $stmt->fetchAll();

$countStmt = $pdo->prepare("SELECT COUNT(*) FROM users u LEFT JOIN countries c ON c.country_id=u.country_id WHERE $whereStr");
$countStmt->execute($params);
$total = (int)$countStmt->fetchColumn();

respond(true, 'Public users', [
    'users' => $users,
    'total' => $total,
    'page'  => $page,
    'pages' => (int)ceil($total / $limit),
]);