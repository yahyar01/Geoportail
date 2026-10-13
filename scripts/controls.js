// ============================================================
// 1. Contrôle Toggle (cache/affiche les outils)
// ============================================================

L.Control.ToggleControls = L.Control.extend({
    options: { position: 'topleft' },
    onAdd: function (map) {
        this._map = map;
        this._visible = true;
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-toggle-ctrl');
        this._button = L.DomUtil.create('a', '', container);
        this._button.href = '#';
        this._button.title = 'Afficher/cacher les outils';
        this._button.innerHTML = '👁';

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.on(this._button, 'click', L.DomEvent.stop)
            .on(this._button, 'click', this._toggle, this);

        return container;
    },
    _toggle: function () {
        this._visible = !this._visible;

        var mapContainer = this._map.getContainer();

        if (this._visible) {
            L.DomUtil.removeClass(mapContainer, 'controls-hidden');
            this._button.innerHTML = '👁';
        } else {
            L.DomUtil.addClass(mapContainer, 'controls-hidden');
            this._button.innerHTML = '🚫';
        }
    },

    onRemove: function (map) {
        L.DomEvent.off(this._button, 'click', this._toggle, this);
    }
});

// ============================================================
// 2. Contrôle de mesure des couches
// ============================================================

L.Control.MeasureTool = L.Control.extend({
    options: {
        position: 'topleft',
        measurementOptions: {
            unit: 'metric', // 'metric' ou 'imperial'
            decimals: 2
        }
    },

    onAdd: function (map) {
        // Création du conteneur
        this._container = L.DomUtil.create('div', 'leaflet-control-measure');
        this._container.style.background = 'white';
        this._container.style.padding = '2px';
        this._container.style.borderRadius = '4px';
        this._container.style.boxShadow = '0 1px 5px rgba(0,0,0,0.65)';

        // Création du bouton
        this._button = L.DomUtil.create('button', 'measure-btn');
        this._button.innerHTML = '📏';
        this._button.style.width = '40px';
        this._button.style.height = '40px';
        this._button.style.border = '1px solid #ccc';
        this._button.style.borderRadius = '4px';
        this._button.style.background = 'white';
        this._button.style.cursor = 'pointer';
        this._button.style.fontSize = '18px';
        this._button.style.transition = 'all 0.2s';
        this._button.title = 'Activer/Désactiver la mesure des couches';

        // Conteneur pour les informations de mesure
        this._infoContainer = L.DomUtil.create('div', 'measure-info');
        this._infoContainer.style.display = 'none';
        this._infoContainer.style.position = 'absolute';
        this._infoContainer.style.top = '100%';
        this._infoContainer.style.left = '0';
        this._infoContainer.style.marginTop = '5px';
        this._infoContainer.style.background = 'white';
        this._infoContainer.style.padding = '8px 12px';
        this._infoContainer.style.borderRadius = '4px';
        this._infoContainer.style.boxShadow = '0 1px 5px rgba(0,0,0,0.65)';
        this._infoContainer.style.minWidth = '200px';
        this._infoContainer.style.fontSize = '12px';
        this._infoContainer.style.zIndex = '1000';
        this._infoContainer.style.pointerEvents = 'none';

        // Assemblage
        this._container.appendChild(this._button);
        this._container.appendChild(this._infoContainer);
        this._container.style.position = 'relative';

        // Stockage des couches mesurées
        this._measuredLayers = [];
        this._isActive = false;
        this._map = map;
        this._clickHandler = null;

        // Configurer les événements
        this._setupEvents(map);

        return this._container;
    },

    _setupEvents: function (map) {
        // Événement click du bouton
        L.DomEvent.on(this._button, 'click', function (e) {
            L.DomEvent.stopPropagation(e);
            this._toggleMeasurement(map);
        }, this);

        // Événement pour fermer l'info en cliquant ailleurs
        L.DomEvent.on(document, 'click', function (e) {
            if (this._container && !this._container.contains(e.target)) {
                this._hideInfo();
            }
        }, this);
    },

    _toggleMeasurement: function (map) {
        this._isActive = !this._isActive;

        if (this._isActive) {
            // Activer le mode mesure
            this._button.style.background = '#4CAF50';
            this._button.style.borderColor = '#4CAF50';
            this._button.style.color = 'white';
            this._button.title = 'Désactiver la mesure';

            // Ajouter les écouteurs d'événements sur les couches
            this._enableMeasurement(map);

            this._showInfo('🟢 Mode mesure activé<br>Cliquez sur un polygone, ligne ou cercle');
        } else {
            // Désactiver le mode mesure
            this._button.style.background = 'white';
            this._button.style.borderColor = '#ccc';
            this._button.style.color = 'black';
            this._button.title = 'Activer la mesure des couches';

            // Retirer les écouteurs et les mesures
            this._disableMeasurement(map);

            this._hideInfo();
        }
    },

    _enableMeasurement: function (map) {
        // Fonction pour mesurer une couche
        const measureLayer = function (layer) {
            // Vérifier si la couche est mesurable
            if (layer instanceof L.Polyline ||
                layer instanceof L.Polygon ||
                layer instanceof L.Circle) {

                // Vérifier si la couche a déjà des mesures
                if (!layer._measurementEnabled) {
                    // Ajouter les mesures
                    layer.showMeasurements(this.options.measurementOptions);
                    layer._measurementEnabled = true;
                    this._measuredLayers.push(layer);
                    //cacher la bulle d'info
                    this._hideInfo();
                }
            }
        };

        // Stocker les handlers pour pouvoir les retirer
        this._clickHandler = function (e) {
            const layer = e.target;
            measureLayer.call(this, layer);
        }.bind(this);

        // Ajouter les écouteurs à toutes les couches existantes et futures
        map.eachLayer(function (layer) {
            this._addListenersToLayer(layer);
        }, this);

        // Écouter les nouvelles couches ajoutées
        map.on('layeradd', function (e) {
            this._addListenersToLayer(e.layer);
        }, this);

        // Écouter les couches retirées
        map.on('layerremove', function (e) {
            const layer = e.layer;
            if (layer._measurementEnabled) {
                layer.hideMeasurements();
                layer._measurementEnabled = false;
                const index = this._measuredLayers.indexOf(layer);
                if (index !== -1) {
                    this._measuredLayers.splice(index, 1);
                }
            }
            this._removeListenersFromLayer(layer);
        }, this);
    },

    _addListenersToLayer: function (layer) {
        // Vérifier si la couche est un polygone, polyline ou cercle
        if (layer instanceof L.Polyline ||
            layer instanceof L.Polygon ||
            layer instanceof L.Circle) {

            // Ajouter les écouteurs
            layer.on('click', this._clickHandler);

        }
    },

    _removeListenersFromLayer: function (layer) {
        if (layer instanceof L.Polyline ||
            layer instanceof L.Polygon ||
            layer instanceof L.Circle) {

            layer.off('click', this._clickHandler);
        }
    },

    _disableMeasurement: function (map) {
        // Retirer toutes les mesures
        this._measuredLayers.forEach(function (layer) {
            if (layer._measurementEnabled) {
                layer.hideMeasurements();
                layer._measurementEnabled = false;
            }
        });
        this._measuredLayers = [];

        // Retirer les écouteurs de toutes les couches
        map.eachLayer(function (layer) {
            this._removeListenersFromLayer(layer);
        }, this);

        // Retirer l'écouteur d'ajout de couche
        map.off('layeradd');
        map.off('layerremove');
    },

    _showInfo: function (message) {
        this._infoContainer.innerHTML = message;
        this._infoContainer.style.display = 'block';
    },

    _hideInfo: function () {
        this._infoContainer.style.display = 'none';
    },

    onRemove: function () {
        // Désactiver les mesures
        this._disableMeasurement(this._map);

        // Nettoyer les événements
        L.DomEvent.off(this._button, 'click');
        L.DomEvent.off(document, 'click');

        // Supprimer les références
        delete this._button;
        delete this._infoContainer;
        delete this._container;
        delete this._map;
        delete this._clickHandler;
    }
});

