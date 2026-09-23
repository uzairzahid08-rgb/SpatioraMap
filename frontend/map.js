// ==========================================
// SpatioraMap WebGIS
// ==========================================


// ==========================================
// Authentication
// ==========================================

const token =
    localStorage.getItem("access_token");


if (!token) {

    window.location.href = "index.html";

}


// ==========================================
// API
// ==========================================

const API_URL =
    "http://127.0.0.1:8000";


// ==========================================
// Default Map View
// ==========================================

const DEFAULT_CENTER = [
    34.0151,
    71.5249
];

const DEFAULT_ZOOM = 7;


// ==========================================
// Create Map
// ==========================================

const map = L.map("map", {

    center: DEFAULT_CENTER,

    zoom: DEFAULT_ZOOM,

    zoomControl: false

});


// ==========================================
// Zoom Control
// ==========================================

L.control.zoom({

    position: "topright"

}).addTo(map);


// ==========================================
// Fullscreen Control
// ==========================================

if (L.control.fullscreen) {

    L.control.fullscreen({

        position: "topright",

        title: "Fullscreen"

    }).addTo(map);

}


// ==========================================
// Scale Bar
// ==========================================

L.control.scale({

    position: "bottomleft",

    imperial: false,

    metric: true

}).addTo(map);


// ==========================================
// OpenStreetMap
// ==========================================

const osmLayer = L.tileLayer(

    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

    {

        attribution:
            '&copy; OpenStreetMap contributors',

        maxZoom: 19

    }

);


osmLayer.addTo(map);


// ==========================================
// Satellite
// ==========================================

const satelliteLayer = L.tileLayer(

    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",

    {

        attribution:
            "Tiles &copy; Esri",

        maxZoom: 19

    }

);


// ==========================================
// Drawing Layer
// ==========================================

const drawingLayer =
    L.featureGroup().addTo(map);


// ==========================================
// Basemap Switching
// ==========================================

const osmCheckbox =
    document.getElementById("osmLayer");


const satelliteCheckbox =
    document.getElementById(
        "satelliteLayer"
    );


osmCheckbox.addEventListener(
    "change",
    function() {

        if (this.checked) {

            map.addLayer(
                osmLayer
            );

        } else {

            map.removeLayer(
                osmLayer
            );

        }

    }
);


satelliteCheckbox.addEventListener(
    "change",
    function() {

        if (this.checked) {

            map.addLayer(
                satelliteLayer
            );

        } else {

            map.removeLayer(
                satelliteLayer
            );

        }

    }
);


// ==========================================
// Home Button
// ==========================================

document
    .getElementById("homeButton")
    .addEventListener(
        "click",
        function() {

            map.setView(

                DEFAULT_CENTER,

                DEFAULT_ZOOM

            );

        }
    );


// ==========================================
// Coordinates
// ==========================================

const coordinatesElement =
    document.getElementById(
        "coordinates"
    );


map.on(
    "mousemove",
    function(event) {

        const lat =
            event.latlng.lat.toFixed(5);

        const lng =
            event.latlng.lng.toFixed(5);


        coordinatesElement.textContent =
            `${lat}, ${lng}`;

    }
);


// ==========================================
// Distance Measurement
// ==========================================

let measuringDistance = false;

let distancePoints = [];

let distanceLine = null;

let distanceMarkers = [];


document
    .getElementById("measureDistance")
    .addEventListener(
        "click",
        startDistanceMeasurement
    );


function startDistanceMeasurement() {

    stopDrawing();

    measuringDistance = true;

    distancePoints = [];

    alert(
        "Distance tool active.\n\nClick points on the map.\nDouble-click to finish."
    );


    map.getContainer().style.cursor =
        "crosshair";


    map.on(
        "click",
        distanceClick
    );

    map.on(
        "dblclick",
        finishDistanceMeasurement
    );

}


function distanceClick(event) {

    if (!measuringDistance) {

        return;

    }


    distancePoints.push(
        event.latlng
    );


    const marker =
        L.circleMarker(
            event.latlng,
            {
                radius: 5
            }
        ).addTo(
            drawingLayer
        );


    distanceMarkers.push(
        marker
    );


    if (distancePoints.length >= 2) {

        if (distanceLine) {

            drawingLayer.removeLayer(
                distanceLine
            );

        }


        distanceLine =
            L.polyline(
                distancePoints,
                {
                    weight: 4
                }
            ).addTo(
                drawingLayer
            );

    }

}


function finishDistanceMeasurement() {

    if (
        !measuringDistance ||
        distancePoints.length < 2
    ) {

        stopDistanceMeasurement();

        return;

    }


    let totalDistance = 0;


    for (
        let i = 1;
        i < distancePoints.length;
        i++
    ) {

        totalDistance +=
            map.distance(
                distancePoints[i - 1],
                distancePoints[i]
            );

    }


    let result;


    if (totalDistance >= 1000) {

        result =
            (
                totalDistance / 1000
            ).toFixed(2)
            + " km";

    } else {

        result =
            totalDistance.toFixed(2)
            + " m";

    }


    alert(
        "Measured distance:\n\n"
        + result
    );


    stopDistanceMeasurement();

}


