<?php
session_start();
require 'db.php';

// Nur Admin darf Benutzer sehen
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

// Alle Benutzer holen
$stmt = $pdo->query("SELECT id, name, email, role FROM users");
$users = $stmt->fetchAll();

echo json_encode($users);
?>