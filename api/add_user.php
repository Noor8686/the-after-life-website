<?php
session_start();
require 'db.php';

// Nur Admin darf hinzufügen
if (!isset($_SESSION['user_id']) || $_SESSION['user_id'] != 1) {
    http_response_code(403);
    echo json_encode(["error" => "Kein Zugriff"]);
    exit;
}

// JSON lesen
$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'] ?? null;
$email = $data['email'] ?? null;
$password = $data['password'] ?? null;

if (!$name || !$email || !$password) {
    http_response_code(400);
    echo json_encode(["error" => "Name, Email und Passwort erforderlich"]);
    exit;
}

// Passwort hashen
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// User hinzufügen
$stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
$stmt->execute([$name, $email, $hashedPassword]);

echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
?>