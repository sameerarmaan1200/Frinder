<?php
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(false, 'Method not allowed', [], 405);

$pdo = getDB();
$action = $_POST['action'] ?? '';
$userId = (int)($_POST['user_id'] ?? 0);

if (!$userId) respond(false, 'User ID required', [], 422);

// ─── Upload Document ─────────────────────────────────────────
if ($action === 'document') {
    if (!isset($_FILES['document'])) respond(false, 'No document uploaded', [], 422);
    $file = $_FILES['document'];
    $docType = $_POST['document_type'] ?? 'national_id';

    if ($file['size'] > 5 * 1024 * 1024) respond(false, 'File too large (max 5MB)', [], 422);

    $allowedMimes = ['image/jpeg','image/png','application/pdf'];
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);
    if (!in_array($mime, $allowedMimes)) respond(false, 'Invalid file type. Only JPG, PNG, PDF allowed.', [], 422);

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = $userId . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $uploadDir = __DIR__ . '/../../uploads/documents/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
    
    if (!move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
        respond(false, 'Failed to save document', [], 500);
    }

    $pdo->prepare('UPDATE user_verification SET document_path=?, document_type=?, verification_score = verification_score + 40 WHERE user_id=?')
        ->execute([$filename, $docType, $userId]);

    // Check if should be pending
    $stmt = $pdo->prepare('SELECT verification_score FROM user_verification WHERE user_id = ?');
    $stmt->execute([$userId]);
    $v = $stmt->fetch();
    if ($v && $v['verification_score'] >= 80) {
        $pdo->prepare('UPDATE users SET account_status = "pending" WHERE user_id = ?')->execute([$userId]);
    }

    respond(true, 'Document uploaded! Awaiting admin review.', ['score_added' => 40]);
}

// ─── Upload Selfie ───────────────────────────────────────────
if ($action === 'selfie') {
    // Accept base64 or file upload
    $selfieData = $_POST['selfie_base64'] ?? null;
    
    if ($selfieData) {
        // Base64 upload
        $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $selfieData));
        $filename = $userId . '_selfie_' . time() . '.jpg';
        $uploadDir = __DIR__ . '/../../uploads/selfies/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
        file_put_contents($uploadDir . $filename, $imageData);
    } elseif (isset($_FILES['selfie'])) {
        $file = $_FILES['selfie'];
        $ext = 'jpg';
        $filename = $userId . '_selfie_' . time() . '.' . $ext;
        $uploadDir = __DIR__ . '/../../uploads/selfies/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
        move_uploaded_file($file['tmp_name'], $uploadDir . $filename);
    } else {
        respond(false, 'No selfie provided', [], 422);
    }

    $pdo->prepare('UPDATE user_verification SET selfie_path=?, verification_score = verification_score + 30 WHERE user_id=?')
        ->execute([$filename, $userId]);

    respond(true, 'Selfie captured!', ['score_added' => 30]);
}

// ─── Save GPS ────────────────────────────────────────────────
if ($action === 'gps') {
    $lat = (float)($_POST['lat'] ?? 0);
    $lng = (float)($_POST['lng'] ?? 0);
    $declaredCountryId = (int)($_POST['country_id'] ?? 0);

    $mismatch = 0;
    // Basic validation
    if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
        respond(false, 'Invalid GPS coordinates', [], 422);
    }

    $pdo->prepare('UPDATE user_verification SET gps_lat=?, gps_lng=?, gps_timestamp=NOW(), location_mismatch=?, verification_score = verification_score + 20 WHERE user_id=?')
        ->execute([$lat, $lng, $mismatch, $userId]);

    respond(true, 'Location saved!', ['score_added' => 20]);
}

respond(false, 'Invalid action', [], 422);