// ============================================================
// 3. Contrôle de localisation
// ============================================================

L.Control.locateme = L.Control.extend({
    onAdd: function (map) {
        this._map = map; // Stocker la référence à la carte
        this._button = L.DomUtil.create('button', 'localiser');
        this._button.innerHTML = '<img src="medias/localisation.jpg" alt="search icon" width="40" height="40">';

        // Créer une référence pour la fonction de gestionnaire
        this._clickHandler = L.Util.bind(function () {
            this._map.locate({ setView: true, maxZoom: 26 });
            this._map.on('locationfound', this._onLocationFound, this);
            this._map.on('locationerror', this._onLocationError, this);
        }, this);

        L.DomEvent.on(this._button, 'click', this._clickHandler);

        return this._button;
    },

    _onLocationFound: function (e) {
        var radius = e.accuracy;
        var latlng = e.latlng;

        // Supprimer les anciens marqueurss'ils existent
        if (this._marker) {
            this._map.removeLayer(this._marker);
        }

        // Créer le marqueur animé
        this._marker = L.marker(latlng).addTo(this._map);
        // Ajouter un popup
        this._marker.bindPopup("Vous êtes à moins de " + radius + " mètres de ce point").openPopup();

        // Désactiver la localisation après avoir trouvé la position
        this._map.off('locationfound', this._onLocationFound, this);
        this._map.off('locationerror', this._onLocationError, this);
    },

    _onLocationError: function (e) {
        console.error("Erreur de localisation:", e.message);
        this._map.off('locationfound', this._onLocationFound, this);
        this._map.off('locationerror', this._onLocationError, this);
    },
    onRemove: function () {
        // Nettoyer les événements
        if (this._button) {
            L.DomEvent.off(this._button, 'click', this._clickHandler);
        }

        // Nettoyer les couches
        if (this._marker) {
            this._map.removeLayer(this._marker);
        }

        // Supprimer les références
        delete this._button;
        delete this._clickHandler;
        delete this._marker;
    }
});


