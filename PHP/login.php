<?php
require_once 'config.php';

header('Content-Type: application/json');

// Récupérer les données JSON
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Données manquantes']);
    exit;
}

$email = trim($data['email']);
$password = trim($data['password']);


try {
    // Rechercher l'utilisateur
    $stmt = $pdo->prepare("SELECT id,nom,prenom,email, mot_de_pass FROM utilisateurs WHERE email = :email OR Nom = :email");
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'nom d\'utilisateur ou mot de passe incorrect']);
        exit;
    }
    
    // Vérifier le mot de passe
    if (!password_verify($password, $user['mot_de_pass'])) {
        echo json_encode(['success' => false, 'message' => 'nom d\'utilisateur ou mot de passe incorrect']);
        exit;
    }
    
    // Créer la session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['nom'] = $user['nom'];
    $_SESSION['prenom'] = $user['prenom'];
    $_SESSION['email'] = $user['email'];
    echo json_encode([
        'success' => true, 
        'message' => 'Connexion réussie',
        'user' => [
            'nom' => $user['nom'],
            'prenom' => $user['prenom'],
            'email' => $user['email']
        ]
    ]);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur de base de données: ' . $e->getMessage()]);
}
    
?>