<?php
require_once 'PHP/config.php'; // démarre aussi la session

if (!isset($_SESSION['user_id'])) {
    header('Location: logpage.html');
    exit;
}

function e($v) { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); }

// Données à jour depuis la BDD
$st = $pdo->prepare("SELECT nom, prenom, email, photo FROM utilisateurs WHERE id = :id");
$st->execute(['id' => $_SESSION['user_id']]);
$user = $st->fetch(PDO::FETCH_ASSOC);
if (!$user) {
    session_destroy();
    header('Location: logpage.html');
    exit;
}
$photoUrl = $user['photo'] ? 'uploads/profiles/' . rawurlencode($user['photo']) : null;
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Profil - Géoportail</title>
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/profil.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <header>
        <a href="main.php" class="btn-home">Géoportail</a>
        <nav class="nav-bar">
            <ul>
                <li><a href="main.php"><i class="fas fa-home"></i> Accueil</a></li>
                <li><a href="main.php#map"><i class="fas fa-map-marked-alt"></i> Carte</a></li>
                <li><a href="profil.php"><i class="fas fa-user"></i> Profil</a></li>
            </ul>
        </nav>
        <div class="btn-logout">
            <i class="fas fa-sign-out-alt"></i>
            <a href="logout.php">Déconnexion</a>
        </div>
    </header>

    <main class="main-content">
        <div class="profile-container">
            <div class="profile-header">
                <div class="profile-avatar">
                    <?php if ($photoUrl): ?>
                        <img src="<?= e($photoUrl) ?>" alt="Photo de profil" class="avatar-img" id="avatarMain">
                    <?php else: ?>
                        <i class="fas fa-user-circle" id="avatarMainIcon"></i>
                    <?php endif; ?>
                </div>
                <div class="profile-title">
                    <h1>Mon Profil</h1>
                </div>
            </div>

            <div id="alertBox" class="alert" role="alert" hidden></div>

            <div class="profile-card">
                <div class="profile-card-header">
                    <h3><i class="fas fa-id-card"></i> Informations personnelles</h3>
                    <button type="button" id="btnEdit" class="btn-edit">
                        <i class="fas fa-pen"></i> Modifier
                    </button>
                </div>

                <!-- Affichage -->
                <div id="profileDisplay" class="profile-info">
                    <div class="info-row">
                        <div class="info-label"><i class="fas fa-user"></i><span>Nom</span></div>
                        <div class="info-value"><?= e($user['nom']) ?></div>
                    </div>
                    <div class="info-row">
                        <div class="info-label"><i class="fas fa-user-tag"></i><span>Prénom</span></div>
                        <div class="info-value"><?= e($user['prenom']) ?></div>
                    </div>
                    <div class="info-row">
                        <div class="info-label"><i class="fas fa-envelope"></i><span>Email</span></div>
                        <div class="info-value"><?= e($user['email']) ?></div>
                    </div>
                </div>

                <!-- Formulaire de modification -->
                <form id="profileForm" class="profile-form" enctype="multipart/form-data" hidden>
                    <div class="photo-edit">
                        <div class="photo-preview">
                            <?php if ($photoUrl): ?>
                                <img src="<?= e($photoUrl) ?>" alt="Aperçu" id="photoPreviewImg">
                            <?php else: ?>
                                <img src="" alt="Aperçu" id="photoPreviewImg" hidden>
                                <i class="fas fa-user-circle" id="photoPreviewIcon"></i>
                            <?php endif; ?>
                        </div>
                        <div class="photo-actions">
                            <label for="photo" class="btn-secondary"><i class="fas fa-camera"></i> Choisir une photo</label>
                            <input type="file" id="photo" name="photo" accept="image/jpeg,image/png,image/webp" hidden>
                            <?php if ($photoUrl): ?>
                                <button type="button" id="btnRemovePhoto" class="btn-link-danger">
                                    <i class="fas fa-trash"></i> Supprimer la photo
                                </button>
                            <?php endif; ?>
                            <small>JPG, PNG ou WebP – 2 Mo max</small>
                        </div>
                    </div>
                    <input type="hidden" name="remove_photo" id="removePhoto" value="0">

                    <div class="form-group">
                        <label for="nom">Nom</label>
                        <input type="text" id="nom" name="nom" value="<?= e($user['nom']) ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="prenom">Prénom</label>
                        <input type="text" id="prenom" name="prenom" value="<?= e($user['prenom']) ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" value="<?= e($user['email']) ?>" required>
                    </div>

                    <fieldset class="password-fieldset">
                        <legend>Changer le mot de passe (optionnel)</legend>
                        <div class="form-group">
                            <label for="current_password">Mot de passe actuel</label>
                            <input type="password" id="current_password" name="current_password" autocomplete="current-password">
                        </div>
                        <div class="form-group">
                            <label for="new_password">Nouveau mot de passe</label>
                            <input type="password" id="new_password" name="new_password" minlength="6" autocomplete="new-password">
                        </div>
                    </fieldset>

                    <div class="form-actions">
                        <button type="submit" class="btn-save"><i class="fas fa-check"></i> Enregistrer</button>
                        <button type="button" id="btnCancel" class="btn-cancel"><i class="fas fa-times"></i> Annuler</button>
                    </div>
                </form>
            </div>
        </div>
    </main>

    <footer class="footer">
        <div class="footer-menu">
            <h4>Menu</h4>
            <ul>
                <li><i class="fas fa-chevron-right"></i><a href="main.php"> Accueil</a></li>
                <li><i class="fas fa-chevron-right"></i><a href="main.php#map"> Carte</a></li>
                <li><i class="fas fa-chevron-right"></i><a href="profil.php"> Profil</a></li>
            </ul>
        </div>
        <div class="footer-contact">
            <h4>Contact</h4>
            <p>Email: info@agenceurbaineexemple.ma</p>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 <strong>Agence Urbaine </strong> - Tous droits réservés</p>
        </div>
    </footer>

    <script>
    (function () {
        const display   = document.getElementById('profileDisplay');
        const form      = document.getElementById('profileForm');
        const btnEdit   = document.getElementById('btnEdit');
        const btnCancel = document.getElementById('btnCancel');
        const alertBox  = document.getElementById('alertBox');
        const photoIn   = document.getElementById('photo');
        const prevImg   = document.getElementById('photoPreviewImg');
        const prevIcon  = document.getElementById('photoPreviewIcon');
        const removeIn  = document.getElementById('removePhoto');
        const btnRemove = document.getElementById('btnRemovePhoto');
        const MAX = 2 * 1024 * 1024;

        function showAlert(msg, ok) {
            alertBox.textContent = msg;
            alertBox.className = 'alert ' + (ok ? 'alert-success' : 'alert-error');
            alertBox.hidden = false;
        }
        function setEditing(on) {
            form.hidden = !on;
            display.hidden = on;
            btnEdit.hidden = on;
            if (!on) form.reset();
        }

        btnEdit.addEventListener('click', () => { alertBox.hidden = true; setEditing(true); });
        btnCancel.addEventListener('click', () => location.reload());

        photoIn.addEventListener('change', () => {
            const f = photoIn.files[0];
            if (!f) return;
            if (f.size > MAX) { showAlert('La photo ne doit pas dépasser 2 Mo', false); photoIn.value = ''; return; }
            removeIn.value = '0';
            prevImg.src = URL.createObjectURL(f);
            prevImg.hidden = false;
            if (prevIcon) prevIcon.hidden = true;
        });

        if (btnRemove) btnRemove.addEventListener('click', () => {
            removeIn.value = '1';
            photoIn.value = '';
            prevImg.hidden = true;
            if (prevIcon) prevIcon.hidden = false;
        });

        form.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const btn = form.querySelector('.btn-save');
            btn.disabled = true;
            try {
                const res  = await fetch('update_profil.php', { method: 'POST', body: new FormData(form) });
                const data = await res.json();
                showAlert(data.message, data.success);
                if (data.success) setTimeout(() => location.reload(), 900);
                else btn.disabled = false;
            } catch (err) {
                showAlert('Erreur de connexion au serveur', false);
                btn.disabled = false;
            }
        });
    })();
    </script>
</body>
</html>