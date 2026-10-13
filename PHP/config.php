<?php
session_start();
//vous devez changer ces parametres avec les votre
define('DB_HOST', 'localhost');
define('DB_NAME', 'geoportail');
define('DB_USER', 'postgres');
define('DB_PASS', '');

try {
    $pdo = new PDO(
        "pgsql:host=" . DB_HOST . ";dbname=" . DB_NAME,
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch(PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Erreur base de données: ' . $e->getMessage()]);
}
?>