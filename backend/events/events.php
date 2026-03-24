<?php
require_once __DIR__ . '/../config/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$pdo = getDB();
$userId = $user['user_id'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    $stmt = $pdo->prepare('
        SELECT e.*, u.full_name AS creator_name, u.profile_picture AS creator_pic,
            (SELECT COUNT(*) FROM event_attendees WHERE event_id=e.event_id AND status="accepted") AS accepted_count,
            (SELECT status FROM event_attendees WHERE event_id=e.event_id AND user_id=?) AS my_status
        FROM events e
        JOIN users u ON u.user_id = e.creator_id
        WHERE e.creator_id = ? OR e.event_id IN (
            SELECT event_id FROM event_attendees WHERE user_id = ?
        )
        ORDER BY e.created_at DESC
    ');
    $stmt->execute([$userId, $userId, $userId]);
    $events = $stmt->fetchAll();

    // Get attendees for each event
    foreach ($events as &$event) {
        $stmt2 = $pdo->prepare('
            SELECT u.user_id, u.full_name, u.username, u.profile_picture, ea.status
            FROM event_attendees ea JOIN users u ON u.user_id=ea.user_id
            WHERE ea.event_id = ? LIMIT 10
        ');
        $stmt2->execute([$event['event_id']]);
        $event['attendees'] = $stmt2->fetchAll();
    }

    respond(true, 'Events loaded', ['events' => $events]);
}

if ($method === 'POST') {
    if ($action === 'create') {
        $body = getBody();
        $type        = $body['event_type'] ?? 'meetup';
        $title       = clean($body['title'] ?? '');
        $description = !empty($body['description']) ? clean($body['description']) : null;
        $location    = !empty($body['location']) ? clean($body['location']) : null;
        $scheduledAt = !empty($body['scheduled_at']) ? $body['scheduled_at'] : null;
        $maxAttendees= !empty($body['max_attendees']) ? (int)$body['max_attendees'] : null;
        $invitees    = $body['invitees'] ?? [];

        if (!$title) respond(false, 'Title is required', [], 422);
        if (!in_array($type, ['group','call','meetup'])) respond(false, 'Invalid event type', [], 422);

        $pdo->prepare('INSERT INTO events (creator_id, event_type, title, description, location, scheduled_at, max_attendees) VALUES (?,?,?,?,?,?,?)')
            ->execute([$userId, $type, $title, $description, $location, $scheduledAt, $maxAttendees]);
        $eventId = $pdo->lastInsertId();

        // Add creator as accepted
        $pdo->prepare('INSERT INTO event_attendees (event_id, user_id, status) VALUES (?,?,"accepted")')->execute([$eventId, $userId]);

        // Invite friends
        foreach ($invitees as $inviteeId) {
            $pdo->prepare('INSERT IGNORE INTO event_attendees (event_id, user_id, status) VALUES (?,?,"invited")')->execute([$eventId, (int)$inviteeId]);
        }

        respond(true, 'Event created!', ['event_id' => (int)$eventId]);
    }

    if ($action === 'respond') {
        $body = getBody();
        $eventId = (int)($body['event_id'] ?? 0);
        $status  = in_array($body['status'] ?? '', ['accepted','declined']) ? $body['status'] : 'accepted';

        if (!$eventId) respond(false, 'Event ID required', [], 422);

        $pdo->prepare('UPDATE event_attendees SET status=?, responded_at=NOW() WHERE event_id=? AND user_id=?')
            ->execute([$status, $eventId, $userId]);
        respond(true, 'Response saved!');
    }

    respond(false, 'Invalid action', [], 400);
}
