<?php
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(false, 'Method not allowed', [], 405);

$pdo    = getDB();
$action = $_POST['action'] ?? ($_GET['action'] ?? '');
$body   = getBody();

// Try token auth first, fall back to user_id during registration
$authUser = optionalAuth();
if ($authUser) {
    $userId = (int)$authUser['user_id'];
} else {
    $userId = (int)($_POST['user_id'] ?? ($body['user_id'] ?? 0));
    if (!$userId) respond(false, 'Authentication required', [], 401);

    // Verify user exists and is in registration flow (not yet verified)
    $stmt = $pdo->prepare('SELECT account_status FROM users WHERE user_id = ?');
    $stmt->execute([$userId]);
    $u = $stmt->fetch();
    if (!$u) respond(false, 'User not found', [], 404);
    if ($u['account_status'] === 'verified') {
        respond(false, 'Please use your login token for this action', [], 401);
    }
}

// ── Upload Document ───────────────────────────────────────────
if ($action === 'document') {
    if (!isset($_FILES['document'])) respond(false, 'No document uploaded', [], 422);
    $file    = $_FILES['document'];
    $docType = in_array($_POST['document_type'] ?? '', ['national_id','passport','driving_license','student_id','ssn'])
        ? $_POST['document_type'] : 'national_id';

    if ($file['error'] !== UPLOAD_ERR_OK) respond(false, 'File upload error', [], 422);
    if ($file['size'] > 5 * 1024 * 1024) respond(false, 'File too large (max 5MB)', [], 422);

    $allowedMimes = ['image/jpeg','image/png','application/pdf'];
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime  = $finfo->file($file['tmp_name']);
    if (!in_array($mime, $allowedMimes)) respond(false, 'Invalid file type. Only JPG, PNG, PDF allowed.', [], 422);

    $ext       = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $filename  = $userId . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $uploadDir = __DIR__ . '/../../uploads/documents/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    if (!move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
        respond(false, 'Failed to save document', [], 500);
    }

    $pdo->prepare('UPDATE user_verification SET document_path=?, document_type=?, verification_score = verification_score + 40 WHERE user_id=?')
        ->execute([$filename, $docType, $userId]);

    $stmt = $pdo->prepare('SELECT verification_score FROM user_verification WHERE user_id = ?');
    $stmt->execute([$userId]);
    $v = $stmt->fetch();
    if ($v && $v['verification_score'] >= 80) {
        $pdo->prepare('UPDATE users SET account_status = "pending" WHERE user_id = ?')->execute([$userId]);
    }

    respond(true, 'Document uploaded! Awaiting admin review.', ['score_added' => 40]);
}

// ── Upload Selfie ─────────────────────────────────────────────
if ($action === 'selfie') {
    $filename  = null;
    $uploadDir = __DIR__ . '/../../uploads/selfies/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    // File upload
    if (isset($_FILES['selfie']) && $_FILES['selfie']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['selfie'];
        if ($file['size'] > 5 * 1024 * 1024) respond(false, 'Image too large (max 5MB)', [], 422);
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime  = $finfo->file($file['tmp_name']);
        if (!in_array($mime, ['image/jpeg','image/png','image/webp'])) {
            respond(false, 'Invalid image type', [], 422);
        }
        $ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $filename = $userId . '_selfie_' . time() . '.' . $ext;
        if (!move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
            respond(false, 'Failed to save selfie', [], 500);
        }
    }

    // Base64 upload
    if (!$filename && !empty($_POST['selfie_base64'])) {
        $imgData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $_POST['selfie_base64']));
        if (!$imgData || strlen($imgData) < 1000) respond(false, 'Invalid image data', [], 422);
        if (strlen($imgData) > 5 * 1024 * 1024) respond(false, 'Image too large', [], 422);
        $filename = $userId . '_selfie_' . time() . '.jpg';
        file_put_contents($uploadDir . $filename, $imgData);
    }

    if (!$filename) respond(false, 'No selfie provided', [], 422);

    $pdo->prepare('UPDATE user_verification SET selfie_path=?, verification_score = verification_score + 30 WHERE user_id=?')
        ->execute([$filename, $userId]);

    // Also set as profile picture if not set
    $stmt = $pdo->prepare('SELECT profile_picture FROM users WHERE user_id = ?');
    $stmt->execute([$userId]);
    $u = $stmt->fetch();
    if (empty($u['profile_picture'])) {
        $pdo->prepare('UPDATE users SET profile_picture = ? WHERE user_id = ?')->execute(['selfies/' . $filename, $userId]);
    }

    $stmt = $pdo->prepare('SELECT verification_score FROM user_verification WHERE user_id = ?');
    $stmt->execute([$userId]);
    $v = $stmt->fetch();
    if ($v && $v['verification_score'] >= 80) {
        $pdo->prepare('UPDATE users SET account_status = "pending" WHERE user_id = ?')->execute([$userId]);
    }

    respond(true, 'Selfie uploaded!', ['score_added' => 30]);
}

// ── GPS Location ──────────────────────────────────────────────
if ($action === 'gps') {
    $lat  = (float)($body['lat'] ?? 0);
    $lng  = (float)($body['lng'] ?? 0);

    if (!$lat || !$lng) respond(false, 'Invalid coordinates', [], 422);
    if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) respond(false, 'Invalid coordinates', [], 422);

    $pdo->prepare('UPDATE user_verification SET gps_lat=?, gps_lng=?, gps_timestamp=NOW(), verification_score = verification_score + 20 WHERE user_id=?')
        ->execute([$lat, $lng, $userId]);

    $stmt = $pdo->prepare('SELECT verification_score FROM user_verification WHERE user_id = ?');
    $stmt->execute([$userId]);
    $v = $stmt->fetch();
    if ($v && $v['verification_score'] >= 80) {
        $pdo->prepare('UPDATE users SET account_status = "pending" WHERE user_id = ?')->execute([$userId]);
    }

    respond(true, 'Location verified!', ['score_added' => 20]);
}

respond(false, 'Invalid action', [], 400);
