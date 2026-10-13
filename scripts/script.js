var map = L.map('map').setView([33.892338, -5.541132], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


//click coordinates
function onMapClick(e) {
    // Créer une popup dynamique
    L.popup()
        .setLatLng(e.latlng)
        .setContent("Vous avez cliqué sur " + e.latlng.toString().slice(6,))
        .openOn(map);
}
map.on('click', onMapClick);

//cordonee de la souris
map.on('mousemove', function (e) {
    document.getElementsByClassName('coordinate')[0].innerHTML = 'lat: ' + e.latlng.lat + ' lng: ' + e.latlng.lng;
})


//layers control
var googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});
var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
var dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
});
var baseMaps = {
    "OSM": osm,
    "dark": dark,
    "google streets": googleStreets,
    "google satellite": googleSat
};
var layerControl = L.control.layers(baseMaps).addTo(map);

// search bar
var geocoder = L.Control.geocoder({
    defaultMarkGeocode: false
})
    .on('markgeocode', function (e) {
        var bbox = e.geocode.bbox;
        var poly = new L.Polygon([
            bbox.getSouthEast(),
            bbox.getNorthEast(),
            bbox.getNorthWest(),
            bbox.getSouthWest()
        ]).addTo(map);
        map.fitBounds(poly.getBounds());
    })
    .addTo(map);
//full screen
map.addControl(new L.Control.FullScreen());
//drawing 
map.pm.addControls({
    position: 'topleft',
    drawCircleMarker: true,
    rotateMode: true,
});
//measurement
map.addControl(new L.Control.LinearMeasurement({
    unitSystem: 'meter',
    color: '#FF0080',
    type: 'line',
    features: 'polygon'
}));
// Impression
var browserPrint = L.control.browserPrint({ position: 'topleft', title: 'Imprimer', documentTitle: 'Carte imprimée du geoportail de l\'agence urbaine de Meknes' }).addTo(map);
