// // Improved multi-device handling: follow your own marker and fit to all markers when peers join/leave
// const socket = io();

// let myId = null;
// socket.on('connect', () => {
//   myId = socket.id;
// });

// if (navigator.geolocation) {
//   navigator.geolocation.watchPosition(
//     (position) => {
//       const { latitude, longitude, accuracy } = position.coords;
//       // Optionally filter very coarse fixes:
//       // if (accuracy && accuracy > 1000) return;
//       socket.emit('send-location', { latitude, longitude, accuracy });
//     },
//     (error) => {
//       console.error('Geolocation error:', error);
//     },
//     {
//       enableHighAccuracy: true,
//       maximumAge: 0,
//       timeout: 10000,
//     }
//   );
// }

// // Start zoomed out; we will fit to markers when available
// const map = L.map('map').setView([0, 0], 3);
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution: 'OpenStreetMap',
// }).addTo(map);

// const markers = {};

// function fitToAllMarkers() {
//   const mks = Object.values(markers);
//   if (mks.length === 0) return;
//   const group = L.featureGroup(mks);
//   map.fitBounds(group.getBounds().pad(0.25));
// }

// socket.on('receive-location', (data) => {
//   const { id, latitude, longitude } = data;

//   if (markers[id]) {
//     markers[id].setLatLng([latitude, longitude]);
//     // Follow only my own marker to avoid jumping due to others
//     if (id === myId) {
//       map.setView([latitude, longitude]);
//     }
//   } else {
//     markers[id] = L.marker([latitude, longitude]).addTo(map);
//     // When a new marker joins, fit bounds to show everyone
//     fitToAllMarkers();
//   }
// });

// socket.on('user-disconnected', (id) => {
//   if (markers[id]) {
//     map.removeLayer(markers[id]);
//     delete markers[id];
//     fitToAllMarkers();
//   }
// });


// const socket = io();

// let myMarker = null;
// const markers = {}; // Stores all other users' markers

// if (navigator.geolocation) {
//     navigator.geolocation.watchPosition(
//         (position) => {
//             const { latitude, longitude } = position.coords;
//             socket.emit("send-location", { latitude, longitude });

//             // Show my own marker (blue)
//             if (!myMarker) {
//                 myMarker = L.marker([latitude, longitude], { title: "Me" })
//                     .addTo(map)
//                     .bindPopup("You are here")
//                     .openPopup();
//                 map.setView([latitude, longitude], 16);
//             } else {
//                 myMarker.setLatLng([latitude, longitude]);
//             }
//         },
//         (error) => {
//             console.error(error);
//         },
//         {
//             enableHighAccuracy: true,
//             maximumAge: 0,
//             timeout: 5000,
//         }
//     );
// }

// const map = L.map("map").setView([0, 0], 2); // default view
// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     attribution: "OpenStreetMap",
// }).addTo(map);

// socket.on("receive-location", (data) => {
//     const { id, latitude, longitude } = data;

//     // Ignore my own updates (already handled)
//     if (id === socket.id) return;

//     if (markers[id]) {
//         markers[id].setLatLng([latitude, longitude]);
//     } else {
//         markers[id] = L.marker([latitude, longitude], { title: `User ${id}` })
//             .addTo(map)
//             .bindPopup(`User: ${id}`);
//     }
// });

// socket.on("user-disconnected", (id) => {
//     if (markers[id]) {
//         map.removeLayer(markers[id]);
//         delete markers[id];
//     }
// });




// const socket = io();

// const map = L.map("map").setView([20.2961, 85.8245], 12); // Default Bhubaneswar coords
// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     attribution: "OpenStreetMap",
// }).addTo(map);

// const markers = {};

// if (navigator.geolocation) {
//     navigator.geolocation.watchPosition(
//         (position) => {
//             const { latitude, longitude } = position.coords;
//             socket.emit("send-location", { latitude, longitude });
//         },
//         (error) => {
//             console.error(error);
//         },
//         {
//             enableHighAccuracy: true,
//             maximumAge: 0,
//             timeout: 5000,
//         }
//     );
// }

// socket.on("receive-location", (data) => {
//     const { id, latitude, longitude } = data;

//     if (markers[id]) {
//         markers[id].setLatLng([latitude, longitude]);
//     } else {
//         markers[id] = L.marker([latitude, longitude], { title: `User ${id}` })
//             .addTo(map)
//             .bindPopup(`User: ${id}`);
//     }
// });

// socket.on("user-disconnected", (id) => {
//     if (markers[id]) {
//         map.removeLayer(markers[id]);
//         delete markers[id];
//     }
// });





const socket = io();

const map = L.map("map").setView([20.2961, 85.8245], 12); // Default Bhubaneswar coords
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap",
}).addTo(map);

const markers = {};
let myMarker = null;
let centeredOnce = false; // To avoid recentering again and again

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });

            // Create/update "You are here" marker
            if (myMarker) {
                myMarker.setLatLng([latitude, longitude]);
            } else {
                myMarker = L.marker([latitude, longitude], { title: "You are here" })
                    .addTo(map)
                    .bindPopup("📍 You are here")
                    .openPopup();
            }

            // Center map only once on my location (first time)
            if (!centeredOnce) {
                map.setView([latitude, longitude], 16);
                centeredOnce = true;
            }
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
        }
    );
}

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    // Skip updating myself here (I already handle "You are here" above)
    if (id === socket.id) return;

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude], { title: `User ${id}` })
            .addTo(map)
            .bindPopup(`User: ${id}`);
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
