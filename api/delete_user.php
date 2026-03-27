<?php
session_start();
require 'db.php';

// Nur Admin darf löschen
if (!isset($_SESSION['user_id']) || $_SESSION['user_id'] != 1) {
    http_response_code(403);
    echo json_encode(["error" => "Kein Zugriff"]);
    exit;
}

// JSON lesen
$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(["error" => "Keine ID"]);
    exit;
}

// User löschen
$stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
$stmt->execute([$id]);

echo json_encode(["success" => true]);
?>