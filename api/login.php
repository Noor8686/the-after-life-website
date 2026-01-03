<?php
declare(strict_types=1);

session_set_cookie_params([
    'lifetime' => 86400 * 7, // one week
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

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    respond(['error' => 'Keine Daten erhalten'], 400);
}

$email = strtolower(trim($data['email'] ?? ''));
$passwordPlain = $data['password'] ?? '';

if ($email === '' || $passwordPlain === '') {
    respond(['error' => 'E-Mail und Passwort sind erforderlich'], 400);
}

$stmt = $db->prepare('SELECT id, name, email, password FROM users WHERE email = :email LIMIT 1');
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

if (!$user || !password_verify($passwordPlain, $user['password'])) {
    respond(['error' => 'E-Mail oder Passwort ist falsch'], 401);
}

$_SESSION['user_id'] = (int) $user['id'];

respond([
    'success' => true,
    'name' => $user['name'],
    'email' => $user['email'],
]);
