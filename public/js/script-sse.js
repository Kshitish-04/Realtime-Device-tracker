const map = L.map("map").setView([20.2961, 85.8245], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap",
}).addTo(map);

const markers = {};
let myMarker = null;
let centeredOnce = false;
let myId = 'user_' + Math.random().toString(36).substr(2, 9);

// Server-Sent Events for real-time updates
const eventSource = new EventSource('/api/stream');
eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'location') {
        const { id, latitude, longitude } = data;
        
        if (id === myId) return; // Skip my own updates
        
        if (markers[id]) {
            markers[id].setLatLng([latitude, longitude]);
        } else {
            markers[id] = L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup(`User: ${id}`);
        }
    } else if (data.type === 'disconnect') {
        if (markers[data.id]) {
            map.removeLayer(markers[data.id]);
            delete markers[data.id];
        }
    }
};

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

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            sendLocation(latitude, longitude);
            
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

window.addEventListener('beforeunload', () => {
    fetch(`/api/location/${myId}`, { method: 'DELETE' });
});