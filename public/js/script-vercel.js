const map = L.map("map").setView([20.2961, 85.8245], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap",
}).addTo(map);

const markers = {};
let myMarker = null;
let centeredOnce = false;
let myId = 'user_' + Math.random().toString(36).substr(2, 9);

// Send location to server
async function sendLocation(latitude, longitude) {
    try {
        await fetch('/api/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: myId, latitude, longitude })
        });
    } catch (error) {
        console.error('Error sending location:', error);
    }
}

// Get all locations from server
async function getLocations() {
    try {
        const response = await fetch('/api/locations');
        const locations = await response.json();
        updateMarkers(locations);
    } catch (error) {
        console.error('Error getting locations:', error);
    }
}

// Update markers on map
function updateMarkers(locations) {
    // Remove markers that no longer exist
    Object.keys(markers).forEach(id => {
        if (!locations[id]) {
            map.removeLayer(markers[id]);
            delete markers[id];
        }
    });

    // Update/create markers
    Object.entries(locations).forEach(([id, data]) => {
        const { latitude, longitude } = data;
        
        if (id === myId) {
            // Handle my own marker
            if (myMarker) {
                myMarker.setLatLng([latitude, longitude]);
            } else {
                myMarker = L.marker([latitude, longitude])
                    .addTo(map)
                    .bindPopup("📍 You are here")
                    .openPopup();
            }
            
            if (!centeredOnce) {
                map.setView([latitude, longitude], 16);
                centeredOnce = true;
            }
        } else {
            // Handle other users' markers
            if (markers[id]) {
                markers[id].setLatLng([latitude, longitude]);
            } else {
                markers[id] = L.marker([latitude, longitude])
                    .addTo(map)
                    .bindPopup(`User: ${id}`);
            }
        }
    });
}

// Watch geolocation
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            sendLocation(latitude, longitude);
        },
        (error) => {
            console.error('Geolocation error:', error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
        }
    );
}

// Poll for updates every 2 seconds
setInterval(getLocations, 2000);

// Remove location when page unloads
window.addEventListener('beforeunload', () => {
    fetch(`/api/location/${myId}`, { method: 'DELETE' });
});