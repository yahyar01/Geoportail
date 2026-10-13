<?php
require_once 'PHP/config.php';
header('Content-Type: application/json; charset=utf-8');

function fail($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $msg]);
    exit;
}

if (!isset($_SESSION['user_id'])) fail('Non authentifié', 401);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Méthode non autorisée', 405);

$userId          = (int) $_SESSION['user_id'];
$nom             = trim($_POST['nom'] ?? '');
$prenom          = trim($_POST['prenom'] ?? '');
$email           = trim($_POST['email'] ?? '');
$currentPassword = $_POST['current_password'] ?? '';
$newPassword     = $_POST['new_password'] ?? '';
$removePhoto     = ($_POST['remove_photo'] ?? '') === '1';

// ---------- Validation ----------
if ($nom === '' || $prenom === '' || $email === '') fail('Nom, prénom et email sont requis');
if (!filter_var($email, FILTER_VALIDATE_EMAIL))     fail('Email invalide');
if ($newPassword !== '' && strlen($newPassword) < 6) fail('Le nouveau mot de passe doit faire au moins 6 caractères');

$uploadDir = __DIR__ . '/uploads/profiles/';
$newPhoto  = null;

try {
    // Utilisateur actuel
    $st = $pdo->prepare("SELECT mot_de_pass, photo FROM utilisateurs WHERE id = :id");
    $st->execute(['id' => $userId]);
    $user = $st->fetch(PDO::FETCH_ASSOC);
    if (!$user) fail('Utilisateur introuvable', 404);

    // Email déjà pris par quelqu'un d'autre ?
    $st = $pdo->prepare("SELECT id FROM utilisateurs WHERE email = :email AND id <> :id");
    $st->execute(['email' => $email, 'id' => $userId]);
    if ($st->fetch()) fail('Cet email est déjà utilisé');

    // Changement de mot de passe : vérifier l'ancien
    $hashedPassword = null;
    if ($newPassword !== '') {
        if (!password_verify($currentPassword, $user['mot_de_pass'])) {
            fail('Mot de passe actuel incorrect');
        }
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    }

    // ---------- Upload de la photo ----------
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] !== UPLOAD_ERR_NO_FILE) {
        $f = $_FILES['photo'];
        if ($f['error'] !== UPLOAD_ERR_OK)  fail('Erreur lors de l\'envoi de la photo');
        if ($f['size'] > 2 * 1024 * 1024)   fail('La photo ne doit pas dépasser 2 Mo');

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime  = $finfo->file($f['tmp_name']);
        $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        if (!isset($allowed[$mime]) || @getimagesize($f['tmp_name']) === false) {
            fail('Format non supporté (JPG, PNG ou WebP uniquement)');
        }

        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) fail('Impossible de créer le dossier d\'upload', 500);

        $newPhoto = 'user_' . $userId . '_' . bin2hex(random_bytes(8)) . '.' . $allowed[$mime];
        if (!move_uploaded_file($f['tmp_name'], $uploadDir . $newPhoto)) fail('Impossible d\'enregistrer la photo', 500);
    }

    // ---------- Mise à jour BDD ----------
    $sql    = "UPDATE utilisateurs SET nom = :nom, prenom = :prenom, email = :email";
    $params = ['nom' => $nom, 'prenom' => $prenom, 'email' => $email, 'id' => $userId];

    if ($hashedPassword !== null) { $sql .= ", mot_de_pass = :pw"; $params['pw'] = $hashedPassword; }
    if ($newPhoto !== null)       { $sql .= ", photo = :photo";    $params['photo'] = $newPhoto; }
    elseif ($removePhoto)         { $sql .= ", photo = NULL"; }

    $sql .= " WHERE id = :id";
    $pdo->prepare($sql)->execute($params);

    // Supprimer l'ancienne photo si remplacée / retirée
    if (($newPhoto !== null || $removePhoto) && !empty($user['photo'])) {
        $old = $uploadDir . basename($user['photo']);
        if (is_file($old)) @unlink($old);
    }

    // Session à jour
    $_SESSION['nom'] = $nom;
    $_SESSION['prenom'] = $prenom;
    $_SESSION['email'] = $email;

    echo json_encode(['success' => true, 'message' => 'Profil mis à jour avec succès']);

} catch (PDOException $e) {
    if ($newPhoto !== null && is_file($uploadDir . $newPhoto)) @unlink($uploadDir . $newPhoto);
    error_log($e->getMessage());
    fail('Erreur serveur, veuillez réessayer', 500);
}