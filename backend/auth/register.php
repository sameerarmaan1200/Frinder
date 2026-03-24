<?php
require_once __DIR__ . '/../config/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(false, 'Method not allowed', [], 405);

$body = getBody();
$pdo = getDB();

// Required fields
$required = ['username','email','password','full_name','date_of_birth','gender'];
foreach ($required as $f) {
    if (empty($body[$f])) respond(false, "Field '{$f}' is required", [], 422);
}

$username    = clean($body['username']);
$email       = strtolower(trim($body['email']));
$password    = $body['password'];
$full_name   = clean($body['full_name']);
$dob         = $body['date_of_birth'];
$gender      = $body['gender'];
$country_id  = !empty($body['country_id']) ? (int)$body['country_id'] : null;
$city        = !empty($body['city']) ? clean($body['city']) : null;

// Validate
if (!preg_match('/^[a-zA-Z0-9_]{3,50}$/', $username)) {
    respond(false, 'Username must be 3-50 characters, alphanumeric and underscores only', [], 422);
}
if (!isValidEmail($email)) {
    respond(false, 'Invalid email address', [], 422);
}
if (strlen($password) < 8) {
    respond(false, 'Password must be at least 8 characters', [], 422);
}
if (!preg_match('/[A-Z]/', $password) || !preg_match('/[0-9]/', $password)) {
    respond(false, 'Password must contain at least 1 uppercase letter and 1 number', [], 422);
}

// Check unique username
$stmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE username = ?');
$stmt->execute([$username]);
if ($stmt->fetchColumn() > 0) respond(false, 'Username already taken', [], 409);

// Check unique email
$stmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetchColumn() > 0) respond(false, 'Email already registered', [], 409);

// Age check (must be 13+)
$dobDate = new DateTime($dob);
$now = new DateTime();
if ($now->diff($dobDate)->y < 13) {
    respond(false, 'You must be at least 13 years old to join Frinder', [], 422);
}

// Create user
$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $pdo->prepare('
    INSERT INTO users (username, email, password_hash, full_name, date_of_birth, gender, country_id, city)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
');
$stmt->execute([$username, $email, $hash, $full_name, $dob, $gender, $country_id, $city]);
$userId = $pdo->lastInsertId();

// Create verification record
$stmt = $pdo->prepare('INSERT INTO user_verification (user_id, verification_score) VALUES (?, 0)');
$stmt->execute([$userId]);

logActivity($userId, 'register', "New user registered: {$username}");

respond(true, 'Account created! Please verify your email.', ['user_id' => (int)$userId]);
