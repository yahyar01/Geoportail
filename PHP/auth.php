<?php
require_once 'config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

// Vérification des champs
if (!isset($data['nom']) || !isset($data['prenom']) || 
    !isset($data['email']) || !isset($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Tous les champs sont requis']);
    exit;
}

$nom = trim($data['nom']);
$prenom = trim($data['prenom']);
$email = trim($data['email']);
$password = $data['password'];

// Validation
if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Le mot de passe doit faire au moins 6 caractères']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Email invalide']);
    exit;
}

try {
    $checkStmt = $pdo->prepare("SELECT id FROM utilisateurs WHERE email = :email");
    $checkStmt->execute(['email' => $email]);
    if ($checkStmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Cet email est déjà utilisé']);
        exit;
    }
    
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("
        INSERT INTO utilisateurs (nom, prenom, email, mot_de_pass) 
        VALUES (:nom, :prenom, :email, :password)
    ");
    
    $stmt->execute([
        'nom' => $nom,
        'prenom' => $prenom,
        'email' => $email,
        'password' => $hashedPassword
    ]);
    
    echo json_encode([
        'success' => true, 
        'message' => 'Inscription réussie! Vous pouvez maintenant vous connecter.'
    ]);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur: ' . $e->getMessage()]);
}
?>