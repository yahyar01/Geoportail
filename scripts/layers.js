const wfsLayersConfig = [
    {
        name: 'Equipement',
        typeName: 'Equipement',
        label: 'Équipement',
        style: {
            color: 'blue',
            weight: 2,
            fillColor: 'blue',
            fillOpacity: 0.3
        }
    },
    {
        name: 'Parking',
        typeName: 'Parking',
        label: 'Parking',
        style: {
            color: 'red',
            weight: 2,
            fillColor: 'red',
            fillOpacity: 0.3
        }
    },
    {
        name: 'Perimetre',
        typeName: 'Perimetre',
        label: 'Périmètre',
        style: {
            color: 'black',
            weight: 3,
            fillColor: 'black',
            fillOpacity: 0.1
        }
    },
    {
        name: 'Espace_vert',
        typeName: 'Espace_vert',
        label: 'Espace vert',
        style: {
            color: 'green',
            weight: 2,
            fillColor: 'green',
            fillOpacity: 0.3
        }
    },
    {
        name: 'Place',
        typeName: 'Place',
        label: 'Place',
        style: {
            color: '#f39c12',
            weight: 2,
            fillColor: '#f39c12',
            fillOpacity: 0.3
        }
    },
    {
        name: 'Servitude',
        typeName: 'Servitude',
        label: 'Servitude',
        style: {
            color: '#9b59b6',
            weight: 2,
            fillColor: '#9b59b6',
            fillOpacity: 0.3
        },
        popupFields: {
            Denominati: '',
            Nom_PA: 'Nom',
            Nature: 'Type',
            Commune: 'Commune',
            Emprise: ''
        }
    },
    {
        name: 'Zonage',
        typeName: 'Zonage',
        label: 'Zonage',
        style: {
            color: '#1abc9c',
            weight: 2,
            fillColor: '#1abc9c',
            fillOpacity: 0.3
        },
        popupFields: {
            Denominati: '',
            Nom_PA: 'Nom',
            Nature: 'Type',
            Commune: 'Commune',
            Zone: '',
            sous_zone: '',
            Surface: '',
            Niveau: ''
        }
    },
    {
        name: 'Voirie',
        typeName: 'Voirie',
        label: 'Voirie',
        style: {
            color: '#FFFF00',
            weight: 2,
            fillColor: '#FFFF00',
            fillOpacity: 0.3
        }
    }
];
const WFS_URL = 'http://localhost:8080/geoserver/PA_Fouarat/wfs?SRS=EPSG:4326';

const TYPE_NS = 'PA_Fouarat';


function buildPopup(props, popupFields) {
    let fields;
    // Si popupFields est défini,
    // on affiche uniquement les champs demandés
    if (popupFields) {
        fields = Object.entries(popupFields);
    }
    // Sinon, on affiche tous les champs
    else {
        fields = Object.keys(props).map(key => [key]);
    }
    let popupContent = '<table>';
    fields.forEach(([key]) => {
        popupContent +=
            '<tr>' +
            '<td><b>' + (key) + '</b></td>' +
            '<td>' + (props[key] ?? '') + '</td>' +
            '</tr>';
    });
    popupContent += '</table>';
    return popupContent;
}
function initWfsLayers(map) {
    const layers = {};
    const legends = [];
    wfsLayersConfig.forEach(cfg => {
        // Création de la couche WFS
        const layer = new L.WFS({
            url: WFS_URL,
            typeNS: TYPE_NS,
            typeName: cfg.typeName,
            crs: L.CRS.EPSG4326,
            style: cfg.style,
            geometryField: 'the_geom'
        });
        // Ajout à la carte
        layer.addTo(map);
        // Stockage de la couche
        layers[cfg.name] = layer;
        // Popup
        layer.on('load', function () {
            layer.eachLayer(function (featureLayer) {
                const props = featureLayer.feature.properties;
                const popupContent = buildPopup(props, cfg.popupFields);
                featureLayer.bindPopup(popupContent);
            });
        });
        // Légende
        legends.push({
            label: cfg.label || cfg.name,
            type: 'rectangle',
            layer: layer,
            color: cfg.style.color,
            fillColor: cfg.style.fillColor,
            weight: cfg.style.weight,
            fillOpacity: cfg.style.fillOpacity
        });

    });


    // Création de la légende
    L.control.Legend({
        position: 'bottomright',
        title: 'Légende',
        opacity: 0.7,
        collapsed: true,
        legends: legends,
        column:2
    }).addTo(map);

    return layers;
}
const wfsLayers = initWfsLayers(map);