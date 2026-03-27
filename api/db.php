<?php
declare(strict_types=1);

$dbPath = __DIR__ . '/../users.db';

$db = new PDO('sqlite:' . $dbPath, null, null, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

// Simple schema bootstrap for the users table (id, name, email, password hash, role)
$db->exec("
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)");

// ensure role column exists in older schemas
try {
    $db->exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
} catch (PDOException $e) {
    // ignore if column already exists
}
