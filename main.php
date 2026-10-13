<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <!-- leaflet css-->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossorigin="" />
    <!-- leaflet js-->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossorigin=""></script>
    <script src="https://unpkg.com/leaflet-wfst@1.1.1/dist/leaflet-wfst.min.js"></script>
    <!-- geocoder (recherche par nom) js et css-->
    <link rel="stylesheet" href="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css" />
    <script src="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js"></script>
    <!--full screen js et css-->
    <link rel="stylesheet" href="https://unpkg.com/leaflet.fullscreen/dist/Control.FullScreen.css" />
    <script src="https://unpkg.com/leaflet.fullscreen/dist/Control.FullScreen.umd.js"></script>
    <!--bibliotheque js de conversion de coordonnees -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.6.2/proj4.js"></script>
    <!-- geoman (dessin) js et css-->
    <link rel="stylesheet" href="https://unpkg.com/@geoman-io/leaflet-geoman-free@latest/dist/leaflet-geoman.css" />
    <script src="https://unpkg.com/@geoman-io/leaflet-geoman-free@latest/dist/leaflet-geoman.js"></script>
    <!-- linear measurement js et css-->   
    <link rel="stylesheet" href="pluggins/css/Leaflet.LinearMeasurement.css">
    <script src="pluggins/js/Leaflet.LinearMeasurement.js"></script>
    <!-- mesure des formes js et css -->
    <link rel="stylesheet" href="pluggins/css/leaflet-measure-path.css">
    <script src="pluggins/js/leaflet-measure-path.js"></script>
    <!-- pluggin d'impression -->
    <script src="pluggins\js\leaflet.browser.print.min.js"></script>
    <!-- legende js et css-->
    <link rel="stylesheet" href="pluggins/css/leaflet.legend.css">
    <script src="pluggins/js/leaflet.legend.js"></script>
    <!-- mon style css et clodflare pour icons -->
    <link rel="stylesheet" href="styles/main.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>

<body>
    <?php
    session_start();
    if (!isset($_SESSION['user_id'])) {
        header('Location: logpage.html');
        exit;
    }
    ?>
    <header>
        <a href="main.php" class="btn-home">Géoportail </a>
        <nav class="nav-bar">
            <ul>
                <li><a href="main.php"><i class="fas fa-home"></i> Accueil</a></li>
                <li><a href="#map"><i class="fas fa-map-marked-alt"></i> Carte</a></li>
                <li><a href="profil.php"><i class="fas fa-user"></i> Profil</a></li>
            </ul>
        </nav>
        <div class="btn-logout">
            <i class="fas fa-sign-out-alt"></i>
            <a href="logout.php">Déconnexion</a>
        </div>
    </header>
    <section class="top-content">
        <h2>Bienvenue sur votre Géoportail</h2>
    </section>
    <div class="map-container">
        <h1>Carte interactive</h1>
        <div id="map" >
            <div class="leaflet-control coordinate" style="position: absolute ;bottom: 5px;left: 1%;"></div>
        </div>
    </div>
    <div id="id"></div>
    <footer class="footer">
        <div class="footer-menu">
            <h4>Menu</h4>
            <ul>
                <li><i class="fas fa-chevron-right"></i><a href="main.php"> Accueil</a></li>
                <li><i class="fas fa-chevron-right"></i><a href="main.php#map"> Carte</a></li>
                <li><i class="fas fa-chevron-right"></i><a href="profile.php"> Profil</a></li>
            </ul>
        </div>
        <div class="footer-contact">
            <h4>Contact</h4>
            <p>Email: info@agenceurbaineexemple.ma</p>
        </div>
        <div class="footer-bottom">
            <p>
                &copy; 2026 <strong>Agence Urbaine </strong> - Tous droits réservés
            </p>
        </div>
    </footer>
    <script src="scripts/script.js"></script>
    <script src="scripts/layers.js"> </script>
    <script src="scripts/controls.js"></script>
</body>

</html>