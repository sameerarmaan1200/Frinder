<?php
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(false, 'Method not allowed', [], 405);

$body = getBody();
$pdo = getDB();

$userId    = (int)($body['user_id'] ?? 0);
$bio       = !empty($body['bio']) ? clean($body['bio']) : null;
$education = !empty($body['education']) ? clean($body['education']) : null;
$profession= !empty($body['profession']) ? clean($body['profession']) : null;
$interests = $body['interests'] ?? [];
$languages = $body['languages'] ?? [];

if (!$userId) respond(false, 'User ID required', [], 422);
if (count($interests) < 3) respond(false, 'Please select at least 3 interests', [], 422);

$pdo->beginTransaction();
try {
    // Update user profile
    $pdo->prepare('UPDATE users SET bio=?, education=?, profession=? WHERE user_id=?')
        ->execute([$bio, $education, $profession, $userId]);

    // Save interests
    $pdo->prepare('DELETE FROM user_interests WHERE user_id = ?')->execute([$userId]);
    $stmtI = $pdo->prepare('INSERT IGNORE INTO user_interests (user_id, interest_id) VALUES (?, ?)');
    foreach ($interests as $iid) {
        $stmtI->execute([$userId, (int)$iid]);
    }

    // Save languages
    $pdo->prepare('DELETE FROM user_languages WHERE user_id = ?')->execute([$userId]);
    if (!empty($languages)) {
        $stmtL = $pdo->prepare('INSERT IGNORE INTO user_languages (user_id, language_id, proficiency, is_native) VALUES (?, ?, ?, ?)');
        foreach ($languages as $lang) {
            $proficiency = $lang['proficiency'] ?? 'Conversational';
            $isNative = ($proficiency === 'Native') ? 1 : 0;
            $stmtL->execute([$userId, (int)$lang['language_id'], $proficiency, $isNative]);
        }
    }

    // Update status to pending if score >= 80
    $stmt = $pdo->prepare('SELECT verification_score FROM user_verification WHERE user_id = ?');
    $stmt->execute([$userId]);
    $v = $stmt->fetch();
    if ($v && $v['verification_score'] >= 80) {
        $pdo->prepare('UPDATE users SET account_status = "pending" WHERE user_id = ? AND account_status = "incomplete"')
            ->execute([$userId]);
    }

    $pdo->commit();
    respond(true, 'Profile saved successfully!');
} catch (Exception $e) {
    $pdo->rollBack();
    respond(false, 'Failed to save profile: ' . $e->getMessage(), [], 500);
}
