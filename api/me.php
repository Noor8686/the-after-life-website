<?php
declare(strict_types=1);

session_set_cookie_params([
    'lifetime' => 86400 * 7,
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/db.php';

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    respond(['error' => 'Nicht eingeloggt'], 401);
}

$stmt = $db->prepare('SELECT id, name, email FROM users WHERE id = :id LIMIT 1');
$stmt->execute([':id' => $_SESSION['user_id']]);
$user = $stmt->fetch();

if (!$user) {
    session_destroy();
    respond(['error' => 'Session ungueltig'], 401);
}

respond([
    'id' => (int) $user['id'],
    'name' => $user['name'],
    'email' => $user['email'],
]);
