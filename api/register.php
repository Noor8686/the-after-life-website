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

$name = trim($data['name'] ?? '');
$email = strtolower(trim($data['email'] ?? ''));
$passwordPlain = $data['password'] ?? '';

if ($name === '' || $email === '' || $passwordPlain === '') {
    respond(['error' => 'Name, E-Mail und Passwort sind erforderlich'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(['error' => 'E-Mail ist ungueltig'], 400);
}

if (strlen($passwordPlain) < 6) {
    respond(['error' => 'Passwort muss mindestens 6 Zeichen lang sein'], 400);
}

$passwordHash = password_hash($passwordPlain, PASSWORD_DEFAULT);

try {
    $stmt = $db->prepare('INSERT INTO users (name, email, password) VALUES (:name, :email, :password)');
    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':password' => $passwordHash,
    ]);

    $_SESSION['user_id'] = (int) $db->lastInsertId();
    respond(['success' => true, 'name' => $name, 'email' => $email]);
} catch (Throwable $e) {
    // Unique constraint -> email already exists
    respond(['error' => 'E-Mail existiert bereits'], 409);
}
