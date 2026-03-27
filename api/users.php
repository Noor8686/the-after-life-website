<?php
session_start();
require 'db.php';

// Nur Admin darf Benutzer sehen
if (!isset($_SESSION['user_id']) || $_SESSION['user_id'] != 1) {
    http_response_code(403);
    echo json_encode(["error" => "Kein Zugriff"]);
    exit;
}

// Alle Benutzer holen
$stmt = $pdo->query("SELECT id, name, email FROM users");
$users = $stmt->fetchAll();

echo json_encode($users);
?>