// ============================================================
// 4. Contrôle de recherche par coordonnéess
// ============================================================

// 1. Définir le système de coordonnées marocain (Merchich / Nord Maroc)
proj4.defs('EPSG:26191', '+proj=lcc +lat_1=34.65 +lat_0=33.3 +lon_0=-5.4 +k_0=0.999625769 +x_0=500000 +y_0=300000 +ellps=clrk80 +towgs84=-96.062,-82.428,-121.753,0,0,0,0 +units=m +no_defs');
// Définir le système WGS84 (lat/lng)
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
L.Control.CoordSearch = L.Control.extend({

    onAdd: function (map) {
        // Création du conteneur principal
        this._container = L.DomUtil.create('div', 'leaflet-control-coordsearch');

        // Création du bouton
        this._button = L.DomUtil.create('button', 'coord-search-btn');
        this._button.innerHTML = '<img src="medias/searchcord.webp" alt="search icon" width="40" height="40">';
        this._button.style.width = '40px';
        this._button.style.height = '40px';
        this._button.style.cursor = 'pointer';
        this._button.style.borderRadius = '4px';
        this._button.style.boxShadow = '0 1px 5px rgba(0,0,0,0.65)';
        this._button.style.display = 'block';

        // Conteneur pour les inputs (positionné à droite)
        this._inputContainer = L.DomUtil.create('div', 'coord-input-container');
        this._inputContainer.style.display = 'none';
        this._inputContainer.style.position = 'absolute';
        this._inputContainer.style.top = '100%';
        this._inputContainer.style.right = '0';  // Aligné à droite
        this._inputContainer.style.marginBottom = '10px';
        this._inputContainer.style.background = 'white';
        this._inputContainer.style.padding = '10px';
        this._inputContainer.style.borderRadius = '4px';
        this._inputContainer.style.boxShadow = '0 1px 5px rgba(0,0,0,0.65)';
        this._inputContainer.style.minWidth = '200px';
        this._inputContainer.style.zIndex = '1000';

        // Création des inputs
        this._createInputs();

        // Assemblage
        this._container.appendChild(this._button);
        this._container.appendChild(this._inputContainer);
        this._container.style.position = 'relative';
        this._container.style.display = 'inline-block';

        // Gestion des événements
        this._setupEvents(map);

        return this._container;
    },

    _createInputs: function () {
        // Input X (longitude)
        this._xInput = document.createElement('input');
        this._xInput.type = 'text';
        this._xInput.placeholder = 'X (coordonnée métrique)';
        this._xInput.style.width = '100%';
        this._xInput.style.marginBottom = '5px';
        this._xInput.style.padding = '5px';
        this._xInput.style.border = '1px solid #ccc';
        this._xInput.style.borderRadius = '3px';
        this._xInput.style.boxSizing = 'border-box';

        // Input Y (latitude)
        this._yInput = document.createElement('input');
        this._yInput.type = 'text';
        this._yInput.placeholder = 'Y (coordonnée métrique)';
        this._yInput.style.width = '100%';
        this._yInput.style.marginBottom = '5px';
        this._yInput.style.padding = '5px';
        this._yInput.style.border = '1px solid #ccc';
        this._yInput.style.borderRadius = '3px';
        this._yInput.style.boxSizing = 'border-box';

        // Bouton de recherche dans les inputs
        this._searchBtn = document.createElement('button');
        this._searchBtn.textContent = 'Rechercher';
        this._searchBtn.style.width = '100%';
        this._searchBtn.style.padding = '5px';
        this._searchBtn.style.background = '#4CAF50';
        this._searchBtn.style.color = 'white';
        this._searchBtn.style.border = 'none';
        this._searchBtn.style.borderRadius = '3px';
        this._searchBtn.style.cursor = 'pointer';
        this._searchBtn.style.marginTop = '5px';

        // Message d'erreur
        this._errorMsg = document.createElement('div');
        this._errorMsg.style.color = 'red';
        this._errorMsg.style.fontSize = '12px';
        this._errorMsg.style.marginTop = '5px';
        this._errorMsg.style.display = 'none';

        // Assemblage des inputs
        this._inputContainer.appendChild(this._xInput);
        this._inputContainer.appendChild(this._yInput);
        this._inputContainer.appendChild(this._searchBtn);
        this._inputContainer.appendChild(this._errorMsg);

        this._inputsCreated = true;
    },

    _setupEvents: function (map) {
        // Événement click du bouton principal
        L.DomEvent.on(this._button, 'click', function (e) {
            L.DomEvent.stopPropagation(e);
            this._toggleInputs(map);
        }, this);

        // Événement click du bouton de recherche
        L.DomEvent.on(this._searchBtn, 'click', function (e) {
            L.DomEvent.stopPropagation(e);
            this._trySearch(map);
        }, this);

        // Événements Entrée sur les inputs
        L.DomEvent.on(this._xInput, 'keydown', function (e) {
            if (e.key === 'Enter') {
                L.DomEvent.stopPropagation(e);
                this._trySearch(map);
            }
        }, this);

        L.DomEvent.on(this._yInput, 'keydown', function (e) {
            if (e.key === 'Enter') {
                L.DomEvent.stopPropagation(e);
                this._trySearch(map);
            }
        }, this);

        this._map = map;
        this._marker = null;
    },

    _toggleInputs: function (map) {
        // Supprimer le marqueur existant
        this._clearMarker();

        // Vérifier si les inputs sont vides
        if (this._inputsAreEmpty()) {
            // Si inputs vides et visibles => cacher
            // Si inputs vides et cachés => afficher
            if (this._inputContainer.style.display === 'none') {
                this._showInputs();
                setTimeout(() => this._xInput.focus(), 100);
            } else {
                this._hideInputs();
                this._clearInputs(); // Vider les inputs quand on cache
            }
        } else {
            // Inputs non vides => tenter la recherche
            this._trySearch(map);
        }
    },

    _trySearch: function (map) {
        const xM = parseFloat(this._xInput.value.trim());
        const yM = parseFloat(this._yInput.value.trim());
        var latLng = proj4('EPSG:26191', 'EPSG:4326', [xM, yM]);
        const lat = latLng[1];
        const lon = latLng[0];
        if (this._isValidCoord(lat, lon)) {
            this._clearError();
            this._searchCoords(map, lat, lon, xM, yM);
        } else {
            this._showError('Coordonnées invalides');
        }
    },

    _isValidCoord: function (x, y) {
        const xNum = parseFloat(x);
        const yNum = parseFloat(y);
        if (isNaN(xNum) || isNaN(yNum)) return false;
        if (yNum < -180 || yNum > 180) return false;
        if (xNum < -90 || xNum > 90) return false;
        return true;
    },

    _searchCoords: function (map, x, y, xM, yM) {
        const lng = parseFloat(y);
        const lat = parseFloat(x);
        // Centrer la carte
        map.setView([lat, lng], 16);
        // Ajouter ou déplacer le marqueur
        if (this._marker) {
            this._marker.setLatLng([lat, lng]);
        } else {
            this._marker = L.marker([lat, lng]).addTo(map);
        }

        // Ajouter un popup
        this._marker.bindPopup(`📍coordonnée métrique X: ${xM}, Y: ${yM}`).openPopup();

        //  VIDER LES INPUTS APRÈS RECHERCHE RÉUSSIE
        this._clearInputs();

        // Cacher les inputs après recherche
        this._hideInputs();
    },

    _clearMarker: function () {
        if (this._marker) {
            this._map.removeLayer(this._marker);
            this._marker = null;
        }
    },

    _clearInputs: function () {
        // Vider les champs de saisie
        this._xInput.value = '';
        this._yInput.value = '';
        this._clearError();
    },

    _showError: function (message) {
        this._errorMsg.textContent = message;
        this._errorMsg.style.display = 'block';
    },

    _clearError: function () {
        this._errorMsg.textContent = '';
        this._errorMsg.style.display = 'none';
    },

    _inputsAreEmpty: function () {
        return this._xInput.value.trim() === '' && this._yInput.value.trim() === '';
    },

    _showInputs: function () {
        this._inputContainer.style.display = 'block';
        this._clearInputs(); // Vider les inputs quand on les affiche
    },

    _hideInputs: function () {
        this._inputContainer.style.display = 'none';
        this._clearError();
    },

    onRemove: function () {
        // Nettoyage des événements
        L.DomEvent.off(this._button, 'click');
        L.DomEvent.off(this._searchBtn, 'click');
        L.DomEvent.off(this._xInput, 'keydown');
        L.DomEvent.off(this._yInput, 'keydown');
        L.DomEvent.off(document, 'click');

        // Supprimer le marqueur
        if (this._marker) {
            this._map.removeLayer(this._marker);
            this._marker = null;
        }

        // Nettoyer les références
        delete this._button;
        delete this._xInput;
        delete this._yInput;
        delete this._searchBtn;
        delete this._errorMsg;
        delete this._inputContainer;
        delete this._container;
        delete this._map;
    }
});


// ============================================================
// 5. Factory functions
// ============================================================
L.control.toggleControls = function (opts) { return new L.Control.ToggleControls(opts); };
L.control.measureTool = function (opts) { return new L.Control.MeasureTool(opts); };
L.control.locateme = function (opts) { return new L.Control.locateme(opts); };
L.control.coordSearch = function (opts) { return new L.Control.CoordSearch(opts); };

// ============================================================
// 6. Initialisation des contrôles sur la carte
// ============================================================
//bouton afficher /cache
L.control.toggleControls({ position: 'topleft' }).addTo(map);
//cotrol de mesur
L.control.measureTool({ position: 'topright' }).addTo(map);
//control de localisation
L.control.locateme({ position: 'topright' }).addTo(map);
//control recherche par coordonnees 
L.control.coordSearch({ position: 'topright' }).addTo(map);