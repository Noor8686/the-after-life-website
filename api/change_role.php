<?php
session_start();
require 'db.php';

// Nur Admin darf Rollen wechseln
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
$role = $data['role'] ?? null;

if (!$id || !$role) {
    http_response_code(400);
    echo json_encode(["error" => "ID und Rolle erforderlich"]);
    exit;
}

// Rolle validieren
if (!in_array($role, ['admin', 'user'])) {
    http_response_code(400);
    echo json_encode(["error" => "Ungültige Rolle"]);
    exit;
}

// Verhindern, dass Admin sich selbst den Admin-Status nimmt
if ($id == $_SESSION['user_id'] && $role === 'user') {
    http_response_code(400);
    echo json_encode(["error" => "Du kannst dir selbst die Admin-Rolle nicht entziehen"]);
    exit;
}

// Rolle aktualisieren
$stmt = $pdo->prepare("UPDATE users SET role = ? WHERE id = ?");
$stmt->execute([$role, $id]);

echo json_encode(["success" => true]);
?>
