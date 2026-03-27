<?php
session_start();
require 'db.php';

// Nur Admin darf bearbeiten
if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(["error" => "Kein Zugriff"]);
    exit;
}

$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ? LIMIT 1");
$stmt->execute([$_SESSION['user_id']]);
$me = $stmt->fetch();
if (!$me || $me['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["error" => "Kein Zugriff"]);
    exit;
}

// JSON lesen
$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? null;
$name = $data['name'] ?? null;
$email = $data['email'] ?? null;

if (!$id || !$name || !$email) {
    http_response_code(400);
    echo json_encode(["error" => "ID, Name und Email erforderlich"]);
    exit;
}

// Email validieren
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Ungültige Email"]);
    exit;
}

// Prüfe, ob Email schon von anderen verwendet wird
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1");
$stmt->execute([$email, $id]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(["error" => "Email existiert bereits"]);
    exit;
}

// Benutzer aktualisieren
$stmt = $pdo->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
$stmt->execute([$name, $email, $id]);

echo json_encode(["success" => true]);
?>
