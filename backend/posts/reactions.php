<?php
// ============================================================
// FRINDER — Post Reactions API
// File location: backend/posts/reactions.php
// ============================================================
require_once __DIR__ . '/../config/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$user   = requireAuth();
$pdo    = getDB();
$userId = (int)$user['user_id'];
$action = $_GET['action'] ?? '';

// Allowed emojis — full social media set
$allowedEmojis = [
    '❤️','😂','😮','😢','😡','👍','👎','🔥','🎉','💯',
    '😍','🥰','😎','🤩','😭','😱','🙏','💪','🤝','✨',
    '😊','🥹','😆','🤣','😅','😇','🤗','🤔','😏','😒',
    '🙄','😤','🤯','🥳','😴','🤮','💀','👻','🫶','❤️‍🔥',
    '💔','💕','💖','💗','💙','💚','💛','🧡','💜','🖤',
    '⭐','🌟','💫','✅','❌','🚀','💡','🎯','🏆','🎊'
];

// ── GET reactions for a post ──────────────────────────────────
if (.
) {
    $postId = (int)($_GET['post_id'] ?? 0);
    if (!$postId) respond(false, 'Post ID required', [], 422);

    // Get all reactions with user details
    $stmt = $pdo->prepare('
        SELECT pr.reaction_id, pr.emoji, pr.created_at,
            u.user_id, u.full_name, u.username, u.profile_picture
        FROM post_reactions pr
        JOIN users u ON u.user_id = pr.user_id
        WHERE pr.post_id = ?
        ORDER BY pr.created_at ASC
    ');
    $stmt->execute([$postId]);
    $reactions = $stmt->fetchAll();

    // Group by emoji
    $grouped = [];
    $myReaction = null;
    foreach ($reactions as $r) {
        $emoji = $r['emoji'];
        if (!isset($grouped[$emoji])) {
            $grouped[$emoji] = ['emoji' => $emoji, 'count' => 0, 'users' => []];
        }
        $grouped[$emoji]['count']++;
        $grouped[$emoji]['users'][] = [
            'user_id'         => (int)$r['user_id'],
            'full_name'       => $r['full_name'],
            'username'        => $r['username'],
            'profile_picture' => $r['profile_picture'],
        ];
        if ((int)$r['user_id'] === $userId) {
            $myReaction = $emoji;
        }
    }

    respond(true, 'Reactions loaded', [
        'reactions'   => array_values($grouped),
        'my_reaction' => $myReaction,
        'total'       => count($reactions),
    ]);
}

// ── POST — add or change reaction ────────────────────────────
if ($method === 'POST' && $action === 'react') {
    $body   = getBody();
    $postId = (int)($body['post_id'] ?? 0);
    $emoji  = trim($body['emoji'] ?? '');

    if (!$postId) respond(false, 'Post ID required', [], 422);
    if (!in_array($emoji, $allowedEmojis)) respond(false, 'Invalid emoji', [], 422);

    // Check post exists
    $stmt = $pdo->prepare('SELECT post_id FROM posts WHERE post_id = ?');
    $stmt->execute([$postId]);
    if (!$stmt->fetch()) respond(false, 'Post not found', [], 404);

    // Check if user already reacted
    $stmt = $pdo->prepare('SELECT reaction_id, emoji FROM post_reactions WHERE post_id = ? AND user_id = ?');
    $stmt->execute([$postId, $userId]);
    $existing = $stmt->fetch();

    if ($existing) {
        if ($existing['emoji'] === $emoji) {
            // Same emoji — remove reaction (toggle off)
            $pdo->prepare('DELETE FROM post_reactions WHERE post_id = ? AND user_id = ?')
                ->execute([$postId, $userId]);
            respond(true, 'Reaction removed', ['action' => 'removed', 'emoji' => $emoji]);
        } else {
            // Different emoji — update reaction
            $pdo->prepare('UPDATE post_reactions SET emoji = ?, created_at = NOW() WHERE post_id = ? AND user_id = ?')
                ->execute([$emoji, $postId, $userId]);
            respond(true, 'Reaction updated', ['action' => 'updated', 'emoji' => $emoji]);
        }
    } else {
        // New reaction
        $pdo->prepare('INSERT INTO post_reactions (post_id, user_id, emoji) VALUES (?, ?, ?)')
            ->execute([$postId, $userId, $emoji]);
        respond(true, 'Reaction added', ['action' => 'added', 'emoji' => $emoji]);
    }
}

// ── DELETE — remove own reaction ──────────────────────────────
if ($method === 'DELETE') {
    $postId = (int)($_GET['post_id'] ?? 0);
    if (!$postId) respond(false, 'Post ID required', [], 422);
    $pdo->prepare('DELETE FROM post_reactions WHERE post_id = ? AND user_id = ?')
        ->execute([$postId, $userId]);
    respond(true, 'Reaction removed');
}

respond(false, 'Invalid action', [], 400);