function stopDistanceMeasurement() {

    measuringDistance = false;

    map.getContainer().style.cursor =
        "";


    map.off(
        "click",
        distanceClick
    );


    map.off(
        "dblclick",
        finishDistanceMeasurement
    );

}


// ==========================================
// Area Measurement
// ==========================================

let measuringArea = false;

let areaPoints = [];

let areaPolygon = null;

let areaMarkers = [];


document
    .getElementById("measureArea")
    .addEventListener(
        "click",
        startAreaMeasurement
    );


function startAreaMeasurement() {

    stopDrawing();

    measuringArea = true;

    areaPoints = [];

    alert(
        "Area tool active.\n\nClick around the area.\nDouble-click to finish."
    );


    map.getContainer().style.cursor =
        "crosshair";


    map.on(
        "click",
        areaClick
    );

    map.on(
        "dblclick",
        finishAreaMeasurement
    );

}


function areaClick(event) {

    if (!measuringArea) {

        return;

    }


    areaPoints.push(
        event.latlng
    );


    const marker =
        L.circleMarker(
            event.latlng,
            {
                radius: 5
            }
        ).addTo(
            drawingLayer
        );


    areaMarkers.push(
        marker
    );


    if (areaPoints.length >= 3) {

        if (areaPolygon) {

            drawingLayer.removeLayer(
                areaPolygon
            );

        }


        areaPolygon =
            L.polygon(
                areaPoints,
                {
                    weight: 3
                }
            ).addTo(
                drawingLayer
            );

    }

}


function finishAreaMeasurement() {

    if (
        !measuringArea ||
        areaPoints.length < 3
    ) {

        stopAreaMeasurement();

        return;

    }


    const area =
        calculatePolygonArea(
            areaPoints
        );


    let result;


    if (area >= 1000000) {

        result =
            (
                area / 1000000
            ).toFixed(2)
            + " km²";

    } else {

        result =
            area.toFixed(2)
            + " m²";

    }


    alert(
        "Measured area:\n\n"
        + result
    );


    stopAreaMeasurement();

}


function stopAreaMeasurement() {

    measuringArea = false;

    map.getContainer().style.cursor =
        "";


    map.off(
        "click",
        areaClick
    );


    map.off(
        "dblclick",
        finishAreaMeasurement
    );

}


// ==========================================
// Polygon Area Calculation
// ==========================================

function calculatePolygonArea(
    points
) {

    const earthRadius =
        6378137;


    let area = 0;


    for (
        let i = 0;
        i < points.length;
        i++
    ) {

        const point1 =
            points[i];

        const point2 =
            points[
                (i + 1) %
                points.length
            ];


        const lat1 =
            point1.lat *
            Math.PI / 180;

        const lat2 =
            point2.lat *
            Math.PI / 180;


        const lon1 =
            point1.lng *
            Math.PI / 180;

        const lon2 =
            point2.lng *
            Math.PI / 180;


        area +=
            (
                lon2 - lon1
            ) *
            (
                2 +
                Math.sin(lat1) +
                Math.sin(lat2)
            );

    }


    area =
        Math.abs(
            area *
            earthRadius *
            earthRadius /
            2
        );


    return area;

}


// ==========================================
// Clear Drawings
// ==========================================

document
    .getElementById("clearMap")
    .addEventListener(
        "click",
        function() {

            drawingLayer.clearLayers();

            distancePoints = [];

            areaPoints = [];

            distanceLine = null;

            areaPolygon = null;

        }
    );


// ==========================================
// Stop Drawing
// ==========================================

function stopDrawing() {

    stopDistanceMeasurement();

    stopAreaMeasurement();

}


// ==========================================
// Locate User
// ==========================================

document
    .getElementById("locateButton")
    .addEventListener(
        "click",
        function() {

            if (!navigator.geolocation) {

                alert(
                    "Geolocation is not supported by this browser."
                );

                return;

            }


            navigator.geolocation.getCurrentPosition(

                function(position) {

                    const lat =
                        position.coords.latitude;

                    const lng =
                        position.coords.longitude;


                    map.setView(
                        [lat, lng],
                        14
                    );


                    L.marker(
                        [lat, lng]
                    )
                    .addTo(
                        drawingLayer
                    )
                    .bindPopup(
                        "Your location"
                    )
                    .openPopup();

                },


                function() {

                    alert(
                        "Unable to determine your location."
                    );

                }

            );

        }
    );


// ==========================================
// Load User
// ==========================================

async function loadUser() {

    try {

        const response =
            await fetch(
                `${API_URL}/me`,
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            localStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "index.html";

            return;

        }


        document
            .getElementById(
                "welcomeUser"
            )
            .textContent =
            `Welcome, ${data.username}`;


        document
            .getElementById(
                "mapStatus"
            )
            .textContent =
            "Connected";

    }


    catch (error) {

        console.error(error);


        document
            .getElementById(
                "mapStatus"
            )
            .textContent =
            "Backend unavailable";

    }

}


// ==========================================
// Logout
// ==========================================

document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        function() {

            localStorage.removeItem(
                "access_token"
            );


            window.location.href =
                "index.html";

        }
    );


// ==========================================
// Start
// ==========================================

loadUser();