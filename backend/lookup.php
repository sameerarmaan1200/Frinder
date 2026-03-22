<?php
require_once __DIR__ . '/config/helpers.php';

$action = $_GET['action'] ?? 'all';
$pdo = getDB();

if ($action === 'countries' || $action === 'all') {
    $countries = $pdo->query('SELECT country_id, country_name, iso_code, continent, flag_emoji FROM countries ORDER BY country_name')->fetchAll();
}

if ($action === 'interests' || $action === 'all') {
    $interests = $pdo->query('SELECT interest_id, interest_name, category, icon FROM interests ORDER BY category, interest_name')->fetchAll();
}

if ($action === 'languages' || $action === 'all') {
    $languages = $pdo->query('SELECT language_id, language_name, iso_code, native_name FROM languages ORDER BY language_name')->fetchAll();
}

respond(true, 'Lookup data', array_filter([
    'countries' => $countries ?? null,
    'interests'  => $interests ?? null,
    'languages'  => $languages ?? null,
]));